'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface HeartButtonProps {
  letterId: string;
  initialLikes: number;
  initialLiked?: boolean;
  onLike?: (likes: number) => void;
}

export default function HeartButton({
  letterId,
  initialLikes,
  initialLiked = false,
  onLike
}: HeartButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (liked || isLiking) return;

    setIsLiking(true);

    try {
      // 获取会话ID
      let sessionId = '';
      if (typeof window !== 'undefined') {
        sessionId = localStorage.getItem('session_id') || '';
        if (!sessionId) {
          // 生成新的会话ID
          sessionId = crypto.randomUUID();
          localStorage.setItem('session_id', sessionId);
        }
      }

      const response = await fetch('/api/like-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          letterId,
          sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        setLikes(data.likes);
        setLiked(true);
        if (onLike) onLike(data.likes);
      }
    } catch (error) {
      console.error('点赞失败:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      disabled={liked || isLiking}
      whileHover={!liked && !isLiking ? { scale: 1.05 } : {}}
      whileTap={!liked && !isLiking ? { scale: 0.95 } : {}}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        liked
          ? 'bg-rose-100 text-rose-600'
          : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
      } ${isLiking ? 'opacity-50 cursor-wait' : ''} ${
        liked ? 'cursor-default' : 'cursor-pointer'
      }`}
    >
      <motion.span
        className="text-xl"
        animate={liked ? {
          scale: [1, 1.3, 1],
          rotate: [0, -10, 10, 0]
        } : {}}
        transition={{ duration: 0.5 }}
      >
        {liked ? '❤️' : '🤍'}
      </motion.span>
      <motion.span
        className="text-sm font-medium"
        key={likes}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {likes > 0 ? likes : '送心意'}
      </motion.span>
    </motion.button>
  );
}
