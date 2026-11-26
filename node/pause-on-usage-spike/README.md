# ⏸️ Node.js Pause on Usage Spike Function

Disables a function or site when a usage monitor scoped to it fires, so a runaway cron, retry loop or traffic spike stops running up the bill.

## 🧰 Usage

Pair it with a usage monitor scoped to the resource to protect, for example:

```js
await monitors.createUsageMonitor({
  monitorId: ID.unique(),
  name: 'Image resizer executions',
  rules: [
    Query.greaterThan('executions', 10000),
    Query.equal('resourceType', ['function']),
    Query.equal('resourceId', ['image-resizer']),
  ],
  window: 3600,
  severity: 'critical',
});
```

### Event: `monitors.*.alerts.*.create`

When the alert names a function or site and its severity is at least `MIN_SEVERITY`, the template sets that resource's `enabled` to `false`. It leaves alone:

- project-wide alerts and alerts on databases or buckets,
- alerts about this function itself,
- alerts below `MIN_SEVERITY`.

It doesn't re-enable the resource when the alert resolves: usage drops because the resource is off, so turning it back on would only start the spike again. Re-enable it from the console once you've found the cause.

Calls that aren't alert events, such as an HTTP request to the function's domain, get a `403`.

**Response**

Sample `200` Response:

```json
{ "paused": true, "resourceType": "function", "resourceId": "image-resizer" }
```

```json
{ "paused": false, "reason": "scope" }
```

## ⚙️ Configuration

| Setting           | Value                                                            |
| ----------------- | ---------------------------------------------------------------- |
| Runtime           | Node (20.0)                                                      |
| Entrypoint        | `src/main.js`                                                    |
| Build Commands    | `npm install`                                                    |
| Permissions       | None                                                             |
| Events            | `monitors.*.alerts.*.create`                                     |
| Timeout (Seconds) | 15                                                               |
| Scopes            | `functions.read`, `functions.write`, `sites.read`, `sites.write` |

## 🔒 Environment Variables

### MIN_SEVERITY

Lowest monitor severity that pauses its resource: `info`, `warning`, `error` or `critical`. Monitors default to `warning`.

| Question     | Answer    |
| ------------ | --------- |
| Required     | No        |
| Sample Value | `warning` |
