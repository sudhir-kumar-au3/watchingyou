export interface SearchInput {
  array: number[];
  target: number;
}

export const randomSortedInput = (size = 15): SearchInput => {
  const values = new Set<number>();
  while (values.size < size) values.add(Math.floor(Math.random() * 80) + 1);
  const array = [...values].sort((a, b) => a - b);
  const target = array[Math.floor(Math.random() * array.length)];
  return { array, target };
};

export const randomWindowInput = (size = 12): SearchInput => {
  const array = Array.from({ length: size }, () => Math.floor(Math.random() * 8) + 1);
  const total = array.reduce((sum, value) => sum + value, 0);
  const target = Math.max(array[0] + 1, Math.round(total * 0.4));
  return { array, target };
};
