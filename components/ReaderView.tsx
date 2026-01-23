import React, { useState, useEffect } from 'react';
import { Verse, Book, ContentText } from '../types';
import CommentaryCard from './CommentaryCard';
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, BookOpen, Globe, Filter, ShieldCheck, Link, Check } from 'lucide-react';

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
  const [linkCopied, setLinkCopied] = useState(false);

  // Reset local view state when verse changes
  useEffect(() => {
    setLinkCopied(false);
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
    if (!activeItem) activeItem = items[0]; // Fallback
    return activeItem;
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}?book=${book.id}&verse=${verse.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
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
            
            <div className="flex justify-center mb-6 gap-3">
              <button 
                onClick={onToggleBookmark}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  isBookmarked ? 'bg-ochre-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                <BookmarkIcon size={14} className={`mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              
              <button 
                onClick={handleCopyLink}
                className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  linkCopied ? 'bg-green-600 text-white shadow-sm' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {linkCopied ? <Check size={14} className="mr-2" /> : <Link size={14} className="mr-2" />}
                {linkCopied ? 'Copied' : 'Link'}
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
        {verse.commentaries && verse.commentaries.length > 0 && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-2 md:mb-0">Bhasya (Commentary)</h3>
              <div className="flex flex-wrap gap-2">
                {verse.commentaries.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleBhasya(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border transition-all ${
                      selectedBhasyaIds.includes(c.id) 
                        ? 'bg-stone-800 text-white border-stone-800' 
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
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
  );
};

export default ReaderView;