'use client';

import { SharedLetter } from '@/types/letter';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import HeartButton from './HeartButton';
import { motion, AnimatePresence } from 'framer-motion';

interface LetterModalProps {
  letter: SharedLetter;
  onClose: () => void;
}

export default function LetterModal({ letter, onClose }: LetterModalProps) {
  const timeAgo = formatDistanceToNow(new Date(letter.timestamp), {
    addSuffix: true,
    locale: zhCN
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-b from-white to-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✉️</div>
            <div>
              <p className="font-semibold text-gray-800">
                {letter.parentRole} → {letter.childName}
              </p>
              <p className="text-xs text-gray-500">{timeAgo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 信件内容 */}
        <div className="p-6">
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-100 p-6 mb-6"
               style={{
                 backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #f5e6d3 28px)',
                 lineHeight: '28px'
               }}>
            <p className="text-gray-700 whitespace-pre-wrap font-serif leading-relaxed">
              {letter.content}
            </p>
          </div>

          {/* 点赞按钮 */}
          <div className="flex justify-center">
            <HeartButton
              letterId={letter.id}
              initialLikes={letter.likes}
            />
          </div>
        </div>

        {/* 底部提示 */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-6 py-4 border-t border-gray-200 rounded-b-3xl">
          <p className="text-xs text-gray-400 text-center">
            这份爱意来自云端广场，让我们一起传递温暖 💕
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
