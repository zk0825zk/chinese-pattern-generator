'use client';

interface PatternCanvasProps {
  svg: string | null;
}

export function PatternCanvas({ svg }: PatternCanvasProps) {
  return (
    <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ minHeight: '400px' }}>
      {svg ? (
        <div
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">云</div>
            <p className="text-sm">选择纹样类型并点击生成</p>
          </div>
        </div>
      )}
    </div>
  );
}
