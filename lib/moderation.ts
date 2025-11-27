// 内容审核工具

/**
 * 敏感词列表（基础版）
 * 实际应用中应该使用更完整的敏感词库
 */
const SENSITIVE_WORDS = [
  // 这里只是示例，实际应该有更完整的列表
  '政治敏感词',
  '暴力词汇',
  '色情内容'
  // ... 更多敏感词
];

/**
 * 检查文本是否包含敏感词
 */
export function hasSensitiveWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SENSITIVE_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * 验证家书内容
 */
export function validateLetterContent(content: string): {
  valid: boolean;
  error?: string;
} {
  // 去除首尾空格
  const trimmed = content.trim();

  // 检查长度
  if (trimmed.length === 0) {
    return { valid: false, error: '家书内容不能为空' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: '家书内容太短，至少需要10个字' };
  }

  if (trimmed.length > 1000) {
    return { valid: false, error: '家书内容太长，最多1000个字' };
  }

  // 检查敏感词
  if (hasSensitiveWords(trimmed)) {
    return { valid: false, error: '内容包含不当词汇，请修改后重试' };
  }

  return { valid: true };
}

/**
 * 简单的IP限流检查
 * 实际应用中应该使用Redis或其他存储来实现更完善的限流
 */
const ipRequestMap = new Map<string, number[]>();

export function checkRateLimit(ip: string, maxRequests: number = 3, windowMs: number = 3600000): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const windowStart = now - windowMs;

  // 获取该IP的请求记录
  let requests = ipRequestMap.get(ip) || [];

  // 过滤掉时间窗口外的请求
  requests = requests.filter(timestamp => timestamp > windowStart);

  // 检查是否超过限制
  if (requests.length >= maxRequests) {
    return {
      allowed: false,
      remaining: 0
    };
  }

  // 记录新请求
  requests.push(now);
  ipRequestMap.set(ip, requests);

  return {
    allowed: true,
    remaining: maxRequests - requests.length
  };
}

/**
 * 清理过期的限流记录（定期调用）
 */
export function cleanupRateLimitCache() {
  const now = Date.now();
  const windowMs = 3600000; // 1小时

  for (const [ip, requests] of ipRequestMap.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > now - windowMs);
    if (validRequests.length === 0) {
      ipRequestMap.delete(ip);
    } else {
      ipRequestMap.set(ip, validRequests);
    }
  }
}

/**
 * 获取客户端IP地址
 */
export function getClientIp(request: Request): string {
  // 尝试从各种header获取真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // 降级到未知IP
  return 'unknown';
}
