KLANG PLAN V7.9.8 — STAGE SWITCH FIX + DASHBOARD MEMBER LIST

แก้:
1) กดเปลี่ยนช่วงชั้น/ระดับไม่ได้บนมือถือ/Messenger
- เปลี่ยนเป็น delegated click handler
- เพิ่ม capture mode กัน event ถูก element อื่นบัง
- เพิ่ม z-index / pointer-events / touch-action
- stage tabs เลื่อนแนวนอนได้บนมือถือ

2) Dashboard Admin
- เพิ่มช่อง “รายชื่อสมาชิกทั้งหมด”
- แสดง ชื่อ / Member ID / วันที่เวลา / สถานะ
- มีปุ่มไปหน้า “จัดการสมาชิก”
- หน้า Members เดิมยังค้นหา กรอง รีเซ็ต PIN รีเซ็ตอุปกรณ์ ระงับ และลบสมาชิกได้

Admin:
https://klang-plan.pages.dev/admin-panel.html
Teacher:
https://klang-plan.pages.dev/teacher.html
