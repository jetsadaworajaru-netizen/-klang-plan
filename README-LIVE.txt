KLANG PLAN V7.6.1 — LOGIN HOTFIX

แก้เร่งด่วน:
- ปุ่ม “เข้าสู่ระบบ” บนคอมและมือถือมี Fallback เปิด Login Modal โดยตรง
- เพิ่ม z-index / pointer-events ป้องกัน element อื่นทับปุ่ม
- Login Modal มี fallback เปิด/ปิด/สลับแท็บ แม้ main app event handler มีปัญหา
- renderAuthState null-safe และคืน handler ปุ่ม login ทุกครั้ง
- เมื่อ Login สำเร็จ ปิด modal ด้วย fallback
- Supabase เพิ่ม claim_member_invite RPC แล้ว เพื่อรองรับ Private Invite/OAuth flow
- ฟีเจอร์ V7.6 Mobile First + V7.5 Member/Sales + V7.4 Smart Indicator คงเดิม
