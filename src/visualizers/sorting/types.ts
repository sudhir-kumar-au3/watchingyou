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

export type Scenario =
  | 'random'
  | 'sorted'
  | 'reversed'
  | 'nearly-sorted'
  | 'few-unique';

export const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'sorted', label: 'Sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'nearly-sorted', label: 'Nearly sorted' },
  { id: 'few-unique', label: 'Few unique' },
];

export const makeScenario = (scenario: Scenario, size: number): number[] => {
  const ascending = Array.from({ length: size }, (_, i) =>
    Math.round(5 + (i * 95) / Math.max(size - 1, 1))
  );
  switch (scenario) {
    case 'sorted':
      return ascending;
    case 'reversed':
      return [...ascending].reverse();
    case 'nearly-sorted': {
      const arr = [...ascending];
      const swaps = Math.max(1, Math.floor(size / 8));
      for (let k = 0; k < swaps; k += 1) {
        const i = Math.floor(Math.random() * (size - 1));
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
      return arr;
    }
    case 'few-unique':
      return Array.from(
        { length: size },
        () => [20, 45, 70, 95][Math.floor(Math.random() * 4)]
      );
    case 'random':
    default:
      return randomArray(size);
  }
};
