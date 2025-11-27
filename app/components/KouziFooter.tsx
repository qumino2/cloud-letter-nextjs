import Image from 'next/image';

export default function KouziFooter() {
  return (
    <div className="w-full py-8 flex flex-col items-center gap-3">
      {/* 扣子IP图片 */}
      <div className="relative w-32 h-24 opacity-60">
        <Image
          src="/kouzi.png"
          alt="扣子"
          fill
          className="object-contain"
          priority={false}
        />
      </div>

      {/* 底部文字 */}
      <p className="text-xs text-gray-400 text-center">
        用心传递爱，让每一句话都充满温暖
      </p>
    </div>
  );
}
