# Admin login notifications

Frontend: `src/components/AdminNotifications.jsx`, mounted in the logged-in header only for an Admin account. Polls every 30 seconds while the page is visible; opening the panel refreshes it immediately. Supports light/dark mode, mobile, Vietnamese/English, unread counts, and marking the displayed history read.

Backend changes are applied to the sibling `PHH EFOOTBALL BACKEND/PHH EFOOTBALL BACKEND` project. Normal and Google login record a server-side event for non-admin accounts. An admin login does not create an event. Both notification endpoints require an Admin JWT and recheck that user's role in the database. Read state belongs to each admin separately.

Restart the backend after deploying the new source. Existing startup schema synchronization creates `AdminActivityEvents` and `AdminActivityReads`; no manual migration is needed. This task did not connect to or change a running database. Events begin after the updated backend is running.

Checks:

- Frontend production build and targeted ESLint.
- Backend `dotnet build --no-restore`.
- `dotnet run --project .work-admin-notifications/checks/Checks.csproj`: anonymous 401; User and BTC 403; Admin without a user-id claim 403; login event identity and timestamp; admin login excluded; storage failure preserves authentication.

The checks use a local HTTP host and stubbed writes. Persistence, read-watermark SQL, and valid-admin retrieval still need verification against the application's configured SQL Server after restart.
