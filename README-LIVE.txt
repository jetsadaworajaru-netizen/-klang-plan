KLANG PLAN V7.8.1 — ADMIN ROUTE LOOP FIX

แก้ Safari “เกิดการเปลี่ยนเส้นทางที่อยู่หน้าเว็บมากไป”
- ยกเลิกไฟล์ _redirects สำหรับ /admin
- ใช้โฟลเดอร์จริง admin/index.html
- URL Admin ใช้ /admin/
- ปุ่มสลับ Admin/User ใช้ /admin/
- ไม่ rewrite /admin ไป admin.html อีก

User:
https://klang-plan.pages.dev/

Admin:
https://klang-plan.pages.dev/admin/
