import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, getNextTrack, getPreviousTrack, filterSongs, shuffleArray } from './audioQueue.ts';
import type { Song } from '../types/music.ts';

const dummySongs: Song[] = [
  {
    id: 's1',
    title: 'Neon Horizon',
    artist: 'DHANJAY MAHATO',
    album: 'Cyber Odyssey',
    genre: 'Synthwave',
    duration: 215,
    audioUrl: '/audio/track1.mp3',
    coverUrl: '/cover1.jpg',
    plays: 120,
    likes: 45,
    releaseYear: 2026,
    addedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 's2',
    title: 'Midnight Echoes',
    artist: 'DHANJAY MAHATO',
    album: 'Deep Pulse',
    genre: 'Cyberpunk',
    duration: 180,
    audioUrl: '/audio/track2.mp3',
    coverUrl: '/cover2.jpg',
    plays: 350,
    likes: 90,
    releaseYear: 2026,
    addedAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 's3',
    title: 'Electric Hearts',
    artist: 'DHANJAY MAHATO',
    album: 'Deep Pulse',
    genre: 'EDM',
    duration: 240,
    audioUrl: '/audio/track3.mp3',
    coverUrl: '/cover3.jpg',
    plays: 50,
    likes: 12,
    releaseYear: 2026,
    addedAt: '2026-03-15T10:00:00Z',
  },
];

test('formatTime converts seconds to mm:ss correctly', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(9), '0:09');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(180), '3:00');
  assert.equal(formatTime(215), '3:35');
  assert.equal(formatTime(-5), '0:00');
});

test('getNextTrack respects linear order when repeat is off', () => {
  const nextFromS1 = getNextTrack(dummySongs, 's1', 'off', false);
  assert.equal(nextFromS2(nextFromS1), 's2');

  const nextFromS2Res = getNextTrack(dummySongs, 's2', 'off', false);
  assert.equal(nextFromS2Res?.id, 's3');

  const nextFromS3Res = getNextTrack(dummySongs, 's3', 'off', false);
  assert.equal(nextFromS3Res, null);

  function nextFromS2(song: Song | null) {
    return song?.id;
  }
});

test('getNextTrack loops to start when repeat mode is all', () => {
  const nextFromS3 = getNextTrack(dummySongs, 's3', 'all', false);
  assert.equal(nextFromS3?.id, 's1');
});

test('getNextTrack repeats current track when repeat mode is one', () => {
  const nextRepeatOne = getNextTrack(dummySongs, 's2', 'one', false);
  assert.equal(nextRepeatOne?.id, 's2');
});

test('getPreviousTrack returns previous item or stays at first', () => {
  assert.equal(getPreviousTrack(dummySongs, 's3')?.id, 's2');
  assert.equal(getPreviousTrack(dummySongs, 's2')?.id, 's1');
  assert.equal(getPreviousTrack(dummySongs, 's1')?.id, 's1');
});

test('filterSongs filters by query and genre', () => {
  const queryResult = filterSongs(dummySongs, 'echoes');
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].id, 's2');

  const genreResult = filterSongs(dummySongs, '', 'Synthwave');
  assert.equal(genreResult.length, 1);
  assert.equal(genreResult[0].id, 's1');

  const allResult = filterSongs(dummySongs, '', 'All');
  assert.equal(allResult.length, 3);
});

test('filterSongs sorts correctly by popular and title', () => {
  const popular = filterSongs(dummySongs, '', 'All', 'popular');
  assert.equal(popular[0].id, 's2'); // 350 plays

  const byTitle = filterSongs(dummySongs, '', 'All', 'title');
  assert.equal(byTitle[0].title, 'Electric Hearts');
});

test('shuffleArray returns array of same length and items', () => {
  const shuffled = shuffleArray(dummySongs);
  assert.equal(shuffled.length, dummySongs.length);
  assert.ok(shuffled.some((s) => s.id === 's1'));
  assert.ok(shuffled.some((s) => s.id === 's2'));
  assert.ok(shuffled.some((s) => s.id === 's3'));
});
