KLANG PLAN V8.3 — HARD MEMBER / ADMIN SEPARATION

โครงสร้างใหม่:
- /teacher.html = หน้า Login ครูเท่านั้น
- /member-app.html = แอปสำหรับสมาชิกหลัง Login
- /admin-panel.html = ระบบหลังบ้าน Admin เท่านั้น
- /join.html?invite=... = สมัครครั้งแรก

แก้ปัญหา:
1) Member เห็นระบบหลังบ้าน
   - Admin และ Member ใช้ auth storage คนละ key
   - member-app ตรวจ role=member + status=active เท่านั้น
   - ถ้าไม่ผ่านจะเด้งกลับ /teacher.html
2) teacher.html เปิดมาเข้าหน้าระบบเลย
   - teacher.html ถูกเปลี่ยนเป็นหน้า Login จริงแบบ standalone
3) ปุ่มในแอปกดไม่ได้
   - app.js มี hard auth flow ที่สั้นลง
   - legacy missing elements เปลี่ยนเป็น null-safe
4) Cache
   - เพิ่ม _headers no-store สำหรับหน้าและ JS สำคัญ

ลิงก์ใหม่:
ครู Login: https://klang-plan.pages.dev/teacher.html
แอปสมาชิก: https://klang-plan.pages.dev/member-app.html
Admin: https://klang-plan.pages.dev/admin-panel.html
