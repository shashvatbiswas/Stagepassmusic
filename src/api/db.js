// StagePass Virtual Database & API Simulation
import { PRESET_AUDIO_TRACKS, PRESET_COVERS, PRESET_AVATARS } from '../utils/presets';

// Helper to simulate network latency
export const sleep = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const DB_KEYS = {
  USERS: 'stagepass_users',
  ASSETS: 'stagepass_assets',
  COLLABS: 'stagepass_collabs',
  PURCHASES: 'stagepass_purchases',
  SESSION: 'stagepass_session'
};

// No seed data — app starts fresh
const initialUsers = [];
const initialAssets = [];
const initialCollabs = [];
const initialPurchases = [];

// Initialize Data in LocalStorage (always reset session on load to show fresh landing page)
export const initDB = () => {
  localStorage.removeItem(DB_KEYS.SESSION);
  const seeded = localStorage.getItem('stagepass_seeded_v6');
  if (!seeded) {
    localStorage.removeItem(DB_KEYS.USERS);
    localStorage.removeItem(DB_KEYS.ASSETS);
    localStorage.removeItem(DB_KEYS.COLLABS);
    localStorage.removeItem(DB_KEYS.PURCHASES);
    localStorage.setItem('stagepass_seeded_v6', 'true');
  }
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(DB_KEYS.ASSETS)) {
    localStorage.setItem(DB_KEYS.ASSETS, JSON.stringify(initialAssets));
  }
  if (!localStorage.getItem(DB_KEYS.COLLABS)) {
    localStorage.setItem(DB_KEYS.COLLABS, JSON.stringify(initialCollabs));
  }
  if (!localStorage.getItem(DB_KEYS.PURCHASES)) {
    localStorage.setItem(DB_KEYS.PURCHASES, JSON.stringify(initialPurchases));
  }
};


// API Fetch Helpers
const getData = (key) => {
  initDB();
  return JSON.parse(localStorage.getItem(key)) || [];
};

const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Auth API Client
export const authAPI = {
  getCurrentSession: () => {
    const session = localStorage.getItem(DB_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  login: async (username, password) => {
    await sleep(400);
    const users = getData(DB_KEYS.USERS);
    const user = users.find(u => (u.username === username || u.email === username) && u.password === password);
    if (!user) throw new Error('Invalid username/email or password');
    
    const sessionUser = { ...user };
    delete sessionUser.password; // strip password
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  },

  signup: async (userData) => {
    await sleep(500);
    const users = getData(DB_KEYS.USERS);
    
    // Validations
    if (users.some(u => u.username === userData.username)) {
      throw new Error('Username is already taken');
    }
    if (users.some(u => u.email === userData.email)) {
      throw new Error('Email is already registered');
    }

    const newUser = {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      artistName: userData.artistName,
      roles: userData.roles || ['Singer'],
      bio: userData.bio || 'New music creator on StagePass.',
      location: userData.location || 'Unknown Location',
      genres: userData.genres || [],
      languages: userData.languages || [],
      followers: [],
      following: [],
      balance: 0.0, // Start with ₹0 balance for fresh accounts
      profilePhoto: userData.profilePhoto || PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      links: userData.links || {},
      isVerified: false,
      isAvailableForCollab: true,
      createdTimestamp: Date.now()
    };

    users.push(newUser);
    saveData(DB_KEYS.USERS, users);

    // Save session
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  },

  logout: () => {
    localStorage.removeItem(DB_KEYS.SESSION);
  },

  updateProfile: async (username, profileData) => {
    await sleep(400);
    const users = getData(DB_KEYS.USERS);
    const index = users.findIndex(u => u.username === username);
    if (index === -1) throw new Error('User not found');

    const updatedUser = { ...users[index], ...profileData };
    users[index] = updatedUser;
    saveData(DB_KEYS.USERS, users);

    // Update current session if matching
    const currentSession = authAPI.getCurrentSession();
    if (currentSession && currentSession.username === username) {
      const sessionUser = { ...updatedUser };
      delete sessionUser.password;
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(sessionUser));
    }
    return updatedUser;
  },

  rechargeWallet: async (username, amount) => {
    const users = getData(DB_KEYS.USERS);
    const index = users.findIndex(u => u.username === username);
    if (index === -1) throw new Error('User not found');
    
    users[index].balance += parseFloat(amount);
    saveData(DB_KEYS.USERS, users);

    // Update session
    const currentSession = authAPI.getCurrentSession();
    if (currentSession && currentSession.username === username) {
      currentSession.balance += parseFloat(amount);
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(currentSession));
    }
    return users[index].balance;
  },

  getUserByUsername: async (username) => {
    const users = getData(DB_KEYS.USERS);
    const user = users.find(u => u.username === username);
    if (!user) return null;
    const cleanUser = { ...user };
    delete cleanUser.password;
    return cleanUser;
  },

  followUser: async (followerUsername, targetUsername) => {
    const users = getData(DB_KEYS.USERS);
    const followerIndex = users.findIndex(u => u.username === followerUsername);
    const targetIndex = users.findIndex(u => u.username === targetUsername);
    
    if (followerIndex === -1 || targetIndex === -1) throw new Error('User not found');

    const targetUser = users[targetIndex];
    const followerUser = users[followerIndex];

    const isFollowing = targetUser.followers.includes(followerUsername);

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter(u => u !== followerUsername);
      followerUser.following = followerUser.following.filter(u => u !== targetUsername);
    } else {
      // Follow
      targetUser.followers.push(followerUsername);
      followerUser.following.push(targetUsername);
    }

    users[targetIndex] = targetUser;
    users[followerIndex] = followerUser;
    saveData(DB_KEYS.USERS, users);

    // Update active session
    const currentSession = authAPI.getCurrentSession();
    if (currentSession && currentSession.username === followerUsername) {
      const sessionUser = { ...followerUser };
      delete sessionUser.password;
      localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(sessionUser));
    }

    return { isFollowing: !isFollowing, targetUserFollowersCount: targetUser.followers.length };
  }
};

// Assets & Marketplace API Client
export const assetsAPI = {
  // Queries content applying security redactions for non-unlocked paid products
  getAssets: async (filters = {}) => {
    await sleep(300);
    const assets = getData(DB_KEYS.ASSETS);
    const purchases = getData(DB_KEYS.PURCHASES);
    const currentUser = authAPI.getCurrentSession();
    const currentUsername = currentUser ? currentUser.username : '';

    let filtered = [...assets];

    // Filter by visibility states
    filtered = filtered.filter(asset => {
      // Owner can always see their own
      if (asset.creatorId === currentUsername) return true;
      
      if (asset.visibility === 'Private') return false;
      
      if (asset.visibility === 'Unlisted' && !filters.allowUnlisted) return false;
      
      if (asset.visibility === 'Followers Only') {
        if (!currentUser) return false;
        // Verify if currentUser is in the creator followers list
        const creators = getData(DB_KEYS.USERS);
        const creator = creators.find(u => u.username === asset.creatorId);
        return creator && creator.followers.includes(currentUsername);
      }
      return true; // Public, Paid, Collaboration Only are visible in feed
    });

    // NLP Search matching algorithm
    if (filters.nlpQuery) {
      const query = filters.nlpQuery.toLowerCase();
      const stopWords = ['find', 'me', 'a', 'with', 'for', 'want', 'search', 'some', 'the', 'an', 'show'];
      const keywords = query.split(/\s+/).filter(w => w.length > 2 && !stopWords.includes(w));

      filtered = filtered.map(asset => {
        let score = 0;
        const reasons = [];

        // Match language
        if (query.includes(asset.language.toLowerCase())) {
          score += 15;
          reasons.push(`Language (${asset.language})`);
        }
        
        // Match genre
        if (query.includes(asset.genre.toLowerCase())) {
          score += 15;
          reasons.push(`Genre (${asset.genre})`);
        }

        // Match mood
        if (query.includes(asset.mood.toLowerCase())) {
          score += 15;
          reasons.push(`Mood (${asset.mood})`);
        }

        // Match creator roles
        const matchingRole = asset.creatorRoles.find(role => query.includes(role.toLowerCase()));
        if (matchingRole) {
          score += 10;
          reasons.push(`Role (${matchingRole})`);
        }

        // Keyword tag matching
        keywords.forEach(word => {
          if (asset.title.toLowerCase().includes(word)) {
            score += 8;
          }
          if (asset.description.toLowerCase().includes(word)) {
            score += 5;
          }
          if (asset.tags.some(t => t.toLowerCase().includes(word))) {
            score += 6;
            reasons.push(`Tag (#${word})`);
          }
        });

        return { ...asset, score, matchReason: reasons.length ? `Matches: ${reasons.join(', ')}` : '' };
      });

      // Filter out unrelated and sort by score descending
      filtered = filtered.filter(a => a.score > 0).sort((a, b) => b.score - a.score);
    } else {
      // Standard search and tags
      if (filters.search) {
        const searchVal = filters.search.toLowerCase();
        filtered = filtered.filter(asset => 
          asset.title.toLowerCase().includes(searchVal) || 
          asset.description.toLowerCase().includes(searchVal) ||
          asset.creatorName.toLowerCase().includes(searchVal)
        );
      }

      if (filters.type && filters.type !== 'All') {
        filtered = filtered.filter(asset => asset.type === filters.type);
      }

      if (filters.genre) {
        filtered = filtered.filter(asset => asset.genre === filters.genre);
      }

      if (filters.language) {
        filtered = filtered.filter(asset => asset.language === filters.language);
      }

      if (filters.creatorType) {
        filtered = filtered.filter(asset => asset.creatorRoles.includes(filters.creatorType));
      }

      if (filters.priceRange) {
        if (filters.priceRange === 'Free') {
          filtered = filtered.filter(asset => asset.price === 0);
        } else if (filters.priceRange === 'Paid') {
          filtered = filtered.filter(asset => asset.price > 0);
        }
      }

      // Sort
      if (filters.sortBy === 'Popularity') {
        filtered.sort((a, b) => b.viewsCount - a.viewsCount);
      } else if (filters.sortBy === 'Newest') {
        filtered.sort((a, b) => b.timestamp - a.timestamp);
      }
    }

    // REDACTION FILTER: Protect locked full-lyrics or full-files from browser tools inspection
    return filtered.map(asset => {
      // Verify purchase
      const hasPurchased = purchases.some(p => p.buyerId === currentUsername && p.assetId === asset.id);
      const isOwner = asset.creatorId === currentUsername;
      const isFree = asset.price === 0;

      const userHasAccess = hasPurchased || isOwner || isFree;

      if (!userHasAccess) {
        // Redact critical paid info
        return {
          ...asset,
          isLocked: true,
          fullLyrics: '[🔒 Content Locked - Purchase to Reveal]',
          audioUrl: asset.watermark ? asset.audioUrl : '[🔒 Audio File Locked]' 
          // If watermark is true, we allow the audio file to load so the client-side player can play the preview,
          // but the progress will be capped. If no watermark, we redact the file fully.
        };
      }

      return {
        ...asset,
        isLocked: false
      };
    });
  },

  getAssetById: async (id) => {
    const assets = getData(DB_KEYS.ASSETS);
    const purchases = getData(DB_KEYS.PURCHASES);
    const currentUser = authAPI.getCurrentSession();
    const currentUsername = currentUser ? currentUser.username : '';

    const asset = assets.find(a => a.id === id);
    if (!asset) return null;

    const hasPurchased = purchases.some(p => p.buyerId === currentUsername && p.assetId === asset.id);
    const isOwner = asset.creatorId === currentUsername;
    const isFree = asset.price === 0;

    const userHasAccess = hasPurchased || isOwner || isFree;

    if (!userHasAccess) {
      return {
        ...asset,
        isLocked: true,
        fullLyrics: '[🔒 Content Locked - Purchase to Reveal]',
        audioUrl: asset.watermark ? asset.audioUrl : '[🔒 Audio File Locked]'
      };
    }

    return { ...asset, isLocked: false };
  },

  createAsset: async (assetData) => {
    await sleep(600);
    const assets = getData(DB_KEYS.ASSETS);
    const currentUser = authAPI.getCurrentSession();
    
    if (!currentUser) throw new Error('Not logged in');

    const newAsset = {
      id: `asset-${Date.now()}`,
      creatorId: currentUser.username,
      creatorName: currentUser.artistName,
      creatorRoles: currentUser.roles,
      title: assetData.title,
      description: assetData.description,
      type: assetData.type,
      genre: assetData.genre,
      mood: assetData.mood,
      language: assetData.language,
      tags: assetData.tags || [],
      coverArt: assetData.coverArt || PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)],
      audioUrl: assetData.audioUrl || '',
      duration: parseInt(assetData.duration) || 0,
      previewDuration: parseInt(assetData.previewDuration) || 0,
      watermark: assetData.watermark !== undefined ? assetData.watermark : true,
      previewLyrics: assetData.previewLyrics || '',
      fullLyrics: assetData.fullLyrics || '',
      price: parseFloat(assetData.price) || 0,
      licensing: assetData.licensing || { personal: parseFloat(assetData.price) || 0 },
      visibility: assetData.visibility || 'Public',
      isWIP: assetData.isWIP || false,
      wipNeedTags: assetData.wipNeedTags || [],
      credits: assetData.credits || [{ role: 'Primary Creator', creatorId: currentUser.username, artistName: currentUser.artistName }],
      timestamp: Date.now(),
      versionHistory: [{ version: 1, timestamp: Date.now(), notes: 'Initial Upload' }],
      viewsCount: 0,
      previewPlaysCount: 0,
      likesCount: 0,
      savesCount: 0
    };

    assets.push(newAsset);
    saveData(DB_KEYS.ASSETS, assets);
    return newAsset;
  },

  updateAsset: async (id, updatedFields) => {
    const assets = getData(DB_KEYS.ASSETS);
    const index = assets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');

    const updated = {
      ...assets[index],
      ...updatedFields,
      versionHistory: [
        ...assets[index].versionHistory,
        { version: assets[index].versionHistory.length + 1, timestamp: Date.now(), notes: 'Metadata/Visibility Updated' }
      ]
    };

    assets[index] = updated;
    saveData(DB_KEYS.ASSETS, assets);
    return updated;
  },

  deleteAsset: async (id) => {
    let assets = getData(DB_KEYS.ASSETS);
    assets = assets.filter(a => a.id !== id);
    saveData(DB_KEYS.ASSETS, assets);
    return true;
  },

  recordMetrics: async (id, type) => {
    // Record view, preview play, or like in background
    const assets = getData(DB_KEYS.ASSETS);
    const index = assets.findIndex(a => a.id === id);
    if (index !== -1) {
      if (type === 'view') assets[index].viewsCount += 1;
      else if (type === 'preview') assets[index].previewPlaysCount += 1;
      else if (type === 'like') assets[index].likesCount += 1;
      else if (type === 'save') assets[index].savesCount += 1;
      saveData(DB_KEYS.ASSETS, assets);
    }
  },

  purchaseAsset: async (assetId, licenseType = 'personal') => {
    await sleep(650);
    const currentUser = authAPI.getCurrentSession();
    if (!currentUser) throw new Error('You must be logged in to purchase content.');

    const assets = getData(DB_KEYS.ASSETS);
    const asset = assets.find(a => a.id === assetId);
    if (!asset) throw new Error('Content not found.');

    const price = asset.licensing[licenseType] !== undefined ? asset.licensing[licenseType] : asset.price;

    const users = getData(DB_KEYS.USERS);
    const buyerIndex = users.findIndex(u => u.username === currentUser.username);
    const sellerIndex = users.findIndex(u => u.username === asset.creatorId);

    if (buyerIndex === -1) throw new Error('Buyer account not found.');
    if (users[buyerIndex].balance < price) {
      throw new Error(`Insufficient funds. You have ₹${users[buyerIndex].balance.toFixed(2)}, but this content requires ₹${price.toFixed(2)}.`);
    }

    // Deduct buyer balance
    users[buyerIndex].balance -= price;
    
    // Credit seller balance (if seller exists in system)
    if (sellerIndex !== -1) {
      users[sellerIndex].balance += price;
    }

    saveData(DB_KEYS.USERS, users);

    // Save updated session for buyer
    const updatedBuyerSession = { ...users[buyerIndex] };
    delete updatedBuyerSession.password;
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(updatedBuyerSession));

    // Register purchase history
    const purchases = getData(DB_KEYS.PURCHASES);
    const newPurchase = {
      id: `pur-${Date.now()}`,
      buyerId: currentUser.username,
      buyerName: currentUser.artistName,
      assetId: asset.id,
      assetTitle: asset.title,
      assetType: asset.type,
      creatorId: asset.creatorId,
      creatorName: asset.creatorName,
      price: price,
      licenseType: licenseType,
      timestamp: Date.now(),
      licenseCertCode: `CERT-SP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    purchases.push(newPurchase);
    saveData(DB_KEYS.PURCHASES, purchases);

    return newPurchase;
  }
};

// Collaboration Hub API Client
export const collabsAPI = {
  getRequests: async (filters = {}) => {
    await sleep(250);
    const collabs = getData(DB_KEYS.COLLABS);
    let filtered = [...collabs];

    if (filters.genre) {
      filtered = filtered.filter(c => c.genre === filters.genre);
    }
    if (filters.role) {
      filtered = filtered.filter(c => c.requiredRole === filters.role);
    }
    if (filters.language) {
      filtered = filtered.filter(c => c.language === filters.language);
    }
    if (filters.search) {
      const term = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(term) || 
        c.description.toLowerCase().includes(term) ||
        c.creatorName.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a,b) => b.timestamp - a.timestamp);
  },

  createRequest: async (requestData) => {
    await sleep(400);
    const collabs = getData(DB_KEYS.COLLABS);
    const currentUser = authAPI.getCurrentSession();
    if (!currentUser) throw new Error('Not logged in');

    const newCollab = {
      id: `collab-${Date.now()}`,
      creatorId: currentUser.username,
      creatorName: currentUser.artistName,
      creatorRoles: currentUser.roles,
      creatorAvatar: currentUser.profilePhoto,
      title: requestData.title,
      description: requestData.description,
      genre: requestData.genre,
      requiredRole: requestData.requiredRole,
      language: requestData.language,
      budget: parseFloat(requestData.budget) || 0,
      deadline: requestData.deadline || '',
      requirements: requestData.requirements || '',
      applications: [],
      status: 'open',
      timestamp: Date.now()
    };

    collabs.push(newCollab);
    saveData(DB_KEYS.COLLABS, collabs);
    return newCollab;
  },

  applyToCollab: async (collabId, demoAssetId, message) => {
    await sleep(500);
    const collabs = getData(DB_KEYS.COLLABS);
    const currentUser = authAPI.getCurrentSession();
    if (!currentUser) throw new Error('Not logged in');

    const index = collabs.findIndex(c => c.id === collabId);
    if (index === -1) throw new Error('Collaboration request not found');

    const collab = collabs[index];
    if (collab.applications.some(app => app.applicantId === currentUser.username)) {
      throw new Error('You have already applied to this collaboration request');
    }

    const newApplication = {
      id: `app-${Date.now()}`,
      applicantId: currentUser.username,
      applicantName: currentUser.artistName,
      demoAssetId: demoAssetId,
      message: message,
      status: 'pending',
      timestamp: Date.now()
    };

    collab.applications.push(newApplication);
    collabs[index] = collab;
    saveData(DB_KEYS.COLLABS, collabs);
    return newApplication;
  },

  manageApplication: async (collabId, applicationId, action) => {
    // Action: 'approved' | 'rejected'
    const collabs = getData(DB_KEYS.COLLABS);
    const index = collabs.findIndex(c => c.id === collabId);
    if (index === -1) throw new Error('Collaboration not found');

    const collab = collabs[index];
    const appIndex = collab.applications.findIndex(a => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    collab.applications[appIndex].status = action;
    collabs[index] = collab;
    saveData(DB_KEYS.COLLABS, collabs);
    return collab;
  },

  // Smart recommendation algorithm
  getRecommendedCollaborators: async () => {
    const currentUser = authAPI.getCurrentSession();
    if (!currentUser) return [];

    const users = getData(DB_KEYS.USERS);
    // Filter out self
    const potentialMatches = users.filter(u => u.username !== currentUser.username && u.isAvailableForCollab);

    return potentialMatches.map(user => {
      let score = 0;
      const matchingReasons = [];

      // Intersect genres
      const commonGenres = user.genres.filter(g => currentUser.genres.includes(g));
      if (commonGenres.length > 0) {
        score += commonGenres.length * 10;
        matchingReasons.push(`Common Genres (${commonGenres.join(', ')})`);
      }

      // Intersect languages
      const commonLangs = user.languages.filter(l => currentUser.languages.includes(l));
      if (commonLangs.length > 0) {
        score += commonLangs.length * 10;
        matchingReasons.push(`Common Languages (${commonLangs.join(', ')})`);
      }

      // Check role complementary match
      // If current is Producer -> recommend Singers, Musicians, Sound Engineers
      const currentRoles = currentUser.roles;
      const targetRoles = user.roles;

      const isComplementary = currentRoles.some(r => {
        if (r === 'Producer' || r === 'Beatmaker' || r === 'Composer') {
          return targetRoles.includes('Singer') || targetRoles.includes('Lyricist') || targetRoles.includes('Musician');
        }
        if (r === 'Lyricist' || r === 'Songwriter') {
          return targetRoles.includes('Producer') || targetRoles.includes('Composer') || targetRoles.includes('Singer');
        }
        if (r === 'Singer') {
          return targetRoles.includes('Songwriter') || targetRoles.includes('Producer') || targetRoles.includes('Musician');
        }
        return true;
      });

      if (isComplementary) {
        score += 20;
        matchingReasons.push('Role Match (Complementary Skills)');
      }

      return {
        ...user,
        matchScore: score,
        recommendationReason: matchingReasons.join(' | ')
      };
    }).filter(u => u.matchScore > 0).sort((a,b) => b.matchScore - a.matchScore).slice(0, 4);
  }
};

// Analytics Data Helper
export const analyticsAPI = {
  getCreatorStats: async (username) => {
    await sleep(200);
    const assets = getData(DB_KEYS.ASSETS).filter(a => a.creatorId === username);
    const purchases = getData(DB_KEYS.PURCHASES).filter(p => p.creatorId === username);

    const totalEarnings = purchases.reduce((sum, p) => sum + p.price, 0);
    const totalViews = assets.reduce((sum, a) => sum + a.viewsCount, 0);
    const totalPreviews = assets.reduce((sum, a) => sum + a.previewPlaysCount, 0);
    const totalLikes = assets.reduce((sum, a) => sum + a.likesCount, 0);
    const totalSaves = assets.reduce((sum, a) => sum + a.savesCount, 0);
    const salesCount = purchases.length;
    const conversionRate = totalViews > 0 ? ((salesCount / totalViews) * 100) : 0;

    // Build timeline details for SVG charts
    // Generate 7 days of data points
    const revenueHistory = [];
    const viewsHistory = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

      // Filter earnings on this day
      const dayEarnings = purchases
        .filter(p => p.timestamp >= startOfDay && p.timestamp < endOfDay)
        .reduce((sum, p) => sum + p.price, 0);

      // Generate a slightly random view count based on assets to look realistic
      let dayViews = Math.floor(totalViews / 10);
      if (dayViews === 0) dayViews = i === 2 ? 15 : i === 5 ? 28 : 0;
      else dayViews += Math.floor(Math.sin(i) * (dayViews * 0.4));

      revenueHistory.push({ label: dateStr, value: dayEarnings });
      viewsHistory.push({ label: dateStr, value: dayViews });
    }

    return {
      totalEarnings,
      salesCount,
      totalViews,
      totalPreviews,
      totalLikes,
      totalSaves,
      conversionRate,
      revenueHistory,
      viewsHistory,
      recentPurchases: purchases.sort((a,b) => b.timestamp - a.timestamp).slice(0, 5),
      assetsPerformance: assets.map(a => {
        const itemSales = purchases.filter(p => p.assetId === a.id);
        const itemRevenue = itemSales.reduce((sum, p) => sum + p.price, 0);
        const itemConversion = a.viewsCount > 0 ? ((itemSales.length / a.viewsCount) * 100) : 0;

        return {
          id: a.id,
          title: a.title,
          type: a.type,
          views: a.viewsCount,
          previews: a.previewPlaysCount,
          unlocks: itemSales.length,
          revenue: itemRevenue,
          conversion: itemConversion
        };
      })
    };
  }
};
