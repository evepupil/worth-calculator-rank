import { createClient } from 'redis';

// 环境变量类型定义
declare global {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    REDIS_URL: string;
  }
}

// 确保环境变量存在
if (!process.env.REDIS_URL) {
  throw new Error('缺少Redis环境变量 REDIS_URL');
}

// Redis客户端单例
let redisClient: ReturnType<typeof createClient> | null = null;
let connectionPromise: Promise<ReturnType<typeof createClient>> | null = null;

/**
 * 获取Redis客户端实例
 * 使用单例模式确保只创建一个连接
 */
export async function getRedisClient() {
  if (!redisClient) {
    if (!connectionPromise) {
      connectionPromise = createClient({
        url: process.env.REDIS_URL
      })
      .on('error', (err: Error) => {
        console.error('Redis连接错误:', err);
        redisClient = null;
        connectionPromise = null;
      })
      .connect();
    }
    
    try {
      redisClient = await connectionPromise;
    } catch (error) {
      console.error('Redis连接失败:', error);
      connectionPromise = null;
      throw error;
    }
  }
  
  return redisClient;
}

// Redis键名常量
const KEYS = {
  VISITS: 'job_worth:visits', // 总访问量
  VISITORS: 'job_worth:visitors', // 总访客数
  DAILY_VISITS: 'job_worth:daily_visits', // 每日访问量
  SCORE_DISTRIBUTION: 'job_worth:score_distribution', // 分数分布
  SCORE_COUNT: 'job_worth:score_count', // 总评估次数
};

/**
 * 记录访问
 * @param visitorId 访客ID（可以是IP或会话ID）
 */
export async function recordVisit(visitorId: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    
    // 增加总访问量
    await redis.incr(KEYS.VISITS);

    // 记录今天的日期
    const today = new Date().toISOString().split('T')[0];
    
    // 增加今天的访问量
    await redis.hIncrBy(KEYS.DAILY_VISITS, today, 1);
    
    // 添加访客ID到集合中（自动去重）
    await redis.sAdd(KEYS.VISITORS, visitorId);
  } catch (error) {
    console.error('记录访问失败:', error);
  }
}

/**
 * 获取访问统计数据
 */
export async function getVisitStats(): Promise<{
  totalVisits: number;
  uniqueVisitors: number;
  dailyVisits: Record<string, number>;
}> {
  try {
    const redis = await getRedisClient();
    
    // 获取总访问量
    const totalVisits = parseInt(await redis.get(KEYS.VISITS) || '0', 10);
    
    // 获取唯一访客数
    const uniqueVisitors = await redis.sCard(KEYS.VISITORS) || 0;
    
    // 获取每日访问量（最近7天）
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    const dailyVisits: Record<string, number> = {};
    const dailyData = await redis.hmGet(KEYS.DAILY_VISITS, dates);
    
    dates.forEach((date, index) => {
      // 确保dailyData存在且有对应的索引值
      const value = dailyData && Array.isArray(dailyData) && index < dailyData.length 
        ? dailyData[index] 
        : null;
      dailyVisits[date] = Number(value || 0);
    });
    
    return {
      totalVisits,
      uniqueVisitors,
      dailyVisits
    };
  } catch (error) {
    console.error('获取访问统计失败:', error);
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
      dailyVisits: {}
    };
  }
}

/**
 * 更新分数分布
 * @param score 评估分数
 */
export async function updateScoreDistribution(score: number): Promise<void> {
  try {
    const redis = await getRedisClient();
    
    // 将分数转换为字符串，保留两位小数
    const scoreStr = score.toFixed(2);
    
    // 增加该分数的计数
    await redis.hIncrBy(KEYS.SCORE_DISTRIBUTION, scoreStr, 1);
    
    // 增加总评估次数
    await redis.incr(KEYS.SCORE_COUNT);
  } catch (error) {
    console.error('更新分数分布失败:', error);
  }
}

/**
 * 计算分数的百分位排名
 * @param score 评估分数
 */
export async function getScorePercentile(score: number): Promise<{
  percentile: string;
  totalCount: number;
  lowerCount: number;
  success: boolean;
  error?: unknown;
}> {
  try {
    const redis = await getRedisClient();
    
    // 获取所有分数分布
    const distribution = await redis.hGetAll(KEYS.SCORE_DISTRIBUTION);
    
    if (!distribution || Object.keys(distribution).length === 0) {
      return {
        percentile: '0',
        totalCount: 0,
        lowerCount: 0,
        success: true
      };
    }
    
    // 计算总样本数和低于当前分数的样本数
    let totalCount = 0;
    let lowerCount = 0;
    
    Object.entries(distribution).forEach(([scoreStr, countStr]) => {
      const count = parseInt(countStr as string, 10);
      totalCount += count;
      
      if (parseFloat(scoreStr) < score) {
        lowerCount += count;
      }
    });
    
    // 计算百分位
    const percentile = totalCount > 0 ? ((lowerCount / totalCount) * 100).toFixed(1) : '0';
    
    return {
      percentile,
      totalCount,
      lowerCount,
      success: true
    };
  } catch (error) {
    console.error('计算分数百分位失败:', error);
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
 * 获取分数分布统计
 */
export async function getScoreDistributionStats(): Promise<{
  distribution: { score: string; count: number }[];
  totalCount: number;
  averageScore: number;
}> {
  try {
    const redis = await getRedisClient();
    
    // 获取所有分数分布
    const distribution = await redis.hGetAll(KEYS.SCORE_DISTRIBUTION);
    
    if (!distribution || Object.keys(distribution).length === 0) {
      return {
        distribution: [],
        totalCount: 0,
        averageScore: 0
      };
    }
    
    // 转换为数组并排序
    const scoreDistribution = Object.entries(distribution).map(([score, count]) => ({
      score,
      count: parseInt(count as string, 10)
    })).sort((a, b) => parseFloat(a.score) - parseFloat(b.score));
    
    // 计算总数和平均分
    let totalCount = 0;
    let scoreSum = 0;
    
    scoreDistribution.forEach(({ score, count }) => {
      totalCount += count;
      scoreSum += parseFloat(score) * count;
    });
    
    const averageScore = totalCount > 0 ? scoreSum / totalCount : 0;
    
    return {
      distribution: scoreDistribution,
      totalCount,
      averageScore
    };
  } catch (error) {
    console.error('获取分数分布统计失败:', error);
    return {
      distribution: [],
      totalCount: 0,
      averageScore: 0
    };
  }
}

/**
 * 计算排名
 * @param score 评估分数
 */
export async function calculateRank(score: number): Promise<{
  percentile: string;
  rank: number;
  totalCount: number;
}> {
  try {
    const { percentile, totalCount, lowerCount } = await getScorePercentile(score);
    
    // 计算排名（总数 - 低于当前分数的数量）
    const rank = totalCount - lowerCount;
    
    return {
      percentile,
      rank,
      totalCount
    };
  } catch (error) {
    console.error('计算排名失败:', error);
    return {
      percentile: '0',
      rank: 0,
      totalCount: 0
    };
  }
} 