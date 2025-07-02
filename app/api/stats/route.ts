import { NextResponse } from 'next/server';
import { getJobWorthStats } from '@/lib/supabase';
import { getVisitStats, getScoreDistributionStats } from '@/lib/redis';

export async function GET() {
  try {
    // 并行获取所有统计数据
    const [jobWorthStats, visitStats, scoreDistributionStats] = await Promise.all([
      getJobWorthStats(),
      getVisitStats(),
      getScoreDistributionStats()
    ]);

    // 组合统计数据
    const stats = {
      jobWorth: jobWorthStats,
      visits: visitStats,
      scoreDistribution: scoreDistributionStats
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    );
  }
} 