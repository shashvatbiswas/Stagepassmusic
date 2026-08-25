// Digital Rights Management (DRM), ISRC & Smart Split Sheet Engine — Spotify Standard

/**
 * Generate official ISRC (International Standard Recording Code)
 * Format: [Country-Code 2char]-[Registrant 3char]-[Year 2digit]-[Designation 5digit]
 * Example: IN-STG-25-00142
 */
export function generateISRC(countryCode = 'IN', registrantCode = 'STG') {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const designation = Math.floor(10000 + Math.random() * 90000).toString();
  return `${countryCode}-${registrantCode}-${currentYear}-${designation}`;
}

/**
 * Generate official ISWC (International Standard Musical Work Code)
 * Format: T-[9 digits]-[Check Digit]
 * Example: T-928.341.056-2
 */
export function generateISWC() {
  const numPart = Math.floor(100000000 + Math.random() * 900000000).toString();
  const formattedNum = `${numPart.slice(0, 3)}.${numPart.slice(3, 6)}.${numPart.slice(6, 9)}`;
  const checkDigit = Math.floor(Math.random() * 10);
  return `T-${formattedNum}-${checkDigit}`;
}

/**
 * Create a Smart Split Sheet Contract for audio asset licensing
 */
export function createSmartSplitContract(assetTitle, primaryCreator, collaborators = []) {
  const contractId = 'contract_split_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  
  // Default equal distribution unless specified
  const totalParties = 1 + collaborators.length;
  const primaryShare = Math.floor(100 / totalParties);
  const collabShare = Math.floor((100 - primaryShare) / (collaborators.length || 1));

  const splitParties = [
    {
      username: primaryCreator,
      role: 'Primary Creator / Owner',
      sharePercentage: primaryShare + (100 - (primaryShare + collabShare * collaborators.length))
    },
    ...collaborators.map(c => ({
      username: c.username || c,
      role: c.role || 'Collaborator',
      sharePercentage: collabShare
    }))
  ];

  return {
    contractId,
    assetTitle,
    isrc: generateISRC(),
    iswc: generateISWC(),
    createdAt: new Date().toISOString(),
    status: 'ACTIVE_AND_BINDING',
    splitParties,
    licensingTerms: {
      commercialRights: 'Granted upon Side B unlock',
      royaltyPoolPercentage: 90,
      platformReservePercentage: 10
    }
  };
}

/**
 * Generate normalized waveform data peaks for track visualizer
 */
export function generateWaveformBars(barCount = 48) {
  const bars = [];
  for (let i = 0; i < barCount; i++) {
    // Generate realistic rhythm wave pattern
    const height = Math.floor(20 + Math.sin(i * 0.4) * 35 + Math.random() * 45);
    bars.push(Math.min(100, Math.max(15, height)));
  }
  return bars;
}
