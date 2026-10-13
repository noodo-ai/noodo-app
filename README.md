# Noodo app

A read-only AI chat interface for Hyperliquid's default perpetual markets. Sign in with an invited account and select a public main-account or subaccount address. No wallet connection or signature is required.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173` or `http://127.0.0.1:5173`. First follow the [service setup](../noodo-service/README.md) to configure the Claude API key, create an invited user, and start the backend. The model is fixed in the service configuration.

Vite proxies `/v1` to `http://127.0.0.1:3001`, preserves Origin and cookies, and allows 75 seconds for SSE. The browser never needs an API key. Every `VITE_*` variable is public; never store secrets there. In production, serve the app and `/v1` under the same HTTPS origin and disable proxy buffering for SSE.

## Features and recovery

The app supports sign-in, structured history, account selection with version checks, tool progress, streamed explanations, and market, position, fill, and source cards. Unknown values stay unknown; amounts retain decimal precision. Farm navigation and the resizable right panel remain available. Unimplemented modes, attachments, and mock recent chats are hidden.

Before submitting a message, the app saves its request ID and payload in user-scoped session storage. Responses use either SSE or duplicate-request JSON, selected by Content-Type. Stream parsing handles split UTF-8 characters and event boundaries. After a disconnect, the app retrieves the saved run. An uncertain submission reuses its original ID; an explicit retry creates a new ID. Expired or malformed pending requests are not replayed. Partial answers remain marked as incomplete.

## Structure

- `src/app`: page composition and top-level coordination.
- `src/features`: components, hooks, data, and types grouped by feature.
- `src/features/assistant/hooks/useAssistant.ts`: conversation selection, history, and account changes.
- `src/features/assistant/hooks/useRunExecution.ts`: streaming, cancellation, and saved-run recovery.
- `src/shared`: code with established cross-feature reuse.
- `src/styles.css`: ordered stylesheet imports; keep their order when moving rules.

Extract modules around a clear responsibility. Prefer direct names and explicit types. Avoid adding generic wrappers or tiny forwarding components merely to reduce line counts.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Tests cover SSE framing and multibyte UTF-8, duplicate requests, decimal display, consecutive messages, recovery, expired and malformed pending requests, and stale history responses. Live Claude evaluation and full browser integration remain separate checks; see the [service acceptance checklist](../noodo-service/docs/acceptance.md).
