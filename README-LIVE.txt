KLANG PLAN V7.8.7 — DEDICATED TEACHER INVITE PAGE

แก้ปัญหา:
Admin สร้างลิงก์แล้วครูเปิดกลับเจอหน้า Admin Login

วิธีแก้:
- สร้างหน้าสมัครสมาชิกสาธารณะใหม่ /join.html
- Admin ทุกปุ่มสร้าง/คัดลอก Invite จะสร้าง:
  https://klang-plan.pages.dev/join.html?invite=KP-...
- หน้า join.html ไม่มี Admin UI และไม่มีปุ่ม Admin Login
- ครูกรอก: ชื่อ / อีเมล / ตั้งรหัสผ่าน / ยืนยันรหัสผ่าน
- invite code ถูกฝังใน URL และส่งเข้า Supabase metadata อัตโนมัติ
- Private Paid Invite ยังคงใช้ได้ 1 คน + Auto Active
- สมัครเสร็จไป teacher.html

Admin:
https://klang-plan.pages.dev/admin-panel.html

Teacher:
https://klang-plan.pages.dev/teacher.html

Invite:
https://klang-plan.pages.dev/join.html?invite=KP-...
