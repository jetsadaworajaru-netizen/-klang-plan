KLANG PLAN V7.9.6 — ADMIN MEMBER RECOVERY TOOLS

เพิ่มหลังบ้าน Admin:
1) รีเซ็ตอุปกรณ์สมาชิก
- ปลดอุปกรณ์เดิมทั้งหมดของสมาชิก
- หลังรีเซ็ต สมาชิกสามารถเข้าใหม่ได้สูงสุด 2 เครื่อง
- มีหน้าต่างยืนยันก่อนดำเนินการ
- บันทึก Admin Audit Log

2) รีเซ็ตรหัสผ่าน/PIN 6 หลัก
- Admin เลือกสมาชิกแล้วกด “รีเซ็ต PIN”
- ตั้ง PIN ใหม่เป็นตัวเลข 6 หลัก
- ต้องยืนยัน PIN สองครั้ง
- เรียก Supabase Edge Function admin-reset-pin
- Edge Function ตรวจว่า caller เป็น Active Admin ก่อน
- Member ไม่สามารถเรียกใช้เองได้
- บันทึก Admin Audit Log

ระบบเดิมยังอยู่:
- No email Member
- Member ID + PIN 6 หลัก
- 1 Invite = 1 Member
- Active ทันที
- 1 Member สูงสุด 2 เครื่อง
- Admin ค้นชื่อ / Member ID / Invite Code / วันที่สมัคร

Admin:
https://klang-plan.pages.dev/admin-panel.html
