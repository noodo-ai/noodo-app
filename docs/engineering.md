# Engineering conventions

This document is the source of truth for repository engineering rules. [AGENTS.md](../AGENTS.md) routes agents here. The optional `noodo-review` skill supplies the shared review workflow; `noodo-ui-standards` supplies detailed visual and interaction guidance. [README.md](../README.md) describes current behavior and setup.

## Responsibility boundaries

- `src/app/` owns route/page composition and top-level coordination.
- `src/features/<feature>/` owns the feature's components, hooks, types, data, and pure behavior. Extract modules around a clear responsibility, not a line-count target.
- `src/shared/` contains code with established cross-feature reuse. Do not introduce generic wrappers or tiny forwarding components solely to shorten files.
- Components project state and expose typed interactions. Keep requests, subscriptions, recovery, and nontrivial interaction state in focused hooks with cleanup; keep pure transformations outside render bodies.
- Use explicit public types, canonical feature types, and minimal source state. Avoid `any`, duplicate derived state, and a global state library for local coordination.
- Preserve stylesheet import order in `src/styles.css`. Reuse existing tokens, components, icons, and feedback patterns instead of adding a second styling system.

## Correctness and interaction

Keep request IDs stable for uncertain submissions; explicit retries create new IDs. Scope pending requests to the authenticated user and do not replay expired or malformed entries. Preserve the distinction between complete and partial answers.

Conversation selection and execution have separate lifecycles. Opening a conversation only selects a view and loads uncached history; it must not submit, recover, cancel, or clear live state. Keep messages, account metadata, history cursor/loading/error, composer drafts, and execution progress scoped to each conversation. New chat is a separate page-lifetime draft, reused until sent; successful creation must not take back a selection changed during the request or clear another view's draft.

Use navigation generations only to validate navigation (such as async creation selecting its result). Validate history and account updates using each conversation's data revision and monotonic account version, including background startup and pagination requests. Deduplicate recovery from before history loading through execution, and recheck the current pending identity after async loading. Restore persisted Pending only during startup or an explicit recovery action; execution transport failure can recover its known run automatically. Error text is display state, not a recovery policy. Background recovery must never select a view, and a list refresh must not determine execution success or completion.

Handle SSE framing and split UTF-8 input, as well as duplicate-request JSON responses selected by Content-Type. Prevent stale history, account, conversation, or run responses from overwriting the current selection. Clean up subscriptions, listeners, and timers, and preserve cancellation and recovery behavior.

Keep unknown financial values unknown and preserve decimal precision, source IDs, and coverage through parsing and display. Do not put secrets in public `VITE_*` configuration.

Keep loading, empty, error, disabled, and in-progress states explicit and accessible. Use native controls, meaningful labels, keyboard access, and focus handling; hidden panels must not receive focus. Respect reduced motion and avoid horizontal overflow across desktop, tablet, and mobile layouts. Use English interface copy by default.

## Review priorities and contracts

Trace the changed behavior through submission, streaming, duplicate responses, disconnect, saved-run recovery, explicit retry, cancellation, and terminal display as applicable. For selection changes, check stale responses and user/account ownership. Review failure paths and data correctness before cosmetic preferences.

For changes to API payloads, SSE events, request IDs, account versions, or recovery semantics, inspect the matching `noodo-service` producer and its tests when available. The service [design document](../../noodo-service/docs/crypto-ai-assistant-design.md) and [acceptance checklist](../../noodo-service/docs/acceptance.md) provide requirements and verification context when relevant. Record an unavailable counterpart or missing requirement as a review limitation.

## Validation

Use the configured scripts: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` for relevant source changes. Add focused regression tests for corrected behavior; avoid tests that merely repeat implementation details. For visual or interaction changes, verify affected states at desktop, tablet, and mobile widths, including transition and focus behavior.

For documentation-only changes, check links and consistency instead of running unrelated code suites. A review selects relevant checks and reports what was actually run; it does not imply live-provider or full browser acceptance.
