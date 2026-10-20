import type { Song, RepeatMode } from '../types/music.js';

/**
 * Formats seconds into a human-readable mm:ss string.
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Returns an unmutated shuffled copy of an array using Fisher-Yates.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Computes the next track in the queue based on repeat mode and shuffle.
 */
export function getNextTrack(
  queue: readonly Song[],
  currentSongId: string | null,
  repeatMode: RepeatMode,
  isShuffle: boolean = false
): Song | null {
  if (!queue || queue.length === 0) return null;

  // Single track repeat mode repeats the exact same track
  if (repeatMode === 'one' && currentSongId) {
    const current = queue.find((s) => s.id === currentSongId);
    if (current) return current;
  }

  const currentIndex = queue.findIndex((s) => s.id === currentSongId);

  // If shuffle is active and queue has multiple songs
  if (isShuffle && queue.length > 1) {
    const pool = queue.filter((s) => s.id !== currentSongId);
    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      return pool[randomIndex];
    }
  }

  // Not playing or song not in queue: start from first
  if (currentIndex === -1) {
    return queue[0];
  }

  // Next index in sequence
  const nextIndex = currentIndex + 1;
  if (nextIndex < queue.length) {
    return queue[nextIndex];
  }

  // At the end of queue: if repeatMode is 'all', loop to index 0
  if (repeatMode === 'all') {
    return queue[0];
  }

  return null;
}

/**
 * Computes the previous track in the queue.
 */
export function getPreviousTrack(
  queue: readonly Song[],
  currentSongId: string | null
): Song | null {
  if (!queue || queue.length === 0) return null;
  const currentIndex = queue.findIndex((s) => s.id === currentSongId);

  if (currentIndex === -1 || currentIndex === 0) {
    return queue[0];
  }

  return queue[currentIndex - 1];
}

/**
 * Filters and sorts songs list based on search term, genre, and sort criteria.
 */
export function filterSongs(
  songs: readonly Song[],
  query: string = '',
  genre: string = 'All',
  sortBy: 'recent' | 'trending' | 'popular' | 'title' = 'recent'
): Song[] {
  let filtered = [...songs];

  const q = query.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
    );
  }

  if (genre && genre !== 'All') {
    filtered = filtered.filter(
      (s) => s.genre.toLowerCase() === genre.toLowerCase()
    );
  }

  switch (sortBy) {
    case 'trending':
      return filtered.sort((a, b) => (b.plays * 2 + b.likes * 5) - (a.plays * 2 + a.likes * 5));
    case 'popular':
      return filtered.sort((a, b) => b.plays - a.plays);
    case 'title':
      return filtered.sort((a, b) => a.title.localeCompare(b.title));
    case 'recent':
    default:
      return filtered.sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
  }
}
