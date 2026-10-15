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

The app supports sign-in, structured history, account selection with version checks, tool progress, streamed explanations, and market, position, fill, and source cards. Unknown values stay unknown; amounts retain decimal precision. The resizable right panel provides Trends and Resources navigation, with a shared back button to return to its overview. Resources includes Community and Personal libraries; Trends shows scheduled Hyperliquid market highlights, a reported seven-day PnL leaderboard, and deterministic market/position signals. Both panels' widths, the left sidebar's pinned expansion, and the right panel's open state are saved locally in the browser across reloads; temporary sidebar hover previews are not saved. Restored widths are constrained to the available desktop space. Unimplemented modes, attachments, and mock recent chats are hidden.

Conversation selection only changes the displayed view. Each conversation keeps its own messages, progress, errors, execution state, and unsent input; background conversations continue generating while you switch. The first visit loads uncached history, and stale responses cannot replace newer execution results or account versions.

Recent chat rows reveal an x delete action on hover or keyboard focus; touch navigation keeps it visible. Clicking x opens a confirmation dialog with Delete and Cancel; Escape cancels. Confirmed deletion clears chat content and returns to New chat when deleting the selected conversation. Active responses must finish before deletion; failures leave the chat available.

Chats generating a response show a spinner on the right of their recent-chat row, including background conversations. Hovering or focusing the row hides the spinner; it disappears when execution ends.

Errors from sign-in, sign-out, requests, recent-chat loading, and deletion appear in dismissible toast notifications, including errors from background conversations. Notifications dismiss after six seconds, pause while hovered or focused, and keep recovery and retry actions available in the original chat. Switching conversations does not redisplay a dismissed notification.

New chat selects a separate unsent draft. Repeated clicks preserve it, and switching away and back preserves each view's input for the current page lifetime. Sending the draft creates a conversation with that first message and prepares a fresh empty draft. If you switch during creation, the new conversation is added to navigation without taking selection back or clearing the other view's input. Drafts are not saved across page reloads.

Before submitting a message, the app saves its request ID and payload in user-scoped session storage. Responses use either SSE or duplicate-request JSON, selected by Content-Type. Stream parsing handles split UTF-8 characters and event boundaries. On page startup, the app independently restores all valid saved pending requests without changing a later user selection. Switching conversations never submits or recovers a request. After a disconnect, the app retrieves the saved run; failed recovery remains available through Recover saved request. An uncertain submission reuses its original ID; an explicit retry creates a new ID. Expired or malformed pending requests are not replayed. Partial answers remain marked as incomplete.

## Resources

Resources opens in the right workspace panel. Community searches public resources by title and summary, filters by topic and file format, and offers Latest and Popular sorting. Popular cards show up to three reports with independent readers in the past seven days; owner views do not count. Public means visible to signed-in users, not anonymous internet access.

Filters open from the filter icon: choose Format, Topic, Sort by, or (in Personal) Category, then choose an option in its submenu. Personal opens on Private and uses a compact Public/Private switch without an All view.

Personal supports viewing, editing and deleting saved resources. The interface has no Add resource or category-management entry; resource creation is reserved for a future agent flow. Existing categories remain available as filters and in resource editing. Public/Private switching retains cached results and refreshes them without replacing the results region with a loading screen. Publishing exposes the report and all its attachments to Community. Private resources are only readable by their owner; file access is checked by the service on every request. Removing a category keeps its resources uncategorized.

Supported attachments are UTF-8 Markdown/TXT/CSV/JSON, PDF, PNG, JPG/JPEG, and WebP. CSV previews show at most 100 data rows and 20 columns; long text previews are truncated. Full attachments can be downloaded. Content is limited to 10 MiB per resource, 100 MiB and 1,000 resources per user, and 50 personal categories. Existing resources can be edited; chat replies are not automatically saved and agent-driven resource creation is not implemented yet.

## Trends

Trends uses no model calls. The service collects default-perpetual market snapshots every five minutes, the public leaderboard hourly, and eligible top-five addresses' raw positions every fifteen minutes while the service is online. Opening or refreshing the panel reads stored results, without triggering upstream queries. The panel polls stored results once a minute while visible.

Cards show the largest reported 24-hour notional volumes, largest absolute hourly funding rates, and approximately one-hour changes in underlying open interest. Hourly OI changes require a baseline 55–65 minutes old. During warm-up, the OI card shows available current underlying open interest for the most active markets, clearly labeled Current; it switches to change rankings once a baseline is available. Signals trigger at a 10% absolute hourly OI change, a funding sign crossing, a change within the stored leaderboard top five, or a tracked signed position change worth at least $1 million at the latest mark. Position comparisons are observations between snapshots, not individual trade notifications or a market-wide whale feed.

Each source has its own last-success time and failure/staleness indication. Failed refreshes preserve previous observations. The leaderboard uses a public, undocumented stats endpoint and is ranked by reported PnL, not risk-adjusted performance. Source-reported returns may cover other markets; tracked positions and market cards cover default perpetuals only. ROI remains unknown when absent. No fabricated cards or news are substituted when sources are unavailable. The feed retains up to 100 events for seven days, persists across service restarts, and exposes rule/source details.

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
