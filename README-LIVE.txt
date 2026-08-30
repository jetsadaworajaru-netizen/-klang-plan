KLANG PLAN V8.6 — FAILSAFE MEMBER CORE

ปัญหาที่แก้:
หน้า Member เปิดได้ แต่ปุ่มช่วงชั้น/ระดับชั้น/ตัวชี้วัด/สร้าง Prompt ไม่ตอบสนอง

แนวทาง V8.6:
- เพิ่ม member-core.js เป็นแกนใช้งานอิสระจาก app.js เดิม
- แม้ app.js เดิมมี runtime error สคริปต์ใหม่ยังทำงานต่อได้
- member-core.js ดูแลโดยตรง:
  1. ปฐมวัย / ประถม / มัธยม
  2. ระดับชั้น
  3. กลุ่มสาระ / ด้าน
  4. ค้นหา + เลือกตัวชี้วัด
  5. รายละเอียดแผน
  6. สไตล์ / โทนสี
  7. สร้าง Prompt
  8. คัดลอก Prompt
  9. สร้างต่อ: ใบงาน / แบบทดสอบ / ใบความรู้ / Rubric / เกม / Teaching Pack
  10. แท็บด้านบน
  11. เปิด ChatGPT / Gemini / Claude / Canva
- data.json ใช้ cache bust v=860
- เพิ่ม no-cache ให้ member-core.js / app.js / styles.css / data.json
- เพิ่ม touch-action และ pointer-events สำหรับ Safari/Messenger

หลัง Deploy ต้องปิดหน้าเดิมแล้วเปิดใหม่:
https://klang-plan.pages.dev/teacher.html
