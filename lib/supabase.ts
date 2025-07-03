import { createClient } from '@supabase/supabase-js';

// 环境变量类型定义
declare global {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}

// 确保环境变量存在
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('缺少Supabase环境变量');
}

// 创建Supabase客户端
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 表单数据接口
export interface JobWorthFormData {
  salary: string;
  workDaysPerWeek: string;
  wfhDaysPerWeek: string;
  annualLeave: string;
  paidSickLeave: string;
  publicHolidays: string;
  workHours: string;
  commuteHours: string;
  restTime: string;
  cityFactor: string;
  workEnvironment: string;
  leadership: string;
  teamwork: string;
  homeTown: string;
  degreeType: string;
  schoolType: string;
  bachelorType: string;
  workYears: string;
  shuttle: string;
  canteen: string;
  jobStability: string;
  education: string;
  hasShuttle: boolean;
  hasCanteen: boolean;
  countryCode?: string;
}

// 评估结果接口
export interface JobWorthResult {
  id: string;
  input_data: JobWorthFormData;
  result_score: number;
  created_at: string;
  client_info?: {
    ip?: string;
    country?: string;
    city?: string;
    user_agent?: string;
  };
}

/**
 * 保存工作价值评估结果
 * @param data 评估数据
 * @returns 保存的结果
 */
export async function saveJobWorthResult(data: {
  input_data: JobWorthFormData;
  result_score: number;
  created_at: string;
  client_info?: {
    ip?: string;
    country?: string;
    city?: string;
    user_agent?: string;
  };
}): Promise<{ id: string }> {
  try {
    const { data: result, error } = await supabase
      .from('job_worth_evaluations')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      console.error('保存评估结果失败:', error);
      throw error;
    }

    return { id: result.id };
  } catch (error) {
    console.error('保存评估结果失败:', error);
    throw error;
  }
}

/**
 * 获取工作价值评估结果
 * @param id 评估结果ID
 * @returns 评估结果
 */
export async function getJobWorthResult(id: string): Promise<JobWorthResult | null> {
  try {
    const { data, error } = await supabase
      .from('job_worth_evaluations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('获取评估结果失败:', error);
      return null;
    }

    return data as JobWorthResult;
  } catch (error) {
    console.error('获取评估结果失败:', error);
    return null;
  }
}

/**
 * 获取最近的评估结果列表
 * @param limit 限制数量
 * @returns 评估结果列表
 */
export async function getRecentJobWorthResults(limit: number = 10): Promise<JobWorthResult[]> {
  try {
    const { data, error } = await supabase
      .from('job_worth_evaluations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取最近评估结果失败:', error);
      return [];
    }

    return data as JobWorthResult[];
  } catch (error) {
    console.error('获取最近评估结果失败:', error);
    return [];
  }
}

/**
 * 获取评估结果统计数据
 * @returns 统计数据
 */
export async function getJobWorthStats(): Promise<{
  total: number;
  avgScore: number;
  countByScoreRange: { range: string; count: number }[];
}> {
  try {
    // 获取总数
    const { count: total, error: countError } = await supabase
      .from('job_worth_evaluations')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('获取评估总数失败:', countError);
      throw countError;
    }

    // 获取平均分
    const { data: avgData, error: avgError } = await supabase
      .rpc('get_average_job_worth_score');

    if (avgError) {
      console.error('获取平均分失败:', avgError);
      throw avgError;
    }

    const avgScore = avgData || 0;

    // 获取分数段分布
    const scoreRanges = [
      { min: 0, max: 0.6, label: '0-0.6' },
      { min: 0.6, max: 1.0, label: '0.6-1.0' },
      { min: 1.0, max: 1.8, label: '1.0-1.8' },
      { min: 1.8, max: 2.5, label: '1.8-2.5' },
      { min: 2.5, max: 3.2, label: '2.5-3.2' },
      { min: 3.2, max: 4.0, label: '3.2-4.0' },
      { min: 4.0, max: 100, label: '4.0+' }
    ];

    const countByScoreRange = await Promise.all(
      scoreRanges.map(async ({ min, max, label }) => {
        const { count, error } = await supabase
          .from('job_worth_evaluations')
          .select('*', { count: 'exact', head: true })
          .gte('result_score', min)
          .lt('result_score', max);

        if (error) {
          console.error(`获取分数段 ${label} 数量失败:`, error);
          return { range: label, count: 0 };
        }

        return { range: label, count: count || 0 };
      })
    );

    return {
      total: total || 0,
      avgScore,
      countByScoreRange
    };
  } catch (error) {
    console.error('获取评估统计数据失败:', error);
    return {
      total: 0,
      avgScore: 0,
      countByScoreRange: []
    };
  }
}

/**
 * 检查是否存在重复提交
 * @param clientInfo 客户端信息
 * @param score 评估分数
 * @returns 是否存在重复提交
 */
export async function checkDuplicateSubmission(
  clientInfo: {
    ip?: string;
    userAgent?: string;
    country?: string;
    city?: string;
  },
  score: number
): Promise<boolean> {
  try {
    // 如果没有IP信息，无法进行重复检查
    if (!clientInfo.ip || clientInfo.ip === '未知') {
      console.log('无法检查重复提交: 缺少IP信息');
      return false;
    }

    console.log(`检查IP ${clientInfo.ip} 在过去10分钟内的提交记录`);
    
    // 查询最近10分钟内相同IP的提交记录
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    // 使用正确的JSON查询语法
    const { data, error } = await supabase
      .from('job_worth_evaluations')
      .select('id, created_at, result_score')
      .contains('client_info', { ip: clientInfo.ip })
      .gte('created_at', tenMinutesAgo.toISOString());

    if (error) {
      console.error('检查重复提交失败:', error);
      // 如果发生错误，为安全起见不阻止提交
      return false;
    }

    // 如果有任何记录，则认为是重复提交
    const hasRecent = data && data.length > 0;
    
    if (hasRecent) {
      console.log(`发现IP ${clientInfo.ip} 在过去10分钟内有 ${data?.length || 0} 条提交记录`);
      // 记录找到的记录，帮助调试
      if (data && data.length > 0) {
        data.forEach(record => {
          console.log(`- ID: ${record.id}, 时间: ${record.created_at}, 分数: ${record.result_score}`);
        });
      }
    } else {
      console.log(`IP ${clientInfo.ip} 在过去10分钟内没有提交记录`);
    }
    
    return hasRecent;
  } catch (error) {
    console.error('检查重复提交时发生异常:', error);
    // 如果发生异常，为安全起见不阻止提交
    return false;
  }
}

/**
 * 从数据库计算分数的百分位排名
 * @param score 评估分数
 */
export async function getScorePercentileFromDB(score: number): Promise<{
  percentile: string;
  totalCount: number;
  lowerCount: number;
  success: boolean;
  error?: unknown;
}> {
  try {
    console.log(`从数据库计算分数 ${score.toFixed(2)} 的百分位排名`);
    
    // 获取总评估数量
    const { count: totalCount, error: countError } = await supabase
      .from('job_worth_evaluations')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('获取评估总数失败:', countError);
      throw countError;
    }

    // 获取低于当前分数的评估数量
    const { count: lowerCount, error: lowerError } = await supabase
      .from('job_worth_evaluations')
      .select('*', { count: 'exact', head: true })
      .lt('result_score', score);

    if (lowerError) {
      console.error('获取低于分数的评估数量失败:', lowerError);
      throw lowerError;
    }

    // 确保 totalCount 和 lowerCount 不为 null
    const safeTotal = totalCount || 0;
    const safeLower = lowerCount || 0;
    
    // 计算百分位
    const percentile = safeTotal > 0 ? ((safeLower / safeTotal) * 100).toFixed(1) : '0';
    
    console.log(`分数 ${score.toFixed(2)} 的百分位排名计算结果:`, {
      percentile,
      totalCount: safeTotal,
      lowerCount: safeLower
    });

    return {
      percentile,
      totalCount: safeTotal,
      lowerCount: safeLower,
      success: true
    };
  } catch (error) {
    console.error('从数据库计算分数百分位失败:', error);
    return {
      percentile: '0',
      totalCount: 0,
      lowerCount: 0,
      success: false,
      error
    };
  }
}

/**
 * 从数据库计算排名
 * @param score 评估分数
 */
export async function calculateRankFromDB(score: number): Promise<{
  percentile: string;
  rank: number;
  totalCount: number;
}> {
  try {
    const { percentile, totalCount, lowerCount } = await getScorePercentileFromDB(score);
    
    // rank直接表示超过的人数，即低于当前分数的人数
    const rank = lowerCount;
    
    return {
      percentile,
      rank,
      totalCount
    };
  } catch (error) {
    console.error('从数据库计算排名失败:', error);
    return {
      percentile: '0',
      rank: 0,
      totalCount: 0
    };
  }
} 