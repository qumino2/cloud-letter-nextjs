import { NextRequest, NextResponse } from 'next/server';
import { generateLetter } from '@/lib/volcano';

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

    // 调用AI生成家书
    const letter = await generateLetter(
      parentInput.trim(),
      parentRole,
      childName.trim()
    );

    return NextResponse.json({
      success: true,
      data: {
        letter: letter
      }
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
