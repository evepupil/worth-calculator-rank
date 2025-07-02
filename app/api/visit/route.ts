import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/redis';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // 获取访客ID，如果没有则生成一个新的
    const { visitorId } = await request.json();
    const id = visitorId || generateId();

    // 记录访问
    await recordVisit(id);

    return NextResponse.json({ success: true, visitorId: id });
  } catch (error) {
    console.error('记录访问失败:', error);
    return NextResponse.json(
      { success: false, error: '记录访问失败' },
      { status: 500 }
    );
  }
} 