import { NextRequest, NextResponse } from 'next/server';
import { updateScoreDistribution, getScorePercentile } from '@/lib/redis';
import { getJobWorthStats, checkDuplicateSubmission } from '@/lib/supabase';
import { getClientInfo } from '@/lib/utils';

// 使用Map记录最近的请求，避免重复处理
// key: IP+分数，value: 时间戳
const recentRequests = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟内相同IP+分数只处理一次

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score } = body;
    
    if (typeof score !== 'number' || isNaN(score)) {
      return NextResponse.json(
        { success: false, error: '无效的分数' },
        { status: 400 }
      );
    }

    // 获取客户端信息
    const clientInfo = getClientInfo();

    // 获取客户端IP
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              '未知';
    
    // 完整的客户端信息，包含IP
    const fullClientInfo = {
      ...clientInfo,
      ip: ip.toString()
    };
    
    // 创建请求标识，使用IP+分数作为键
    const requestKey = `${ip}-${score.toFixed(2)}`;
    const now = Date.now();
    
    // 检查是否是重复请求
    const lastRequest = recentRequests.get(requestKey);
    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
      console.log(`防止重复请求: ${requestKey}, 间隔: ${now - lastRequest}ms`);
      
      // 重复请求需要获取最新的样本数，但不更新统计
      const [percentileData, jobWorthStats] = await Promise.all([
        getScorePercentile(score),
        getJobWorthStats()
      ]);
      
      // 使用Supabase中的实际评估记录数量
      const totalCount = jobWorthStats.total;
      
      // 检查样本数是否足够
      const showRanking = totalCount >= 1;
      
      return NextResponse.json({
        success: true,
        percentile: showRanking ? percentileData.percentile : null,
        rank: showRanking ? percentileData.totalCount - percentileData.lowerCount : null,
        totalCount: totalCount,
        showRanking,
        fromCache: true
      });
    }
    
    // 检查数据库中是否已存在相同客户端信息的提交记录
    const isDuplicate = await checkDuplicateSubmission(fullClientInfo, score);
    if (isDuplicate) {
      console.log(`防止重复提交: ${ip.toString()}, 分数: ${score.toFixed(2)}`);
      
      // 数据库中已存在相同客户端信息的提交，只返回排名数据，不更新统计
      const [percentileData, jobWorthStats] = await Promise.all([
        getScorePercentile(score),
        getJobWorthStats()
      ]);
      
      // 使用Supabase中的实际评估记录数量
      const totalCount = jobWorthStats.total;
      
      // 检查样本数是否足够
      const showRanking = totalCount >= 1;
      
      return NextResponse.json({
        success: true,
        percentile: showRanking ? percentileData.percentile : null,
        rank: showRanking ? percentileData.totalCount - percentileData.lowerCount : null,
        totalCount: totalCount,
        showRanking,
        fromCache: true,
        message: '同一IP在10分钟内不能重复提交，请稍后再试'
      });
    }
    
    // 更新请求记录
    recentRequests.set(requestKey, now);
    
    // 清理旧记录，避免内存泄漏
    if (recentRequests.size > 1000) {
      const oldEntries = [...recentRequests.entries()]
        .filter(([_, timestamp]) => now - timestamp > RATE_LIMIT_WINDOW);
      for (const [key] of oldEntries) {
        recentRequests.delete(key);
      }
    }
    
    // 更新分数分布统计
    await updateScoreDistribution(score);
    
    // 并行获取分数百分位和Supabase统计
    const [percentileData, jobWorthStats] = await Promise.all([
      getScorePercentile(score),
      getJobWorthStats()
    ]);
    
    // 使用Supabase中的实际评估记录数量
    const totalCount = jobWorthStats.total;
    
    // 检查样本数是否足够
    const showRanking = totalCount >= 1;
    
    return NextResponse.json({
      success: true,
      percentile: showRanking ? percentileData.percentile : null,
      rank: showRanking ? percentileData.totalCount - percentileData.lowerCount : null,
      totalCount: totalCount,
      showRanking
    });
    
  } catch (error) {
    console.error('获取排名信息失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
} 