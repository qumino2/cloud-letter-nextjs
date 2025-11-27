'use client';

import { useState, useEffect, useCallback } from 'react';
import { SharedLetter } from '@/types/letter';
import WallCard from '../components/WallCard';
import LetterModal from '../components/LetterModal';
import KouziFooter from '../components/KouziFooter';
import Link from 'next/link';

const INSPIRATIONAL_QUOTES = [
  "思念不因距离而减少 💕",
  "每一份牵挂，都值得被看见 ✨",
  "我们都是爱孩子的父母 🤗",
  "您的故事，也是别人的力量 🌟"
];

export default function WallPage() {
  const [letters, setLetters] = useState<SharedLetter[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<SharedLetter | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // 轮转文案
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % INSPIRATIONAL_QUOTES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 加载数据
  const loadLetters = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      // 添加时间戳参数破坏缓存，确保获取最新数据
      const timestamp = Date.now();
      const response = await fetch(`/api/wall?sort=${sortBy}&limit=20&t=${timestamp}`);
      const data = await response.json();

      if (data.success) {
        setLetters(data.letters);
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err) {
      console.error('加载展示墙失败:', err);
      setError('加载失败，请刷新重试');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* 头部 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* 返回按钮和标题 */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">返回首页</span>
            </Link>
          </div>

          {/* 标题区域 */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">☁️</div>
            <h1 className="text-3xl font-bold text-amber-800 mb-2">云端广场</h1>
            <p className="text-amber-600 transition-opacity duration-500">
              {INSPIRATIONAL_QUOTES[quoteIndex]}
            </p>
          </div>

          {/* Tab切换 */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                sortBy === 'recent'
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              最新
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                sortBy === 'popular'
                  ? 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              最受欢迎
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 加载状态 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <svg className="animate-spin h-12 w-12 text-rose-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="mt-4 text-gray-500">从云端取信中... ☁️</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadLetters}
              className="px-6 py-2 bg-rose-400 text-white rounded-full hover:bg-rose-500 transition-colors"
            >
              重新加载
            </button>
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !error && letters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💕</div>
            <p className="text-gray-600 text-lg mb-2">
              这里即将充满来自五湖四海的爱意
            </p>
            <p className="text-gray-500">
              成为第一个分享的人吧
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-rose-400 to-orange-400 text-white rounded-full hover:shadow-lg transition-all"
            >
              去写一封家书
            </Link>
          </div>
        )}

        {/* 家书列表 */}
        {!isLoading && !error && letters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {letters.map(letter => (
              <WallCard
                key={letter.id}
                letter={letter}
                onReadMore={setSelectedLetter}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <KouziFooter />
      </div>

      {/* 信件详情模态框 */}
      {selectedLetter && (
        <LetterModal
          letter={selectedLetter}
          onClose={() => setSelectedLetter(null)}
        />
      )}
    </div>
  );
}
