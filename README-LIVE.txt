KLANG PLAN V9.0.1 — LIBRARY FILTER FIX

สาเหตุของข้อความ:
Can't find variable: updateLibraryFilters

V9.0 เรียกใช้ updateLibraryFilters(), updateLibrarySubjects() และ applyLibraryFilters()
แต่ฟังก์ชันทั้ง 3 ตัวไม่ได้ถูกรวมเข้า member-app.js ตอนประกอบเวอร์ชัน

V9.0.1:
- เพิ่มฟังก์ชันกรองคลังตัวชี้วัดครบ
- ช่วงชั้น → ระดับชั้น → กลุ่มสาระ → ค้นหา
- เพิ่ม startup guard ไม่ให้ความผิดพลาดเฉพาะคลังตัวชี้วัดทำให้ทั้ง Member App เปิดไม่ได้
- bump cache เป็น v=901 สำหรับ Messenger/Safari
- member-app.js / admin.js / join.js ผ่าน node --check

Teacher:
https://klang-plan.pages.dev/teacher.html
