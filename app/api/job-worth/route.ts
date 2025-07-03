import { NextRequest, NextResponse } from 'next/server';
import { saveJobWorthResult } from '@/lib/supabase';
import { updateScoreDistribution, calculateRank } from '@/lib/redis';
import { getClientInfo } from '@/lib/utils';

// 使用Map记录最近的请求，避免重复处理
// key: IP+分数, value: 时间戳
const recentRequests = new Map<string, number>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10分钟内相同IP+分数只处理一次

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { formData, score } = data;
    
    if (!formData || typeof score !== 'number') {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取客户端信息
    const clientInfo = getClientInfo();
    
    // 获取IP地址（从请求头中获取）
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               '未知';
    
    // 创建请求标识
    const requestKey = `${ip.toString()}-${score.toFixed(2)}`;
    const now = Date.now();
    
    // 检查是否是重复请求
    const lastRequest = recentRequests.get(requestKey);
    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
      console.log(`防止重复请求: ${requestKey}, 间隔: ${now - lastRequest}ms`);
      
      // 重复请求只返回排名数据，不保存到数据库
      const rankData = await calculateRank(score);
      
      return NextResponse.json({
        success: true,
        score,
        percentile: rankData.percentile,
        rank: rankData.rank,
        totalCount: rankData.totalCount,
        fromCache: true
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
    
    // 保存评估结果到Supabase
    const result = await saveJobWorthResult({
      input_data: formData,
      result_score: score,
      created_at: new Date().toISOString(),
      client_info: {
        ...clientInfo,
        ip: ip.toString()
      }
    });
    
    // 更新Redis中的分数分布
    await updateScoreDistribution(score);
    
    // 计算排名
    const rankData = await calculateRank(score);
    
    return NextResponse.json({
      success: true,
      id: result.id,
      score,
      percentile: rankData.percentile,
      rank: rankData.rank,
      totalCount: rankData.totalCount
    });
  } catch (error) {
    console.error('提交评估失败:', error);
    return NextResponse.json(
      { success: false, error: '提交评估失败' },
      { status: 500 }
    );
  }
} 