KLANG PLAN V7.6.1 — RELEASE QA FIX

Production fixes over V7.6:
- Pre-validates Member invite/code before signup.
- Invalid/expired/fully-used code gives a clear error.
- Backend trigger rejects invalid supplied invite codes.
- Member Only cleaned up; visible VIP references removed.
- Legacy VIP database rows normalized to Member.
- Facebook Login button is hidden until OAuth is actually configured.
- Contact Page button is hidden until salesContactUrl is configured.
- Clearer email-confirmation/login error messages.
- URL invite auto-fills and locks the code field.
- Reduced duplicate auth/profile fetch behavior.
- Mobile overlay/pointer-event hotfixes.
- Mobile bottom nav, bottom sheet, 44–48px tap targets, 16px inputs retained.
- Smart fuzzy indicator search + expand-all indicator cards retained.
- Lesson Plan First + de-duplicated prompt + teacher/signature/style/palette/continue tools retained.
- Member-only Sales Ready admin retained.
- Curriculum verified: 2,155 records.

See QA-REPORT.txt for release checks.
