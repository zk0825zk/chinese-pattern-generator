export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function svgToBlob(svg: string): Blob {
  return new Blob([svg], { type: 'image/svg+xml' });
}

export function downloadSvg(svg: string, filename: string = 'pattern.svg'): void {
  const blob = svgToBlob(svg);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPng(svg: string, width: number, height: number, filename: string = 'pattern.png'): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // 2x for retina
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load SVG image'));
    img.src = svgToDataUrl(svg);
  });
}
