import { toPng } from 'html-to-image';

export const exportNodeToPng = async (
  node: HTMLElement,
  filename: string
): Promise<boolean> => {
  try {
    const dataUrl = await toPng(node, {
      backgroundColor: '#05060f',
      pixelRatio: 2,
      cacheBust: true,
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  } catch {
    return false;
  }
};
