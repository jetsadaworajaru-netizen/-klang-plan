KLANG PLAN V7.5 — MEMBER ONLY + SALES READY

แนวทางธุรกิจช่วงเริ่มต้น
- มีสิทธิ์ใช้งานจริงเพียง Member และ Admin
- Member ทุกคนใช้ฟีเจอร์เหมือนกันทั้งหมด
- ไม่มีการแบ่ง VIP ในหน้าเว็บช่วงนี้
- การชำระเงินยังใช้โอนเข้าบัญชี + ส่งสลิปผ่านเพจ
- หลังแอดมินตรวจสลิป กดสร้าง Private Invite Link
- Private Invite: สมัครสำเร็จแล้ว Active Member อัตโนมัติ
- Public Promo Code: สมัครแล้ว Pending ให้แอดมินอนุมัติ

Supabase V7.5
- invite_codes เพิ่ม invite_type, auto_activate, sales_source, campaign_name, price_paid, payment_note
- profiles เพิ่ม auth_provider, provider_user_id, avatar_url, sales_source, campaign_name, price_paid, payment_status
- RPC admin_create_member_invite
- RPC claim_member_invite สำหรับ OAuth/Facebook flow
- handle_new_user รองรับ Member-only + Auto Activate

ระบบสมาชิก
- ครั้งแรก: ชื่อครู + อีเมล + Invite/Code + ตั้งรหัสผ่าน
- ครั้งถัดไป: Email + Password
- Facebook Login เตรียมโค้ดไว้แล้ว แต่ต้องเชื่อม Meta App/Supabase Provider ก่อน
- สามารถตั้ง salesContactUrl ใน config.js เพื่อเปิดปุ่มติดต่อเพจ

Admin
- Dashboard
- รออนุมัติ
- สมาชิก
- ลิงก์ส่วนตัวหลังชำระเงิน
- Code โปรโมชั่น
- ประวัติการใช้งาน
- หลักสูตร
- ตั้งค่าระบบ
- เก็บ source / campaign / price เพื่อวิเคราะห์ยอดขายและโปรโมชั่นในอนาคต

ฟีเจอร์ Lesson Builder / Smart Indicator Search / Styles / Continue Builder จาก V7.4 ยังคงอยู่
