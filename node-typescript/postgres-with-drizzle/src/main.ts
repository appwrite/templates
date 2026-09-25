import { asc, eq } from 'drizzle-orm';
import { getDb } from './db.js';
import { todos } from './schema.js';
import { parseBody, parseTitle, throwIfMissing } from './utils.js';

type Context = {
  req: any;
  res: any;
  log: (msg: any) => void;
  error: (msg: any) => void;
};

export default async ({ req, res, log }: Context) => {
  throwIfMissing(process.env, ['DATABASE_URL']);

  // `/` targets all todos, `/123` targets the todo with ID 123
  const idParam = req.path.replace(/^\/|\/$/g, '');
  const id = idParam === '' ? undefined : Number(idParam);
  if (id !== undefined && !Number.isSafeInteger(id)) {
    return res.json({ ok: false, error: 'Not found.' }, 404);
  }

  const db = await getDb();

  if (id === undefined && req.method === 'GET') {
    const rows = await db.select().from(todos).orderBy(asc(todos.id));
    return res.json({ ok: true, todos: rows });
  }

  if (id === undefined && req.method === 'POST') {
    const title = parseTitle(parseBody(req)?.title);
    if (!title) {
      return res.json(
        { ok: false, error: 'Title must be 1 to 255 characters.' },
        400
      );
    }

    const [todo] = await db.insert(todos).values({ title }).returning();
    log(`Created todo ${todo.id}`);
    return res.json({ ok: true, todo }, 201);
  }

  if (id !== undefined && req.method === 'GET') {
    const [todo] = await db.select().from(todos).where(eq(todos.id, id));
    if (!todo) {
      return res.json({ ok: false, error: 'Todo not found.' }, 404);
    }
    return res.json({ ok: true, todo });
  }

  if (id !== undefined && req.method === 'PATCH') {
    const body = parseBody(req) ?? {};
    // Only update the fields present in the body
    const changes: Partial<typeof todos.$inferInsert> = {};

    if (body.title !== undefined) {
      const title = parseTitle(body.title);
      if (!title) {
        return res.json(
          { ok: false, error: 'Title must be 1 to 255 characters.' },
          400
        );
      }
      changes.title = title;
    }

    if (body.completed !== undefined) {
      if (typeof body.completed !== 'boolean') {
        return res.json(
          { ok: false, error: 'Completed must be a boolean.' },
          400
        );
      }
      changes.completed = body.completed;
    }

    if (Object.keys(changes).length === 0) {
      return res.json(
        { ok: false, error: 'Provide a title or completed value.' },
        400
      );
    }

    const [todo] = await db
      .update(todos)
      .set(changes)
      .where(eq(todos.id, id))
      .returning();
    if (!todo) {
      return res.json({ ok: false, error: 'Todo not found.' }, 404);
    }
    return res.json({ ok: true, todo });
  }

  if (id !== undefined && req.method === 'DELETE') {
    const [todo] = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning({ id: todos.id });
    if (!todo) {
      return res.json({ ok: false, error: 'Todo not found.' }, 404);
    }
    log(`Deleted todo ${todo.id}`);
    return res.json({ ok: true });
  }

  return res.json({ ok: false, error: 'Not found.' }, 404);
};
