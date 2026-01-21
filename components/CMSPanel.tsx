import React, { useState, useEffect } from 'react';
import { User, Verse, Book, Contribution, ContributorStat, Commentary, ContentText } from '../types';
import { loginWithKey, submitContribution, getPendingContributions, updateContributionStatus, getContributorStats } from '../services/cms';
import { getVerseById } from '../services/library';
import { X, Lock, Check, FileText, Send, LogOut, Shield, BarChart3, BookOpen, PenTool, Search, Languages, Plus, Loader2 } from 'lucide-react';

interface CMSPanelProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
}

const CMSPanel: React.FC<CMSPanelProps> = ({ isOpen, onClose, books }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authKey, setAuthKey] = useState('');
  const [error, setError] = useState('');

  // UI Tabs
  const [activeTab, setActiveTab] = useState<'contribute' | 'review' | 'stats'>('contribute');

  // Context State
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '');
  const [verseId, setVerseId] = useState(''); // "1.1.1"
  const [fetchedVerse, setFetchedVerse] = useState<Verse | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Form Mode
  const [contributionMode, setContributionMode] = useState<'verse' | 'commentary' | 'translation'>('verse');
  
  // Verse Fields
  const [sanskrit, setSanskrit] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [meaning, setMeaning] = useState('');

  // Commentary Fields
  const [bhasyaAuthor, setBhasyaAuthor] = useState('');
  const [bhasyaLang, setBhasyaLang] = useState('Sanskrit');
  const [bhasyaText, setBhasyaText] = useState('');
  
  // Translation Fields
  const [targetCommentaryId, setTargetCommentaryId] = useState('');
  const [transLang, setTransLang] = useState('English');
  const [transAuthor, setTransAuthor] = useState('');
  const [transText, setTransText] = useState('');

  // Admin State
  const [pendingItems, setPendingItems] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<ContributorStat[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
       if (activeTab === 'review') refreshPending();
       if (activeTab === 'stats') refreshStats();
    }
  }, [user, activeTab]);

  // Auto-fetch verse logic (Async Wrapper)
  useEffect(() => {
    const fetch = async () => {
        if (!selectedBookId || !verseId || verseId.length < 3) {
            setFetchedVerse(null);
            setContributionMode('verse');
            return;
        }
        setIsSearching(true);
        // Small delay to simulate lookup/debounce
        await new Promise(r => setTimeout(r, 300));
        
        try {
            const v = await getVerseById(selectedBookId, verseId);
            setFetchedVerse(v || null);
            // Default to 'verse' if not found (create mode), or 'commentary' if found (add mode)
            setContributionMode(v ? 'commentary' : 'verse'); 
        } catch (e) {
            console.error(e);
            setFetchedVerse(null);
        } finally {
            setIsSearching(false);
        }
    };
    fetch();
  }, [selectedBookId, verseId]);

  const refreshPending = () => {
    setPendingItems(getPendingContributions());
  };

  const refreshStats = () => {
    setStats(getContributorStats());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser = loginWithKey(authKey);
    if (loggedUser) {
      setUser(loggedUser);
      setAuthKey('');
      setError('');
      if (loggedUser.role === 'admin') setActiveTab('stats');
    } else {
      setError('Invalid Auth Key');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('contribute');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // 1. Prepare Base Data
    let baseVerse: Verse;
    
    if (fetchedVerse) {
        // We are editing/appending to an existing verse
        baseVerse = JSON.parse(JSON.stringify(fetchedVerse));
    } else {
        // We are creating a new verse
        if (contributionMode !== 'verse') {
            alert("Verse does not exist. You must create the Verse first before adding commentary.");
            return;
        }
        const parts = verseId.split('.').map(Number);
        baseVerse = {
            id: verseId,
            chapter: parts[0] || 1,
            pada: parts[1] || 1,
            number: parts[2] || 1,
            sanskrit: sanskrit,
            transliteration: transliteration,
            sutrarth: [],
            summary: [],
            commentaries: []
        };
    }

    // 2. Apply Changes based on Mode
    if (contributionMode === 'verse') {
        if (sanskrit) baseVerse.sanskrit = sanskrit;
        if (transliteration) baseVerse.transliteration = transliteration;
        if (meaning) {
             const meaningObj: ContentText = { id: `s-${Date.now()}`, language: 'English', author: user.name, text: meaning };
             if (!baseVerse.sutrarth) baseVerse.sutrarth = [];
             baseVerse.sutrarth.push(meaningObj);
        }
    } else if (contributionMode === 'commentary') {
        const newCommentary: Commentary = {
            id: `c-${Date.now()}`,
            author: bhasyaAuthor,
            language: bhasyaLang,
            text: bhasyaText,
            translations: []
        };
        if (!baseVerse.commentaries) baseVerse.commentaries = [];
        baseVerse.commentaries.push(newCommentary);
    } else if (contributionMode === 'translation') {
        if (!targetCommentaryId) {
            alert("Please select a commentary to translate.");
            return;
        }
        const commentary = baseVerse.commentaries?.find(c => c.id === targetCommentaryId);
        if (commentary) {
            const newTrans: ContentText = {
                id: `t-${Date.now()}`,
                language: transLang,
                author: transAuthor || user.name,
                text: transText
            };
            if (!commentary.translations) commentary.translations = [];
            commentary.translations.push(newTrans);
        } else {
            alert("Target commentary not found.");
            return;
        }
    }

    // 3. Submit
    const contribution: Contribution = {
      id: `contrib-${Date.now()}`,
      timestamp: Date.now(),
      contributorName: user.name,
      status: 'pending',
      type: contributionMode,
      bookId: selectedBookId,
      chapterId: baseVerse.chapter,
      sectionId: baseVerse.pada || 1,
      verseNumber: baseVerse.number,
      verseId: verseId,
      content: baseVerse
    };

    submitContribution(contribution);
    alert('Contribution submitted for review!');
    
    // 4. Cleanup Form
    if (contributionMode === 'translation') {
        setTransText('');
    } else if (contributionMode === 'commentary') {
        setBhasyaText('');
    } else {
        setSanskrit('');
        setTransliteration('');
        setMeaning('');
    }
  };

  const handleApprove = (id: string) => {
    updateContributionStatus(id, 'approved');
    refreshPending();
  };

  const handleReject = (id: string) => {
    updateContributionStatus(id, 'rejected');
    refreshPending();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
           <div className="flex items-center gap-2">
             <Shield className={`w-5 h-5 ${user ? 'text-ochre-600' : 'text-stone-400'}`} />
             <h2 className="font-serif font-bold text-lg text-stone-800">
               {user ? `CMS: ${user.name}` : 'Contributor Access'}
             </h2>
           </div>
           <button onClick={onClose}><X className="text-stone-400 hover:text-stone-600" /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
           {!user ? (
             <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto py-8">
                <div className="text-center mb-4">
                   <div className="bg-ochre-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="text-ochre-700" size={24} />
                   </div>
                   <p className="text-stone-500 text-sm">Enter your Auth Key to access the library CMS.</p>
                </div>
                
                <input 
                  type="password" 
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                  placeholder="Enter Key"
                  className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-ochre-400 focus:border-transparent outline-none"
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                
                <button type="submit" className="bg-stone-900 text-white py-2 rounded-md font-bold hover:bg-stone-800 transition-colors">
                  Login
                </button>
             </form>
           ) : (
             <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-stone-100 overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('contribute')}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap ${activeTab === 'contribute' ? 'border-b-2 border-ochre-600 text-ochre-700' : 'text-stone-400'}`}
                  >
                    <PenTool size={14} /> Contribute
                  </button>
                  {user.role === 'admin' && (
                    <>
                    <button 
                      onClick={() => setActiveTab('review')}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap ${activeTab === 'review' ? 'border-b-2 border-ochre-600 text-ochre-700' : 'text-stone-400'}`}
                    >
                      <FileText size={14} /> Review Queue ({getPendingContributions().length})
                    </button>
                    <button 
                      onClick={() => setActiveTab('stats')}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap ${activeTab === 'stats' ? 'border-b-2 border-ochre-600 text-ochre-700' : 'text-stone-400'}`}
                    >
                      <BarChart3 size={14} /> Analytics
                    </button>
                    </>
                  )}
                  <div className="flex-1 text-right">
                    <button onClick={handleLogout} className="text-xs text-stone-500 hover:text-red-600 flex items-center justify-end w-full">
                       <LogOut size={12} className="mr-1" /> Logout
                    </button>
                  </div>
                </div>

                {/* --- TAB: CONTRIBUTE --- */}
                {activeTab === 'contribute' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                     
                     {/* 1. CONTEXT SECTION */}
                     <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                        <h3 className="text-xs font-bold uppercase text-stone-400 mb-3 flex items-center"><Search size={14} className="mr-1"/> Select Context</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Book</label>
                                <select 
                                    value={selectedBookId} 
                                    onChange={(e) => setSelectedBookId(e.target.value)}
                                    className="w-full p-2 border border-stone-200 rounded text-sm bg-white"
                                >
                                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Verse ID (e.g. 1.1.1)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={verseId} onChange={(e) => setVerseId(e.target.value)}
                                    placeholder="Enter ID..."
                                    className="w-full p-2 border border-stone-200 rounded text-sm font-mono"
                                />
                            </div>
                        </div>

                        {/* Search Status Indicator */}
                        {verseId.length > 0 && (
                            <div className="mt-3 text-sm">
                                {isSearching ? (
                                    <span className="text-stone-400 flex items-center"><Loader2 size={14} className="animate-spin mr-2"/> Searching...</span>
                                ) : fetchedVerse ? (
                                    <div className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded border border-green-100">
                                        <Check size={16} className="mr-2" /> 
                                        <div className="truncate flex-1">
                                            <span className="font-bold mr-2">Found:</span> 
                                            <span className="font-deva">{fetchedVerse.sanskrit}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-ochre-700 bg-ochre-50 px-3 py-2 rounded border border-ochre-100">
                                        <Plus size={16} className="mr-2" />
                                        <span>Verse not found. Creating new entry.</span>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>

                     {/* 2. ACTION SELECTION */}
                     {fetchedVerse && (
                         <div className="flex flex-wrap gap-2 p-1 bg-stone-100 rounded-lg w-full md:w-fit">
                             <button type="button" onClick={() => setContributionMode('verse')}
                                className={`flex-1 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${contributionMode === 'verse' ? 'bg-white shadow text-stone-900' : 'text-stone-400'}`}>
                                Edit Verse
                             </button>
                             <button type="button" onClick={() => setContributionMode('commentary')}
                                className={`flex-1 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${contributionMode === 'commentary' ? 'bg-white shadow text-ochre-700' : 'text-stone-400'}`}>
                                Add Bhasya
                             </button>
                             <button type="button" onClick={() => setContributionMode('translation')}
                                className={`flex-1 px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${contributionMode === 'translation' ? 'bg-white shadow text-blue-700' : 'text-stone-400'}`}>
                                Add Translation
                             </button>
                         </div>
                     )}

                     {/* 3. DYNAMIC FORMS */}
                     
                     {/* MODE: VERSE (Create or Edit) */}
                     {contributionMode === 'verse' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                             <div className="border-l-2 border-stone-800 pl-4 py-1">
                                <h4 className="font-bold text-stone-800">Verse Details</h4>
                                <p className="text-xs text-stone-400">Basic text and simple meaning.</p>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Sanskrit</label>
                                <input type="text" required value={sanskrit} onChange={(e) => setSanskrit(e.target.value)}
                                className="w-full p-2 border border-stone-200 rounded font-deva text-lg" placeholder={fetchedVerse?.sanskrit} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Transliteration</label>
                                <input type="text" required value={transliteration} onChange={(e) => setTransliteration(e.target.value)}
                                className="w-full p-2 border border-stone-200 rounded font-serif italic" placeholder={fetchedVerse?.transliteration} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Literal Meaning (Sutrarth)</label>
                                <textarea rows={3} value={meaning} onChange={(e) => setMeaning(e.target.value)}
                                className="w-full p-2 border border-stone-200 rounded text-sm" placeholder="Add a new meaning..." ></textarea>
                            </div>
                        </div>
                     )}

                     {/* MODE: COMMENTARY (Add New Bhasya) */}
                     {contributionMode === 'commentary' && (
                        <div className="space-y-4 bg-ochre-50/50 p-4 rounded-xl border border-ochre-100 animate-in fade-in slide-in-from-bottom-2">
                             <div className="border-l-2 border-ochre-600 pl-4 py-1">
                                <h4 className="font-bold text-ochre-800">New Bhasya (Commentary)</h4>
                                <p className="text-xs text-ochre-600/70">Add a new source commentary (e.g. from a Rishi).</p>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-ochre-700 uppercase mb-1">Author / Rishi</label>
                                    <input type="text" required placeholder="e.g. Shankaracharya" value={bhasyaAuthor} onChange={(e) => setBhasyaAuthor(e.target.value)}
                                    className="w-full p-2 border border-ochre-200 rounded text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-ochre-700 uppercase mb-1">Language</label>
                                    <select value={bhasyaLang} onChange={(e) => setBhasyaLang(e.target.value)}
                                        className="w-full p-2 border border-ochre-200 rounded text-sm bg-white">
                                        <option value="Sanskrit">Sanskrit</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="English">English</option>
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-ochre-700 uppercase mb-1">Original Text</label>
                                <textarea rows={6} required value={bhasyaText} onChange={(e) => setBhasyaText(e.target.value)}
                                className="w-full p-2 border border-ochre-200 rounded text-sm font-serif" placeholder="Enter the original commentary text..." ></textarea>
                            </div>
                        </div>
                     )}

                     {/* MODE: TRANSLATION (Add to existing Bhasya) */}
                     {contributionMode === 'translation' && (
                        <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
                             <div className="border-l-2 border-blue-600 pl-4 py-1">
                                <h4 className="font-bold text-blue-800">Translate Bhasya</h4>
                                <p className="text-xs text-blue-600/70">Add a translation to an existing commentary.</p>
                             </div>
                             
                             <div>
                                <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Select Source Commentary</label>
                                <select 
                                    value={targetCommentaryId} 
                                    onChange={(e) => setTargetCommentaryId(e.target.value)}
                                    className="w-full p-2 border border-blue-200 rounded text-sm bg-white shadow-sm"
                                >
                                    <option value="">-- Choose a Commentary --</option>
                                    {fetchedVerse?.commentaries?.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.author} ({c.language}) - "{c.text.substring(0, 30)}..."
                                        </option>
                                    ))}
                                </select>
                                {fetchedVerse?.commentaries?.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">No commentaries available to translate. Add a Bhasya first.</p>
                                )}
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Translator Name</label>
                                    <input type="text" value={transAuthor} onChange={(e) => setTransAuthor(e.target.value)}
                                    placeholder={user.name} className="w-full p-2 border border-blue-200 rounded text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Target Language</label>
                                    <select value={transLang} onChange={(e) => setTransLang(e.target.value)}
                                        className="w-full p-2 border border-blue-200 rounded text-sm bg-white">
                                        <option value="English">English</option>
                                        <option value="Hindi">Hindi</option>
                                        <option value="Sanskrit">Sanskrit</option>
                                        <option value="Tamil">Tamil</option>
                                    </select>
                                </div>
                             </div>

                             <div>
                                <label className="block text-xs font-bold text-blue-700 uppercase mb-1">Translation Text</label>
                                <textarea rows={5} required value={transText} onChange={(e) => setTransText(e.target.value)}
                                className="w-full p-2 border border-blue-200 rounded text-sm" placeholder="Enter the translation..." ></textarea>
                            </div>
                        </div>
                     )}

                     <div className="pt-4 border-t border-stone-100">
                        <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-md font-bold hover:bg-stone-800 flex items-center justify-center transition-all shadow-lg hover:shadow-xl">
                           <Send size={16} className="mr-2" /> Submit Contribution
                        </button>
                     </div>
                  </form>
                )}

                {/* --- TAB: REVIEW --- */}
                {activeTab === 'review' && (
                  <div className="space-y-4">
                     {pendingItems.length === 0 ? (
                        <div className="text-center py-10 text-stone-400 italic">No pending contributions.</div>
                     ) : (
                        pendingItems.map(item => (
                           <div key={item.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                              <div className="flex justify-between items-start mb-2">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-white border border-stone-200 px-1 rounded uppercase text-stone-500">{item.bookId}</span>
                                    <span className={`text-[10px] font-bold px-1 rounded uppercase ${
                                        item.type === 'verse' ? 'bg-stone-200 text-stone-700' :
                                        item.type === 'commentary' ? 'bg-ochre-100 text-ochre-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>{item.type}</span>
                                 </div>
                                 <span className="text-xs text-stone-400">by {item.contributorName}</span>
                              </div>
                              
                              <div className="mb-3">
                                <span className="font-mono text-sm font-bold text-stone-800 block mb-1">{item.verseId}</span>
                                
                                {item.type === 'verse' && (
                                    <div className="text-sm text-stone-600">
                                        <p className="font-deva text-lg">{item.content.sanskrit}</p>
                                        <p className="italic">{item.content.transliteration}</p>
                                    </div>
                                )}

                                {item.type === 'commentary' && (
                                    <div className="mt-1 bg-white p-2 rounded border border-ochre-100">
                                        <p className="text-xs font-bold text-ochre-600 mb-1">New Commentary:</p>
                                        <p className="font-serif text-sm line-clamp-2">{item.content.commentaries?.[item.content.commentaries.length-1]?.text}</p>
                                    </div>
                                )}

                                {item.type === 'translation' && (
                                    <div className="mt-1 bg-white p-2 rounded border border-blue-100">
                                        <p className="text-xs font-bold text-blue-600 mb-1">New Translation:</p>
                                        <p className="font-serif text-sm italic">
                                            {/* We iterate to find the new translation, simplifying for display here */}
                                            "Translation text hidden in nested object..." 
                                        </p>
                                    </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                 <button onClick={() => handleApprove(item.id)} className="flex-1 bg-stone-900 text-white py-1.5 rounded text-xs font-bold hover:bg-green-700">Approve</button>
                                 <button onClick={() => handleReject(item.id)} className="flex-1 bg-white border border-stone-300 text-stone-500 py-1.5 rounded text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200">Reject</button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
                )}

                {/* --- TAB: STATS --- */}
                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-ochre-50 p-4 rounded-lg border border-ochre-100 text-center">
                                <h3 className="text-ochre-800 text-xs uppercase font-bold tracking-wider mb-1">Total Contributors</h3>
                                <p className="text-3xl font-serif font-bold text-ochre-600">{stats.length}</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 text-center">
                                <h3 className="text-stone-500 text-xs uppercase font-bold tracking-wider mb-1">Pending Review</h3>
                                <p className="text-3xl font-serif font-bold text-stone-800">{pendingItems.length}</p>
                            </div>
                        </div>

                        <h3 className="font-serif font-bold text-lg text-stone-800 border-b border-stone-100 pb-2">Activity Log</h3>
                        
                        <div className="overflow-hidden rounded-lg border border-stone-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3 text-center text-green-600">Approved</th>
                                        <th className="px-4 py-3 text-center text-orange-500">Pending</th>
                                        <th className="px-4 py-3 text-center text-red-500">Rejected</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100">
                                    {stats.length > 0 ? stats.map((stat, idx) => (
                                        <tr key={idx} className="hover:bg-stone-50">
                                            <td className="px-4 py-3 font-medium text-stone-800">{stat.name}</td>
                                            <td className="px-4 py-3 text-center font-bold text-stone-600">{stat.approved}</td>
                                            <td className="px-4 py-3 text-center text-stone-400">{stat.pending}</td>
                                            <td className="px-4 py-3 text-center text-stone-400">{stat.rejected}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-stone-400 italic">No activity recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default CMSPanel;
