import { NextRequest, NextResponse } from 'next/server';
import { getWallLetters } from '@/lib/kv-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = (searchParams.get('sort') as 'recent' | 'popular') || 'recent';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 验证参数
    if (!['recent', 'popular'].includes(sortBy)) {
      return NextResponse.json(
        { success: false, error: '无效的排序方式' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { success: false, error: '每页数量应在1-50之间' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { success: false, error: '偏移量不能为负数' },
        { status: 400 }
      );
    }

    // 获取展示墙数据
    const letters = await getWallLetters(sortBy, limit, offset);

    return NextResponse.json({
      success: true,
      letters,
      sort: sortBy,
      hasMore: letters.length === limit
    }, {
      headers: {
        // 缓存60秒
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
      }
    });

  } catch (error: any) {
    console.error('获取展示墙错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}
