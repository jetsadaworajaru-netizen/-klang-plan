KLANG PLAN V9.1 — FINAL RELEASE

FINAL CURRICULUM AUDIT
- Records: 2155
- ปฐมวัย: 99
- ประถมศึกษา: 1061
- มัธยมศึกษา: 995
- Core duplicate records: 0
- Missing core fields: {'dataset_id': 0, 'stage': 0, 'curriculum': 0, 'grade': 0, 'subject': 0, 'standard': 0, 'indicator': 0, 'indicator_text': 0, 'status': 0}
- Shared ม.4–6 records: 197
- Per-record direct source URL: 1400
- Curriculum-group source metadata gap: 755
- Dataset SHA256: e2707adf572fc69d7263926371f3cac4d025d1ca973d834af41778b2ca183014

V9.1 FINAL FIXES
1. ม.4–6 shared indicator UX
   - ครูเลือก ม.4 / ม.5 / ม.6 ตามปกติ
   - ระบบดึง record ม.4–6 ผ่าน available_grades โดยอัตโนมัติ
   - ไม่แสดง “ม.4–6” เป็นระดับชั้นที่ครูต้องเลือก
2. Prompt แสดง “ระดับชั้นที่ครูเลือกจริง” แต่คงรหัสตัวชี้วัด ม.4-6 ตามหลักสูตร
3. คลังตัวชี้วัดใช้ logic เดียวกัน
4. Dataset integrity guard = 2,155 records
5. Lock dataset manifest: curriculum-manifest.json
6. Cache bump = V9.1 / v=910
7. final-qa.html สำหรับ smoke test ก่อนเปิดจริง

หมายเหตุ:
ไม่มีการแต่ง URL อ้างอิงให้ record ที่ source ว่าง
metadata gap ถูกบันทึกตรงไปตรงมาใน curriculum-manifest.json

Teacher:
https://klang-plan.pages.dev/teacher.html
Member:
https://klang-plan.pages.dev/member-app.html
Admin:
https://klang-plan.pages.dev/admin-panel.html
QA:
https://klang-plan.pages.dev/final-qa.html
