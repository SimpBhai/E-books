import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Verse, Chapter, Book, Bookmark } from './types';
import { getAvailableBooks, getBookContent, getAllVerses, getBookMetadata, getVerseById, searchGlobal } from './services/library';
import { fuzzyMatch } from './services/searchUtils';
import Sidebar from './components/Sidebar';
import BookmarksPanel from './components/BookmarksPanel';
import ReaderView from './components/ReaderView';
import DonatePage from './components/DonatePage';
import ContributePage from './components/ContributePage';
import ProjectsPage from './components/ProjectsPage';
import { Menu, Search, Moon, Sun, Share2, Library, ArrowRight, Bookmark as BookmarkIcon, Check, BookOpen, Loader2, Heart, HelpCircle, Feather, X, LayoutGrid } from 'lucide-react';

// --- Types ---
type ViewState = 'landing' | 'library' | 'donate' | 'contribute' | 'projects';

// --- Helper Components ---

const HeaderActionButtons: React.FC<{
  darkMode: boolean;
  toggleTheme: () => void;
  onNavigate: (view: ViewState) => void;
}> = ({ darkMode, toggleTheme, onNavigate }) => (
  <div className="flex items-center gap-1 md:gap-2">
    <button onClick={() => onNavigate('donate')} className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-red-600 transition-colors dark:text-stone-400 dark:hover:bg-stone-800" title="Donate">
      <Heart size={20} />
    </button>
    <button onClick={() => onNavigate('contribute')} className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-blue-600 transition-colors dark:text-stone-400 dark:hover:bg-stone-800" title="Contribute">
      <HelpCircle size={20} />
    </button>
    <button onClick={toggleTheme} className="p-2 rounded-full text-stone-500 hover:bg-stone-100 hover:text-amber-600 transition-colors dark:text-stone-400 dark:hover:bg-stone-800" title="Toggle Theme">
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  </div>
);

const LandingView: React.FC<{
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  onNavigate: (v: ViewState) => void;
}> = ({ query, setQuery, onSearch, onNavigate }) => (
  <div className="min-h-screen bg-stone-900 flex flex-col items-center relative overflow-hidden font-sans text-white">
    {/* Background Effects */}
    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1c1917] via-[#0c0a09] to-black" />
    
    {/* Search Section */}
    <div className="w-full p-6 flex justify-center items-center z-10 pt-16 md:pt-24">
      <form onSubmit={(e) => { e.preventDefault(); onSearch(); }} className="w-full max-w-xl relative group">
        <div className="absolute inset-0 bg-ochre-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <input 
          type="text" 
          placeholder="Search the library..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-4 pl-14 pr-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 focus:outline-none focus:bg-white/15 focus:border-ochre-400/50 text-white placeholder-white/40 shadow-2xl transition-all"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
          <ArrowRight size={18} />
        </button>
      </form>
    </div>

    {/* Hero Text */}
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 text-center relative z-10">
      <h1 className="text-6xl md:text-8xl font-deva font-bold text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 to-amber-600 mb-8 drop-shadow-lg tracking-wide">
        • सत्यप्रतिष्ठा •
      </h1>
      <p className="text-stone-300 font-deva text-2xl md:text-4xl font-light leading-relaxed drop-shadow-md">
        सत्ये प्रतिष्ठिता धर्ममार्गः।
      </p>
      <div className="w-32 h-1 bg-gradient-to-r from-transparent via-ochre-600 to-transparent mt-12 mb-8 opacity-60" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-stone-500 font-serif tracking-[0.2em] text-[10px] uppercase">Curated by</span>
        <span className="text-xl font-bold text-stone-200 font-serif tracking-widest">Sanatani Akhada</span>
      </div>
    </div>

    {/* Navigation Grid */}
    <div className="w-full max-w-5xl px-8 pb-16 z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {[
          { icon: BookOpen, label: 'Library', sub: 'ई-पुस्तकम्', action: () => onNavigate('library'), color: 'text-yellow-100' },
          { icon: Feather, label: 'Contribute', sub: 'योगदानम्', action: () => onNavigate('contribute'), color: 'text-red-100' },
          { icon: Heart, label: 'Donate', sub: 'दानम्', action: () => onNavigate('donate'), color: 'text-orange-100' },
          { icon: LayoutGrid, label: 'Projects', sub: 'प्रकल्पाः', action: () => onNavigate('projects'), color: 'text-blue-100' },
        ].map((item, i) => (
          <button key={i} onClick={item.action} className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-all">
            <div className={`w-14 h-14 bg-white/5 backdrop-blur-sm ${item.color} rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-lg`}>
              <item.icon size={24} />
            </div>
            <div className="text-center">
              <span className="block font-bold text-stone-200 text-sm group-hover:text-white">{item.label}</span>
              <span className="block font-deva text-stone-500 text-xs mt-0.5">{item.sub}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// --- Main Component ---

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Data State
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allVerses, setAllVerses] = useState<Verse[]>([]);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  
  // Search State
  const [globalResults, setGlobalResults] = useState<{ book: Book, verse: Verse }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [readerQuery, setReaderQuery] = useState('');
  
  // UI State
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'copied'>('idle');

  // Load Bookmarks Safely
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('sutra_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse bookmarks", e);
      return [];
    }
  });

  // --- Effects ---

  useEffect(() => {
    setAvailableBooks(getAvailableBooks());
  }, []);

  useEffect(() => {
    localStorage.setItem('sutra_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Global Search Debouncer
  useEffect(() => {
    if (libraryQuery.trim().length < 2) {
      setGlobalResults([]);
      setIsSearching(false);
      return;
    }

    const handler = setTimeout(async () => {
       setIsSearching(true);
       try {
         const results = await searchGlobal(libraryQuery);
         setGlobalResults(results);
       } catch (error) {
         console.error("Search error:", error);
       } finally {
         setIsSearching(false);
       }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [libraryQuery]);

  // Book Loader
  useEffect(() => {
    if (!selectedBook) {
        setChapters([]);
        setAllVerses([]);
        setCurrentVerse(null);
        return;
    }

    let active = true;
    const loadContent = async () => {
      setIsLoadingBook(true);
      try {
        const [loadedChapters, loadedVerses] = await Promise.all([
            getBookContent(selectedBook.id),
            getAllVerses(selectedBook.id)
        ]);
        
        if (active) {
          setChapters(loadedChapters);
          setAllVerses(loadedVerses);
          // Auto-select first verse if none selected, or try to keep current if switching versions (future proof)
          setCurrentVerse(prev => {
             if (prev && loadedVerses.find(v => v.id === prev.id)) {
                 return loadedVerses.find(v => v.id === prev.id) || null;
             }
             return loadedVerses[0] || null;
          });
        }
      } catch (err) {
        console.error("Failed to load book content", err);
      } finally {
        if (active) setIsLoadingBook(false);
      }
    };

    loadContent();
    return () => { active = false; };
  }, [selectedBook]);

  // --- Event Handlers ---

  const handleBookmark = useCallback((bookId: string, verseId: string) => {
    setBookmarks(prev => {
        const exists = prev.some(b => b.bookId === bookId && b.verseId === verseId);
        if (exists) return prev.filter(b => !(b.bookId === bookId && b.verseId === verseId));
        return [...prev, { bookId, verseId, timestamp: Date.now() }];
    });
  }, []);

  const handleUpdateNote = useCallback((bookId: string, verseId: string, note: string) => {
    setBookmarks(prev => prev.map(b => 
      (b.bookId === bookId && b.verseId === verseId) ? { ...b, note } : b
    ));
  }, []);

  const handleNavigateBookmark = useCallback(async (bookId: string, verseId: string) => {
    const book = getBookMetadata(bookId);
    if (!book) return;

    if (selectedBook?.id !== bookId) {
        setSelectedBook(book);
        // Note: The useEffect will fire and load verses. 
        // We set a temporary intent or rely on the user finding it, 
        // but for a better UX in a real app, we'd have a 'targetVerseId' state.
        // For this static version, we simply switch books. 
        // We can manually wait for the fetch in a real async action here, but React state batching makes it tricky without a useEffect dependency.
        // Simple workaround:
        setTimeout(async () => {
            const verse = await getVerseById(bookId, verseId);
            if (verse) setCurrentVerse(verse);
        }, 100); 
    } else {
        const verse = allVerses.find(v => v.id === verseId);
        if (verse) setCurrentVerse(verse);
    }
    setCurrentView('library');
  }, [selectedBook, allVerses]);

  const handleShare = async () => {
    if (!currentVerse || !selectedBook) return;
    const text = `${currentVerse.sanskrit}\n\n${currentVerse.transliteration}\n— ${selectedBook.title} ${currentVerse.id}\nSutraLibrary`;
    
    if (navigator.share) {
      try { await navigator.share({ title: `Sutra ${currentVerse.id}`, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setShareFeedback('copied');
      setTimeout(() => setShareFeedback('idle'), 2000);
    }
  };

  const handleNextPrev = (dir: 'next' | 'prev') => {
    if (!currentVerse) return;
    const idx = allVerses.findIndex(v => v.id === currentVerse.id);
    if (idx === -1) return;
    
    const newIdx = dir === 'next' ? idx + 1 : idx - 1;
    if (newIdx >= 0 && newIdx < allVerses.length) {
      setCurrentVerse(allVerses[newIdx]);
    }
  };

  // --- Render Helpers ---

  // Filter books for the library grid
  const displayedBooks = useMemo(() => 
    availableBooks.filter(b => fuzzyMatch(libraryQuery, b.title, b.author, b.category)),
  [availableBooks, libraryQuery]);

  // Filter verses for the reader search dropdown
  const readerSearchResults = useMemo(() => {
    if (!selectedBook || readerQuery.length < 2) return [];
    return allVerses.filter(v => 
        fuzzyMatch(readerQuery, v.id, v.sanskrit, v.transliteration)
    );
  }, [selectedBook, readerQuery, allVerses]);

  // --- Views ---

  if (currentView === 'landing' && !selectedBook) {
    return <LandingView query={libraryQuery} setQuery={setLibraryQuery} onSearch={() => setCurrentView('library')} onNavigate={setCurrentView} />;
  }

  if (currentView === 'donate') return <DonatePage onBack={() => setCurrentView('landing')} />;
  if (currentView === 'contribute') return <ContributePage onBack={() => setCurrentView('landing')} />;
  if (currentView === 'projects') return <ProjectsPage onBack={() => setCurrentView('landing')} />;

  // Library & Reader View
  return (
    <div className={`min-h-screen w-full flex flex-col ${darkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'} transition-colors duration-300 font-sans`}>
      
      <BookmarksPanel 
        bookmarks={bookmarks}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onSelectBookmark={handleNavigateBookmark}
        onRemoveBookmark={(bid, vid) => handleBookmark(bid, vid)}
        onUpdateBookmark={handleUpdateNote}
      />

      {/* --- Library View (Grid) --- */}
      {!selectedBook && (
        <>
          <header className="h-16 md:h-20 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 gap-4">
             <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setCurrentView('landing'); setLibraryQuery(''); }}>
               <div className="p-2 bg-ochre-700 rounded-lg text-white shadow-lg group-hover:bg-ochre-600 transition-colors"><Library size={24} /></div>
               <h1 className="font-serif font-bold text-xl text-stone-800 dark:text-stone-100 hidden md:block">SutraLibrary</h1>
             </div>

             <div className="flex-1 max-w-xl mx-auto relative">
                  <input 
                    type="text" 
                    placeholder="Search library..." 
                    value={libraryQuery}
                    onChange={(e) => setLibraryQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-stone-100 dark:bg-stone-800 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-ochre-400 focus:bg-white dark:focus:bg-stone-950 dark:focus:border-stone-700 transition-all outline-none"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  {libraryQuery && (
                    <button onClick={() => setLibraryQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1">
                      <X size={14} />
                    </button>
                  )}
             </div>

             <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  <HeaderActionButtons darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} onNavigate={(v) => setCurrentView(v)} />
                </div>
                <button onClick={() => setIsBookmarksOpen(true)} className="text-stone-600 dark:text-stone-300 hover:text-ochre-600 transition-colors relative">
                  <BookmarkIcon size={22} />
                  {bookmarks.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ochre-500 rounded-full border-2 border-white dark:border-stone-900" />}
                </button>
             </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full animate-in fade-in duration-300">
             {/* Results Header */}
             <div className="flex justify-between items-end mb-8 border-b border-stone-200 dark:border-stone-800 pb-4">
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center">
                   {libraryQuery ? 'Search Results' : 'Catalog'}
                </h2>
                {libraryQuery && (
                   <span className="text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full">
                     {displayedBooks.length} Books • {globalResults.length} Sutras
                   </span>
                )}
             </div>
             
             {/* Book Cards */}
             {displayedBooks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {displayedBooks.map(book => (
                      <div key={book.id} onClick={() => setSelectedBook(book)} className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 cursor-pointer hover:shadow-xl hover:border-ochre-200 dark:hover:border-ochre-900 hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-ochre-700 bg-ochre-50 dark:bg-ochre-900/20 px-2 py-1 rounded">{book.category}</span>
                           <ArrowRight size={18} className="text-stone-300 group-hover:text-ochre-500 transition-colors opacity-0 group-hover:opacity-100" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">{book.title}</h3>
                        <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">by {book.author}</p>
                        <p className="text-stone-600 dark:text-stone-300 text-sm line-clamp-3 leading-relaxed">{book.description}</p>
                      </div>
                    ))}
                </div>
             )}

             {/* Verse Search Results */}
             {(globalResults.length > 0 || isSearching) && (
                 <div className="space-y-4">
                    <div className="flex items-center text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">
                       <Search size={14} className="mr-2" /> Matches in Verses
                       {isSearching && <Loader2 size={14} className="ml-2 animate-spin" />}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {globalResults.map(({ book, verse }) => (
                          <div key={`${book.id}-${verse.id}`} onClick={() => { setSelectedBook(book); setCurrentVerse(verse); }} className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-ochre-400 cursor-pointer transition-all group relative overflow-hidden">
                              <div className="absolute left-0 top-0 w-1 h-full bg-stone-200 dark:bg-stone-700 group-hover:bg-ochre-500 transition-colors" />
                              <div className="flex justify-between items-start mb-2 pl-2">
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase">{book.title}</span>
                                    <span className="text-xs font-bold text-ochre-600 dark:text-ochre-400 bg-ochre-50 dark:bg-ochre-900/20 px-1.5 py-0.5 rounded">{verse.id}</span>
                                 </div>
                              </div>
                              <div className="pl-2">
                                  <div className="font-deva text-xl text-stone-800 dark:text-stone-100 mb-1">{verse.sanskrit}</div>
                                  <div className="text-sm text-stone-500 dark:text-stone-400 font-serif italic truncate">{verse.transliteration}</div>
                              </div>
                          </div>
                       ))}
                    </div>
                 </div>
             )}

             {/* Empty State */}
             {libraryQuery && displayedBooks.length === 0 && globalResults.length === 0 && !isSearching && (
               <div className="flex flex-col items-center justify-center py-24 text-stone-400">
                  <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="opacity-50" />
                  </div>
                  <p className="text-lg font-medium text-stone-600 dark:text-stone-300">No matches found</p>
                  <p className="text-sm mb-4">Try checking your spelling or using a different keyword.</p>
                  <button onClick={() => setLibraryQuery('')} className="text-sm text-ochre-600 font-bold hover:underline">Clear search</button>
               </div>
             )}
          </main>
        </>
      )}

      {/* --- Reader View --- */}
      {selectedBook && (
        <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-950">
          <Sidebar 
            activeBook={selectedBook}
            chapters={chapters} 
            currentVerse={currentVerse} 
            onSelectVerse={setCurrentVerse}
            onBackToLibrary={() => { setSelectedBook(null); setCurrentVerse(null); }}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
          />
          
          <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
            <header className="h-16 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 md:gap-4">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-md"><Menu size={24} /></button>
                 
                 {/* Reader Search */}
                 <div className="relative group">
                    <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-full px-3 py-1.5 w-48 md:w-80 focus-within:ring-2 focus-within:ring-ochre-200 transition-all">
                       <Search size={14} className="text-stone-400 mr-2" />
                       <input 
                         type="text" 
                         placeholder="Go to verse..."
                         className="bg-transparent border-none outline-none text-sm w-full placeholder-stone-400 text-stone-800 dark:text-stone-200"
                         value={readerQuery} 
                         onChange={e => setReaderQuery(e.target.value)}
                       />
                       {readerQuery && <button onClick={() => setReaderQuery('')}><X size={14} className="text-stone-400"/></button>}
                    </div>

                    {/* Search Dropdown */}
                    {readerQuery.length > 1 && (
                      <div className="absolute top-full left-0 mt-2 w-full md:w-96 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 py-2 z-50 max-h-80 overflow-y-auto">
                         {readerSearchResults.length > 0 ? (
                            readerSearchResults.map(v => (
                                <button key={v.id} onClick={() => { setCurrentVerse(v); setReaderQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-ochre-50 dark:hover:bg-ochre-900/20 border-b border-stone-100 dark:border-stone-800 last:border-0 transition-colors">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-stone-400 text-[10px] uppercase">{v.id}</span>
                                      {v.isVerified && <Check size={12} className="text-green-600" />}
                                    </div>
                                    <div className="font-deva text-stone-800 dark:text-stone-200 text-lg mb-0.5">{v.sanskrit}</div>
                                </button>
                            ))
                         ) : (
                            <div className="px-4 py-3 text-sm text-stone-400 italic">No verses found</div>
                         )}
                      </div>
                    )}
                 </div>
              </div>

              <div className="flex items-center space-x-2">
                 <div className="hidden md:block">
                   <HeaderActionButtons darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} onNavigate={(v) => { setSelectedBook(null); setCurrentView(v); }} />
                 </div>
                 <div className="w-px h-5 bg-stone-300 dark:bg-stone-700 mx-1 hidden md:block" />
                 
                 <button onClick={() => setIsBookmarksOpen(true)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500 dark:text-stone-400">
                   <BookmarkIcon size={20} className={bookmarks.some(b => b.bookId === selectedBook.id && b.verseId === currentVerse?.id) ? "fill-ochre-600 text-ochre-600" : ""} />
                 </button>
                 
                 <button onClick={handleShare} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500 dark:text-stone-400" title="Share">
                    {shareFeedback === 'copied' ? <Check size={20} className="text-green-600" /> : <Share2 size={20} />}
                 </button>
              </div>
            </header>

            {isLoadingBook ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-400">
                    <Loader2 size={40} className="animate-spin text-ochre-600 mb-4" />
                    <p className="font-serif">Opening scroll...</p>
                </div>
            ) : currentVerse ? (
              <ReaderView 
                 book={selectedBook}
                 verse={currentVerse}
                 allVerses={allVerses}
                 isBookmarked={bookmarks.some(b => b.bookId === selectedBook.id && b.verseId === currentVerse.id)}
                 onToggleBookmark={() => handleBookmark(selectedBook.id, currentVerse.id)}
                 onNavigateVerse={handleNextPrev}
              />
            ) : (
               <div className="flex-1 flex items-center justify-center text-stone-400">
                  <div className="text-center">
                     <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Select a verse to begin reading.</p>
                  </div>
               </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
