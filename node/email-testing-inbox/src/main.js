import { createHash } from 'node:crypto';
import { Client, ID, Query, Storage, TablesDB } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import {
  extractCode,
  extractLinks,
  htmlToText,
  parseAddress,
} from './extract.js';

// These IDs match the ones the Catchall site creates during /setup.
const DATABASE_ID = 'catchall';
const MESSAGES = 'messages';
const SETTINGS = 'settings';
const BUCKET_ID = 'attachments';
const DEFAULT_RETENTION_DAYS = 7;

export default async (context) => {
  const { req, res, error } = context;
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key']);
  const tables = new TablesDB(client);
  const storage = new Storage(client);

  const trigger = req.headers['x-appwrite-trigger'];
  try {
    if (trigger === 'email')
      return res.json(await receive(context, tables, storage));
    if (trigger === 'schedule')
      return res.json(await cleanup(context, tables, storage));
    return res.json(
      { ok: false, message: `Nothing to do for trigger "${trigger}".` },
      400
    );
  } catch (err) {
    error(err?.stack || String(err));
    return res.json(
      { ok: false, message: err?.message || 'Unexpected error' },
      500
    );
  }
};

async function receive({ req, log }, tables, storage) {
  const form = await new Response(req.bodyBinary, {
    headers: { 'content-type': req.headers['content-type'] },
  }).formData();
  const part = form.get('email');
  const email = JSON.parse(typeof part === 'string' ? part : await part.text());

  const recipient = String(
    req.headers['x-appwrite-email-recipient'] || email.envelope?.to?.[0] || ''
  ).toLowerCase();
  const mailbox = recipient.split('@')[0] || 'unknown';

  // Appwrite retries an email when an execution runs out of time, so the same message can arrive twice.
  // The row ID comes from the Message-ID (or Appwrite's email ID) plus the recipient, so a retry lands on the same row.
  const rowId = createHash('sha256')
    .update(`${email.messageId || email.id}|${recipient}`)
    .digest('hex')
    .slice(0, 32);
  if (await findMessage(tables, rowId)) {
    log(`Duplicate of ${rowId}, skipped.`);
    return { ok: true, duplicate: true, rowId };
  }

  // Appwrite does not keep attachments, so each one goes into the attachments bucket.
  const attachments = [];
  for (const meta of email.attachments || []) {
    const file = form.get(meta.id);
    const entry = {
      name: meta.name || meta.id,
      contentType: meta.contentType || 'application/octet-stream',
      contentId: (meta.contentId || '').replace(/^<|>$/g, ''),
      disposition: meta.disposition || 'attachment',
      size: meta.size || 0,
      fileId: null,
    };
    if (file && typeof file !== 'string' && file.size > 0) {
      try {
        const upload = InputFile.fromBuffer(
          Buffer.from(await file.arrayBuffer()),
          safeName(entry.name)
        );
        const stored = await storage.createFile({
          bucketId: BUCKET_ID,
          fileId: ID.unique(),
          file: upload,
        });
        entry.fileId = stored.$id;
      } catch (err) {
        entry.error = err?.message || 'Upload failed';
      }
    }
    attachments.push(entry);
  }

  const text = email.text || htmlToText(email.html);
  const links = extractLinks(email.html, text);
  const from = parseAddress(email.from || email.envelope?.from);
  const { text: _text, html: _html, attachments: _a, ...meta } = email;

  const data = {
    mailbox,
    recipient,
    fromName: from.name.slice(0, 256),
    fromAddress: from.address.slice(0, 320),
    subject: (email.subject || '').slice(0, 998),
    preview: text.replace(/\s+/g, ' ').trim().slice(0, 280),
    text: email.text || '',
    html: email.html || '',
    code: extractCode(email.subject, text),
    links: JSON.stringify(links),
    linkCount: links.length,
    attachments: JSON.stringify(attachments),
    attachmentCount: attachments.length,
    spamScore: typeof email.spam?.score === 'number' ? email.spam.score : null,
    spamVerdict: email.spam?.verdict || null,
    meta: JSON.stringify(meta),
    receivedAt: normalizeDate(email.receivedAt),
    read: false,
  };

  try {
    await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: MESSAGES,
      rowId,
      data,
    });
  } catch (err) {
    const uploaded = attachments.map((a) => a.fileId).filter(Boolean);
    if (err?.code !== 409) {
      // The call can fail after the row was written, so look before deleting anything. If the
      // lookup fails too, keep the files: they may belong to a stored message.
      const row = await findMessage(tables, rowId).catch(() => {
        throw err;
      });
      if (!row) {
        // Nothing was stored. Delete the files, or the retry would upload a second set.
        await deleteFiles(storage, uploaded);
        throw err;
      }
      if (attachmentFileIds(row).join() === uploaded.join()) {
        log(`Stored ${rowId} for ${recipient}, though the call failed.`);
        return { ok: true, rowId };
      }
    }
    // Another execution stored the same message first: drop this copy's files.
    await deleteFiles(storage, uploaded);
    return { ok: true, duplicate: true, rowId };
  }
  log(
    `Stored ${rowId} for ${recipient} with ${attachments.length} attachment(s).`
  );
  return { ok: true, rowId };
}

// Returns the message row, or null if there isn't one.
async function findMessage(tables, rowId) {
  try {
    return await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: MESSAGES,
      rowId,
      queries: [Query.select(['$id', 'attachments'])],
    });
  } catch (err) {
    if (err?.code === 404) return null;
    throw err;
  }
}

function attachmentFileIds(row) {
  try {
    return JSON.parse(row.attachments || '[]')
      .map((a) => a.fileId)
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Deletes the files and returns the IDs that are still there. One that's already gone counts.
async function deleteFiles(storage, fileIds) {
  const results = await Promise.allSettled(
    fileIds.map((fileId) => storage.deleteFile({ bucketId: BUCKET_ID, fileId }))
  );
  return fileIds.filter(
    (_, i) =>
      results[i].status === 'rejected' && results[i].reason?.code !== 404
  );
}

function safeName(name) {
  const clean = String(name)
    .replace(/[\\/\0]/g, '_')
    .trim();
  return clean.slice(-200) || 'attachment';
}

// Appwrite sends nanoseconds; datetime columns take milliseconds.
function normalizeDate(value) {
  const date = value
    ? new Date(String(value).replace(/(\.\d{3})\d+/, '$1'))
    : new Date();
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

// A message row is the only record of its attachments' file IDs, so a row goes only once all its
// files are gone. A row whose file fails to delete stays for the next run. The Catchall site
// follows the same rule when someone deletes messages.
async function cleanup({ log }, tables, storage) {
  let days = DEFAULT_RETENTION_DAYS;
  try {
    const settings = await tables.getRow({
      databaseId: DATABASE_ID,
      tableId: SETTINGS,
      rowId: 'settings',
    });
    if (settings.retentionDays > 0) days = settings.retentionDays;
  } catch (err) {
    // Only a missing settings row means the default. Any other error stops the run, so it never
    // deletes messages a longer retention setting would keep.
    if (err?.code !== 404) throw err;
  }
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  const started = Date.now();
  let removed = 0;
  let kept = 0;
  // Rows come back in the order they were created. Everything before the last kept row is either
  // deleted or kept, so the next page starts after it.
  let after = null;
  while (Date.now() - started < 45_000) {
    const page = await tables.listRows({
      databaseId: DATABASE_ID,
      tableId: MESSAGES,
      queries: [
        Query.lessThan('receivedAt', cutoff),
        Query.select(['$id', 'attachments']),
        Query.limit(100),
        ...(after ? [Query.cursorAfter(after)] : []),
      ],
    });
    if (page.rows.length === 0) break;
    const stuck = new Set(
      await deleteFiles(storage, page.rows.flatMap(attachmentFileIds))
    );
    const cleared = [];
    for (const row of page.rows) {
      if (attachmentFileIds(row).some((fileId) => stuck.has(fileId))) {
        kept++;
        after = row.$id;
      } else cleared.push(row.$id);
    }
    if (cleared.length) {
      await tables.deleteRows({
        databaseId: DATABASE_ID,
        tableId: MESSAGES,
        queries: [Query.equal('$id', cleared)],
      });
      removed += cleared.length;
    }
  }
  log(
    `Removed ${removed} message(s) older than ${days} day(s).` +
      (kept
        ? ` Kept ${kept} whose attachments couldn't be deleted; the next run tries again.`
        : '')
  );
  return { ok: true, removed, kept, days };
}
