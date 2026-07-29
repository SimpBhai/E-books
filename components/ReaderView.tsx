import React, { useState, useEffect } from 'react';
import { Verse, Book, ContentText, Commentary } from '../types';
import CommentaryCard from './CommentaryCard';
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, BookOpen, Globe, Filter, ShieldCheck, Sparkles, Loader2, ScrollText } from 'lucide-react';

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
  const [dynamicBhasya, setDynamicBhasya] = useState<Commentary | null>(null);
  const [isLoadingBhasya, setIsLoadingBhasya] = useState<boolean>(false);

  // Fetch or generate dynamic Bhashya when verse changes or when static commentaries are missing
  const fetchClassicalBhasya = async () => {
    setIsLoadingBhasya(true);
    try {
      const res = await fetch('/api/bhasya', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sutraId: verse.id,
          sanskrit: verse.sanskrit,
          transliteration: verse.transliteration,
          sutrarth: verse.sutrarth,
          bookTitle: book.title
        })
      });
      if (!res.ok) throw new Error('Failed to fetch Bhasya');
      const data: Commentary = await res.json();
      setDynamicBhasya(data);
      setSelectedBhasyaIds(prev => prev.includes(data.id) ? prev : [...prev, data.id]);
    } catch (err) {
      console.error('Error fetching Bhasya:', err);
    } finally {
      setIsLoadingBhasya(false);
    }
  };

  // Reset local view state when verse changes
  useEffect(() => {
    setDynamicBhasya(null);
    setIsLoadingBhasya(false);

    if (verse.commentaries && verse.commentaries.length > 0) {
      setSelectedBhasyaIds([verse.commentaries[0].id]);
    } else {
      setSelectedBhasyaIds([]);
      // Auto fetch Bhasya if no static commentaries exist
      fetchClassicalBhasya();
    }
  }, [verse.id]);

  const isDevanagari = (lang: string) => lang === 'Hindi' || lang === 'Sanskrit';

  const getActiveContent = (items: ContentText[] | undefined) => {
    if (!items || items.length === 0) return null;
    let activeItem = items.find(i => i.language === contentLang);
    if (!activeItem) activeItem = items[0]; // Fallback
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

  const allCommentaries: Commentary[] = [
    ...(verse.commentaries || []),
    ...(dynamicBhasya && !verse.commentaries?.some(c => c.id === dynamicBhasya.id) ? [dynamicBhasya] : [])
  ];

  const activeCommentaries = allCommentaries.filter(c => selectedBhasyaIds.includes(c.id));

  const isFirst = allVerses[0]?.id === verse.id;
  const isLast = allVerses[allVerses.length - 1]?.id === verse.id;

  return (
    <div className="flex-1 overflow-y-auto bg-stone-50 scroll-smooth">
      <div className="max-w-4xl mx-auto px-6 py-12 pb-24">
        
        {/* Navigation Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-12 mb-8 relative">
          <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-8">
            <button 
              onClick={() => onNavigateVerse('prev')} 
              disabled={isFirst} 
              className="hover:text-ochre-600 disabled:opacity-20 flex items-center transition-colors"
            >
              <ChevronLeft size={16} className="mr-1"/> Prev
            </button>
            
            <div className="flex flex-col items-center">
              <span>{book.title} {verse.id}</span>
              {verse.isVerified && (
                <span className="text-[10px] text-green-600 flex items-center mt-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <ShieldCheck size={10} className="mr-1" /> Verified
                </span>
              )}
            </div>

            <button 
              onClick={() => onNavigateVerse('next')} 
              disabled={isLast} 
              className="hover:text-ochre-600 disabled:opacity-20 flex items-center transition-colors"
            >
              Next <ChevronRight size={16} className="ml-1"/>
            </button>
          </div>
          
          {/* Main Verse Display */}
          <div className="text-center mb-8">
            <h1 className="font-deva text-4xl md:text-6xl text-stone-800 mb-6 leading-relaxed">
              {verse.sanskrit}
            </h1>
            <p className="font-serif text-xl text-stone-500 italic mb-6">
              {verse.transliteration}
            </p>
            
            <div className="flex justify-center mb-6">
              <button 
                onClick={onToggleBookmark}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  isBookmarked ? 'bg-ochre-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                <BookmarkIcon size={14} className={`mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Language Toggle */}
            {availableLanguages.length > 1 && (
              <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-stone-100 p-1 rounded-lg inline-flex shadow-inner">
                  {availableLanguages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setContentLang(lang)}
                      className={`px-6 py-1.5 text-sm font-bold rounded-md transition-all ${
                        contentLang === lang ? 'bg-white text-ochre-700 shadow-sm' : 'text-stone-400 hover:text-stone-600'
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
            <div className="mt-10 pt-8 border-t border-stone-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-stone-800 text-lg font-bold font-serif">
                  <BookOpen size={20} className="mr-2 text-ochre-600" /> Sutrarth
                </div>
              </div>
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 transition-all duration-300">
                <p className={`text-stone-800 leading-relaxed text-lg ${isDevanagari(activeSutrarth.language) ? 'font-deva' : 'font-serif'}`}>
                  {activeSutrarth.text}
                </p>
                <p className="text-xs text-stone-400 mt-3 text-right flex justify-end items-center">
                  <span className="w-4 h-px bg-stone-300 mr-2"></span> {activeSutrarth.author}
                </p>
              </div>
            </div>
          )}

          {/* Summary (Bhavarth) */}
          {activeSummary && (
            <div className="mt-10 pt-8 border-t border-stone-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center text-stone-800 text-lg font-bold font-serif">
                  <Globe size={20} className="mr-2 text-ochre-600" /> Bhavarth
                </div>
              </div>
              <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 transition-all duration-300">
                <p className={`text-stone-800 leading-relaxed text-lg ${isDevanagari(activeSummary.language) ? 'font-deva' : 'font-serif'}`}>
                  {activeSummary.text}
                </p>
                <p className="text-xs text-stone-400 mt-3 text-right flex justify-end items-center">
                  <span className="w-4 h-px bg-stone-300 mr-2"></span> {activeSummary.author}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Commentaries Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2">
              <ScrollText size={22} className="text-ochre-600" />
              <h3 className="text-2xl font-serif font-bold text-stone-800">Bhasya (Commentary)</h3>
            </div>

            {allCommentaries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {allCommentaries.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleBhasya(c.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                      selectedBhasyaIds.includes(c.id) 
                        ? 'bg-stone-800 text-white border-stone-800 shadow-sm' 
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {c.author}
                  </button>
                ))}
                {!dynamicBhasya && (
                  <button
                    onClick={fetchClassicalBhasya}
                    disabled={isLoadingBhasya}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border bg-ochre-50 text-ochre-700 border-ochre-200 hover:bg-ochre-100 flex items-center gap-1.5 transition-all"
                  >
                    {isLoadingBhasya ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Generate Deep Bhashya
                  </button>
                )}
              </div>
            )}
          </div>

          {isLoadingBhasya ? (
            <div className="bg-stone-50 p-8 rounded-xl border border-stone-200 text-center text-stone-500">
              <Loader2 size={32} className="animate-spin text-ochre-600 mx-auto mb-3" />
              <p className="font-serif text-lg text-stone-700 font-medium">Loading Classical Bhashya Exposition...</p>
              <p className="text-xs text-stone-400 mt-1">Retrieving Vyasa Bhashya and traditional commentary breakdown</p>
            </div>
          ) : activeCommentaries.length > 0 ? (
            <div className="space-y-6">
              {activeCommentaries.map(c => (
                <CommentaryCard key={c.id} commentary={c} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-stone-50 rounded-xl border border-stone-200 border-dashed">
              <ScrollText className="mx-auto h-10 w-10 text-stone-300 mb-3" />
              <p className="text-stone-700 font-serif font-bold text-lg mb-1">Classical Bhashya</p>
              <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
                No pre-loaded commentary selected. Load Maharshi Vyasa's classical Bhashya exposition for this sutra.
              </p>
              <button
                onClick={fetchClassicalBhasya}
                className="px-6 py-2.5 bg-ochre-600 hover:bg-ochre-700 text-white text-sm font-bold rounded-lg shadow transition-all inline-flex items-center gap-2"
              >
                <Sparkles size={16} /> Load Classical Bhashya Exposition
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReaderView;