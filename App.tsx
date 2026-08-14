import React, { useState, useEffect } from 'react';
import { Verse, Chapter, Book, Bookmark } from './types';
import { getAvailableBooks, getBookContent, getAllVerses, getBookMetadata, getVerseById, searchGlobal } from './services/library';
import { fuzzyMatch } from './services/searchUtils';
import Sidebar from './components/Sidebar';
import BookmarksPanel from './components/BookmarksPanel';
import ReaderView from './components/ReaderView';
import DonatePage from './components/DonatePage';
import ContributePage from './components/ContributePage';
import ProjectsPage from './components/ProjectsPage';
import AIPage from './components/AIPage';
import LoginPage from './components/LoginPage';
import { Menu, Search, Moon, Sun, ChevronLeft, Share2, Library, ArrowRight, Bookmark as BookmarkIcon, Check, BookOpen, Loader2, Facebook, Youtube, Heart, HelpCircle, Feather, X, LayoutGrid, MessageCircle } from 'lucide-react';

// --- CONFIGURATION ---
type ViewState = 'landing' | 'library' | 'ai' | 'donate' | 'contribute' | 'projects';

interface GlobalHeaderButtonsProps {
  theme: 'light' | 'dark';
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onNavigate: (view: ViewState) => void;
}

const GlobalHeaderButtons: React.FC<GlobalHeaderButtonsProps> = ({ theme, darkMode, setDarkMode, onNavigate }) => (
  <div className={`flex items-center space-x-1 md:space-x-2`}>
     <button onClick={() => onNavigate('donate')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10 hover:text-red-400' : 'text-stone-500 hover:bg-stone-100 hover:text-red-500'}`} title="Donate">
        <Heart size={20} />
     </button>
     <button onClick={() => onNavigate('contribute')} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10 hover:text-blue-400' : 'text-stone-500 hover:bg-stone-100 hover:text-blue-600'}`} title="Contribute">
        <HelpCircle size={20} />
     </button>
     <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'}`}>
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
     </button>
  </div>
);

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Data State
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allVerses, setAllVerses] = useState<Verse[]>([]);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  
  // Global Search State
  const [globalVerses, setGlobalVerses] = useState<{ book: Book, verse: Verse }[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  
  // UI State
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/auth/session').then(response => response.json()).then(data => setAuthenticated(Boolean(data.authenticated))).catch(() => setAuthenticated(false));
  }, []);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('sutra_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Initialization
  useEffect(() => {
    const fetchBooks = async () => {
      const available = await getAvailableBooks();
      setBooks(available);
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    localStorage.setItem('sutra_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Global Search Effect
  useEffect(() => {
    const performGlobalSearch = async () => {
       if (libraryQuery.length < 2) {
         setGlobalVerses([]);
         return;
       }
       setIsSearchingGlobal(true);
       try {
         const results = await searchGlobal(libraryQuery);
         setGlobalVerses(results);
       } catch (e) {
         console.error(e);
       } finally {
         setIsSearchingGlobal(false);
       }
    };
    
    // Debounce
    const timeoutId = setTimeout(performGlobalSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [libraryQuery]);

  // Book Loader
  useEffect(() => {
    let isMounted = true;
    const loadBook = async () => {
      if (!selectedBook) {
        if (isMounted) {
            setChapters([]);
            setAllVerses([]);
            setCurrentVerse(null);
        }
        return;
      }

      setIsLoadingBook(true);
      try {
        const bookChapters = await getBookContent(selectedBook.id);
        const bookVerses = await getAllVerses(selectedBook.id);
        
        if (isMounted) {
          setChapters(bookChapters);
          setAllVerses(bookVerses);
          
          if (bookVerses.length > 0) {
              const matchingVerse = currentVerse ? bookVerses.find(v => v.id === currentVerse.id) : null;
              setCurrentVerse(matchingVerse || bookVerses[0]);
          }
        }
      } catch (error) {
        console.error("Error loading book:", error);
      } finally {
        if (isMounted) setIsLoadingBook(false);
      }
    };

    loadBook();
    return () => { isMounted = false; };
  }, [selectedBook]);

  // Handlers
  const isBookmarked = (bookId: string, verseId: string) => {
    return bookmarks.some(b => b.bookId === bookId && b.verseId === verseId);
  };

  const toggleBookmark = (bookId: string, verseId: string) => {
    if (isBookmarked(bookId, verseId)) {
      setBookmarks(prev => prev.filter(b => !(b.bookId === bookId && b.verseId === verseId)));
    } else {
      setBookmarks(prev => [...prev, { bookId, verseId, timestamp: Date.now() }]);
    }
  };

  const updateBookmarkNote = (bookId: string, verseId: string, note: string) => {
    setBookmarks(prev => prev.map(b => 
      (b.bookId === bookId && b.verseId === verseId) ? { ...b, note } : b
    ));
  };

  const handleBookmarkNavigation = async (bookId: string, verseId: string) => {
    const book = await getBookMetadata(bookId);
    if (book) {
      setCurrentView('library');
      setSelectedBook(book);
      const targetVerse = await getVerseById(bookId, verseId);
      if (targetVerse) setCurrentVerse(targetVerse);
    }
  };

  const handleShare = async () => {
    if (!currentVerse) return;
    const shareText = `${currentVerse.sanskrit}\n\n${currentVerse.transliteration}\n— ${selectedBook?.title} ${currentVerse.id}\nRead more at SutraLibrary`;
    if (navigator.share) {
      try { await navigator.share({ title: `${selectedBook?.title} ${currentVerse.id}`, text: shareText }); } 
      catch (err) { console.error(err); }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNavigateVerse = (direction: 'next' | 'prev') => {
    if (!currentVerse) return;
    const idx = allVerses.findIndex(v => v.id === currentVerse.id);
    if (direction === 'next' && idx < allVerses.length - 1) {
      setCurrentVerse(allVerses[idx + 1]);
    } else if (direction === 'prev' && idx > 0) {
      setCurrentVerse(allVerses[idx - 1]);
    }
  };

  const filteredBooks = books.filter(b => 
    fuzzyMatch(libraryQuery, b.title, b.author)
  );

  // DEEP SEARCH ALGORITHM with Fuzzy Matching
  // Scans ID, Sanskrit, Transliteration, Meanings, and Summaries
  const filteredVerses = selectedBook && searchQuery.length > 1
    ? allVerses.filter(v => {
        return fuzzyMatch(
            searchQuery,
            v.id,
            v.sanskrit,
            v.transliteration,
            ...(v.sutrarth?.map(s => s.text) || []),
            ...(v.summary?.map(s => s.text) || [])
        );
    })
    : [];

  if (authenticated === null) return <div className="min-h-screen bg-stone-950" />;
  if (!authenticated) return <LoginPage onLogin={() => setAuthenticated(true)} />;

  // View Routing
  if (currentView === 'donate') return <DonatePage onBack={() => setCurrentView('landing')} />;
  if (currentView === 'contribute') return <ContributePage onBack={() => setCurrentView('landing')} />;
  if (currentView === 'projects') return <ProjectsPage onBack={() => setCurrentView('landing')} />;
  if (currentView === 'ai') return <AIPage onBack={() => setCurrentView('library')} />;

  return (
    <div className={`min-h-screen w-full flex flex-col ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      
      <BookmarksPanel 
        bookmarks={bookmarks}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onSelectBookmark={handleBookmarkNavigation}
        onRemoveBookmark={toggleBookmark}
        onUpdateBookmark={updateBookmarkNote}
      />

      {!selectedBook ? (
        currentView === 'landing' ? (
            <div className="min-h-screen bg-stone-900 flex flex-col items-center relative overflow-hidden font-sans">
                {/* Background Gradient matching the requested style */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a0a0a] via-[#120202] to-black" />

                <div className="w-full p-4 flex justify-center items-center z-10 pt-8 sm:pt-12">
                  <form onSubmit={(e) => { e.preventDefault(); setCurrentView('library'); }} className="w-full max-w-lg relative">
                      <input 
                        type="text" 
                        placeholder="Search Library..."
                        value={libraryQuery}
                        onChange={(e) => setLibraryQuery(e.target.value)}
                        className="w-full py-3 pl-12 pr-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-ochre-500 text-white placeholder-white/50 shadow-lg transition-all"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                          <ArrowRight size={16} className="text-white" />
                      </button>
                  </form>
               </div>

               <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-4 py-6 z-10 text-center relative">
                  <h1 className="text-5xl md:text-7xl font-deva font-bold text-yellow-300 mb-6 drop-shadow-[0_4px_3px_rgba(0,0,0,0.9)] [text-shadow:_0_0_30px_rgba(253,224,71,0.5)] tracking-wide">
                    • सत्यप्रतिष्ठा •
                  </h1>
                  <div className="space-y-3 text-white/90 font-deva text-xl md:text-3xl font-medium leading-relaxed drop-shadow-md text-center">
                     <p>सत्ये प्रतिष्ठिता धर्ममार्गः।</p>
                     <p>सत्यस्य स्थापना एव धर्मः।।</p>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mt-10 mb-8 opacity-80" />
                  <p className="text-stone-300 font-serif tracking-[0.2em] text-sm uppercase">A project by</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 font-serif tracking-wide">Sanatani Akhada</h3>
               </div>

               <div className="w-full max-w-5xl px-6 pb-12 z-10 mt-4">
                   <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                       <button onClick={() => setCurrentView('library')} className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-yellow-100 rounded-full flex items-center justify-center border border-white/20">
                                <BookOpen size={24} />
                            </div>
                            <span className="block font-deva font-bold text-white text-base">ई-पुस्तकम्</span>
                       </button>

                       <button onClick={() => setCurrentView('ai')} aria-label="Open AI chat" className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-yellow-300 text-stone-950 rounded-full flex items-center justify-center border border-yellow-200 shadow-lg shadow-yellow-300/20"><MessageCircle size={24} /></div>
                            <span className="block font-deva font-bold text-white text-base">AI संवाद</span>
                       </button>

                       <button onClick={() => setCurrentView('contribute')} className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-red-100 rounded-full flex items-center justify-center border border-white/20">
                                <Feather size={24} />
                            </div>
                            <span className="block font-deva font-bold text-white text-base">योगदानम्</span>
                       </button>

                       <button onClick={() => setCurrentView('donate')} className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-orange-100 rounded-full flex items-center justify-center border border-white/20">
                                <Heart size={24} />
                            </div>
                            <span className="block font-deva font-bold text-white text-base">दानम्</span>
                       </button>

                       <button onClick={() => setCurrentView('projects')} className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-blue-100 rounded-full flex items-center justify-center border border-white/20">
                                <LayoutGrid size={24} />
                            </div>
                            <span className="block font-deva font-bold text-white text-base">प्रकल्पाः</span>
                       </button>
                   </div>
                   
                   <div className="flex justify-center gap-8 mt-12 text-white/50 font-semibold text-sm">
                      <button className="flex items-center gap-2 hover:text-white transition-colors"><Facebook size={18}/> Social Media</button>
                      <button className="flex items-center gap-2 hover:text-white transition-colors"><Youtube size={18}/> YouTube</button>
                   </div>
               </div>
            </div>
        ) : (
        /* LIBRARY VIEW */
        <>
        <header className="h-20 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-12 gap-4">
           <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 shrink-0" onClick={() => { setCurrentView('landing'); setLibraryQuery(''); }}>
             <div className="p-2 bg-ochre-600 rounded-lg text-white"><Library size={24} /></div>
             <div><h1 className="font-serif font-bold text-2xl text-stone-800 hidden md:block">SutraLibrary</h1></div>
           </div>

           <div className="flex-1 max-w-md mx-auto relative">
                <input 
                  type="text" placeholder="Search books or sutras..." value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-100 border-transparent focus:bg-white focus:border-ochre-300 rounded-lg text-sm transition-all outline-none border focus:ring-2 focus:ring-ochre-100"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                {libraryQuery && <button onClick={() => setLibraryQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"><X size={14} /></button>}
           </div>

                         <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
              <button onClick={() => setCurrentView('ai')} className="hidden md:block rounded-lg px-3 py-2 text-sm font-bold text-ochre-700 hover:bg-ochre-50">Ask AI</button>
              <GlobalHeaderButtons theme="light" darkMode={darkMode} setDarkMode={setDarkMode} onNavigate={(v) => { setSelectedBook(null); setCurrentView(v); }} />
              <div className="w-px h-6 bg-stone-300 mx-2 hidden md:block"></div>
              <button onClick={() => setIsBookmarksOpen(true)} className="text-stone-600 hover:text-ochre-700 transition-colors"><BookmarkIcon size={20} /></button>
           </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-12 py-12 flex-1 min-h-[calc(100vh-80px)]">
           <div className="flex justify-between items-center mb-6">
              <button onClick={() => setCurrentView('landing')} className="flex items-center text-sm font-bold text-stone-400 hover:text-ochre-600 uppercase tracking-wider transition-colors">
                  <ChevronLeft size={16} className="mr-1" /> Back to Home
              </button>
              {libraryQuery && (
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      {filteredBooks.length} Books • {globalVerses.length} Sutras
                  </span>
              )}
           </div>
           
           {/* Books Section */}
           {filteredBooks.length > 0 && (
              <div className="mb-12">
                  <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                    <BookOpen size={14} className="mr-2" /> Books
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredBooks.map(book => (
                        <div key={book.id} onClick={() => setSelectedBook(book)} className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-xl cursor-pointer p-8 flex flex-col transition-all">
                          <span className="text-xs font-bold uppercase tracking-wider text-ochre-600 mb-2">{book.category}</span>
                          <h3 className="font-serif text-2xl font-bold text-stone-800 mb-2">{book.title}</h3>
                          <p className="text-stone-400 text-sm mb-4">by {book.author}</p>
                          <p className="text-stone-600 text-sm mb-6 flex-1 line-clamp-3">{book.description}</p>
                          <div className="flex items-center text-ochre-600 font-bold text-sm group-hover:translate-x-1 transition-transform">Start Reading <ArrowRight size={16} className="ml-2" /></div>
                        </div>
                      ))}
                  </div>
              </div>
           )}

           {/* Verses Section */}
           {(globalVerses.length > 0 || isSearchingGlobal) && (
               <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center">
                    <Search size={14} className="mr-2" /> 
                    Matches in Verses
                    {isSearchingGlobal && <Loader2 size={12} className="ml-2 animate-spin" />}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {globalVerses.map(({ book, verse }) => (
                        <div key={`${book.id}-${verse.id}`} onClick={() => { setSelectedBook(book); setCurrentVerse(verse); }} className="bg-white p-5 rounded-xl border border-stone-200 hover:border-ochre-300 hover:shadow-md cursor-pointer transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-ochre-200 group-hover:bg-ochre-500 transition-colors"></div>
                            <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-0.5 rounded uppercase">{book.title}</span>
                                  <span className="text-xs font-bold text-ochre-600">{verse.id}</span>
                               </div>
                               <ArrowRight size={16} className="text-stone-300 group-hover:text-ochre-500 transition-colors" />
                            </div>
                            <div className="font-deva text-xl text-stone-800 mb-1 leading-snug">{verse.sanskrit}</div>
                            <div className="text-sm text-stone-500 font-serif italic truncate">{verse.transliteration}</div>
                        </div>
                     ))}
                  </div>
               </div>
           )}

           {/* No Results */}
           {libraryQuery && filteredBooks.length === 0 && globalVerses.length === 0 && !isSearchingGlobal && (
             <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
                <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-lg font-bold text-stone-600">No results found</h3>
                <p className="text-stone-400">Try adjusting your search terms.</p>
             </div>
           )}

           {/* Default State (No Query) */}
           {!libraryQuery && filteredBooks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredBooks.map(book => (
                    <div key={book.id} onClick={() => setSelectedBook(book)} className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-xl cursor-pointer p-8 flex flex-col transition-all">
                      <span className="text-xs font-bold uppercase tracking-wider text-ochre-600 mb-2">{book.category}</span>
                      <h3 className="font-serif text-2xl font-bold text-stone-800 mb-2">{book.title}</h3>
                      <p className="text-stone-400 text-sm mb-4">by {book.author}</p>
                      <p className="text-stone-600 text-sm mb-6 flex-1 line-clamp-3">{book.description}</p>
                      <div className="flex items-center text-ochre-600 font-bold text-sm group-hover:translate-x-1 transition-transform">Start Reading <ArrowRight size={16} className="ml-2" /></div>
                    </div>
                  ))}
              </div>
           )}
        </main>
        </>
        )
      ) : (
        /* READER VIEW */
        <div className="flex h-screen overflow-hidden">
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
            <header className="h-16 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-8">
              <div className="flex items-center space-x-4">
                 <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden"><Menu size={24} /></button>
                 <div className="relative">
                    <div className="flex items-center bg-stone-100 rounded-full px-4 py-2 w-full md:w-64 focus-within:ring-2 focus-within:ring-ochre-200 transition-all">
                       <Search size={16} className="text-stone-400 mr-2" />
                       <input 
                         type="text" placeholder="Search verse (e.g. 'vrddhi')..." 
                         className="bg-transparent border-none outline-none text-sm w-full placeholder-stone-400"
                         value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                       />
                       {searchQuery && <button onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-stone-600"><X size={14}/></button>}
                    </div>
                    {/* Enhanced Search Dropdown */}
                    {searchQuery.length > 1 && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
                         {filteredVerses.length > 0 ? (
                            filteredVerses.map(v => (
                                <button key={v.id} onClick={() => { setCurrentVerse(v); setSearchQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-ochre-50 border-b border-stone-100 last:border-0 transition-colors group">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-stone-500 text-[10px] uppercase tracking-wider">{v.id}</span>
                                      {v.isVerified && <Check size={10} className="text-green-600" />}
                                    </div>
                                    <div className="font-deva text-stone-900 text-lg mb-0.5 group-hover:text-ochre-800">{v.sanskrit}</div>
                                    <div className="text-xs text-stone-500 font-serif truncate">{v.transliteration}</div>
                                </button>
                            ))
                         ) : (
                            <div className="px-4 py-3 text-sm text-stone-400 italic">No verses found matching "{searchQuery}"</div>
                         )}
                      </div>
                    )}
                 </div>
              </div>
              <div className="flex items-center space-x-2">
                 <GlobalHeaderButtons theme="light" darkMode={darkMode} setDarkMode={setDarkMode} onNavigate={(v) => { setSelectedBook(null); setCurrentView(v); }} />
                 <div className="w-px h-6 bg-stone-300 mx-1"></div>
                 <button onClick={() => setIsBookmarksOpen(true)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><BookmarkIcon size={20} className="text-stone-500" /></button>
                 <button onClick={handleShare} className="p-2 hover:bg-stone-100 rounded-full transition-colors">{copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} className="text-stone-500" />}</button>
              </div>
            </header>

            {isLoadingBook ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 text-stone-400">
                    <Loader2 size={48} className="animate-spin text-ochre-600 mb-4" />
                    <p className="font-serif text-lg text-stone-600">Loading {selectedBook.title}...</p>
                </div>
            ) : currentVerse ? (
              <ReaderView 
                 book={selectedBook}
                 verse={currentVerse}
                 allVerses={allVerses}
                 isBookmarked={isBookmarked(selectedBook.id, currentVerse.id)}
                 onToggleBookmark={() => toggleBookmark(selectedBook.id, currentVerse.id)}
                 onNavigateVerse={handleNavigateVerse}
              />
            ) : (
               <div className="flex-1 flex items-center justify-center bg-stone-50 text-stone-400">
                  <div className="text-center">
                     <Library size={48} className="mx-auto mb-4 opacity-20" />
                     <p>Select a verse to read.</p>
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
