import { NextRequest, NextResponse } from 'next/server';
import { generateLetterStream } from '@/lib/volcano';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parentInput, parentRole, childName } = body;

    // 参数验证
    if (!parentInput || !parentInput.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: '请输入想对孩子说的话'
        },
        { status: 400 }
      );
    }

    if (!parentRole) {
      return NextResponse.json(
        {
          success: false,
          error: '请选择您的角色'
        },
        { status: 400 }
      );
    }

    if (!childName || !childName.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: '请输入孩子的称呼'
        },
        { status: 400 }
      );
    }

    // 调用AI生成家书（流式）
    const stream = await generateLetterStream(
      parentInput.trim(),
      parentRole,
      childName.trim()
    );

    // 返回流式响应
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('生成家书错误:', error);
    console.error('错误堆栈:', error.stack);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '生成家书失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
