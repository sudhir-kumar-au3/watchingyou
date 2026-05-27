export const encodeState = (value: unknown): string => {
  try {
    return encodeURIComponent(btoa(JSON.stringify(value)));
  } catch {
    return '';
  }
};

export const decodeState = <T>(encoded: string | null): T | null => {
  if (!encoded) return null;
  try {
    return JSON.parse(atob(decodeURIComponent(encoded))) as T;
  } catch {
    return null;
  }
};

export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
