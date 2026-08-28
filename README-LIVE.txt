KLANG PLAN V7.8.3 — CONTROL ROUTE FIX

แก้ Safari Redirect Loop ตอนสลับจากมุมผู้ใช้กลับหลังบ้าน

สาเหตุ:
ไฟล์ _redirects เก่าบน GitHub อาจยังคงอยู่ แม้ ZIP รุ่นใหม่จะไม่มีไฟล์นั้น
เพราะการอัปโหลดไฟล์ทับ GitHub ไม่ได้ลบไฟล์เก่าอัตโนมัติ

วิธีแก้:
- เปลี่ยน Admin route ใหม่เป็น /control/
- ใช้โฟลเดอร์จริง control/index.html
- ใส่ _redirects ตัวใหม่เพื่อ overwrite กฎเก่าที่อาจค้าง
- /admin/ เป็นหน้าแจ้งย้าย ไม่ auto redirect
- ปุ่ม User → Admin ใช้ /control/
- Session Admin เดิมยังคงอยู่

User:
https://klang-plan.pages.dev/

Admin:
https://klang-plan.pages.dev/control/
