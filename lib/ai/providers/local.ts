import type { AiAdapter, AiGenerateRequest, AiGenerateResult } from '../adapter';

/**
 * 生成一个简单的祥云纹 SVG 作为本地存根
 */
function generateCloudPatternSvg(prompt: string): string {
  // 从提示词中提取颜色信息，使用默认的中国传统配色
  const primary = '#e54d42';
  const secondary = '#c5a572';
  const bg = '#f5f0e8';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="${bg}"/>
  <g opacity="0.15">
    ${Array.from({ length: 8 }, (_, i) => {
      const x = 100 + (i % 4) * 200;
      const y = 120 + Math.floor(i / 4) * 280;
      return `<circle cx="${x}" cy="${y}" r="80" fill="none" stroke="${secondary}" stroke-width="0.5"/>`;
    }).join('\n    ')}
  </g>
  <g fill="none" stroke="${primary}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- 祥云 1 -->
    <g transform="translate(200, 180)">
      <path d="M0,0 C-20,-30 -60,-30 -60,0 C-60,20 -40,30 -20,25 C-30,50 0,60 20,40 C40,60 70,40 60,15 C80,20 90,0 70,-10 C80,-35 50,-50 30,-30 C20,-50 -10,-45 0,0 Z"/>
      <path d="M-20,25 C-15,15 -5,12 5,18" opacity="0.5"/>
      <path d="M20,40 C25,30 35,28 40,32" opacity="0.5"/>
    </g>
    <!-- 祥云 2 -->
    <g transform="translate(550, 150) scale(0.8)">
      <path d="M0,0 C-20,-30 -60,-30 -60,0 C-60,20 -40,30 -20,25 C-30,50 0,60 20,40 C40,60 70,40 60,15 C80,20 90,0 70,-10 C80,-35 50,-50 30,-30 C20,-50 -10,-45 0,0 Z"/>
    </g>
    <!-- 祥云 3 -->
    <g transform="translate(350, 380) scale(1.1)">
      <path d="M0,0 C-20,-30 -60,-30 -60,0 C-60,20 -40,30 -20,25 C-30,50 0,60 20,40 C40,60 70,40 60,15 C80,20 90,0 70,-10 C80,-35 50,-50 30,-30 C20,-50 -10,-45 0,0 Z"/>
      <path d="M-20,25 C-15,15 -5,12 5,18" opacity="0.5"/>
    </g>
    <!-- 祥云 4 -->
    <g transform="translate(650, 420) scale(0.7)">
      <path d="M0,0 C-20,-30 -60,-30 -60,0 C-60,20 -40,30 -20,25 C-30,50 0,60 20,40 C40,60 70,40 60,15 C80,20 90,0 70,-10 C80,-35 50,-50 30,-30 C20,-50 -10,-45 0,0 Z"/>
    </g>
    <!-- 小祥云 -->
    <g transform="translate(120, 420) scale(0.5)">
      <path d="M0,0 C-20,-30 -60,-30 -60,0 C-60,20 -40,30 -20,25 C-30,50 0,60 20,40 C40,60 70,40 60,15 C80,20 90,0 70,-10 C80,-35 50,-50 30,-30 C20,-50 -10,-45 0,0 Z"/>
    </g>
    <g transform="translate(700, 250) scale(0.45)">
      <path d="M0,0 C-20,-30 -60,-30 -60,0 C-60,20 -40,30 -20,25 C-30,50 0,60 20,40 C40,60 70,40 60,15 C80,20 90,0 70,-10 C80,-35 50,-50 30,-30 C20,-50 -10,-45 0,0 Z"/>
    </g>
  </g>
  <!-- 装饰回纹边框 -->
  <rect x="30" y="30" width="740" height="540" fill="none" stroke="${secondary}" stroke-width="1" opacity="0.4" rx="4"/>
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="${secondary}" stroke-width="0.5" opacity="0.25" rx="2"/>
  <!-- 角落装饰 -->
  <g stroke="${secondary}" stroke-width="1.5" fill="none" opacity="0.5">
    <path d="M50,70 L50,50 L70,50"/>
    <path d="M730,50 L750,50 L750,70"/>
    <path d="M750,530 L750,550 L730,550"/>
    <path d="M70,550 L50,550 L50,530"/>
  </g>
  <text x="400" y="560" text-anchor="middle" font-size="11" fill="${secondary}" font-family="serif" opacity="0.6">本地预览 · ${prompt.length > 20 ? prompt.substring(0, 20) + '…' : prompt}</text>
</svg>`;
}

export class LocalAdapter implements AiAdapter {
  readonly provider = 'local';

  async generate(request: AiGenerateRequest): Promise<AiGenerateResult> {
    // 模拟 AI 生成延迟
    await new Promise((r) => setTimeout(r, 1500));

    if (request.outputFormat === 'svg') {
      return { svgCode: generateCloudPatternSvg(request.prompt) };
    }

    // image 模式：生成一个有内容的 SVG 再转为简单的占位提示
    // 由于本地无法真正生成位图，返回一个提示性的 SVG 作为 base64
    const svg = generateCloudPatternSvg(request.prompt);
    const base64Svg = Buffer.from(svg).toString('base64');
    return {
      // 返回 SVG 的 base64（浏览器可以用 data:image/svg+xml 显示）
      imageBase64: base64Svg,
      metadata: { note: 'local-stub-svg-as-image' },
    };
  }
}
