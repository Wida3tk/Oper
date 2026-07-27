UPDATE `enrollments` SET `status`='تم التواصل', `updated_at`=datetime('now') WHERE `status`='جديد';
UPDATE `orders` SET `academy_status`='تم التواصل', `updated_at`=datetime('now') WHERE `academy_status`='جديد' AND `order_type`!='حجز مقعد';
UPDATE `workflow_tasks`
SET `title`='تهيئة العميل واستكمال بياناته'
WHERE `entity_type`='enrollment'
  AND `status`!='مكتملة'
  AND `title` IN ('التواصل مع العميل وبدء التسجيل','تسليم العميل وبدء التهيئة');
