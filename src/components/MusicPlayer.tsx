import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Radio,
  Maximize2,
  Minimize2,
  Music,
} from 'lucide-react';
import type { Song, RepeatMode } from '../types/music.js';
import { formatTime } from '../utils/audioQueue.js';
import { AudioVisualizer } from './AudioVisualizer.js';

interface MusicPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSongEnd: () => void;
  repeatMode: RepeatMode;
  onCycleRepeat: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  isFavorite: boolean;
  onToggleFavorite: (songId: string) => void;
  onOpenQueue: () => void;
  queueLength: number;
  onRecordPlay: (songId: string) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  onNext,
  onPrevious,
  onSongEnd,
  repeatMode,
  onCycleRepeat,
  isShuffle,
  onToggleShuffle,
  isFavorite,
  onToggleFavorite,
  onOpenQueue,
  queueLength,
  onRecordPlay,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasRecordedPlay, setHasRecordedPlay] = useState(false);

  // Sync isPlaying with audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play request handled:', err.message);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Reset play tracking on new song
  useEffect(() => {
    setHasRecordedPlay(false);
    setCurrentTime(0);
  }, [currentSong?.id]);

  // Volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Time update handler
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);

    // Record measurable play if played > 5 seconds
    if (!hasRecordedPlay && audio.currentTime >= 5 && currentSong) {
      setHasRecordedPlay(true);
      onRecordPlay(currentSong.id);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration || currentSong?.duration || 0);
  };

  // Seek bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !audioRef.current || !duration) return;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle Audio Ended
  const handleEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onSongEnd();
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) return null;

  return (
    <>
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="auto"
      />

      {/* Expanded Full-Screen Visualizer Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-[#10091F]/95 backdrop-blur-2xl flex flex-col p-6 sm:p-10 animate-in fade-in duration-300">
          <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF4FA3] animate-ping" />
              <span className="font-display font-bold text-sm tracking-widest text-[#FF4FA3]">
                NOW STREAMING • 3D SOUNDSTAGE
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 rounded-xl glass-panel text-gray-300 hover:text-white"
              aria-label="Close expanded visualizer"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto text-center my-6">
            {/* Massive Spinning Vinyl */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-black border-8 border-[#2D164B] shadow-[0_0_60px_rgba(255,79,163,0.35)] flex items-center justify-center p-3 mb-8">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className={`w-full h-full object-cover rounded-full ${
                  isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-paused'
                }`}
              />
              <div className="absolute w-16 h-16 rounded-full bg-[#10091F] border-4 border-[#FF4FA3] flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 rounded-full bg-[#7B2CFF]" />
              </div>
            </div>

            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white mb-2 text-glow-pink">
              {currentSong.title}
            </h2>
            <p className="text-pink-300 font-semibold text-lg sm:text-xl mb-4">
              {currentSong.artist} • {currentSong.album}
            </p>

            {/* High-Fidelity Canvas Visualizer */}
            <div className="w-full max-w-2xl my-4">
              <AudioVisualizer isPlaying={isPlaying} barCount={48} height={70} variant="full" />
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Bottom Player */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-pink-500/30 bg-[#120A24]/90 backdrop-blur-xl transition-all shadow-[0_-10px_35px_rgba(0,0,0,0.5)]"
        role="region"
        aria-label="Audio player"
      >
        {/* Scrubber Bar along top edge */}
        <div
          ref={progressBarRef}
          onClick={handleSeek}
          className="relative w-full h-1.5 bg-[#201239] hover:h-2.5 transition-all cursor-pointer group"
          role="slider"
          aria-label="Seek audio position"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
        >
          <div
            className="h-full bg-gradient-to-r from-[#7B2CFF] via-[#FF4FA3] to-pink-300 relative rounded-r-full shadow-sm"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-[#FF4FA3] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Song Info & Mini Rotating Vinyl */}
          <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs flex-1">
            <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-black border-2 border-pink-500/40 shadow-md">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className={`w-full h-full object-cover ${
                  isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-paused'
                }`}
              />
              <div className="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-[#10091F] border border-pink-400" />
            </div>

            <div className="min-w-0">
              <div className="font-display font-bold text-sm text-white truncate text-glow-pink">
                {currentSong.title}
              </div>
              <div className="text-xs text-pink-300 truncate">
                {currentSong.artist}
              </div>
            </div>

            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(currentSong.id)}
              className={`hidden sm:block p-1.5 rounded-lg transition ${
                isFavorite ? 'text-[#FF4FA3]' : 'text-gray-400 hover:text-white'
              }`}
              aria-label={isFavorite ? 'Unfavorite current track' : 'Favorite current track'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#FF4FA3]' : ''}`} />
            </button>
          </div>

          {/* Central Playback Controls */}
          <div className="flex flex-col items-center flex-1 max-w-md">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Shuffle */}
              <button
                onClick={onToggleShuffle}
                className={`p-2 rounded-lg transition ${
                  isShuffle
                    ? 'text-[#FF4FA3] bg-pink-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
                title={isShuffle ? 'Shuffle: ON' : 'Shuffle: OFF'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous */}
              <button
                onClick={onPrevious}
                className="p-2 text-gray-300 hover:text-white hover:scale-105 active:scale-95 transition"
                aria-label="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause Main Button */}
              <button
                onClick={onTogglePlay}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF4FA3] to-[#7B2CFF] flex items-center justify-center text-white shadow-lg shadow-pink-500/30 hover:scale-108 active:scale-95 transition glow-pink"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={onNext}
                className="p-2 text-gray-300 hover:text-white hover:scale-105 active:scale-95 transition"
                aria-label="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={onCycleRepeat}
                className={`p-2 rounded-lg transition ${
                  repeatMode !== 'off'
                    ? 'text-[#FF4FA3] bg-pink-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label={`Repeat mode: ${repeatMode}`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Time labels & Mini Spectrum */}
            <div className="hidden sm:flex items-center justify-between w-full text-[11px] text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <AudioVisualizer isPlaying={isPlaying} barCount={18} height={18} className="w-28" />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume, Queue, and Expand */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-[280px]">
            {/* Volume slider */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-gray-400 hover:text-white transition"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-pink-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-18 accent-[#FF4FA3] h-1.5 bg-[#25153E] rounded-lg cursor-pointer"
                aria-label="Volume control"
              />
            </div>

            {/* Queue Toggle */}
            <button
              onClick={onOpenQueue}
              className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
              aria-label="Toggle Queue"
              title="Queue"
            >
              <Radio className="w-4 h-4 text-purple-300" />
              {queueLength > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF4FA3] text-[10px] font-bold flex items-center justify-center text-white">
                  {queueLength}
                </span>
              )}
            </button>

            {/* Expand Fullscreen Visualizer */}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
              aria-label="Expand 3D visualizer mode"
              title="Fullscreen visualizer"
            >
              <Maximize2 className="w-4 h-4 text-pink-300" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
