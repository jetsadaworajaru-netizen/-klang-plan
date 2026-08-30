KLANG PLAN V7.9.7 — NO EMAIL + REVENUE + MEMBER MANAGEMENT

1) สมัครสมาชิกไม่ใช้อีเมล
- หน้า Invite ให้กรอกแค่ชื่อ
- ตั้ง PIN ตัวเลข 6 หลัก
- ระบบสร้าง Member ID อัตโนมัติ
- 1 Invite = 1 Member
- Active ทันที

2) Dashboard รายได้
- รายได้สมาชิก = จำนวนสมาชิก Active × 169 บาท
- อัปเดตตามจำนวนสมาชิกที่ยังอยู่ในระบบ
- ไม่ใช้ price_paid เดิมเป็นตัวคำนวณ

3) รายชื่อสมาชิกทั้งหมด
- แสดงชื่อ / Member ID / วันเวลาสมัคร / สถานะ
- ค้นหาและกรองได้
- รีเซ็ตอุปกรณ์
- รีเซ็ต PIN
- ระงับ
- ลบสมาชิกออกจากระบบได้
- การลบต้องยืนยัน 2 ขั้น
- ลบ auth user และข้อมูลที่ผูกแบบ cascade
- Admin account ลบผ่านฟังก์ชันนี้ไม่ได้

Admin:
https://klang-plan.pages.dev/admin-panel.html

Teacher:
https://klang-plan.pages.dev/teacher.html
