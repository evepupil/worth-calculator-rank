#!/usr/bin/env node

/**
 * Supabase数据库初始化脚本
 * 
 * 此脚本将执行SQL文件来初始化Supabase数据库
 * 需要设置环境变量或.env文件中的Supabase URL和密钥
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: '.env.local' });
dotenv.config(); // 回退到.env

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('错误: 缺少Supabase配置。请确保设置了以下环境变量:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY 或 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('\n提示: 推荐使用service role key以获得完整的数据库访问权限');
  process.exit(1);
}

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SQL文件路径
const sqlFilePath = path.join(__dirname, 'init-db.sql');

async function initDatabase() {
  try {
    console.log('正在读取SQL初始化文件...');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('正在连接到Supabase...');
    
    // 执行SQL命令
    console.log('正在执行SQL初始化命令...');
    const { error } = await supabase.rpc('pgmoon.run_sql', { query_text: sqlCommands });
    
    if (error) {
      if (error.message.includes('function pgmoon.run_sql() does not exist')) {
        console.error('错误: pgmoon扩展可能未启用。');
        console.error('解决方案: 请使用Supabase仪表板中的SQL编辑器手动执行SQL文件内容。');
        console.log('SQL文件内容:\n');
        console.log(sqlCommands);
      } else {
        console.error('初始化数据库时出错:', error.message);
      }
      process.exit(1);
    }
    
    console.log('数据库初始化成功!');
    console.log('已创建表: job_worth_evaluations');
    console.log('已创建函数: get_average_job_worth_score');
    
  } catch (err) {
    console.error('执行初始化脚本时发生错误:', err);
    console.error('请使用Supabase仪表板中的SQL编辑器手动执行SQL文件内容。');
    process.exit(1);
  }
}

initDatabase(); 