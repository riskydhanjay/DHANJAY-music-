import React from 'react';
import { Play, Sparkles, Compass, Flame, Heart, Music, Star, Disc } from 'lucide-react';
import type { Song } from '../types/music.js';
import { HeroScene3D } from './HeroScene3D.js';

interface HeroSectionProps {
  onPlayTrending: () => void;
  onExplore: () => void;
  trendingCount: number;
  totalPlays: number;
  isPlaying: boolean;
  featuredSong?: Song;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onPlayTrending,
  onExplore,
  trendingCount,
  totalPlays,
  isPlaying,
  featuredSong,
}) => {
  return (
    <section className="relative w-full overflow-hidden pt-8 pb-14 px-4 sm:px-6 lg:px-8">
      {/* Background Neon Glow Circles & Ambient Stars */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#FF4FA3]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#7B2CFF]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Animated Tiny Hearts, Stars and Music Notes */}
      <div className="absolute top-12 left-10 text-pink-400 opacity-60 animate-float pointer-events-none hidden sm:block">
        <Heart className="w-5 h-5 fill-current animate-heart-pulse" />
      </div>
      <div className="absolute top-36 right-16 text-purple-400 opacity-50 animate-float pointer-events-none hidden sm:block" style={{ animationDelay: '1.5s' }}>
        <Music className="w-6 h-6" />
      </div>
      <div className="absolute bottom-16 left-24 text-pink-300 opacity-40 animate-float pointer-events-none hidden md:block" style={{ animationDelay: '2.5s' }}>
        <Star className="w-4 h-4 fill-current" />
      </div>
      <div className="absolute top-1/2 right-10 text-pink-500 opacity-30 animate-float pointer-events-none hidden lg:block" style={{ animationDelay: '3s' }}>
        <Heart className="w-4 h-4 fill-current animate-heart-pulse" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline & Action Controls */}
        <div className="lg:col-span-7 flex flex-col items-start z-10 text-left">
          {/* Futuristic Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F123A]/80 border border-pink-500/30 text-xs font-semibold text-pink-200 mb-6 backdrop-blur-md shadow-lg shadow-pink-500/10">
            <span className="w-2 h-2 rounded-full bg-[#FF4FA3] animate-pulse" />
            <span className="tracking-wider uppercase font-bold text-[11px]">
              Futuristic 3D Audio Experience
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-purple-300">By Dhanjay Mahato</span>
          </div>

          {/* Hero Headline */}
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white uppercase leading-[1.05] mb-6">
            YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4FA3] via-pink-300 to-[#7B2CFF] text-glow-pink">MUSIC.</span><br />
            YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7B2CFF] via-purple-300 to-[#FF4FA3] text-glow-purple">WORLD.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 max-w-xl mb-8 leading-relaxed font-normal">
            Step into the next generation of soundscapes created by <strong className="text-pink-300 font-bold">DHANJAY MAHATO</strong>. Seamless real audio streaming, 3D interactive vinyl aesthetics, and high-energy electronic rhythms.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onPlayTrending}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF4FA3] to-[#7B2CFF] text-white font-bold text-sm tracking-wide shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 glow-pink"
              aria-label="Play Trending Music"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Stream Trending Now</span>
            </button>

            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl glass-panel text-gray-200 hover:text-white font-bold text-sm border-pink-500/30 hover:border-pink-500/60 transition-all flex items-center justify-center gap-2"
              aria-label="Explore All Songs"
            >
              <Compass className="w-4 h-4 text-[#FF4FA3]" />
              <span>Explore Vault</span>
            </button>
          </div>

          {/* Real Measurable Stats Counters */}
          <div className="grid grid-cols-3 gap-6 sm:gap-10 mt-10 pt-8 border-t border-white/10 w-full max-w-lg">
            <div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                {totalPlays.toLocaleString()}+
              </div>
              <div className="text-xs text-pink-300/80 font-medium uppercase tracking-wider mt-0.5">
                Real Plays
              </div>
            </div>

            <div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                {trendingCount}
              </div>
              <div className="text-xs text-purple-300/80 font-medium uppercase tracking-wider mt-0.5">
                Trending Beats
              </div>
            </div>

            <div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                100%
              </div>
              <div className="text-xs text-pink-300/80 font-medium uppercase tracking-wider mt-0.5">
                Original Audio
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Animated Scene & Floating Vinyl */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="w-full relative">
            <HeroScene3D isPlaying={isPlaying} />

            {/* Now Playing Interactive Holographic Card (if song available) */}
            {featuredSong && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-xs glass-panel rounded-2xl p-3 border border-pink-500/30 shadow-2xl flex items-center gap-3 backdrop-blur-xl">
                <img
                  src={featuredSong.coverUrl}
                  alt={featuredSong.title}
                  className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold text-[#FF4FA3] tracking-wider">
                    {isPlaying ? 'Now Playing' : 'Featured Track'}
                  </div>
                  <div className="text-xs font-bold text-white truncate font-display">
                    {featuredSong.title}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {featuredSong.artist}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-pink-500/20 text-[#FF4FA3]">
                  <Disc className="w-4 h-4 animate-vinyl-spin" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
