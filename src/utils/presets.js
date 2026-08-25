// StagePass Presets - Audio Tracks & Cover Art presets for uploads and seed data

export const PRESET_AUDIO_TRACKS = [
  {
    id: "preset-lofi",
    name: "Midnight Drift (Lofi Hip Hop)",
    artist: "Aarav Sharma",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372, // ~6:12
    genre: "Lo-fi",
    mood: "Chill / Relieved",
    tags: ["lofi", "chill", "relaxing", "night", "beat"]
  },
  {
    id: "preset-synth",
    name: "Neon Horizon (Synthwave Beat)",
    artist: "Rohan (BeatMaker)",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 425, // ~7:05
    genre: "Electronic",
    mood: "Energetic / Focused",
    tags: ["synthwave", "80s", "beat", "retro", "producer"]
  },
  {
    id: "preset-acoustic",
    name: "Chasing Shadows (Acoustic Folk)",
    artist: "Maya Kapoor",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: 344, // ~5:44
    genre: "Folk",
    mood: "Melancholic / Romantic",
    tags: ["acoustic", "guitar", "folk", "sad", "raw"]
  },
  {
    id: "preset-ambient",
    name: "Cosmic Resonance (Soundscape)",
    artist: "Dev",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 302, // ~5:02
    genre: "Classical",
    mood: "Dreamy / Peaceful",
    tags: ["ambient", "drone", "space", "texture", "synthesizer"]
  },
  {
    id: "preset-jazz",
    name: "Subtle Indigo (Smooth Jazz Piano)",
    artist: "Studio X",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 318, // ~5:18
    genre: "Jazz",
    mood: "Romantic / Sophisticated",
    tags: ["jazz", "piano", "smooth", "cozy", "instrumental"]
  }
];

export const PRESET_COVERS = [
  "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop", // Glowing wave
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop", // Microphone dark
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop", // Concert lights
  "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop", // Turntable
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop", // Headphones gold
  "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop", // Neon abstract
  "https://images.unsplash.com/photo-1487180142328-0c4e37023af5?q=80&w=400&auto=format&fit=crop", // Vinyls
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop"  // Synth close
];

export const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Maya",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Rohan",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Dev",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=StudioX",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya"
];

// Helper to get random item
export const getRandomCover = () => PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)];
export const getRandomAvatar = () => PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
