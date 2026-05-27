export interface DpState {
  grid: (number | null)[][];
  rowHeader: string[];
  colHeader: string[];
  rowTitle: string;
  colTitle: string;
  current: [number, number] | null;
  dependencies: [number, number][];
  path: [number, number][];
}

export interface StringPairInput {
  a: string;
  b: string;
}

export interface KnapsackInput {
  weights: number[];
  values: number[];
  capacity: number;
}

export const createDpState = (
  partial: Partial<DpState> & Pick<DpState, 'grid' | 'rowHeader' | 'colHeader'>
): DpState => ({
  rowTitle: '',
  colTitle: '',
  current: null,
  dependencies: [],
  path: [],
  ...partial,
});

export const emptyGrid = (rows: number, cols: number): (number | null)[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
