<div align="center">

<img src="title.png" alt="Job Worth Calculator" width="500" />
<br><br>

<a href="https://trendshift.io/repositories/13145" target="_blank"><img src="https://trendshift.io/api/badge/repositories/13145" alt="Zippland%2Fworth-calculator | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

<p>
   <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
   <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
   <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
   <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

<div align="center">

**[⚡ Try it now ⚡](https://worthjob.zippland.com)**

</div>

<p>
   <a href="#english"><img src="https://img.shields.io/badge/English-blue?style=for-the-badge" alt="English" /></a>
   &nbsp;&nbsp;
   <a href="#中文"><img src="https://img.shields.io/badge/中文-red?style=for-the-badge" alt="中文" /></a>
   &nbsp;&nbsp;
   <a href="#japanese"><img src="https://img.shields.io/badge/日本語-green?style=for-the-badge" alt="日本語" /></a>
</p>

</div>

---

<div id="english">

<h2 align="center">📊 Job Worth Calculator</h2>

<p align="center"><i>Calculating the actual value of your job beyond just salary</i></p>

### ✨ Features

- **💰 Comprehensive Evaluation**: Calculate job worth based on salary, work hours, commute time, environment, and more
- **🌏 PPP Conversion**: International salary comparison with Purchasing Power Parity conversion across 190+ countries
- **👩‍🎓 Personal Factors**: Customize calculations with personal education level, work experience, and more
- **📱 Detailed Report**: Generate a shareable, downloadable job analysis report
- **🌐 Internationalization**: Available in both English and Chinese
- **📱 Mobile Friendly**: Responsive design works on all devices

### 🖥️ How to Use

1. Enter your annual salary
2. Select your country/region
3. Fill in work details (days per week, hours, commute time, etc.)
4. Specify environmental factors (city, work environment, team, etc.)
5. Input your education and experience
6. View your job worth score and detailed evaluation
7. Generate a shareable report

### 📊 The Calculation

The job worth score is calculated using a comprehensive formula that accounts for:
- Standardized daily salary (adjusted for PPP)
- Work-life balance factors (hours, commute, WFH options)
- Environmental aspects (office location, team dynamics)
- Educational qualification premiums
- Experience-based expectations

### 👨‍💻 Contributing

Contributions are welcome! Here's how you can help:

- [Open an issue](https://github.com/zippland/worth-calculator/issues/new) if you have suggestions or find a bug
- Fork the repository and submit a PR for new features or bug fixes
- Improve documentation or translations

Please make sure to test your changes before submitting a PR.

### 📝 License

[MIT License](LICENSE)

## 数据存储与统计

本项目使用Supabase和Redis进行数据存储和统计：

### Supabase配置

1. 创建Supabase账户并新建项目
2. 创建以下数据表：

```sql
-- 工作价值评估表
CREATE TABLE job_worth_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_data JSONB NOT NULL,
  result_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_info JSONB
);

-- 创建平均分计算函数
CREATE OR REPLACE FUNCTION get_average_job_worth_score()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT AVG(result_score) FROM job_worth_evaluations);
END;
$$ LANGUAGE plpgsql;
```

3. 在项目根目录创建`.env.local`文件，添加Supabase配置：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Redis配置

1. 创建Upstash Redis数据库
2. 在项目根目录的`.env.local`文件中添加Redis配置：

```
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

### 数据统计功能

- 访问量统计：记录总访问量和每日访问量
- 访客量统计：记录唯一访客数
- 分数分布统计：记录用户评估分数的分布
- 排名计算：根据历史数据计算用户评估结果的排名

</div>

---

<div id="中文">

<h2 align="center">📊 工作性价比计算器</h2>

<p align="center"><i>全面考量，计算薪资之外的工作真实价值</i></p>

### ✨ 特点

- **💰 全面评估**: 基于薪资、工作时间、通勤时间、工作环境等多方面因素计算工作价值
- **🌏 PPP转换**: 通过购买力平价(PPP)转换支持190多个国家的薪资比较
- **👩‍🎓 个人因素**: 根据个人学历、工作经验等定制计算
- **📱 详细报告**: 生成可分享、可下载的工作分析报告
- **🌐 国际化**: 支持中英文双语
- **📱 移动友好**: 响应式设计，适用于所有设备

### 🖥️ 使用方法

1. 输入年薪
2. 选择工作国家/地区
3. 填写工作细节（每周工作天数、工作时长、通勤时间等）
4. 指定环境因素（城市、工作环境、团队等）
5. 输入学历和工作经验
6. 查看工作性价比分数和详细评估
7. 生成可分享的报告

### 📊 计算方法

工作性价比分数使用全面的公式计算，考虑了：
- 标准化日薪（经PPP调整）
- 工作生活平衡因素（工作时长、通勤、远程工作选项）
- 环境因素（办公地点、团队关系）
- 学历加成
- 基于经验的期望值调整

### 👨‍💻 贡献指南

欢迎参与贡献！以下是您可以提供帮助的方式：

- 如有建议或发现错误，请[提交问题](https://github.com/zippland/worth-calculator/issues/new)
- 分叉仓库并提交PR，增加新功能或修复bug
- 改进文档或翻译

请确保在提交PR前测试您的更改。

### 📝 许可证

[MIT 许可证](LICENSE)

## 数据存储与统计

本项目使用Supabase和Redis进行数据存储和统计：

### Supabase配置

1. 创建Supabase账户并新建项目
2. 创建以下数据表：

```sql
-- 工作价值评估表
CREATE TABLE job_worth_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_data JSONB NOT NULL,
  result_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_info JSONB
);

-- 创建平均分计算函数
CREATE OR REPLACE FUNCTION get_average_job_worth_score()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT AVG(result_score) FROM job_worth_evaluations);
END;
$$ LANGUAGE plpgsql;
```

3. 在项目根目录创建`.env.local`文件，添加Supabase配置：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Redis配置

1. 创建Upstash Redis数据库
2. 在项目根目录的`.env.local`文件中添加Redis配置：

```
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

### 数据统计功能

- 访问量统计：记录总访问量和每日访问量
- 访客量统计：记录唯一访客数
- 分数分布统计：记录用户评估分数的分布
- 排名计算：根据历史数据计算用户评估结果的排名

</div>

---

<div id="japanese">

<h2 align="center">📊 仕事の価値計算機</h2>

<p align="center"><i>給料だけでなく、仕事の本当の価値を計算する</i></p>

### ✨ 特徴

- **💰 総合的な評価**: 給与、労働時間、通勤時間、職場環境など複数の要素に基づいて仕事の価値を計算
- **🌏 PPP変換**: 購買力平価(PPP)による190カ国以上の国際的な給与比較
- **👩‍🎓 個人要素**: 学歴、職務経験などに基づいてカスタマイズされた計算
- **📱 詳細レポート**: 共有可能でダウンロード可能な仕事分析レポートの生成
- **🌐 多言語対応**: 英語、中国語、日本語で利用可能
- **📱 モバイル対応**: すべてのデバイスで動作するレスポンシブデザイン

### 🖥️ 使用方法

1. 年収を入力
2. 国/地域を選択
3. 勤務詳細（週あたりの勤務日数、勤務時間、通勤時間など）を入力
4. 環境要素（都市、職場環境、チームなど）を指定
5. 学歴と経験を入力
6. 仕事の価値スコアと詳細評価を確認
7. 共有可能なレポートを生成

### 📊 計算方法

仕事の価値スコアは以下を考慮した総合的な計算式を使用しています：
- 標準化された日給（PPPで調整済み）
- ワークライフバランス要素（労働時間、通勤、リモートワークオプション）
- 環境的側面（オフィスの場所、チームダイナミクス）
- 教育資格による優遇
- 経験に基づく期待値

### 👨‍💻 貢献方法

貢献は大歓迎です！以下の方法でご協力いただけます：

- 提案やバグを発見した場合は[問題を報告](https://github.com/zippland/worth-calculator/issues/new)してください
- リポジトリをフォークし、新機能やバグ修正のためのPRを提出
- ドキュメントや翻訳の改善

PRを提出する前に変更をテストしてください。

### 📝 ライセンス

[MITライセンス](LICENSE)

## 数据存储与统计

本项目使用Supabase和Redis进行数据存储和统计：

### Supabase配置

1. 创建Supabase账户并新建项目
2. 创建以下数据表：

```sql
-- 工作价值评估表
CREATE TABLE job_worth_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_data JSONB NOT NULL,
  result_score NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_info JSONB
);

-- 创建平均分计算函数
CREATE OR REPLACE FUNCTION get_average_job_worth_score()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT AVG(result_score) FROM job_worth_evaluations);
END;
$$ LANGUAGE plpgsql;
```

3. 在项目根目录创建`.env.local`文件，添加Supabase配置：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Redis配置

1. 创建Upstash Redis数据库
2. 在项目根目录的`.env.local`文件中添加Redis配置：

```
UPSTASH_REDIS_REST_URL=your_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_redis_rest_token
```

### 数据统计功能

- 访问量统计：记录总访问量和每日访问量
- 访客量统计：记录唯一访客数
- 分数分布统计：记录用户评估分数的分布
- 排名计算：根据历史数据计算用户评估结果的排名

</div>