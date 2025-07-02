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

/**
 * 执行SQL查询
 * @param {string} query SQL查询
 * @returns {Promise<void>}
 */
async function executeQuery(query) {
  // 使用标准的supabase.rpc方式执行SQL查询
  const { data, error } = await supabase.rpc('postgresql_query', { q: query });
  
  if (error) {
    // 如果postgresql_query不可用，则提示使用手动方法
    if (error.message && error.message.includes('function postgresql_query() does not exist')) {
      console.warn('警告: Supabase服务器不支持直接执行SQL查询。');
      throw new Error('不支持的操作，请使用手动方法。');
    }
    throw new Error(`执行SQL时出错: ${error.message}`);
  }
  
  return data;
}

/**
 * 分割SQL脚本为单独的语句
 * @param {string} sql SQL脚本
 * @returns {string[]} SQL语句数组
 */
function splitSqlStatements(sql) {
  // 简单地按分号分割语句，但忽略注释中的分号和字符串中的分号
  const statements = [];
  let currentStatement = '';
  let inComment = false;
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';
    
    // 处理注释
    if (char === '-' && nextChar === '-' && !inString) {
      inComment = true;
      currentStatement += char;
      continue;
    }
    
    // 处理换行（结束单行注释）
    if ((char === '\n' || char === '\r') && inComment) {
      inComment = false;
      currentStatement += char;
      continue;
    }
    
    // 处理字符串
    if ((char === "'" || char === '"') && !inComment) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      currentStatement += char;
      continue;
    }
    
    // 处理语句结束
    if (char === ';' && !inComment && !inString) {
      currentStatement += char;
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }
    
    // 添加普通字符
    currentStatement += char;
  }
  
  // 添加最后一个语句（如果存在且不为空）
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(stmt => stmt.trim());
}

async function initDatabase() {
  try {
    console.log('正在读取SQL初始化文件...');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('正在连接到Supabase...');
    
    // 分割SQL脚本为单独的语句
    const sqlStatements = splitSqlStatements(sqlScript);
    
    console.log(`找到 ${sqlStatements.length} 条SQL语句需要执行...`);
    
    // 逐一执行SQL语句
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`正在执行第 ${i + 1}/${sqlStatements.length} 条SQL语句...`);
      
      try {
        await executeQuery(statement);
        console.log(`- 执行成功`);
      } catch (err) {
        // 如果表已存在等原因导致错误，但不影响主体功能，我们可以继续执行
        if (err.message.includes('already exists')) {
          console.warn(`- 警告: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('数据库初始化成功!');
    console.log('已创建表: job_worth_evaluations');
    console.log('已创建函数: get_average_job_worth_score');
    
  } catch (err) {
    console.error('执行初始化脚本时发生错误:', err.message);
    console.error('如果您无法解决此问题，请尝试使用手动方法:');
    console.error('运行 `npm run init:db:manual` 并按照提示操作');
    process.exit(1);
  }
}

initDatabase(); 