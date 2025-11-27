'use client';

import { useState } from 'react';
import { Letter } from '@/types/letter';
import { useRouter } from 'next/navigation';

interface ShareToWallProps {
  letter: Letter;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ShareToWall({ letter, onClose, onSuccess }: ShareToWallProps) {
  const router = useRouter();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    setIsSharing(true);
    setError('');

    try {
      const response = await fetch('/api/share-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: letter.content,
          parentRole: letter.parentRole,
          childName: letter.childName,
          isAnonymous
        })
      });

      const data = await response.json();

      if (data.success) {
        // 分享成功
        if (onSuccess) onSuccess();
        // 稍后跳转到展示墙
        setTimeout(() => {
          router.push('/wall');
        }, 1500);
      } else {
        setError(data.error || '分享失败');
      }
    } catch (err) {
      console.error('分享失败:', err);
      setError('分享失败，请稍后重试');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">分享到云端广场</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 说明 */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              您的故事会温暖很多和您一样的父母。分享到云端广场后，其他人可以看到并为您送上心意。
            </p>
          </div>

          {/* 预览 */}
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">
                {isAnonymous ? '一位父母' : letter.parentRole} → {isAnonymous ? '宝贝' : letter.childName}
              </span>
            </p>
            <p className="text-sm text-gray-700 line-clamp-3">
              {letter.content}
            </p>
          </div>

          {/* 隐私选项 */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-1 w-4 h-4 text-rose-500 rounded focus:ring-rose-400"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">完全匿名</p>
                <p className="text-xs text-gray-500">
                  显示为&ldquo;一位父母 → 宝贝&rdquo;，保护您的隐私
                </p>
              </div>
            </label>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-400 to-orange-400 text-white rounded-xl hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
            >
              {isSharing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  分享中...
                </>
              ) : (
                <>
                  ☁️ 分享到广场
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
