import React, { useState, useEffect } from 'react';
import { Verse, Chapter, Book, Bookmark, ContentText } from './types';
import { getAvailableBooks, getBookContent, getAllVerses, getBookMetadata, getVerseById } from './services/library';
import Sidebar from './components/Sidebar';
import BookmarksPanel from './components/BookmarksPanel';
import CommentaryCard from './components/CommentaryCard';
import CMSPanel from './components/CMSPanel';
import InfoModal from './components/InfoModal';
import { Menu, Search, Moon, Sun, ChevronLeft, ChevronRight, Share2, Library, ArrowRight, Bookmark as BookmarkIcon, Check, Filter, BookOpen, Globe, Loader2, Facebook, Youtube, Heart, CircleHelp, BookOpenText, Feather, HeartHandshake, X } from 'lucide-react';

// --- CONFIGURATION ---
const LANDING_BG_IMAGE = "https://images.unsplash.com/photo-1603217277800-4497e0eb7e3e?q=80&w=2600&auto=format&fit=crop";

// --- SUB-COMPONENTS ---

interface GlobalHeaderButtonsProps {
  theme: 'light' | 'dark';
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onOpenInfo: () => void;
}

const GlobalHeaderButtons: React.FC<GlobalHeaderButtonsProps> = ({ theme, darkMode, setDarkMode, onOpenInfo }) => (
  <div className={`flex items-center space-x-1 md:space-x-2`}>
     <button onClick={onOpenInfo} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10 hover:text-red-400' : 'text-stone-500 hover:bg-stone-100 hover:text-red-500'}`} title="Donate">
        <Heart size={20} />
     </button>
     <button onClick={onOpenInfo} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10 hover:text-blue-400' : 'text-stone-500 hover:bg-stone-100 hover:text-blue-600'}`} title="About & Contribute">
        <CircleHelp size={20} />
     </button>
     <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'}`}>
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
     </button>
  </div>
);

const App: React.FC = () => {
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  
  // Library Search State
  const [libraryQuery, setLibraryQuery] = useState('');

  // Reader Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Reader State
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  
  // Content View State
  const [contentLang, setContentLang] = useState<string>('English');
  const [selectedBhasyaIds, setSelectedBhasyaIds] = useState<string[]>([]);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [allVerses, setAllVerses] = useState<Verse[]>([]);
  
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isCMSOpen, setIsCMSOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('sutra_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load bookmarks", e);
      return [];
    }
  });

  // Initialize Library
  useEffect(() => {
    setBooks(getAvailableBooks());
  }, []);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem('sutra_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Load book content (ASYNC)
  useEffect(() => {
    let isMounted = true;
    const loadBook = async () => {
      if (selectedBook) {
        setIsLoadingBook(true);
        if (isMounted) {
            setChapters([]);
            setAllVerses([]);
        }

        try {
          const bookChapters = await getBookContent(selectedBook.id);
          const bookVerses = await getAllVerses(selectedBook.id);
          
          if (isMounted) {
            setChapters(bookChapters);
            setAllVerses(bookVerses);
            
            const verseExists = currentVerse && bookVerses.some(v => v.id === currentVerse.id);
            if (bookVerses.length > 0) {
                 if (!currentVerse || !verseExists) {
                     setCurrentVerse(bookVerses[0]);
                 }
            }
          }
        } catch (error) {
          console.error("Error loading book:", error);
        } finally {
          if (isMounted) setIsLoadingBook(false);
        }
      } else {
        if (isMounted) {
            setChapters([]);
            setAllVerses([]);
            setCurrentVerse(null);
        }
      }
    };

    loadBook();
    return () => { isMounted = false; };
  }, [selectedBook]);

  // Reset View selections when verse changes
  useEffect(() => {
    if (currentVerse) {
      if (currentVerse.commentaries && currentVerse.commentaries.length > 0) {
        setSelectedBhasyaIds([currentVerse.commentaries[0].id]);
      } else {
        setSelectedBhasyaIds([]);
      }
    }
  }, [currentVerse?.id]);

  // Helpers
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

  const handleBookmarkNavigation = async (bookId: string, verseId: string) => {
    const book = getBookMetadata(bookId);
    if (book) {
      setShowLanding(false);
      setSelectedBook(book);
      const targetVerse = await getVerseById(bookId, verseId);
      if (targetVerse) {
        setCurrentVerse(targetVerse);
      }
    }
  };

  const toggleBhasyaSelection = (id: string) => {
    setSelectedBhasyaIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (!currentVerse) return;
    const shareText = `${currentVerse.sanskrit}\n${currentVerse.transliteration}\n— ${selectedBook?.title} ${currentVerse.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${selectedBook?.title} ${currentVerse.id}`, text: shareText });
      } catch (err) { console.error(err); }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Nav Handlers
  const handleNextVerse = () => {
    if (!currentVerse) return;
    const idx = allVerses.findIndex(v => v.id === currentVerse.id);
    if (idx < allVerses.length - 1) setCurrentVerse(allVerses[idx + 1]);
  };

  const handlePrevVerse = () => {
    if (!currentVerse) return;
    const idx = allVerses.findIndex(v => v.id === currentVerse.id);
    if (idx > 0) setCurrentVerse(allVerses[idx - 1]);
  };

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLanding(false);
  };

  // Filter books in library view
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(libraryQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(libraryQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(libraryQuery.toLowerCase())
  );

  const filteredVerses = selectedBook && searchQuery.length > 1
    ? allVerses.filter(v => v.sanskrit.includes(searchQuery) || v.id.includes(searchQuery))
    : [];

  const getActiveContent = (items: ContentText[] | undefined, preferredLang: string) => {
    if (!items || items.length === 0) return null;
    const availableLangs = Array.from(new Set(items.map(i => i.language)));
    let activeItem = items.find(i => i.language === preferredLang);
    if (!activeItem && availableLangs.length > 0) {
      activeItem = items[0];
    }
    return { activeItem, availableLangs };
  };

  const isDevanagari = (lang: string) => {
    return lang === 'Hindi' || lang === 'Sanskrit';
  };

  const sutrarthData = currentVerse ? getActiveContent(currentVerse.sutrarth, contentLang) : null;
  const bhavarthData = currentVerse ? getActiveContent(currentVerse.summary, contentLang) : null;

  const availableLanguages = currentVerse ? Array.from(new Set([
    ...(currentVerse.sutrarth?.map(s => s.language) || []),
    ...(currentVerse.summary?.map(s => s.language) || [])
  ])).sort() : [];

  return (
    <div className={`min-h-screen w-full flex flex-col ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      
      {/* Global Modals */}
      <CMSPanel isOpen={isCMSOpen} onClose={() => setIsCMSOpen(false)} books={books} />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} onOpenCMS={() => setIsCMSOpen(true)} />
      
      <BookmarksPanel 
        bookmarks={bookmarks}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onSelectBookmark={handleBookmarkNavigation}
        onRemoveBookmark={toggleBookmark}
      />

      {/* VIEW SELECTION */}
      {!selectedBook ? (
        showLanding ? (
            /* --- LANDING PAGE --- */
            <div className="min-h-screen bg-stone-900 flex flex-col items-center relative overflow-hidden font-sans">
                
                <div className="absolute inset-0 z-0">
                    <img src={LANDING_BG_IMAGE} alt="Background" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent h-40"></div>
                </div>

                <div className="absolute top-4 right-4 z-20 flex gap-2">
                     <GlobalHeaderButtons theme="dark" darkMode={darkMode} setDarkMode={setDarkMode} onOpenInfo={() => setIsInfoOpen(true)} />
                </div>

                <div className="w-full p-4 flex justify-center items-center z-10 pt-8 sm:pt-12">
                  <form onSubmit={handleHomeSearch} className="w-full max-w-lg relative">
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
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 blur-[120px] rounded-full pointer-events-none"></div>

                  <h1 className="text-5xl md:text-7xl font-deva font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-6 drop-shadow-[0_2px_10px_rgba(255,200,0,0.3)] tracking-wide">
                    • सत्यप्रतिष्ठा •
                  </h1>
                  
                  <div className="space-y-4 text-white/90 font-deva text-xl md:text-3xl font-medium leading-relaxed drop-shadow-md">
                     <p>सत्ये प्रतिष्ठिता धर्ममार्गः।</p>
                     <p>सत्यस्य स्थापना एव धर्मः।</p>
                  </div>
                  
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mt-8 mb-8 opacity-80"></div>
                  
                  <p className="text-stone-300 font-serif tracking-[0.2em] text-sm uppercase">A project by</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mt-2 font-serif tracking-wide">Sanatani Akhada</h3>
               </div>

               <div className="w-full max-w-4xl px-6 pb-12 z-10 mt-4">
                   <div className="flex justify-center gap-8 md:gap-16">
                       <button onClick={() => setShowLanding(false)} className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-yellow-100 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)] group-hover:bg-white/20 group-hover:shadow-[0_0_20px_rgba(255,200,0,0.2)] transition-all border border-white/20">
                                <BookOpenText size={24} strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <span className="block font-deva font-bold text-white text-base">ई-पुस्तकम्</span>
                                <span className="block text-[10px] font-serif uppercase tracking-widest text-white/50">Library</span>
                            </div>
                       </button>

                       <button onClick={() => setIsInfoOpen(true)} className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-red-100 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)] group-hover:bg-white/20 group-hover:shadow-[0_0_20px_rgba(255,100,100,0.2)] transition-all border border-white/20">
                                <Feather size={24} strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <span className="block font-deva font-bold text-white text-base">योगदानम्</span>
                                <span className="block text-[10px] font-serif uppercase tracking-widest text-white/50">Contribute</span>
                            </div>
                       </button>

                       <button onClick={() => setIsInfoOpen(true)} className="group flex flex-col items-center gap-3 transition-all hover:-translate-y-1">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md text-orange-100 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)] group-hover:bg-white/20 group-hover:shadow-[0_0_20px_rgba(255,165,0,0.2)] transition-all border border-white/20">
                                <HeartHandshake size={24} strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <span className="block font-deva font-bold text-white text-base">दानम्</span>
                                <span className="block text-[10px] font-serif uppercase tracking-widest text-white/50">Donate</span>
                            </div>
                       </button>
                   </div>
                   
                   <div className="flex justify-center gap-8 mt-12 text-white/50 font-semibold text-sm">
                      <button className="flex items-center gap-2 hover:text-white transition-colors"><Facebook size={18}/> Social Media</button>
                      <button className="flex items-center gap-2 hover:text-white transition-colors"><Youtube size={18}/> YouTube</button>
                   </div>
               </div>
            </div>
        ) : (
        /* --- LIBRARY VIEW --- */
        <>
        <header className="h-20 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-12 gap-4">
           <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 shrink-0" onClick={() => setShowLanding(true)}>
             <div className="p-2 bg-ochre-600 rounded-lg text-white">
                <Library size={24} />
             </div>
             <div>
               <h1 className="font-serif font-bold text-2xl text-stone-800 hidden md:block">SutraLibrary</h1>
             </div>
           </div>

           <div className="flex-1 max-w-md mx-auto relative">
                <input 
                  type="text" 
                  placeholder="Filter books..." 
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-100 border-transparent focus:bg-white focus:border-ochre-300 rounded-lg text-sm transition-all outline-none border focus:ring-2 focus:ring-ochre-100"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                {libraryQuery && (
                  <button onClick={() => setLibraryQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                    <X size={14} />
                  </button>
                )}
           </div>

           <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
              <GlobalHeaderButtons theme="light" darkMode={darkMode} setDarkMode={setDarkMode} onOpenInfo={() => setIsInfoOpen(true)} />
              <div className="w-px h-6 bg-stone-300 mx-2 hidden md:block"></div>
              <button onClick={() => setIsBookmarksOpen(true)} className="text-stone-600 hover:text-ochre-700 transition-colors">
                <BookmarkIcon size={20} />
              </button>
           </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-12 py-12 flex-1">
           <div className="flex justify-between items-center mb-6">
              <button onClick={() => setShowLanding(true)} className="flex items-center text-sm font-bold text-stone-400 hover:text-ochre-600 uppercase tracking-wider transition-colors">
                  <ChevronLeft size={16} className="mr-1" /> Back to Home
              </button>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{filteredBooks.length} Books Available</span>
           </div>
           
           {filteredBooks.length > 0 ? (
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
           ) : (
             <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
                <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
                <h3 className="text-lg font-bold text-stone-600">No books found</h3>
                <p className="text-stone-400">Try adjusting your search terms.</p>
                <button onClick={() => setLibraryQuery('')} className="mt-4 text-ochre-600 font-bold text-sm hover:underline">Clear Search</button>
             </div>
           )}
        </main>
        </>
        )
      ) : (
        /* --- READER VIEW --- */
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
                    <div className="flex items-center bg-stone-100 rounded-full px-4 py-2 w-full md:w-64">
                       <Search size={16} className="text-stone-400 mr-2" />
                       <input 
                         type="text" placeholder="Search verse..." 
                         className="bg-transparent border-none outline-none text-sm w-full"
                         value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                       />
                    </div>
                    {searchQuery.length > 1 && (
                      <div className="absolute top-full left-0 mt-2 w-full bg-white rounded shadow-xl border border-stone-200 py-2 z-50 max-h-64 overflow-y-auto">
                         {filteredVerses.map(v => (
                            <button key={v.id} onClick={() => { setCurrentVerse(v); setSearchQuery(''); }} className="w-full text-left px-4 py-2 hover:bg-ochre-50 text-sm">
                               {v.id} - {v.sanskrit}
                            </button>
                         ))}
                      </div>
                    )}
                 </div>
              </div>
              <div className="flex items-center space-x-2">
                 <GlobalHeaderButtons theme="light" darkMode={darkMode} setDarkMode={setDarkMode} onOpenInfo={() => setIsInfoOpen(true)} />
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
              <div className="flex-1 overflow-y-auto bg-stone-50 scroll-smooth">
                 <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12 mb-8 relative">
                       <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-8">
                          <button onClick={handlePrevVerse} disabled={allVerses[0]?.id === currentVerse.id} className="hover:text-ochre-600 disabled:opacity-20 flex items-center transition-colors"><ChevronLeft size={16} className="mr-1"/> Prev</button>
                          <span>{currentVerse.id}</span>
                          <button onClick={handleNextVerse} disabled={allVerses[allVerses.length-1]?.id === currentVerse.id} className="hover:text-ochre-600 disabled:opacity-20 flex items-center transition-colors">Next <ChevronRight size={16} className="ml-1"/></button>
                       </div>
                       
                       <div className="text-center mb-8">
                         <h1 className="font-deva text-4xl md:text-6xl text-stone-800 mb-6 leading-relaxed">{currentVerse.sanskrit}</h1>
                         <p className="font-serif text-xl text-stone-500 italic mb-6">{currentVerse.transliteration}</p>
                         
                         <div className="flex justify-center mb-6">
                            <button 
                               onClick={() => toggleBookmark(selectedBook.id, currentVerse.id)}
                               className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${isBookmarked(selectedBook.id, currentVerse.id) ? 'bg-ochre-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                            >
                               <BookmarkIcon size={14} className={`mr-2 ${isBookmarked(selectedBook.id, currentVerse.id) ? 'fill-current' : ''}`} />
                               {isBookmarked(selectedBook.id, currentVerse.id) ? 'Saved' : 'Save'}
                            </button>
                         </div>

                         {availableLanguages.length > 1 && (
                           <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="bg-stone-100 p-1 rounded-lg inline-flex shadow-inner">
                                 {availableLanguages.map(lang => (
                                    <button
                                       key={lang}
                                       onClick={() => setContentLang(lang)}
                                       className={`px-6 py-1.5 text-sm font-bold rounded-md transition-all ${contentLang === lang ? 'bg-white text-ochre-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                       {lang}
                                    </button>
                                 ))}
                              </div>
                           </div>
                         )}
                       </div>

                       {sutrarthData && sutrarthData.activeItem && (
                          <div className="mt-10 pt-8 border-t border-stone-100">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center text-stone-800 text-lg font-bold font-serif">
                                   <BookOpen size={20} className="mr-2 text-ochre-600" /> Sutrarth (Literal)
                                </div>
                             </div>
                             <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 transition-all duration-300">
                                <p className={`text-stone-800 leading-relaxed text-lg ${isDevanagari(sutrarthData.activeItem.language) ? 'font-deva' : 'font-serif'}`}>
                                    {sutrarthData.activeItem.text}
                                </p>
                                <p className="text-xs text-stone-400 mt-3 text-right flex justify-end items-center">
                                   <span className="w-4 h-px bg-stone-300 mr-2"></span> {sutrarthData.activeItem.author}
                                </p>
                             </div>
                          </div>
                       )}

                       {bhavarthData && bhavarthData.activeItem && (
                          <div className="mt-10 pt-8 border-t border-stone-100">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center text-stone-800 text-lg font-bold font-serif">
                                   <Globe size={20} className="mr-2 text-ochre-600" /> Bhavarth (Summary)
                                </div>
                             </div>
                             <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 transition-all duration-300">
                                <p className={`text-stone-800 leading-relaxed text-lg ${isDevanagari(bhavarthData.activeItem.language) ? 'font-deva' : 'font-serif'}`}>
                                    {bhavarthData.activeItem.text}
                                </p>
                                <p className="text-xs text-stone-400 mt-3 text-right flex justify-end items-center">
                                   <span className="w-4 h-px bg-stone-300 mr-2"></span> {bhavarthData.activeItem.author}
                                </p>
                             </div>
                          </div>
                       )}
                    </div>

                    {currentVerse.commentaries && currentVerse.commentaries.length > 0 && (
                      <div>
                         <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2">
                            <h3 className="text-xl font-serif font-bold text-stone-800 mb-2 md:mb-0">Bhasya (Commentary)</h3>
                            <div className="flex flex-wrap gap-2">
                               {currentVerse.commentaries.map(c => (
                                  <button
                                     key={c.id}
                                     onClick={() => toggleBhasyaSelection(c.id)}
                                     className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${selectedBhasyaIds.includes(c.id) ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
                                  >
                                     {c.author}
                                  </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-6">
                            {selectedBhasyaIds.length > 0 ? (
                               currentVerse.commentaries
                                  .filter(c => selectedBhasyaIds.includes(c.id))
                                  .map(c => (
                                     <CommentaryCard key={c.id} commentary={c} />
                                  ))
                            ) : (
                               <div className="text-center p-8 bg-stone-50 rounded-xl border border-stone-200 border-dashed">
                                  <Filter className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                                  <p className="text-stone-400 italic">Select commentaries from above to view.</p>
                               </div>
                            )}
                         </div>
                      </div>
                    )}
                 </div>
              </div>
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