import { create } from 'zustand';

const KEY = 'watchingyou:library';
const RECENT_LIMIT = 8;

interface Persisted {
  favorites: string[];
  recents: string[];
}

const load = (): Persisted => {
  if (typeof localStorage === 'undefined') return { favorites: [], recents: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { favorites: [], recents: [] };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      recents: Array.isArray(parsed.recents) ? parsed.recents : [],
    };
  } catch {
    return { favorites: [], recents: [] };
  }
};

const save = (data: Persisted): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable — ignore */
  }
};

interface LibraryState {
  favorites: string[];
  recents: string[];
  toggleFavorite: (id: string) => void;
  visit: (id: string) => void;
}

const initial = load();

export const useLibraryStore = create<LibraryState>((set, get) => ({
  favorites: initial.favorites,
  recents: initial.recents,

  toggleFavorite: (id) => {
    const { favorites, recents } = get();
    const favs = favorites.includes(id)
      ? favorites.filter((entry) => entry !== id)
      : [id, ...favorites];
    set({ favorites: favs });
    save({ favorites: favs, recents });
  },

  visit: (id) => {
    const { favorites, recents } = get();
    if (recents[0] === id) return;
    const next = [id, ...recents.filter((entry) => entry !== id)].slice(
      0,
      RECENT_LIMIT
    );
    set({ recents: next });
    save({ favorites, recents: next });
  },
}));
