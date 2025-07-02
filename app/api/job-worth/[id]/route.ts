import { NextRequest, NextResponse } from 'next/server';
import { getJobWorthResult } from '@/lib/supabase';
import { getScorePercentile } from '@/lib/redis';
import { getValueAssessment, getImprovementSuggestions } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少评估ID' },
        { status: 400 }
      );
    }

    // 获取评估结果
    const result = await getJobWorthResult(id);
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: '未找到评估结果' },
        { status: 404 }
      );
    }
    
    // 计算百分位排名
    const percentileData = await getScorePercentile(result.result_score);
    
    // 获取评估描述
    const assessment = getValueAssessment(result.result_score);
    
    // 获取改进建议
    const suggestions = getImprovementSuggestions({
      commuteHours: Number(result.input_data.commuteHours),
      workHours: Number(result.input_data.workHours),
      cityFactor: result.input_data.cityFactor,
      workEnvironment: result.input_data.workEnvironment,
      leadership: result.input_data.leadership,
      teamwork: result.input_data.teamwork
    });
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        percentile: percentileData.percentile,
        rank: percentileData.totalCount - percentileData.lowerCount,
        totalCount: percentileData.totalCount,
        assessment,
        suggestions
      }
    });
  } catch (error) {
    console.error('获取评估结果失败:', error);
    return NextResponse.json(
      { success: false, error: '获取评估结果失败' },
      { status: 500 }
    );
  }
} 