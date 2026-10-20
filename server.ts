import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Ensure directories exist
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const AUDIO_UPLOADS_DIR = path.join(UPLOADS_DIR, 'audio');
const COVER_UPLOADS_DIR = path.join(UPLOADS_DIR, 'covers');
const DB_FILE = path.join(DATA_DIR, 'database.json');

[DATA_DIR, UPLOADS_DIR, AUDIO_UPLOADS_DIR, COVER_UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer for audio & cover uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, AUDIO_UPLOADS_DIR);
    } else {
      cb(null, COVER_UPLOADS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      const allowedAudio = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedAudio.includes(ext) || file.mimetype.startsWith('audio/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid audio format. Please upload MP3, WAV, OGG, or M4A.'));
      }
    } else if (file.fieldname === 'cover') {
      const allowedImg = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedImg.includes(ext) || file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid cover image format. Please upload JPG, PNG, or WebP.'));
      }
    } else {
      cb(null, true);
    }
  },
});

// Admin credentials & Session state
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dhanjaykumar1356@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'dhanjay2026!';
const activeTokens = new Set<string>();

// Initial curated tracks with real streamable royalty-free audio tracks & neon futuristic covers
const DEFAULT_SONGS = [
  {
    id: 'dm-001',
    title: 'Cyber Dimension',
    artist: 'DHANJAY MAHATO',
    album: 'Neon Universe Vol. 1',
    genre: 'Synthwave',
    duration: 194,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    plays: 1420,
    likes: 384,
    releaseYear: 2026,
    addedAt: '2026-03-01T10:00:00.000Z',
    isTrending: true,
    isPopular: true,
    isRecommended: true,
    description: 'A pulsating synthwave journey into a neon-lit cyberpunk metropolis with heavy basslines and retro synth leads.',
  },
  {
    id: 'dm-002',
    title: 'Electric Nightfall',
    artist: 'DHANJAY MAHATO',
    album: 'Neon Universe Vol. 1',
    genre: 'Cyberpunk',
    duration: 165,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=the-cradle-of-your-soul-15700.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    plays: 980,
    likes: 245,
    releaseYear: 2026,
    addedAt: '2026-03-05T14:30:00.000Z',
    isTrending: true,
    isPopular: false,
    isRecommended: true,
    description: 'Atmospheric electronic anthem featuring hypnotic arpeggios, electric guitar echoes, and deep 808 percussion.',
  },
  {
    id: 'dm-003',
    title: 'Cosmic Velocity',
    artist: 'DHANJAY MAHATO',
    album: 'Hyperdrive',
    genre: 'EDM',
    duration: 210,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    plays: 2150,
    likes: 672,
    releaseYear: 2026,
    addedAt: '2026-03-12T08:15:00.000Z',
    isTrending: false,
    isPopular: true,
    isRecommended: true,
    description: 'High energy festival EDM with soaring saw leads, massive drops, and euphoric stadium melodies.',
  },
  {
    id: 'dm-004',
    title: 'Lofi Stardust Dreams',
    artist: 'DHANJAY MAHATO',
    album: 'Midnight Chillout',
    genre: 'Lo-Fi',
    duration: 148,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    plays: 1870,
    likes: 512,
    releaseYear: 2026,
    addedAt: '2026-03-18T20:00:00.000Z',
    isTrending: true,
    isPopular: true,
    isRecommended: false,
    description: 'Warm vinyl crackles, mellow Rhodes piano chords, and soothing hip-hop beats for deep relaxation and focus.',
  },
  {
    id: 'dm-005',
    title: 'Quantum Horizon',
    artist: 'DHANJAY MAHATO',
    album: 'Hyperdrive',
    genre: 'Ambient',
    duration: 178,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_03d97f2619.mp3?filename=space-atmosphere-10702.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=800&q=80',
    plays: 820,
    likes: 190,
    releaseYear: 2026,
    addedAt: '2026-03-24T12:00:00.000Z',
    isTrending: false,
    isPopular: false,
    isRecommended: true,
    description: 'Ethereal soundscapes and shimmering pad layers depicting the vastness of the cosmos.',
  },
  {
    id: 'dm-006',
    title: 'Neon Heartbeat',
    artist: 'DHANJAY MAHATO',
    album: 'Neon Universe Vol. 1',
    genre: 'Synthwave',
    duration: 202,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    plays: 1640,
    likes: 430,
    releaseYear: 2026,
    addedAt: '2026-03-28T16:45:00.000Z',
    isTrending: true,
    isPopular: true,
    isRecommended: true,
    description: 'An infectious upbeat 80s synth-pop groove with sparkling arpeggiators and dynamic analog bass.',
  },
];

interface DatabaseSchema {
  songs: typeof DEFAULT_SONGS;
  playlists: Array<{
    id: string;
    name: string;
    description: string;
    coverUrl?: string;
    songIds: string[];
    createdAt: string;
  }>;
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (data && Array.isArray(data.songs)) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading database file, resetting to defaults:', err);
  }

  const initialData: DatabaseSchema = {
    songs: DEFAULT_SONGS,
    playlists: [
      {
        id: 'pl-01',
        name: 'Cyberpunk Odyssey',
        description: 'Immersive futuristic electronic tracks by Dhanjay Mahato.',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
        songIds: ['dm-001', 'dm-002', 'dm-006'],
        createdAt: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 'pl-02',
        name: 'Chill Stardust Session',
        description: 'Relaxing ambient and lofi tunes for late night flow.',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        songIds: ['dm-004', 'dm-005'],
        createdAt: '2026-03-15T12:00:00.000Z',
      },
    ],
  };

  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Authentication Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Admin token required.' });
    return;
  }

  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    res.status(403).json({ error: 'Invalid or expired admin session token.' });
    return;
  }

  next();
}

// Global middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded audio and covers statically
app.use('/uploads', express.static(UPLOADS_DIR));

// === API ROUTES ===

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);

    res.json({
      success: true,
      token,
      user: {
        email: ADMIN_EMAIL,
        name: 'DHANJAY MAHATO',
        role: 'owner',
      },
    });
  } else {
    res.status(401).json({ error: 'Invalid owner credentials.' });
  }
});

// Admin Verify Token
app.get('/api/admin/verify', requireAdmin, (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: {
      email: ADMIN_EMAIL,
      name: 'DHANJAY MAHATO',
      role: 'owner',
    },
  });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeTokens.delete(token);
  }
  res.json({ success: true });
});

// Get all songs with optional search/genre
app.get('/api/songs', (req: Request, res: Response) => {
  const db = loadDatabase();
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  const genre = ((req.query.genre as string) || '').toLowerCase().trim();
  const tag = (req.query.tag as string) || '';

  let results = [...db.songs];

  if (q) {
    results = results.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
    );
  }

  if (genre && genre !== 'all') {
    results = results.filter((s) => s.genre.toLowerCase() === genre);
  }

  if (tag === 'trending') {
    results = results.filter((s) => s.isTrending);
  } else if (tag === 'popular') {
    results = results.filter((s) => s.isPopular);
  } else if (tag === 'recommended') {
    results = results.filter((s) => s.isRecommended);
  }

  res.json(results);
});

// Get single song by ID
app.get('/api/songs/:id', (req: Request, res: Response) => {
  const db = loadDatabase();
  const song = db.songs.find((s) => s.id === req.params.id);
  if (!song) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }
  res.json(song);
});

// Increment real measurable play count (Accurate counts only when actually played!)
app.post('/api/songs/:id/play', (req: Request, res: Response) => {
  const db = loadDatabase();
  const index = db.songs.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }

  db.songs[index].plays = (db.songs[index].plays || 0) + 1;
  saveDatabase(db);

  res.json({
    success: true,
    id: db.songs[index].id,
    plays: db.songs[index].plays,
  });
});

// Like / Unlike song
app.post('/api/songs/:id/like', (req: Request, res: Response) => {
  const { action } = req.body; // 'like' or 'unlike'
  const db = loadDatabase();
  const index = db.songs.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Song not found' });
    return;
  }

  if (action === 'unlike') {
    db.songs[index].likes = Math.max(0, (db.songs[index].likes || 0) - 1);
  } else {
    db.songs[index].likes = (db.songs[index].likes || 0) + 1;
  }
  saveDatabase(db);

  res.json({
    success: true,
    id: db.songs[index].id,
    likes: db.songs[index].likes,
  });
});

// Upload song (Admin only)
app.post(
  '/api/admin/songs',
  requireAdmin,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const {
        title,
        artist,
        album,
        genre,
        duration,
        releaseYear,
        description,
        isTrending,
        isPopular,
        isRecommended,
        customAudioUrl,
        customCoverUrl,
      } = req.body;

      if (!title || !title.trim()) {
        res.status(400).json({ error: 'Song title is required.' });
        return;
      }

      // Determine audio URL
      let audioUrl = '';
      if (files && files['audio'] && files['audio'][0]) {
        audioUrl = `/uploads/audio/${files['audio'][0].filename}`;
      } else if (customAudioUrl && customAudioUrl.trim()) {
        audioUrl = customAudioUrl.trim();
      } else {
        res.status(400).json({ error: 'Audio file (MP3/WAV) or valid audio URL is required.' });
        return;
      }

      // Determine cover URL
      let coverUrl = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80';
      if (files && files['cover'] && files['cover'][0]) {
        coverUrl = `/uploads/covers/${files['cover'][0].filename}`;
      } else if (customCoverUrl && customCoverUrl.trim()) {
        coverUrl = customCoverUrl.trim();
      }

      const db = loadDatabase();
      const newSong = {
        id: 'dm-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex'),
        title: title.trim(),
        artist: (artist && artist.trim()) || 'DHANJAY MAHATO',
        album: (album && album.trim()) || 'Singles',
        genre: (genre && genre.trim()) || 'Synthwave',
        duration: parseInt(duration, 10) || 180,
        audioUrl,
        coverUrl,
        plays: 0,
        likes: 0,
        releaseYear: parseInt(releaseYear, 10) || new Date().getFullYear(),
        addedAt: new Date().toISOString(),
        isTrending: isTrending === 'true' || isTrending === true,
        isPopular: isPopular === 'true' || isPopular === true,
        isRecommended: isRecommended === 'true' || isRecommended === true,
        description: description ? description.trim() : '',
      };

      db.songs.unshift(newSong);
      saveDatabase(db);

      res.status(201).json(newSong);
    } catch (err: any) {
      console.error('Song upload error:', err);
      res.status(500).json({ error: err.message || 'Failed to upload song.' });
    }
  }
);

// Edit song (Admin only)
app.put('/api/admin/songs/:id', requireAdmin, (req: Request, res: Response) => {
  const db = loadDatabase();
  const index = db.songs.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Song not found.' });
    return;
  }

  const {
    title,
    artist,
    album,
    genre,
    duration,
    coverUrl,
    audioUrl,
    releaseYear,
    description,
    isTrending,
    isPopular,
    isRecommended,
  } = req.body;

  db.songs[index] = {
    ...db.songs[index],
    ...(title ? { title: title.trim() } : {}),
    ...(artist ? { artist: artist.trim() } : {}),
    ...(album ? { album: album.trim() } : {}),
    ...(genre ? { genre: genre.trim() } : {}),
    ...(duration !== undefined ? { duration: parseInt(duration, 10) } : {}),
    ...(coverUrl ? { coverUrl: coverUrl.trim() } : {}),
    ...(audioUrl ? { audioUrl: audioUrl.trim() } : {}),
    ...(releaseYear !== undefined ? { releaseYear: parseInt(releaseYear, 10) } : {}),
    ...(description !== undefined ? { description: description.trim() } : {}),
    ...(isTrending !== undefined ? { isTrending: Boolean(isTrending) } : {}),
    ...(isPopular !== undefined ? { isPopular: Boolean(isPopular) } : {}),
    ...(isRecommended !== undefined ? { isRecommended: Boolean(isRecommended) } : {}),
  };

  saveDatabase(db);
  res.json(db.songs[index]);
});

// Delete song (Admin only)
app.delete('/api/admin/songs/:id', requireAdmin, (req: Request, res: Response) => {
  const db = loadDatabase();
  const index = db.songs.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Song not found.' });
    return;
  }

  const [removed] = db.songs.splice(index, 1);

  // Remove song ID from playlists
  db.playlists.forEach((pl) => {
    pl.songIds = pl.songIds.filter((id) => id !== req.params.id);
  });

  saveDatabase(db);

  // If local file, optionally delete from disk
  if (removed.audioUrl && removed.audioUrl.startsWith('/uploads/audio/')) {
    const filePath = path.join(__dirname, removed.audioUrl);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not remove file:', filePath);
      }
    }
  }

  res.json({ success: true, removedId: req.params.id });
});

// Playlists endpoints
app.get('/api/playlists', (req: Request, res: Response) => {
  const db = loadDatabase();
  res.json(db.playlists || []);
});

app.post('/api/playlists', (req: Request, res: Response) => {
  const { name, description, coverUrl, songIds } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Playlist name is required.' });
    return;
  }

  const db = loadDatabase();
  const newPlaylist = {
    id: 'pl-' + Date.now().toString(36),
    name: name.trim(),
    description: (description && description.trim()) || '',
    coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    songIds: Array.isArray(songIds) ? songIds : [],
    createdAt: new Date().toISOString(),
  };

  db.playlists.push(newPlaylist);
  saveDatabase(db);
  res.status(201).json(newPlaylist);
});

app.put('/api/playlists/:id', (req: Request, res: Response) => {
  const db = loadDatabase();
  const pl = db.playlists.find((p) => p.id === req.params.id);
  if (!pl) {
    res.status(404).json({ error: 'Playlist not found.' });
    return;
  }

  const { name, description, coverUrl, songIds } = req.body;
  if (name !== undefined) pl.name = name.trim();
  if (description !== undefined) pl.description = description.trim();
  if (coverUrl !== undefined) pl.coverUrl = coverUrl;
  if (Array.isArray(songIds)) pl.songIds = songIds;

  saveDatabase(db);
  res.json(pl);
});

app.delete('/api/playlists/:id', (req: Request, res: Response) => {
  const db = loadDatabase();
  const index = db.playlists.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Playlist not found.' });
    return;
  }
  db.playlists.splice(index, 1);
  saveDatabase(db);
  res.json({ success: true, removedId: req.params.id });
});

// App Stats (Measurable and accurate)
app.get('/api/stats', (req: Request, res: Response) => {
  const db = loadDatabase();
  const totalPlays = db.songs.reduce((acc, s) => acc + (s.plays || 0), 0);
  const totalLikes = db.songs.reduce((acc, s) => acc + (s.likes || 0), 0);
  const uniqueGenres = Array.from(new Set(db.songs.map((s) => s.genre))).length;

  let uploadBytes = 0;
  try {
    const audioFiles = fs.readdirSync(AUDIO_UPLOADS_DIR);
    for (const f of audioFiles) {
      const stat = fs.statSync(path.join(AUDIO_UPLOADS_DIR, f));
      uploadBytes += stat.size;
    }
  } catch (err) {
    // Ignore error
  }

  res.json({
    totalSongs: db.songs.length,
    totalPlays,
    totalLikes,
    totalGenres: uniqueGenres,
    storageUsedBytes: uploadBytes,
    storageLimitBytes: 500 * 1024 * 1024, // 500 MB limit
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DHANJAY MAHATO Music Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
