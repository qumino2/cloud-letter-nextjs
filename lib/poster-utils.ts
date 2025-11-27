// Canvas海报生成工具库

/**
 * 在Canvas上绘制自动换行文本
 */
export function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split('');
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);

  return currentY + lineHeight; // 返回最后一行的Y坐标
}

/**
 * 添加水印
 */
export function addWatermark(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  text: string = '云端家书'
) {
  ctx.save();
  ctx.font = '14px sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.textAlign = 'right';
  ctx.fillText(text, canvas.width - 30, canvas.height - 20);
  ctx.restore();
}

/**
 * 添加日期
 */
export function addDate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  date: Date = new Date()
) {
  ctx.save();
  ctx.font = '16px sans-serif';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  ctx.fillText(dateStr, x, y);
  ctx.restore();
}

/**
 * 下载Canvas为图片
 */
export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  filename: string = 'letter'
) {
  const link = document.createElement('a');
  link.download = `${filename}_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

/**
 * 使用Web Share API分享图片（如果支持）
 */
export async function shareImage(
  canvas: HTMLCanvasElement,
  title: string = '云端家书',
  text: string = '我给孩子写的一封家书'
): Promise<boolean> {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  try {
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });

    const file = new File([blob], 'letter.png', { type: 'image/png' });

    const canShare = navigator.canShare({ files: [file] });
    if (!canShare) {
      return false;
    }

    await navigator.share({
      files: [file],
      title,
      text
    });

    return true;
  } catch (error) {
    console.error('分享失败:', error);
    return false;
  }
}

/**
 * 创建渐变背景
 */
export function createGradientBackground(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  colors: string[]
) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制圆角矩形
 */
export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * 添加阴影效果
 */
export function addShadow(
  ctx: CanvasRenderingContext2D,
  blur: number = 20,
  color: string = 'rgba(0, 0, 0, 0.2)',
  offsetX: number = 0,
  offsetY: number = 10
) {
  ctx.shadowBlur = blur;
  ctx.shadowColor = color;
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
}

/**
 * 清除阴影
 */
export function clearShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
