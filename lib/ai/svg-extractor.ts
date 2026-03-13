/**
 * 从 AI 大模型返回的文本中提取 SVG 代码
 */
export function extractSvg(text: string): { success: true; svg: string } | { success: false; error: string } {
  // 1. 尝试从 markdown 代码块中提取
  const codeBlockMatch = text.match(/```(?:svg|xml)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    const content = codeBlockMatch[1].trim();
    if (content.includes('<svg')) {
      return validateAndReturn(content);
    }
  }

  // 2. 尝试直接匹配 <svg>...</svg>
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return validateAndReturn(svgMatch[0].trim());
  }

  return { success: false, error: 'AI 返回内容中未找到有效的 SVG 代码' };
}

function validateAndReturn(svg: string): { success: true; svg: string } | { success: false; error: string } {
  if (!/<svg\s/i.test(svg)) {
    return { success: false, error: 'SVG 代码缺少根元素' };
  }
  if (!/<\/svg>/i.test(svg)) {
    return { success: false, error: 'SVG 代码未正确闭合' };
  }
  return { success: true, svg };
}
