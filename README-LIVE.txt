KLANG PLAN V7.8.2 — ADMIN ↔ USER FAST SWITCH SESSION FIX

แก้ปัญหา:
กด “สลับเป็นมุมผู้ใช้งาน” แล้วเหมือนถูก Logout

วิธีใหม่:
- ปุ่มสลับจะตรวจ Supabase Session ก่อน
- ไม่เรียก signOut
- ใช้ Session เดิมของ Admin
- ไปหน้า /?adminview=1
- หน้าเว็บครูแสดงแถบ “คุณกำลังดูเว็บในมุมผู้ใช้งาน”
- ปุ่มด้านบนสำหรับ Admin เปลี่ยนจาก “ออกจากระบบ” เป็น “กลับหลังบ้าน”
  เพื่อป้องกัน Admin เผลอกด Logout
- หน้า User มีปุ่มกลับ /admin/ ทันที
- มี auth resolving state ลดอาการหน้า Login กระพริบตอนกำลังอ่าน Session

URL:
User view: https://klang-plan.pages.dev/?adminview=1
Admin: https://klang-plan.pages.dev/admin/
