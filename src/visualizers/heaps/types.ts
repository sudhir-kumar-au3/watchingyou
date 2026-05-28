export interface HeapState {
  values: number[];
  size: number;
  comparing: number[];
  swapped: number[];
  active: number | null;
}

export const createHeapState = (
  values: number[],
  size: number,
  partial: Partial<HeapState> = {}
): HeapState => ({
  values,
  size,
  comparing: [],
  swapped: [],
  active: null,
  ...partial,
});

export const randomHeapValues = (count = 7, max = 99): number[] =>
  Array.from({ length: count }, () => Math.floor(Math.random() * max) + 1);
