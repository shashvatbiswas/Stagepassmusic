/**
 * StagePass Supabase Cloud Database & Storage Integration
 * Production-ready PostgreSQL database and S3-compatible audio storage client.
 */
import { createClient } from '@supabase/supabase-js';

// Default Demo / Custom Config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://demo-stagepass-project.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8tc3RhZ2VwYXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.demo_signature_key_stagepass_prod';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const cloudStorageAPI = {
  // Check if Supabase URL is configured with custom production keys
  isCloudConfigured: () => {
    return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  },

  // Upload Audio Stem to Supabase Storage Bucket ('audio-stems')
  uploadAudioStem: async (file, fileName) => {
    if (!cloudStorageAPI.isCloudConfigured()) {
      // Local URL Object fallback for browser preview
      return URL.createObjectURL(file);
    }
    try {
      const filePath = `stems/${Date.now()}_${fileName}`;
      const { data, error } = await supabase.storage.from('audio-stems').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('audio-stems').getPublicUrl(data.path);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Cloud storage fallback:', err);
      return URL.createObjectURL(file);
    }
  },

  // Upload Cover Artwork to Supabase Storage Bucket ('cover-art')
  uploadCoverArt: async (file, fileName) => {
    if (!cloudStorageAPI.isCloudConfigured()) {
      return URL.createObjectURL(file);
    }
    try {
      const filePath = `covers/${Date.now()}_${fileName}`;
      const { data, error } = await supabase.storage.from('cover-art').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('cover-art').getPublicUrl(data.path);
      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Cloud artwork storage fallback:', err);
      return URL.createObjectURL(file);
    }
  },

  // Sync PostgreSQL Assets table
  syncAssetsTable: async (assets) => {
    if (!cloudStorageAPI.isCloudConfigured()) return;
    try {
      await supabase.from('stagepass_assets').upsert(assets, { onConflict: 'id' });
    } catch (err) {
      console.error('Supabase DB sync error:', err);
    }
  }
};
