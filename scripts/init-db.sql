-- job_worth_evaluations 表创建
CREATE TABLE IF NOT EXISTS job_worth_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_data JSONB NOT NULL,
  result_score NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_info JSONB
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS job_worth_evaluations_created_at_idx ON job_worth_evaluations (created_at DESC);
CREATE INDEX IF NOT EXISTS job_worth_evaluations_result_score_idx ON job_worth_evaluations (result_score);

-- 创建获取平均分数的函数
CREATE OR REPLACE FUNCTION get_average_job_worth_score()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT COALESCE(AVG(result_score), 0) FROM job_worth_evaluations);
END;
$$ LANGUAGE plpgsql; 