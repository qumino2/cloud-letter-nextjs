'use client';

import { useState, useCallback } from 'react';
import { Letter } from '@/types/letter';
import { downloadCanvasAsImage, shareImage } from '@/lib/poster-utils';
import WarmEmbrace from './templates/WarmEmbrace';

interface PosterGeneratorProps {
  letter: Letter;
  onClose?: () => void;
}

export default function PosterGenerator({ letter, onClose }: PosterGeneratorProps) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleCanvasReady = useCallback((canvasElement: HTMLCanvasElement) => {
    setCanvas(canvasElement);
  }, []);

  const handleDownload = () => {
    if (!canvas) return;

    setIsDownloading(true);
    try {
      downloadCanvasAsImage(canvas, `家书_${letter.childName}`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error('下载失败:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!canvas) return;

    setIsSharing(true);
    try {
      const shared = await shareImage(canvas, '云端家书', `给${letter.childName}的一封家书`);
      if (!shared) {
        // 如果分享API不可用，降级到下载
        handleDownload();
      }
    } catch (error) {
      console.error('分享失败:', error);
      handleDownload();
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">海报预览</h2>
            <p className="text-sm text-gray-500 mt-1">长按图片可保存到相册</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 海报内容 */}
        <div className="p-6">
          <WarmEmbrace letter={letter} onCanvasReady={handleCanvasReady} />
        </div>

        {/* 底部操作按钮 */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-6 py-4 border-t border-gray-200 rounded-b-3xl">
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={!canvas || isDownloading}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-400 to-orange-400 text-white font-medium rounded-xl hover:from-rose-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  下载中...
                </>
              ) : downloadSuccess ? (
                <>
                  <span className="text-xl">✓</span>
                  下载成功
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载图片
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              disabled={!canvas || isSharing}
              className="py-4 px-6 bg-amber-100 text-amber-700 font-medium rounded-xl hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  分享
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-3">
            💡 提示：可以打印出来寄给孩子，或分享到微信/QQ
          </p>
        </div>
      </div>
    </div>
  );
}
