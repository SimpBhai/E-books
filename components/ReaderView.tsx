import React, { useState, useEffect } from 'react';
import { Verse, Book, ContentText } from '../types';
import CommentaryCard from './CommentaryCard';
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, BookOpen, Globe, Filter, ShieldCheck, Type } from 'lucide-react';

interface ReaderViewProps {
  book: Book;
  verse: Verse;
  allVerses: Verse[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onNavigateVerse: (direction: 'next' | 'prev') => void;
}

const ReaderView: React.FC<ReaderViewProps> = ({ 
  book, 
  verse, 
  allVerses, 
  isBookmarked, 
  onToggleBookmark, 
  onNavigateVerse 
}) => {
  const [contentLang, setContentLang] = useState<string>('English');
  const [selectedBhasyaIds, setSelectedBhasyaIds] = useState<string[]>([]);

  // Reset local view state when verse changes
  useEffect(() => {
    if (verse.commentaries && verse.commentaries.length > 0) {
      setSelectedBhasyaIds([verse.commentaries[0].id]);
    } else {
      setSelectedBhasyaIds([]);
    }
  }, [verse.id]);

  const isDevanagari = (lang: string) => lang === 'Hindi' || lang === 'Sanskrit';

  const getActiveContent = (items: ContentText[] | undefined) => {
    if (!items || items.length === 0) return null;
    let activeItem = items.find(i => i.language === contentLang);
    if (!activeItem) activeItem = items[0]; // Fallback to first available
    return activeItem;
  };

  const availableLanguages = Array.from(new Set([
    ...(verse.sutrarth?.map(s => s.language) || []),
    ...(verse.summary?.map(s => s.language) || [])
  ])).sort();

  const activeSutrarth = getActiveContent(verse.sutrarth);
  const activeSummary = getActiveContent(verse.summary);

  const toggleBhasya = (id: string) => {
    setSelectedBhasyaIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isFirst = allVerses[0]?.id === verse.id;
  const isLast = allVerses[allVerses.length - 1]?.id === verse.id;

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-950 scroll-smooth">
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
        
        {/* Navigation Header */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 p-8 md:p-12 mb-8 relative">
          <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 select-none">
            <button 
              onClick={() => onNavigateVerse('prev')} 
              disabled={isFirst} 
              className="hover:text-ochre-600 disabled:opacity-20 flex items-center transition-colors px-2 py-1 rounded hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              <ChevronLeft size={16} className="mr-1"/> Prev
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-stone-500 dark:text-stone-400">{book.title} {verse.id}</span>
              {verse.isVerified && (
                <span className="text-[10px] text-green-600 dark:text-green-400 flex items-center mt-1 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800/30">
                  <ShieldCheck size={10} className="mr-1" /> Verified
                </span>
              )}
            </div>

            <button 
              onClick={() => onNavigateVerse('next')} 
              disabled={isLast} 
              className="hover:text-ochre-600 disabled:opacity-20 flex items-center transition-colors px-2 py-1 rounded hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              Next <ChevronRight size={16} className="ml-1"/>
            </button>
          </div>
          
          {/* Main Verse Display */}
          <div className="text-center mb-8">
            <h1 className="font-deva text-4xl md:text-5xl lg:text-6xl text-stone-800 dark:text-stone-100 mb-6 leading-relaxed drop-shadow-sm">
              {verse.sanskrit}
            </h1>
            <p className="font-serif text-xl text-stone-500 dark:text-stone-400 italic mb-8">
              {verse.transliteration}
            </p>
            
            <div className="flex justify-center mb-8">
              <button 
                onClick={onToggleBookmark}
                className={`inline-flex items-center px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md ${
                  isBookmarked 
                    ? 'bg-ochre-600 text-white hover:bg-ochre-700' 
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <BookmarkIcon size={14} className={`mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>

            {/* Language Toggle */}
            {availableLanguages.length > 1 && (
              <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-stone-100 dark:bg-stone-800 p-1 rounded-lg inline-flex shadow-inner">
                  {availableLanguages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setContentLang(lang)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                        contentLang === lang 
                          ? 'bg-white dark:bg-stone-700 text-ochre-700 dark:text-ochre-200 shadow-sm' 
                          : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Word Meaning (Sutrarth) */}
          {activeSutrarth && (
            <div className="mt-10 pt-8 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-stone-800 dark:text-stone-200 text-lg font-bold font-serif">
                  <BookOpen size={20} className="mr-2 text-ochre-600" /> Word Meaning
                </div>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-100 dark:border-stone-800 transition-all duration-300">
                <p className={`text-stone-800 dark:text-stone-200 leading-relaxed text-lg ${isDevanagari(activeSutrarth.language) ? 'font-deva' : 'font-serif'}`}>
                  {activeSutrarth.text}
                </p>
                <p className="text-xs text-stone-400 mt-4 text-right flex justify-end items-center uppercase tracking-wide">
                   Source: {activeSutrarth.author}
                </p>
              </div>
            </div>
          )}

          {/* Summary (Bhavarth) */}
          {activeSummary && (
            <div className="mt-10 pt-8 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-stone-800 dark:text-stone-200 text-lg font-bold font-serif">
                  <Globe size={20} className="mr-2 text-ochre-600" /> Translation
                </div>
              </div>
              <div className="bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-100 dark:border-stone-800 transition-all duration-300">
                <p className={`text-stone-800 dark:text-stone-200 leading-relaxed text-lg ${isDevanagari(activeSummary.language) ? 'font-deva' : 'font-serif'}`}>
                  {activeSummary.text}
                </p>
                <p className="text-xs text-stone-400 mt-4 text-right flex justify-end items-center uppercase tracking-wide">
                   Source: {activeSummary.author}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Commentaries Section */}
        {verse.commentaries && verse.commentaries.length > 0 && (
          <div className="animate-in fade-in duration-500 delay-150">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2">
              <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-200 mb-2 md:mb-0 flex items-center">
                <Type className="mr-2 opacity-50" size={20}/> 
                Commentaries (Bhasya)
              </h3>
              <div className="flex flex-wrap gap-2">
                {verse.commentaries.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleBhasya(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                      selectedBhasyaIds.includes(c.id) 
                        ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-800 dark:border-stone-100' 
                        : 'bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {c.author}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {selectedBhasyaIds.length > 0 ? (
                verse.commentaries
                  .filter(c => selectedBhasyaIds.includes(c.id))
                  .map(c => <CommentaryCard key={c.id} commentary={c} />)
              ) : (
                <div className="text-center p-8 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 border-dashed opacity-75">
                  <Filter className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                  <p className="text-stone-400 italic">Select a commentator above to view their exposition.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderView;
