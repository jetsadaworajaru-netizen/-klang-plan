KLANG PLAN V7.8.4 — DIRECT ADMIN FILE

แก้ปัญหาปุ่มเปิดหลังบ้านกดไม่ได้ / Redirect Loop แบบถาวร:
- ไม่ใช้ /admin/ หรือ /control/ เป็นเส้นทางหลักอีก
- หลังบ้านใช้ไฟล์ตรง /admin-panel.html
- ไม่มี pretty URL / directory redirect
- ปุ่ม “กลับหลังบ้าน” ในหน้า User ชี้ตรงไป /admin-panel.html
- หน้า /admin/ เก่าเป็นเพียงหน้าปุ่มสำรองที่ชี้ตรงไปไฟล์นี้
- _redirects ไม่มี routing rule

Admin:
https://klang-plan.pages.dev/admin-panel.html

User:
https://klang-plan.pages.dev/
