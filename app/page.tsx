'use client';

import React, { useState } from 'react';

export default function Home() {
  const [parentInput, setParentInput] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parentRole, setParentRole] = useState('爸爸');
  const [childName, setChildName] = useState('宝贝');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const generateLetter = async () => {
    if (!parentInput.trim()) {
      setError('请输入想对孩子说的话');
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失败，请稍后重试');
      }

      if (data.success && data.data?.letter) {
        setGeneratedLetter(data.data.letter);
      } else {
        throw new Error('返回数据格式异常');
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

  const examplePrompts = [
    "让他好好学习，别老玩手机",
    "天冷了，记得多穿点",
    "考试没考好也没关系",
    "爸妈过年就回来了",
    "想你了"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✉️</div>
          <h1 className="text-3xl font-bold text-amber-800 mb-2">云端家书</h1>
          <p className="text-amber-600">把你的牵挂，变成孩子能感受到的温暖</p>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">我是</label>
              <select
                value={parentRole}
                onChange={(e) => setParentRole(e.target.value)}
                className="w-full p-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <option value="爸爸">爸爸</option>
                <option value="妈妈">妈妈</option>
                <option value="爷爷">爷爷</option>
                <option value="奶奶">奶奶</option>
                <option value="外公">外公</option>
                <option value="外婆">外婆</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">孩子的称呼</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="宝贝、小明..."
                className="w-full p-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
          </div>

          {/* Input Area */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">你想对孩子说什么？</label>
            <textarea
              value={parentInput}
              onChange={(e) => {
                setParentInput(e.target.value);
                setError('');
              }}
              placeholder="把你想说的话写在这里，哪怕只是简单的一句话..."
              className="w-full h-32 p-4 border border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Example Prompts */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">不知道说什么？试试这些：</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setParentInput(prompt);
                    setError('');
                  }}
                  className="text-sm px-3 py-1 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateLetter}
            disabled={isLoading || !parentInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在用心写信...
              </span>
            ) : '✨ 生成家书'}
          </button>
        </div>

        {/* Generated Letter */}
        {generatedLetter && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 relative">
            <div className="absolute -top-3 left-6 bg-amber-500 text-white text-sm px-3 py-1 rounded-full">
              生成的家书
            </div>

            {/* Letter Paper Style */}
            <div className="mt-4 p-6 bg-gradient-to-b from-amber-50 to-white rounded-lg border border-amber-100"
                 style={{
                   backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #f5e6d3 28px)',
                   lineHeight: '28px'
                 }}>
              <p className="text-gray-700 whitespace-pre-wrap font-serif">
                {generatedLetter}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? '✓ 已复制' : '📋 复制内容'}
              </button>
              <button
                onClick={() => {
                  setGeneratedLetter('');
                  setError('');
                }}
                className="py-2 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                重新生成
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-amber-600/70">
          <p>用 AI 的力量，让爱更好地传达 💕</p>
          <p className="mt-1">守护留守青少年健康成长</p>
        </div>
      </div>
    </div>
  );
}
