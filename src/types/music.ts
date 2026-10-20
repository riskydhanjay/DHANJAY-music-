export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // in seconds
  audioUrl: string;
  coverUrl: string;
  plays: number; // measurable actual plays
  likes: number;
  releaseYear: number;
  addedAt: string;
  isTrending?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  description?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  songIds: string[];
  createdAt: string;
}

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Song[];
  history: string[];
}
