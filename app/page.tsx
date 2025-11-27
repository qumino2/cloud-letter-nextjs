'use client';

import React, { useState, useEffect } from 'react';
import PosterGenerator from './components/PosterGenerator';
import ShareToWall from './components/ShareToWall';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function Home() {
  const [parentInput, setParentInput] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parentRole, setParentRole] = useState('爸爸');
  const [childName, setChildName] = useState('宝贝');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showPoster, setShowPoster] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [letterCount, setLetterCount] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // 加载写信计数
  useEffect(() => {
    const count = parseInt(localStorage.getItem('letterCount') || '0');
    setLetterCount(count);
  }, []);

  // 更新写信计数
  const updateLetterCount = () => {
    const newCount = letterCount + 1;
    setLetterCount(newCount);
    localStorage.setItem('letterCount', newCount.toString());

    // 里程碑鼓励
    if ([3, 5, 10, 20].includes(newCount)) {
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 5000);
    }
  };

  const generateLetter = async () => {
    if (!parentInput.trim()) {
      setError('记得填写您想对孩子说的话哦 🤗');
      return;
    }

    setIsLoading(true);
    setGeneratedLetter('');
    setError('');

    try {
      const response = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentInput: parentInput.trim(),
          parentRole,
          childName: childName.trim() || '宝贝'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '网络开了个小差，请稍后再试试看 😊');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // 生成完成，触发庆祝动画
          celebrateCompletion();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setGeneratedLetter(accumulatedText);
      }

    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || '生成失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 庆祝动画
  const celebrateCompletion = () => {
    // 更新计数
    updateLetterCount();

    // 五彩纸屑效果
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fb923c', '#fb7185', '#fbbf24']
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <Link
              href="/wall"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-amber-700 hover:bg-white transition-all shadow-md hover:shadow-lg"
            >
              <span>☁️</span>
              <span className="text-sm font-medium">云端广场</span>
            </Link>
          </div>
          <div className="text-5xl mb-3">✉️</div>
          <h1 className="text-3xl font-bold text-amber-800 mb-2">云端家书</h1>
          <p className="text-amber-600">把你的牵挂，变成孩子能感受到的温暖</p>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Input */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            {/* Title with Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl">💭</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">说说您想对孩子说的话</h2>
                <p className="text-sm text-gray-500 mt-1">简单一句话就好，我们会帮您润色成温暖的家书</p>
              </div>
            </div>

            {/* Role and Child Name */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">我是</label>
                <select
                  value={parentRole}
                  onChange={(e) => setParentRole(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white text-gray-800"
                >
                  <option value="爸爸">爸爸</option>
                  <option value="妈妈">妈妈</option>
                  <option value="爷爷">爷爷</option>
                  <option value="奶奶">奶奶</option>
                  <option value="外公">外公</option>
                  <option value="外婆">外婆</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">孩子的称呼</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="宝贝、小明..."
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 bg-white text-gray-800"
                />
              </div>
            </div>

            {/* Preset Messages */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">快捷话语（点击快速填充）</label>
              <div className="flex flex-wrap gap-2">
                {[
                  "让他好好学习，别老玩手机",
                  "天冷了，记得多穿衣服",
                  "爸爸妈妈很想你",
                  "要听老师的话，好好吃饭",
                  "周末回家记得打电话",
                  "考试不要紧张，尽力就好"
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setParentInput(preset);
                      setError('');
                    }}
                    className="px-3 py-2 text-sm bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors border border-rose-200"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">您想说什么？</label>
              <textarea
                value={parentInput}
                onChange={(e) => {
                  setParentInput(e.target.value);
                  setError('');
                }}
                placeholder="例如：让他好好学习，别老玩手机"
                className="w-full h-40 p-4 border-2 border-rose-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 resize-none bg-white text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={generateLetter}
              disabled={isLoading || !parentInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-rose-400 to-orange-400 text-white font-medium rounded-2xl hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  正在用心润色...
                </>
              ) : (
                <>
                  <span className="text-xl">💕</span>
                  把心里话变成家书
                </>
              )}
            </button>

            {/* Tips Section */}
            <div className="mt-8 p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-lg">💡</span>
                <h3 className="font-medium text-gray-800">小贴士：</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>说真心话就好，不用想怎么表达</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>可以说说最近的担心或期望</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>想说什么就说什么，AI会帮您润色</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Generated Letter */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            {/* Title with Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="text-2xl">📮</div>
              <h2 className="text-xl font-semibold text-gray-800">生成的家书</h2>
            </div>

            {/* Content Area */}
            {!generatedLetter && !isLoading ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-center">
                  在左侧输入您想说的话
                  <br />
                  然后点击"生成家书"
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 p-6 bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-100 min-h-[400px]"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #f5e6d3 28px)',
                       lineHeight: '28px'
                     }}>
                  <p className="text-gray-700 whitespace-pre-wrap font-serif">
                    {generatedLetter || '正在生成中...'}
                  </p>
                </div>

                {/* Actions */}
                {generatedLetter && (
                  <div className="space-y-3">
                    {/* 鼓励信息 */}
                    {showEncouragement && (
                      <div className="p-4 bg-gradient-to-r from-rose-100 to-amber-100 rounded-xl border-2 border-rose-300 text-center animate-pulse">
                        <p className="text-rose-700 font-medium text-lg mb-1">
                          🎉 您已经写了{letterCount}封家书了！
                        </p>
                        <p className="text-sm text-rose-600">
                          孩子一定能感受到您满满的爱 💕
                        </p>
                      </div>
                    )}

                    {/* 主要操作按钮 */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowPoster(true)}
                        className="py-4 px-4 bg-gradient-to-r from-rose-400 to-orange-400 text-white font-medium rounded-xl hover:from-rose-500 hover:to-orange-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">🎨</span>
                        制作海报
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="py-4 px-4 bg-gradient-to-r from-amber-400 to-rose-400 text-white font-medium rounded-xl hover:from-amber-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">☁️</span>
                        分享广场
                      </button>
                    </div>

                    {shareSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
                        ✓ 您的家书已飞向云端 ☁️ 去温暖更多人的心
                      </div>
                    )}

                    {/* 其他操作按钮 */}
                    <div className="flex gap-3">
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 py-3 px-4 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        {copied ? (
                          <>
                            <span>✓</span>
                            已复制
                          </>
                        ) : (
                          <>
                            <span>📋</span>
                            复制这份爱意
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedLetter('');
                          setError('');
                          setShareSuccess(false);
                        }}
                        className="py-3 px-6 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        再润色一次
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>用心传递爱，让每一句话都充满温暖</p>
        </div>
      </div>

      {/* 海报生成器弹窗 */}
      {showPoster && generatedLetter && (
        <PosterGenerator
          letter={{
            content: generatedLetter,
            parentRole,
            childName: childName.trim() || '宝贝'
          }}
          onClose={() => setShowPoster(false)}
        />
      )}

      {/* 分享到社区弹窗 */}
      {showShareModal && generatedLetter && (
        <ShareToWall
          letter={{
            content: generatedLetter,
            parentRole,
            childName: childName.trim() || '宝贝'
          }}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            setShareSuccess(true);
            setShowShareModal(false);
          }}
        />
      )}
    </div>
  );
}
