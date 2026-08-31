KLANG PLAN V9.1.2 — REAL 7-DAY TRIAL

แก้ระบบ Code โปรโมชั่นให้เป็น Trial จริง

Admin:
- ชื่อแคมเปญ
- จำนวนครูสูงสุด (ค่าเริ่มต้น 30)
- วันทดลองต่อบัญชี (ค่าเริ่มต้น 7 วัน)
- อายุลิงก์รับสมัคร (ค่าเริ่มต้น 3 วัน)
- สร้างลิงก์ถูกต้องเป็น /join.html?invite=KP-T...
- ครูสมัครแล้ว Active ทันที ไม่ต้องอนุมัติซ้ำ

Backend:
- invite_codes.trial_days
- RPC admin_create_trial_invite(...)
- invite_type = trial
- auto_activate = true
- แต่ละคนได้ membership_expires_at = เวลาสมัคร + trial_days
- นับ 7 วันแยกตามวันที่แต่ละคนสมัคร

Access:
- teacher.html ตรวจ membership_expires_at
- member-app.html ตรวจ membership_expires_at
- หมด Trial แล้วจะไม่เข้า Member App และแจ้งให้ติดต่อ Admin

ตัวอย่าง:
สร้างแคมเปญ 30 คน / ทดลอง 7 วัน / ลิงก์รับสมัคร 3 วัน
ครู A สมัคร 1 ก.ย. → หมดสิทธิ์ 8 ก.ย.
ครู B สมัคร 2 ก.ย. → หมดสิทธิ์ 9 ก.ย.

Backend migration applied:
v912_real_trial_invites
