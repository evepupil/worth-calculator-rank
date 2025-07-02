import { NextRequest, NextResponse } from 'next/server';
import { updateScoreDistribution, getScorePercentile } from '@/lib/redis';

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
    
    // 更新分数分布统计
    await updateScoreDistribution(score);
    
    // 获取分数百分位
    const percentileData = await getScorePercentile(score);
    
    // 检查样本数是否足够
    const showRanking = percentileData.totalCount >= 1000;
    
    return NextResponse.json({
      success: true,
      percentile: showRanking ? percentileData.percentile : null,
      rank: showRanking ? percentileData.totalCount - percentileData.lowerCount : null,
      totalCount: percentileData.totalCount,
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