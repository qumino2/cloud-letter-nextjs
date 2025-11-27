// 家书数据类型定义

export interface Letter {
  content: string;      // 家书内容
  parentRole: string;   // 父母角色（爸爸、妈妈等）
  childName: string;    // 孩子称呼
}

export interface SharedLetter extends Letter {
  id: string;              // UUID
  timestamp: number;       // 发布时间戳
  likes: number;          // 点赞数
  isAnonymous: boolean;   // 是否完全匿名
  posterTemplate?: string; // 使用的海报模板
}

export type PosterTemplate = 'warm-embrace' | 'starry-night' | 'paper-letter';

export interface PosterOptions {
  template: PosterTemplate;
  letter: Letter;
  showWatermark?: boolean;
  showDate?: boolean;
}
