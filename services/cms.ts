import { Contribution, User, UserRole, Verse, ContributorStat } from '../types';

// --- AUTHENTICATION CONFIGURATION ---
// Since this is a serverless/static application, users are defined here.
// TO ADD A NEW USER:
// 1. Pick a secret "Auth Key" (password).
// 2. Add an entry to the object below.

const AUTH_KEYS: Record<string, User> = {
  // MASTER ADMIN (Access to Review Queue & Stats)
  'admin-secret': { role: 'admin', name: 'Site Owner' },

  // CONTRIBUTORS (Can submit content only)
  'writer-01': { role: 'contributor', name: 'Guest Scholar' },
  'demo-user': { role: 'contributor', name: 'Demo User' }
};

// --- AUTH SERVICES ---

export const loginWithKey = (key: string): User | null => {
  return AUTH_KEYS[key] || null;
};

// --- DATA PERSISTENCE (Local Storage for Demo) ---
// In a real app, these would be API calls to a backend.

const STORAGE_KEYS = {
  CONTRIBUTIONS: 'sutra_cms_contributions',
  OVERRIDES: 'sutra_cms_overrides' // Approved content that replaces static data
};

const getStoredContributions = (): Contribution[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveContributions = (data: Contribution[]) => {
  localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(data));
};

// --- CONTRIBUTION WORKFLOW ---

export const submitContribution = (contribution: Contribution): void => {
  const current = getStoredContributions();
  current.push(contribution);
  saveContributions(current);
};

export const getPendingContributions = (): Contribution[] => {
  return getStoredContributions().filter(c => c.status === 'pending');
};

export const updateContributionStatus = (id: string, status: 'approved' | 'rejected'): void => {
  const all = getStoredContributions();
  const index = all.findIndex(c => c.id === id);
  
  if (index !== -1) {
    all[index].status = status;
    saveContributions(all);

    // If approved, move to "Active Overrides" so it appears in the library
    if (status === 'approved') {
        const activeOverrides = getActiveOverrides();
        // Create a unique key for the override: BookId + VerseId
        const key = `${all[index].bookId}-${all[index].verseId}`;
        activeOverrides[key] = all[index].content;
        localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(activeOverrides));
    }
  }
};

export const getContributorStats = (): ContributorStat[] => {
  const all = getStoredContributions();
  const statsMap: Record<string, ContributorStat> = {};

  all.forEach(c => {
    if (!statsMap[c.contributorName]) {
      statsMap[c.contributorName] = { name: c.contributorName, pending: 0, approved: 0, rejected: 0 };
    }
    statsMap[c.contributorName][c.status]++;
  });

  return Object.values(statsMap);
};

// --- LIBRARY INTEGRATION ---

// Helper to get active overrides
const getActiveOverrides = (): Record<string, Verse> => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
};

// Used by library.ts to check if there is a CMS update for a specific verse
export const getApprovedOverride = (bookId: string, verseId: string): Verse | null => {
    const overrides = getActiveOverrides();
    const key = `${bookId}-${verseId}`;
    return overrides[key] || null;
};
