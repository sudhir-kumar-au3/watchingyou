import { beforeEach, describe, expect, it } from 'vitest';
import { useLibraryStore } from './libraryStore';

const reset = (): void =>
  useLibraryStore.setState({ favorites: [], recents: [] });

describe('libraryStore', () => {
  beforeEach(reset);

  it('toggles a favorite on and off', () => {
    const { toggleFavorite } = useLibraryStore.getState();
    toggleFavorite('bubble-sort');
    expect(useLibraryStore.getState().favorites).toEqual(['bubble-sort']);
    toggleFavorite('bubble-sort');
    expect(useLibraryStore.getState().favorites).toEqual([]);
  });

  it('records recents most-recent-first without duplicates', () => {
    const { visit } = useLibraryStore.getState();
    visit('a');
    visit('b');
    visit('a');
    expect(useLibraryStore.getState().recents).toEqual(['a', 'b']);
  });

  it('caps recents at 8 entries', () => {
    const { visit } = useLibraryStore.getState();
    for (let i = 0; i < 12; i += 1) visit(`id-${i}`);
    expect(useLibraryStore.getState().recents.length).toBe(8);
    expect(useLibraryStore.getState().recents[0]).toBe('id-11');
  });
});
