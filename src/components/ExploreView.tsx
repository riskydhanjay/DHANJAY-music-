import React, { useState, useMemo } from 'react';
import { Compass, Filter, ArrowUpDown, Sparkles } from 'lucide-react';
import type { Song, Playlist } from '../types/music.js';
import { filterSongs } from '../utils/audioQueue.js';
import { SongCard } from './SongCard.js';

interface ExploreViewProps {
  title?: string;
  songs: Song[];
  searchQuery: string;
  currentSong: Song | null;
  isPlaying: boolean;
  favorites: string[];
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onShare: (song: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, songId: string) => void;
}

const GENRES = ['All', 'Synthwave', 'Cyberpunk', 'EDM', 'Lo-Fi', 'Ambient', 'Pop'];

export const ExploreView: React.FC<ExploreViewProps> = ({
  title = 'Explore Sound Dimensions',
  songs,
  searchQuery,
  currentSong,
  isPlaying,
  favorites,
  onPlaySong,
  onToggleFavorite,
  onShare,
  playlists,
  onAddToPlaylist,
}) => {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'trending' | 'popular' | 'title'>('recent');

  const filteredSongs = useMemo(() => {
    return filterSongs(songs, searchQuery, selectedGenre, sortBy);
  }, [songs, searchQuery, selectedGenre, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF4FA3] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Futuristic Sonic Library</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Showing {filteredSongs.length} tracks {searchQuery && `matching "${searchQuery}"`}
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <ArrowUpDown className="w-4 h-4 text-pink-400" />
          <span className="text-xs text-gray-400 font-semibold">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#1A0E33] border border-pink-500/25 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4FA3]"
          >
            <option value="recent">Recently Added</option>
            <option value="trending">Highest Trending</option>
            <option value="popular">Most Listened</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none" role="tablist">
        {GENRES.map((g) => {
          const isActive = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white shadow-md shadow-pink-500/25 glow-pink'
                  : 'glass-panel text-gray-300 hover:text-white hover:border-pink-500/30'
              }`}
              role="tab"
              aria-selected={isActive}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Songs Grid */}
      {filteredSongs.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-3xl border border-pink-500/20 max-w-md mx-auto">
          <Filter className="w-12 h-12 text-pink-500/30 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-white mb-1">No tracks found</h3>
          <p className="text-xs text-gray-400">
            Try adjusting your search terms or picking another genre category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isCurrentSong={currentSong?.id === song.id}
              isPlaying={isPlaying}
              isFavorite={favorites.includes(song.id)}
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
