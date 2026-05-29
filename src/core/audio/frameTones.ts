export interface FrameTones {
  values: number[];
  max: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null;

const numberArray = (value: unknown): number[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === 'number')
    ? (value as number[])
    : null;

const pick = (source: number[], indices: number[]): number[] =>
  indices
    .filter((index) => index >= 0 && index < source.length)
    .map((index) => source[index]);

export const frameTones = (state: unknown): FrameTones | null => {
  const record = asRecord(state);
  if (!record) return null;

  const sortArray = numberArray(record.array);
  if (sortArray && (record.comparing || record.writing)) {
    const touched = [
      ...(numberArray(record.comparing) ?? []),
      ...(numberArray(record.swapping) ?? []),
      ...(numberArray(record.writing) ?? []),
    ];
    const values = pick(sortArray, touched);
    if (values.length === 0) return null;
    return { values, max: Math.max(...sortArray, 1) };
  }

  const heapValues = numberArray(record.values);
  if (heapValues && (record.comparing || record.swapped)) {
    const active = typeof record.active === 'number' ? [record.active] : [];
    const touched = [
      ...(numberArray(record.comparing) ?? []),
      ...(numberArray(record.swapped) ?? []),
      ...active,
    ];
    const values = pick(heapValues, touched);
    if (values.length === 0) return null;
    return { values, max: Math.max(...heapValues, 1) };
  }

  return null;
};
