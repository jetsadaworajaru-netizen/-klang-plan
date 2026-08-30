KLANG PLAN V8.2 — AUTH SEPARATION + TEACHER INTERACTION FIX

แก้ปัญหาหลักจากภาพ:
1) Member เห็นระบบหลังบ้าน
- แยก Supabase session ของ Admin และ Member คนละ storage key
- Admin: klang-admin-auth
- Teacher/Member: klang-member-auth
- หน้า teacher ไม่รับ Admin session และไม่มีปุ่ม/โหมดหลังบ้าน

2) เปิด teacher.html แล้วเข้าระบบทันทีทั้งที่ควร Login
- ถ้าไม่มี Active Member session หน้า teacher จะล็อกและแสดง Login ก่อน
- Login ด้วย Member ID + PIN 6 หลัก
- เมื่อ login สำเร็จจึงเปิดหน้าใช้งาน
- ถ้ายังมี Member session ที่ถูกต้อง ระบบเข้าได้ตามปกติ ไม่ต้อง login ซ้ำทุกครั้ง

3) ปุ่มระดับชั้น/สร้าง Prompt กดไม่ได้
- พบสาเหตุสำคัญ: app.js ยังมี $("registerBtn").onclick แต่หน้า HTML ไม่มี registerBtn แล้ว
- JavaScript จึง crash ก่อนโหลด curriculum และก่อน bind ปุ่ม
- ลบ registration handler เก่าออก
- init Backend แยกจาก data loader
- เพิ่ม touch/pointer reliability สำหรับมือถือและ Messenger WebView

4) Admin และ Teacher แยก session ชัดเจน
- ลดปัญหาบัญชี Admin ไหลไปหน้า Member และกลับกัน

URLs:
Teacher: https://klang-plan.pages.dev/teacher.html
Admin: https://klang-plan.pages.dev/admin-panel.html
