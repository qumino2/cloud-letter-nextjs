// Vercel KV数据存储封装
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import { SharedLetter } from '@/types/letter';
import { mockKV } from './mock-kv';

// Redis键名
const KEYS = {
  RECENT_LETTERS: 'letters:recent',      // ZSET: 按时间排序
  POPULAR_LETTERS: 'letters:popular',    // ZSET: 按点赞数排序
  LETTER: (id: string) => `letter:${id}`, // HASH: 家书详情
  LIKERS: (id: string) => `letter:${id}:likers`, // SET: 点赞用户
  FLAGGED: 'letters:flagged'             // SET: 被举报的信件
};

/**
 * 分享家书到社区
 */
export async function shareLetterToWall(
  content: string,
  parentRole: string,
  childName: string,
  isAnonymous: boolean = false
): Promise<SharedLetter> {
  const id = uuidv4();
  const timestamp = Date.now();

  const letter: SharedLetter = {
    id,
    content,
    parentRole: isAnonymous ? '一位父母' : parentRole,
    childName: isAnonymous ? '宝贝' : childName,
    timestamp,
    likes: 0,
    isAnonymous
  };

  try {
    // 使用mock KV或真实KV
    if (mockKV.shouldUseMock()) {
      await mockKV.hset(KEYS.LETTER(id), letter);
      await mockKV.zadd(KEYS.RECENT_LETTERS, { score: timestamp, member: id });
      await mockKV.zadd(KEYS.POPULAR_LETTERS, { score: 0, member: id });
    } else {
      // 存储家书详情
      await kv.hset(KEYS.LETTER(id), letter as unknown as Record<string, unknown>);

      // 添加到最近列表（按时间戳排序）
      await kv.zadd(KEYS.RECENT_LETTERS, {
        score: timestamp,
        member: id
      });

      // 添加到热门列表（初始点赞数为0）
      await kv.zadd(KEYS.POPULAR_LETTERS, {
        score: 0,
        member: id
      });
    }

    return letter;
  } catch (error) {
    console.error('分享家书失败:', error);
    throw new Error('分享失败，请稍后重试');
  }
}

/**
 * 获取展示墙家书列表
 */
export async function getWallLetters(
  sortBy: 'recent' | 'popular' = 'recent',
  limit: number = 20,
  offset: number = 0
): Promise<SharedLetter[]> {
  try {
    const sortKey = sortBy === 'recent' ? KEYS.RECENT_LETTERS : KEYS.POPULAR_LETTERS;

    if (mockKV.shouldUseMock()) {
      // 使用mock KV
      const ids = await mockKV.zrange(sortKey, offset, offset + limit - 1, { rev: true }) as string[];

      if (!ids || ids.length === 0) {
        return [];
      }

      const letters: SharedLetter[] = [];
      for (const id of ids) {
        const letter = await mockKV.hgetall(KEYS.LETTER(id));
        if (letter) {
          letters.push(letter as SharedLetter);
        }
      }
      return letters;
    } else {
      // 获取ID列表（倒序，最新/最热的在前）
      const ids = await kv.zrange(sortKey, offset, offset + limit - 1, {
        rev: true
      }) as string[];

      if (!ids || ids.length === 0) {
        return [];
      }

      // 批量获取家书详情
      const letters: SharedLetter[] = [];
      for (const id of ids) {
        const letter = await kv.hgetall(KEYS.LETTER(id));
        if (letter) {
          letters.push(letter as unknown as SharedLetter);
        }
      }

      return letters;
    }
  } catch (error) {
    console.error('获取展示墙失败:', error);
    return [];
  }
}

/**
 * 获取单封家书详情
 */
export async function getLetter(id: string): Promise<SharedLetter | null> {
  try {
    if (mockKV.shouldUseMock()) {
      const letter = await mockKV.hgetall(KEYS.LETTER(id));
      return letter as unknown as SharedLetter | null;
    } else {
      const letter = await kv.hgetall(KEYS.LETTER(id));
      return letter as unknown as SharedLetter | null;
    }
  } catch (error) {
    console.error('获取家书详情失败:', error);
    return null;
  }
}

/**
 * 点赞家书
 */
export async function likeLetter(
  letterId: string,
  sessionId: string
): Promise<{ success: boolean; likes: number; alreadyLiked: boolean }> {
  try {
    if (mockKV.shouldUseMock()) {
      // 使用mock KV
      const alreadyLiked = await mockKV.sismember(KEYS.LIKERS(letterId), sessionId);

      if (alreadyLiked) {
        const letter = await getLetter(letterId);
        return {
          success: false,
          likes: letter?.likes || 0,
          alreadyLiked: true
        };
      }

      await mockKV.sadd(KEYS.LIKERS(letterId), sessionId);
      const newLikes = await mockKV.hincrby(KEYS.LETTER(letterId), 'likes', 1);

      const letter = await getLetter(letterId);
      if (letter) {
        await mockKV.zadd(KEYS.POPULAR_LETTERS, {
          score: letter.likes,
          member: letterId
        });
      }

      return {
        success: true,
        likes: newLikes,
        alreadyLiked: false
      };
    } else {
      // 检查是否已点赞
      const alreadyLiked = await kv.sismember(KEYS.LIKERS(letterId), sessionId);

      if (alreadyLiked) {
        // 已经点赞，返回当前点赞数
        const letter = await getLetter(letterId);
        return {
          success: false,
          likes: letter?.likes || 0,
          alreadyLiked: true
        };
      }

      // 添加到点赞用户集合
      await kv.sadd(KEYS.LIKERS(letterId), sessionId);

      // 递增点赞数
      await kv.hincrby(KEYS.LETTER(letterId), 'likes', 1);

      // 更新热门排序
      const letter = await getLetter(letterId);
      if (letter) {
        await kv.zadd(KEYS.POPULAR_LETTERS, {
          score: letter.likes,
          member: letterId
        });
      }

      return {
        success: true,
        likes: letter?.likes || 0,
        alreadyLiked: false
      };
    }
  } catch (error) {
    console.error('点赞失败:', error);
    throw new Error('点赞失败，请稍后重试');
  }
}

/**
 * 检查是否已点赞
 */
export async function hasLiked(letterId: string, sessionId: string): Promise<boolean> {
  try {
    if (mockKV.shouldUseMock()) {
      return await mockKV.sismember(KEYS.LIKERS(letterId), sessionId) === 1;
    } else {
      return await kv.sismember(KEYS.LIKERS(letterId), sessionId) === 1;
    }
  } catch (error) {
    console.error('检查点赞状态失败:', error);
    return false;
  }
}

/**
 * 举报家书
 */
export async function flagLetter(letterId: string): Promise<void> {
  try {
    await kv.sadd(KEYS.FLAGGED, letterId);
  } catch (error) {
    console.error('举报失败:', error);
    throw new Error('举报失败，请稍后重试');
  }
}

/**
 * 获取举报次数
 */
export async function getFlagCount(letterId: string): Promise<number> {
  try {
    const flagged = await kv.sismember(KEYS.FLAGGED, letterId);
    return flagged ? 1 : 0;
  } catch (error) {
    console.error('获取举报次数失败:', error);
    return 0;
  }
}

/**
 * 生成会话ID（用于点赞去重）
 */
export function generateSessionId(): string {
  // 使用浏览器指纹 + 随机数
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('session_id');
    if (stored) return stored;

    const newSessionId = uuidv4();
    localStorage.setItem('session_id', newSessionId);
    return newSessionId;
  }

  return uuidv4();
}
