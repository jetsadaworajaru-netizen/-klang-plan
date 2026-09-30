# วิธีเปิดใช้ Course Cloud ของ V9.2.4

1. สำรองฐานข้อมูล Production ก่อน
2. เปิด Supabase project ของ **Klang Plan** เท่านั้น
3. เปิด SQL Editor และรัน `supabase-v9.2.4-persistence.sql`
4. ตรวจว่า table `courses` และตาราง V9.2 ใหม่ถูกสร้าง พร้อม RLS owner-only
5. Deploy V9.2.4 เป็น Preview ก่อน Production
6. ล็อกอินด้วย Member ทดสอบ สร้าง 1 รายวิชา แล้วกด `☁️ ซิงก์รายวิชา`
7. รีเฟรช/เปิดอีกอุปกรณ์เพื่อยืนยันว่ารายวิชากลับมาจาก Cloud

> อย่ารัน migration นี้กับ `klang-research-staging` เพราะเป็นอีกผลิตภัณฑ์หนึ่ง
