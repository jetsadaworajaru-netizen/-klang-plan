KLANG PLAN V8.5.1 — INTERACTION HOTFIX

อาการ:
- หน้า “สร้างแผน” เปิดได้ แต่กดช่วงชั้น/ระดับชั้น/ตัวชี้วัด/ปุ่มต่าง ๆ ไม่ได้
- ช่องข้อมูลค้างที่ “กำลังโหลดข้อมูล...”

สาเหตุ:
V8.4/V8.5 ลบหน้า Login และ Admin เก่าออกจาก member-app.html แล้ว
แต่ app.js ยังมี event handler เก่าบางส่วนที่อ้าง element เหล่านั้นโดยตรง
JavaScript จึงหยุดทำงานก่อนเริ่มโหลด data.json และก่อนผูก event ของตัวเลือกหลักสูตร

แก้ไข:
- ทำ compatibility guard สำหรับ legacy element ที่ไม่ใช้แล้ว เพื่อไม่ให้ JS crash
- ตรวจ direct element references ใน member-app.html แล้ว
- เพิ่ม cache bust app.js/styles.css เป็น v=851
- data.json no-cache
- เพิ่มข้อความ fallback หากโหลด curriculum ไม่สำเร็จ
- app.js/admin.js/join.js ผ่าน node --check

หลัง Deploy:
1. ปิดหน้า Messenger/Safari เดิม
2. เปิด teacher.html ใหม่
3. Login
4. ทดสอบ ปฐมวัย > ระดับชั้น > กลุ่มสาระ > ตัวชี้วัด
5. ทดสอบสร้าง Prompt

Teacher:
https://klang-plan.pages.dev/teacher.html
