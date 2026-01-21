import React, { useState, useEffect } from 'react';
import { Verse, Chapter, Book, Bookmark, ContentText } from './types';
import { getAvailableBooks, getBookContent, getAllVerses, getBookMetadata, getVerseById } from './services/library';
import Sidebar from './components/Sidebar';
import BookmarksPanel from './components/BookmarksPanel';
import CommentaryCard from './components/CommentaryCard';
import CMSPanel from './components/CMSPanel';
import { Menu, Search, Moon, Sun, ChevronLeft, ChevronRight, Share2, Library, ArrowRight, Bookmark as BookmarkIcon, Check, Filter, BookOpen, Globe, Edit3, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoadingBook, setIsLoadingBook] = useState(false);
  
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
  const [isCMSOpen, setIsCMSOpen] = useState(false); // CMS State
  
  const [searchQuery, setSearchQuery] = useState('');
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
    const loadBook = async () => {
      if (selectedBook) {
        setIsLoadingBook(true);
        try {
          const bookChapters = await getBookContent(selectedBook.id);
          const bookVerses = await getAllVerses(selectedBook.id);
          
          setChapters(bookChapters);
          setAllVerses(bookVerses);
          
          // Select first verse by default if none is selected
          if (bookVerses.length > 0 && !currentVerse) {
            setCurrentVerse(bookVerses[0]);
          }
        } catch (error) {
          console.error("Error loading book:", error);
        } finally {
          setIsLoadingBook(false);
        }
      } else {
        setChapters([]);
        setAllVerses([]);
        setCurrentVerse(null);
      }
    };

    loadBook();
  }, [selectedBook]);

  // Reset View selections when verse changes
  useEffect(() => {
    if (currentVerse) {
      // Default Bhasya (Commentary)
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
      // 1. Set book (triggers loading effect)
      setSelectedBook(book);
      
      // 2. Fetch specific verse asynchronously (might be faster than full load)
      // Note: The useEffect will also fire, but this ensures we target the specific verse
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

  const filteredVerses = selectedBook && searchQuery.length > 1
    ? allVerses.filter(v => v.sanskrit.includes(searchQuery) || v.id.includes(searchQuery))
    : [];

  // Helper to get active content
  const getActiveContent = (items: ContentText[] | undefined, preferredLang: string) => {
    if (!items || items.length === 0) return null;
    const availableLangs = Array.from(new Set(items.map(i => i.language)));
    
    // Priority: Preferred Language -> First Available
    let activeItem = items.find(i => i.language === preferredLang);
    if (!activeItem && availableLangs.length > 0) {
      activeItem = items[0];
    }
    
    return { activeItem, availableLangs };
  };

  // Helper to check if text is Devanagari (Hindi/Sanskrit) for font selection
  const isDevanagari = (lang: string) => {
    return lang === 'Hindi' || lang === 'Sanskrit';
  };

  // Reader Content Preparation
  const sutrarthData = currentVerse ? getActiveContent(currentVerse.sutrarth, contentLang) : null;
  const bhavarthData = currentVerse ? getActiveContent(currentVerse.summary, contentLang) : null;

  // Derive all available languages
  const availableLanguages = currentVerse ? Array.from(new Set([
    ...(currentVerse.sutrarth?.map(s => s.language) || []),
    ...(currentVerse.summary?.map(s => s.language) || [])
  ])).sort() : [];

  // --- RENDER ---
  
  return (
    <div className={`min-h-screen w-full flex flex-col ${darkMode ? 'dark bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-900'}`}>
      
      {/* Global Modals */}
      <CMSPanel isOpen={isCMSOpen} onClose={() => setIsCMSOpen(false)} books={books} />
      
      <BookmarksPanel 
        bookmarks={bookmarks}
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onSelectBookmark={handleBookmarkNavigation}
        onRemoveBookmark={toggleBookmark}
      />

      {/* VIEW: LIBRARY */}
      {!selectedBook ? (
        <>
        <header className="h-20 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 md:px-12">
           <div className="flex items-center space-x-3">
             <div className="p-2 bg-ochre-600 rounded-lg text-white">
                <Library size={24} />
             </div>
             <div>
               <h1 className="font-serif font-bold text-2xl text-stone-800">SutraLibrary</h1>
             </div>
           </div>
           <div className="flex items-center space-x-4">
              <button onClick={() => setIsCMSOpen(true)} className="text-stone-400 hover:text-ochre-700 flex items-center gap-1 text-sm font-medium" title="Contributor Access">
                 <Edit3 size={18} /> <span className="hidden md:inline">Contribute</span>
              </button>
              <button onClick={() => setIsBookmarksOpen(true)} className="text-stone-600 hover:text-ochre-700">
                <BookmarkIcon size={20} />
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="text-stone-400 hover:text-stone-600">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
           </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-12 py-12 flex-1">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map(book => (
                <div key={book.id} onClick={() => setSelectedBook(book)} className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-xl cursor-pointer p-8 flex flex-col">
                   <span className="text-xs font-bold uppercase tracking-wider text-ochre-600 mb-2">{book.category}</span>
                   <h3 className="font-serif text-2xl font-bold text-stone-800 mb-2">{book.title}</h3>
                   <p className="text-stone-400 text-sm mb-4">by {book.author}</p>
                   <p className="text-stone-600 text-sm mb-6 flex-1">{book.description}</p>
                   <div className="flex items-center text-ochre-600 font-bold text-sm">Start Reading <ArrowRight size={16} className="ml-2" /></div>
                </div>
              ))}
           </div>
        </main>
        </>
      ) : (
        /* VIEW: READER */
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
                         type="text" placeholder="Search..." 
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
                 <button onClick={() => setIsCMSOpen(true)} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-ochre-700" title="Contribute">
                    <Edit3 size={18} />
                 </button>
                 <button onClick={() => setIsBookmarksOpen(true)} className="p-2 hover:bg-stone-100 rounded-full"><BookmarkIcon size={20} className="text-stone-500" /></button>
                 <button onClick={handleShare} className="p-2 hover:bg-stone-100 rounded-full">{copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} className="text-stone-500" />}</button>
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
                    
                    {/* Unified Main Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12 mb-8 relative">
                       
                       {/* Card Header (Nav) */}
                       <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-8">
                          <button onClick={handlePrevVerse} disabled={allVerses[0]?.id === currentVerse.id} className="hover:text-ochre-600 disabled:opacity-20 flex items-center"><ChevronLeft size={16} className="mr-1"/> Prev</button>
                          <span>{currentVerse.id}</span>
                          <button onClick={handleNextVerse} disabled={allVerses[allVerses.length-1]?.id === currentVerse.id} className="hover:text-ochre-600 disabled:opacity-20 flex items-center">Next <ChevronRight size={16} className="ml-1"/></button>
                       </div>
                       
                       {/* Main Verse Content */}
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

                         {/* UNIFIED LANGUAGE TOGGLE */}
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

                       {/* Sutrarth (Literal Meaning) Section */}
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

                       {/* Bhavarth (Summary) Section */}
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

                    {/* Bhasya (Commentary) - Outside Card */}
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
