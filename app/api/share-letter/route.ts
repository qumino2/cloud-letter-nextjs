import { NextRequest, NextResponse } from 'next/server';
import { shareLetterToWall } from '@/lib/kv-client';
import { validateLetterContent, checkRateLimit, getClientIp } from '@/lib/moderation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, parentRole, childName, isAnonymous = false } = body;

    // 验证参数
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: '家书内容不能为空' },
        { status: 400 }
      );
    }

    if (!parentRole || typeof parentRole !== 'string') {
      return NextResponse.json(
        { success: false, error: '请选择您的角色' },
        { status: 400 }
      );
    }

    if (!childName || typeof childName !== 'string') {
      return NextResponse.json(
        { success: false, error: '请输入孩子的称呼' },
        { status: 400 }
      );
    }

    // 内容验证
    const validation = validateLetterContent(content);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 限流检查
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip, 3, 3600000); // 每小时最多3次

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: '您分享得太频繁了，请稍后再试（每小时最多3次）'
        },
        { status: 429 }
      );
    }

    // 分享到社区
    const letter = await shareLetterToWall(
      content.trim(),
      parentRole.trim(),
      childName.trim(),
      isAnonymous
    );

    return NextResponse.json({
      success: true,
      letter,
      remaining: rateLimit.remaining
    });

  } catch (error: any) {
    console.error('分享家书错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '分享失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
