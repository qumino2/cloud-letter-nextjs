'use client';

import { SharedLetter } from '@/types/letter';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import HeartButton from './HeartButton';
import { motion } from 'framer-motion';

interface WallCardProps {
  letter: SharedLetter;
  onReadMore?: (letter: SharedLetter) => void;
}

// 角色对应的emoji
const ROLE_EMOJIS: Record<string, string> = {
  '爸爸': '👨',
  '妈妈': '👩',
  '爷爷': '👴',
  '奶奶': '👵',
  '外公': '👴',
  '外婆': '👵',
  '一位父母': '💝'
};

export default function WallCard({ letter, onReadMore }: WallCardProps) {
  // 截取预览文本
  const previewText = letter.content.length > 100
    ? letter.content.substring(0, 100) + '...'
    : letter.content;

  // 格式化时间
  const timeAgo = formatDistanceToNow(new Date(letter.timestamp), {
    addSuffix: true,
    locale: zhCN
  });

  const roleEmoji = ROLE_EMOJIS[letter.parentRole] || '💝';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl"
    >
      {/* 头部：角色和时间 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{roleEmoji}</span>
          <div>
            <p className="text-sm font-medium text-gray-800">
              {letter.parentRole} → {letter.childName}
            </p>
            <p className="text-xs text-gray-400">{timeAgo}</p>
          </div>
        </div>
      </div>

      {/* 内容预览 */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {previewText}
        </p>
      </div>

      {/* 底部：展开按钮和点赞 */}
      <div className="flex items-center justify-between">
        {letter.content.length > 100 && (
          <button
            onClick={() => onReadMore?.(letter)}
            className="text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
          >
            展开阅读 →
          </button>
        )}
        <div className={letter.content.length > 100 ? '' : 'ml-auto'}>
          <HeartButton
            letterId={letter.id}
            initialLikes={letter.likes}
          />
        </div>
      </div>
    </motion.div>
  );
}
