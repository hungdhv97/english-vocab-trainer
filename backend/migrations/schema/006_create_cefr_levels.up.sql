-- Up migration: Create cefr_levels table

CREATE TABLE IF NOT EXISTS cefr_levels (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  group_name VARCHAR(50) NOT NULL,
  level_name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE INDEX idx_cefr_levels_code ON cefr_levels(code);

-- Insert CEFR levels
INSERT INTO cefr_levels (code, group_name, level_name, description) VALUES
('A1', 'Basic User', 'Beginner / Breakthrough', 'Có thể hiểu và sử dụng các mẫu câu rất đơn giản, giao tiếp cơ bản.'),
('A2', 'Basic User', 'Elementary / Waystage', 'Có thể giao tiếp trong các tình huống quen thuộc, mô tả ngắn gọn về bản thân, gia đình, môi trường xung quanh.'),
('B1', 'Independent User', 'Intermediate / Threshold', 'Hiểu được các điểm chính của văn bản quen thuộc và xử lý được hầu hết tình huống khi đi du lịch.'),
('B2', 'Independent User', 'Upper Intermediate / Vantage', 'Hiểu ý chính của văn bản phức tạp, giao tiếp khá trôi chảy và tự nhiên với người bản ngữ.'),
('C1', 'Proficient User', 'Advanced / Effective Operational Proficiency', 'Hiểu được các văn bản dài, phức tạp và diễn đạt ý tưởng trôi chảy, linh hoạt.'),
('C2', 'Proficient User', 'Proficiency / Mastery', 'Hiểu dễ dàng hầu hết mọi thứ nghe hoặc đọc được, diễn đạt chính xác và tinh tế.');

