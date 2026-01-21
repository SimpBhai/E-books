import { Contribution, User, UserRole, Verse, ContributorStat } from '../types';

// Mock Auth Keys
const AUTH_KEYS: Record<string, User> = {
  'admin-secret': { role: 'admin', name: 'Site Owner' },
  'writer-secret': { role: 'contributor', name: 'Contributor' },
  'guest-secret': { role: 'contributor', name: 'Guest Writer' }
};

const STORAGE_KEY_PENDING = 'cms_pending_contributions';
const STORAGE_KEY_APPROVED = 'cms_approved_data';
const STORAGE_KEY_HISTORY = 'cms_history_log';

// --- Auth Service ---

export const loginWithKey = (key: string): User | null => {
  return AUTH_KEYS[key] || null;
};

// --- CMS Logic ---

export const submitContribution = (contribution: Contribution): void => {
  const current = getPendingContributions();
  current.push(contribution);
  localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(current));
  
  // Log to history for analytics (initial state)
  logHistory(contribution);
};

export const getPendingContributions = (): Contribution[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PENDING);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const updateContributionStatus = (id: string, status: 'approved' | 'rejected'): void => {
  const current = getPendingContributions();
  const index = current.findIndex(c => c.id === id);
  
  if (index !== -1) {
    const contribution = current[index];
    contribution.status = status;
    
    if (status === 'approved') {
      // Move to "Production" Database
      saveApprovedVerse(contribution.bookId, contribution.content);
      // Remove from pending
      current.splice(index, 1);
    } else if (status === 'rejected') {
      // Just remove from list
      current.splice(index, 1);
    }
    
    localStorage.setItem(STORAGE_KEY_PENDING, JSON.stringify(current));
    
    // Update history log
    logHistory(contribution);
  }
};

// Helper to log history for analytics
const logHistory = (contribution: Contribution) => {
  try {
    const historyData = localStorage.getItem(STORAGE_KEY_HISTORY);
    let history: Contribution[] = historyData ? JSON.parse(historyData) : [];
    
    // Update existing entry or add new
    const existingIdx = history.findIndex(h => h.id === contribution.id);
    if (existingIdx > -1) {
      history[existingIdx] = contribution;
    } else {
      history.push(contribution);
    }
    
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to log history", e);
  }
};

// --- Analytics ---

export const getContributorStats = (): ContributorStat[] => {
  try {
    // We calculate stats from the History Log + Current Pending
    const historyData = localStorage.getItem(STORAGE_KEY_HISTORY);
    const history: Contribution[] = historyData ? JSON.parse(historyData) : [];
    
    const statsMap: Record<string, ContributorStat> = {};
    
    history.forEach(c => {
      if (!statsMap[c.contributorName]) {
        statsMap[c.contributorName] = { name: c.contributorName, pending: 0, approved: 0, rejected: 0 };
      }
      
      if (c.status === 'approved') statsMap[c.contributorName].approved++;
      else if (c.status === 'rejected') statsMap[c.contributorName].rejected++;
      else if (c.status === 'pending') statsMap[c.contributorName].pending++;
    });
    
    return Object.values(statsMap);
  } catch (e) {
    return [];
  }
};

// --- Production Data Overrides ---

// We store approved verses as a map: { "bookId:verseId": VerseObject }
export const saveApprovedVerse = (bookId: string, verse: Verse) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPROVED);
    const approvedMap = data ? JSON.parse(data) : {};
    
    // Since 'verse' object passed here (from CMSPanel) is a CLONE of the existing verse
    // WITH the new contribution appended to it, we can safely overwrite/merge 
    // the whole object for this key.
    
    const key = `${bookId}:${verse.id}`;
    
    // We treat 'verse' as the master source of truth for this ID now.
    approvedMap[key] = verse;
    
    localStorage.setItem(STORAGE_KEY_APPROVED, JSON.stringify(approvedMap));
  } catch (e) {
    console.error("Failed to save approved verse", e);
  }
};

export const getApprovedOverride = (bookId: string, verseId: string): Verse | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPROVED);
    if (!data) return null;
    const approvedMap = JSON.parse(data);
    return approvedMap[`${bookId}:${verseId}`] || null;
  } catch (e) {
    return null;
  }
};