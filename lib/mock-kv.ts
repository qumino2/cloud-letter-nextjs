// 本地开发用的模拟KV存储（使用内存）
import { SharedLetter } from '@/types/letter';

// 内存存储
const storage = {
  letters: new Map<string, SharedLetter>(),
  recent: [] as string[],
  popular: [] as Array<{ id: string; score: number }>,
  likers: new Map<string, Set<string>>()
};

export const mockKV = {
  // 检查是否应该使用mock（没有配置真实KV时）
  shouldUseMock: () => {
    return !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN;
  },

  // 存储家书
  async hset(key: string, value: any) {
    if (typeof value === 'object') {
      storage.letters.set(key, value as SharedLetter);
    }
    return 1;
  },

  // 获取家书
  async hgetall(key: string) {
    return storage.letters.get(key) || null;
  },

  // 添加到有序集合
  async zadd(key: string, data: { score: number; member: string }) {
    if (key.includes('recent')) {
      storage.recent.unshift(data.member);
      // 保持最多100条
      if (storage.recent.length > 100) {
        storage.recent = storage.recent.slice(0, 100);
      }
    } else if (key.includes('popular')) {
      // 移除旧的条目
      const index = storage.popular.findIndex(item => item.id === data.member);
      if (index > -1) {
        storage.popular.splice(index, 1);
      }
      // 添加新条目
      storage.popular.push({ id: data.member, score: data.score });
      // 按分数降序排序（分数高的在前）
      storage.popular.sort((a, b) => b.score - a.score);
    }
    return 1;
  },

  // 获取有序集合范围
  async zrange(key: string, start: number, stop: number, options?: any) {
    if (key.includes('recent')) {
      // recent: 直接返回ID数组（已经按时间倒序排列）
      return storage.recent.slice(start, stop + 1);
    } else if (key.includes('popular')) {
      // popular: 已经按分数降序排列，直接返回ID
      const ids = storage.popular.map(item => item.id);
      if (options?.rev) {
        // rev=true时，返回分数最高的（已经是降序，所以直接slice）
        return ids.slice(start, stop + 1);
      }
      // rev=false时，返回分数最低的（需要反转）
      return [...ids].reverse().slice(start, stop + 1);
    }
    return [];
  },

  // 添加到集合
  async sadd(key: string, member: string) {
    if (!storage.likers.has(key)) {
      storage.likers.set(key, new Set());
    }
    storage.likers.get(key)!.add(member);
    return 1;
  },

  // 检查集合成员
  async sismember(key: string, member: string) {
    const set = storage.likers.get(key);
    return set ? (set.has(member) ? 1 : 0) : 0;
  },

  // 哈希字段递增
  async hincrby(key: string, field: string, increment: number) {
    const letter = storage.letters.get(key);
    if (letter && field === 'likes') {
      letter.likes += increment;
      storage.letters.set(key, letter);
      return letter.likes;
    }
    return increment;
  },

  // 获取所有数据（用于调试）
  getAll() {
    return {
      letters: Array.from(storage.letters.values()),
      recent: storage.recent,
      popular: storage.popular.map(item => item.id)
    };
  },

  // 清空所有数据
  clear() {
    storage.letters.clear();
    storage.recent = [];
    storage.popular = [];
    storage.likers.clear();
  }
};
