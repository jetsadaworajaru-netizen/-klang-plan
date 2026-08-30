KLANG PLAN V8.0 — MEMBER LIST RENDER FIX

สาเหตุที่รายชื่อสมาชิกขึ้น 0 คน:
- Dashboard เวอร์ชันก่อนลบกล่อง dPending ออกจาก HTML
- แต่ admin.js ยังเรียก dPending.textContent โดยตรง
- JavaScript จึงหยุดระหว่าง renderDashboard()
- ทำให้ renderDashboardMembers() และ renderMembers() ไม่ทำงานต่อ

แก้แล้ว:
- ทุก KPI เป็น null-safe
- แต่ละส่วนของ Dashboard render แยกกัน ป้องกันส่วนหนึ่งพังแล้วส่วนอื่นหาย
- รายชื่อสมาชิกทั้งหมดแสดงทันที
- เพิ่มสถานะ “กำลังโหลด...”
- เพิ่มปุ่มรีเฟรชรายชื่อ
- Dashboard/สมาชิกไม่ควรค้างเป็น 0 เพราะ widget อื่นผิดพลาดอีก

ข้อมูลฐานปัจจุบันมีสมาชิกจริงใน Supabase และจะถูกดึงมาแสดงหลัง Deploy เวอร์ชันนี้
