import React from 'react';
import { Heart, Play, Music, Sparkles } from 'lucide-react';
import type { Song, Playlist } from '../types/music.js';
import { SongCard } from './SongCard.js';

interface FavoritesViewProps {
  favorites: string[];
  allSongs: Song[];
  onPlaySong: (song: Song) => void;
  onPlayAllFavorites: (favoriteSongs: Song[]) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onToggleFavorite: (songId: string) => void;
  onShare: (song: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onNavigateExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  allSongs,
  onPlaySong,
  onPlayAllFavorites,
  currentSong,
  isPlaying,
  onToggleFavorite,
  onShare,
  playlists,
  onAddToPlaylist,
  onNavigateExplore,
}) => {
  const favoriteSongs = allSongs.filter((song) => favorites.includes(song.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4FA3] uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5 fill-[#FF4FA3]" />
            <span>Your Personal Collection</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Favorite Tracks
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {favoriteSongs.length} songs loved by you
          </p>
        </div>

        {favoriteSongs.length > 0 && (
          <button
            onClick={() => onPlayAllFavorites(favoriteSongs)}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition shadow-lg shadow-pink-500/20 glow-pink"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play All Favorites</span>
          </button>
        )}
      </div>

      {favoriteSongs.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-3xl border border-pink-500/20 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[#FF4FA3]" />
          </div>
          <h3 className="font-display font-bold text-xl text-white mb-2">No Favorites Yet</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-6">
            Click the glowing heart icon on any song to save it to your private favorites collection.
          </p>
          <button
            onClick={onNavigateExplore}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white text-xs font-bold shadow-lg hover:opacity-90 transition"
          >
            Explore Music Vault
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isCurrentSong={currentSong?.id === song.id}
              isPlaying={isPlaying}
              isFavorite={true}
              onPlay={onPlaySong}
              onToggleFavorite={onToggleFavorite}
              onShare={onShare}
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
