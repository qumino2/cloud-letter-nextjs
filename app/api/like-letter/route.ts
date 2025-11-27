import { NextRequest, NextResponse } from 'next/server';
import { likeLetter } from '@/lib/kv-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { letterId, sessionId } = body;

    // 验证参数
    if (!letterId || typeof letterId !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少家书ID' },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { success: false, error: '缺少会话ID' },
        { status: 400 }
      );
    }

    // 执行点赞
    const result = await likeLetter(letterId, sessionId);

    return NextResponse.json({
      success: result.success,
      likes: result.likes,
      alreadyLiked: result.alreadyLiked,
      message: result.alreadyLiked
        ? '您已经点过赞了'
        : '您的心意已送达 💖'
    });

  } catch (error: any) {
    console.error('点赞错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '点赞失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
