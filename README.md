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

On startup, the app shows only its plain background until the session check completes, then displays the workspace or sign-in form without flashing the form for signed-in users.

The app supports sign-in, structured history, account selection with version checks, tool progress, streamed explanations, and market, position, fill, and source cards. Unknown values stay unknown; amounts retain decimal precision. The resizable right panel provides Trends and Resources navigation, with a shared back button to return to its overview. Both panels' widths, the left sidebar's pinned expansion, and the right panel's open state are saved locally in the browser across reloads; temporary sidebar hover previews are not saved. Restored widths are constrained to the available desktop space. Unimplemented modes, attachments, and mock recent chats are hidden.

Conversation selection only changes the displayed view. Each conversation keeps its own messages, progress, errors, execution state, and unsent input; background conversations continue generating while you switch. The first visit loads uncached history, and stale responses cannot replace newer execution results or account versions.

New chat selects a separate unsent draft. Repeated clicks preserve it, and switching away and back preserves each view's input for the current page lifetime. Sending the draft creates a conversation with that first message and prepares a fresh empty draft. If you switch during creation, the new conversation is added to navigation without taking selection back or clearing the other view's input. Drafts are not saved across page reloads.

Before submitting a message, the app saves its request ID and payload in user-scoped session storage. Responses use either SSE or duplicate-request JSON, selected by Content-Type. Stream parsing handles split UTF-8 characters and event boundaries. On page startup, the app independently restores all valid saved pending requests without changing a later user selection. Switching conversations never submits or recovers a request. After a disconnect, the app retrieves the saved run; failed recovery remains available through Recover saved request. An uncertain submission reuses its original ID; an explicit retry creates a new ID. Expired or malformed pending requests are not replayed. Partial answers remain marked as incomplete.

## Structure

- `src/app`: page composition and top-level coordination.
- `src/features`: components, hooks, data, and types grouped by feature.
- `src/features/assistant/hooks/useAssistant.ts`: view selection, per-view drafts, pending storage, startup recovery, and submission coordination.
- `src/features/assistant/hooks/useConversationState.ts`: per-conversation history cache, pagination, data revisions, and account-version protection.
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

Tests cover independent concurrent runs, per-view drafts, creation and startup navigation races, stale history/account revisions, request identity on recovery and retry, SSE framing and multibyte UTF-8, duplicate requests, decimal display, consecutive messages, recovery, expired and malformed pending requests, and stale history responses. Live Claude evaluation and full browser integration remain separate checks; see the [service acceptance checklist](../noodo-service/docs/acceptance.md).
