import React, { useState } from 'react';
import { Play, Pause, Heart, Share2, Plus, Headphones, Sparkles } from 'lucide-react';
import type { Song, Playlist } from '../types/music.js';
import { formatTime } from '../utils/audioQueue.js';

interface SongCardProps {
  song: Song;
  isCurrentSong: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onShare: (song: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, songId: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isCurrentSong,
  isPlaying,
  isFavorite,
  onPlay,
  onToggleFavorite,
  onShare,
  playlists,
  onAddToPlaylist,
}) => {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const currentlyPlayingThis = isCurrentSong && isPlaying;

  return (
    <div className="group relative glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between overflow-hidden transition-all duration-300">
      {/* Glow highlight on playing */}
      {isCurrentSong && (
        <div className="absolute inset-0 bg-gradient-to-t from-[#FF4FA3]/15 via-transparent to-[#7B2CFF]/15 pointer-events-none" />
      )}

      {/* Album Artwork & Peek-out Vinyl Disc */}
      <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-[#160D29] flex items-center justify-center">
        {/* Peeking Vinyl Record */}
        <div
          className={`absolute right-1 w-[90%] h-[90%] rounded-full bg-black border-4 border-[#25133d] shadow-2xl transition-all duration-500 flex items-center justify-center ${
            currentlyPlayingThis
              ? 'translate-x-7 rotate-45 animate-vinyl-spin'
              : 'group-hover:translate-x-6'
          }`}
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle, #10091f, #10091f 4px, #20123a 5px, #20123a 8px)',
          }}
        >
          {/* Vinyl center sticker */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF4FA3] to-[#7B2CFF] flex items-center justify-center p-1 shadow-inner">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10091F]" />
          </div>
        </div>

        {/* Cover Artwork Image */}
        <img
          src={song.coverUrl}
          alt={`${song.title} cover`}
          className="relative z-10 w-full h-full object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Play/Pause Hover Overlay */}
        <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onPlay(song)}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#FF4FA3] to-[#7B2CFF] flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-transform glow-pink"
            aria-label={currentlyPlayingThis ? `Pause ${song.title}` : `Play ${song.title}`}
          >
            {currentlyPlayingThis ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-1" />
            )}
          </button>
        </div>

        {/* Trending / Popular Badge */}
        {song.isTrending && (
          <div className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF4FA3]/90 text-white shadow-lg backdrop-blur-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Trending
          </div>
        )}

        {/* Genre Pill */}
        <div className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#10091F]/80 text-pink-300 border border-pink-500/30 backdrop-blur-md">
          {song.genre}
        </div>
      </div>

      {/* Song Details */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className={`font-display font-bold text-base truncate transition-colors ${
                isCurrentSong ? 'text-[#FF4FA3] text-glow-pink' : 'text-white group-hover:text-pink-200'
              }`}
              title={song.title}
            >
              {song.title}
            </h3>
            <p className="text-xs text-gray-400 truncate mt-0.5" title={song.artist}>
              {song.artist}
            </p>
          </div>

          {/* Quick Play button on small screens */}
          <button
            onClick={() => onPlay(song)}
            className="sm:hidden p-2 rounded-full bg-pink-500/20 text-[#FF4FA3] hover:bg-pink-500/40"
            aria-label={currentlyPlayingThis ? `Pause ${song.title}` : `Play ${song.title}`}
          >
            {currentlyPlayingThis ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Metadata stats: Plays & Duration */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2.5 border-t border-white/5">
          <div className="flex items-center gap-1 text-pink-300" title="Measurable actual listens">
            <Headphones className="w-3 h-3 text-purple-400" />
            <span>{song.plays.toLocaleString()} plays</span>
          </div>
          <span>{formatTime(song.duration)}</span>
        </div>
      </div>

      {/* Action Row: Favorite, Share, Add to Playlist */}
      <div className="flex items-center justify-between mt-3 pt-2 relative">
        <button
          onClick={() => onToggleFavorite(song.id)}
          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs ${
            isFavorite
              ? 'text-[#FF4FA3] hover:text-pink-300'
              : 'text-gray-400 hover:text-white'
          }`}
          aria-label={isFavorite ? `Remove ${song.title} from favorites` : `Add ${song.title} to favorites`}
          title={isFavorite ? 'In Favorites' : 'Add to Favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#FF4FA3]' : ''}`} />
          <span className="text-[11px]">{song.likes}</span>
        </button>

        <div className="flex items-center gap-1">
          {/* Share */}
          <button
            onClick={() => onShare(song)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            aria-label={`Share ${song.title}`}
            title="Share Song"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Add to Playlist Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
              aria-label={`Add ${song.title} to playlist`}
              title="Add to Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>

            {showPlaylistMenu && (
              <div
                className="absolute right-0 bottom-full mb-2 w-48 rounded-xl glass-panel bg-[#150B28]/95 border border-pink-500/30 p-2 shadow-2xl z-50 text-xs"
                onMouseLeave={() => setShowPlaylistMenu(false)}
              >
                <div className="font-semibold text-gray-300 px-2 py-1 border-b border-white/10 mb-1">
                  Add to Playlist
                </div>
                {playlists.length === 0 ? (
                  <div className="px-2 py-1.5 text-gray-400">No playlists yet</div>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => {
                        onAddToPlaylist(pl.id, song.id);
                        setShowPlaylistMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-pink-500/20 text-gray-200 hover:text-white truncate transition"
                    >
                      + {pl.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
