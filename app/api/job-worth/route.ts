import { NextRequest, NextResponse } from 'next/server';
import { saveJobWorthResult } from '@/lib/supabase';
import { updateScoreDistribution, calculateRank } from '@/lib/redis';
import { getClientInfo } from '@/lib/utils';

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