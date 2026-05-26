export interface SortState {
  array: number[];
  comparing: number[];
  swapping: number[];
  writing: number[];
  sorted: number[];
  pivot: number | null;
  range: [number, number] | null;
  pointers: Record<string, number>;
}

export const createSortState = (
  array: number[],
  partial: Partial<SortState> = {}
): SortState => ({
  array,
  comparing: [],
  swapping: [],
  writing: [],
  sorted: [],
  pivot: null,
  range: null,
  pointers: {},
  ...partial,
});

export const randomArray = (size: number, max = 100): number[] =>
  Array.from({ length: size }, () => Math.floor(Math.random() * max) + 5);
