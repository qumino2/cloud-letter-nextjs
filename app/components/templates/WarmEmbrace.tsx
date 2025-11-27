'use client';

import { useEffect, useRef } from 'react';
import { Letter } from '@/types/letter';
import {
  createGradientBackground,
  drawRoundedRect,
  drawWrappedText,
  addWatermark,
  addDate,
  addShadow,
  clearShadow
} from '@/lib/poster-utils';

interface WarmEmbraceProps {
  letter: Letter;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export default function WarmEmbrace({ letter, onCanvasReady }: WarmEmbraceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置Canvas尺寸 (适合手机屏幕分享)
    const width = 1080;
    const height = 1440;
    canvas.width = width;
    canvas.height = height;

    // 1. 绘制渐变背景
    createGradientBackground(ctx, canvas, [
      '#fef1e6', // 柔和奶油色
      '#fce5e3', // 浅玫瑰色
      '#fde8e9'  // 粉色调
    ]);

    // 2. 添加装饰性圆点图案
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 30 + 10;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 绘制主卡片
    const cardX = 80;
    const cardY = 200;
    const cardWidth = width - 160;
    const cardHeight = height - 400;

    // 卡片阴影
    addShadow(ctx, 30, 'rgba(0, 0, 0, 0.15)', 0, 15);

    // 绘制白色圆角卡片
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 30);
    ctx.fill();

    clearShadow(ctx);

    // 4. 绘制顶部装饰
    ctx.fillStyle = '#f59e0b'; // 琥珀色
    ctx.fillRect(cardX + 40, cardY - 15, cardWidth - 80, 6);

    // 5. 添加信封图标
    ctx.font = '60px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✉️', width / 2, 120);

    // 6. 添加标题
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#d97706';
    ctx.textAlign = 'center';
    ctx.fillText('云端家书', width / 2, 180);

    // 7. 绘制家书内容
    ctx.font = '28px serif';
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';

    // 称呼
    const greeting = `亲爱的${letter.childName}：`;
    ctx.fillText(greeting, cardX + 60, cardY + 80);

    // 正文内容 (自动换行)
    const contentY = drawWrappedText(
      ctx,
      letter.content,
      cardX + 60,
      cardY + 130,
      cardWidth - 120,
      42
    );

    // 落款
    ctx.textAlign = 'right';
    ctx.fillText(`—— ${letter.parentRole}`, cardX + cardWidth - 60, contentY + 60);

    // 8. 添加日期
    addDate(ctx, cardX + 60, cardY + cardHeight - 40);

    // 9. 添加水印
    addWatermark(ctx, canvas, '云端家书 ✉️');

    // 10. 添加底部装饰线
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cardX + cardWidth / 3, height - 120);
    ctx.lineTo(cardX + (cardWidth / 3) * 2, height - 120);
    ctx.stroke();

    // 11. 添加温馨寄语
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.textAlign = 'center';
    ctx.fillText('把你的牵挂，变成孩子能感受到的温暖', width / 2, height - 60);

    // 回调
    if (onCanvasReady) {
      onCanvasReady(canvas);
    }
  }, [letter, onCanvasReady]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded-2xl shadow-2xl"
    />
  );
}
