#!/usr/bin/env node

/**
 * 手动初始化数据库辅助脚本
 * 
 * 此脚本将输出初始化SQL，方便复制到Supabase SQL编辑器中手动执行
 */

const fs = require('fs');
const path = require('path');

// SQL文件路径
const sqlFilePath = path.join(__dirname, 'init-db.sql');

try {
  console.log('读取SQL文件...');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  console.log('\n============ 复制下面的SQL并粘贴到Supabase SQL编辑器中 ============\n');
  console.log(sqlContent);
  console.log('\n============================================================\n');
  
  console.log('使用说明:');
  console.log('1. 登录到 Supabase 仪表板');
  console.log('2. 在左侧菜单选择 "SQL 编辑器"');
  console.log('3. 创建一个新的查询');
  console.log('4. 粘贴上面的SQL代码');
  console.log('5. 点击 "运行" 按钮执行SQL');
  console.log('\n完成后，数据库将创建以下内容:');
  console.log('- job_worth_evaluations 表');
  console.log('- 相关索引');
  console.log('- get_average_job_worth_score 函数');
  
} catch (err) {
  console.error('读取SQL文件时出错:', err);
  process.exit(1);
} 