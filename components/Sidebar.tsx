import React, { useState, useCallback, memo } from 'react';
import { Chapter, Verse, Book as BookType } from '../types';
import { ChevronRight, ChevronDown, Book, ArrowLeft, ChevronsUp, Layers } from 'lucide-react';

interface SidebarProps {
  activeBook: BookType;
  chapters: Chapter[];
  currentVerse: Verse | null;
  onSelectVerse: (verse: Verse) => void;
  onBackToLibrary: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Optimized Verse List
const VerseList = memo(({ 
  verses, 
  currentVerseId, 
  onSelect 
}: { 
  verses: Verse[], 
  currentVerseId?: string, 
  onSelect: (v: Verse) => void 
}) => {
  if (verses.length === 0) {
    return <div className="px-3 py-2 text-xs text-stone-400 italic pl-8">No verses available</div>;
  }

  return (
    <div className="ml-5 border-l border-stone-200 dark:border-stone-700 my-1">
      {verses.map((verse) => {
        const isActive = currentVerseId === verse.id;
        return (
          <button 
            key={verse.id} 
            onClick={() => onSelect(verse)} 
            className={`w-full text-left px-3 py-2 text-xs transition-colors duration-200 flex items-baseline ${
              isActive 
                ? 'bg-ochre-50 dark:bg-ochre-900/20 text-ochre-900 dark:text-ochre-100 font-bold border-l-2 border-ochre-500 -ml-[1px]' 
                : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 border-l-2 border-transparent'
            }`}
          >
            <span className="w-8 shrink-0 opacity-50 font-mono text-[10px]">{verse.id}</span>
            <span className="font-deva tracking-wide truncate">{verse.sanskrit}</span>
          </button>
        );
      })}
    </div>
  );
});

const Sidebar: React.FC<SidebarProps> = ({ 
  activeBook, 
  chapters, 
  currentVerse, 
  onSelectVerse, 
  onBackToLibrary, 
  isOpen, 
  setIsOpen 
}) => {
  const [expandedChapters, setExpandedChapters] = useState<number[]>([1]);
  const [expandedSections, setExpandedSections] = useState<string[]>(["1.1"]); 

  const toggleChapter = useCallback((id: number) => {
    setExpandedChapters(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }, []);

  const toggleSection = useCallback((cId: number, sId: number) => {
    const key = `${cId}.${sId}`;
    setExpandedSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedChapters([]);
    setExpandedSections([]);
  }, []);

  const handleVerseSelect = useCallback((verse: Verse) => {
    onSelectVerse(verse);
    // Auto-close on mobile only
    if (window.matchMedia("(max-width: 768px)").matches) {
      setIsOpen(false);
    }
  }, [onSelectVerse, setIsOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)} 
      />
      
      <aside className={`
        fixed left-0 top-0 bottom-0 z-30 w-72 
        bg-stone-50 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800
        flex flex-col 
        transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen
      `}>
        
        {/* Header */}
        <div className="flex flex-col bg-white dark:bg-stone-900 shrink-0 border-b border-stone-200 dark:border-stone-800">
           <button 
             onClick={onBackToLibrary} 
             className="flex items-center px-6 py-4 text-xs font-bold text-stone-500 hover:text-ochre-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 uppercase tracking-wider transition-colors border-b border-stone-100 dark:border-stone-800"
           >
             <ArrowLeft size={12} className="mr-2" /> Back to Library
           </button>
           <div className="h-16 flex items-center justify-between px-6">
              <div className="flex items-center min-w-0">
                <Book className="w-5 h-5 text-ochre-600 mr-2 shrink-0" />
                <span className="font-serif font-bold text-lg text-stone-800 dark:text-stone-100 tracking-tight truncate" title={activeBook.title}>
                  {activeBook.title}
                </span>
              </div>
              <button 
                onClick={handleCollapseAll} 
                className="p-1.5 ml-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
                title="Collapse All"
              >
                <ChevronsUp size={16} />
              </button>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-700">
          {chapters.length > 0 ? chapters.map((chapter) => {
            const isChapterExpanded = expandedChapters.includes(chapter.id);
            return (
              <div key={chapter.id} className="select-none">
                <button 
                  onClick={() => toggleChapter(chapter.id)} 
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isChapterExpanded 
                      ? 'bg-white dark:bg-stone-800 text-ochre-800 dark:text-ochre-100 shadow-sm' 
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className="text-left font-serif">{chapter.title}</span>
                  {isChapterExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {isChapterExpanded && (
                  <div className="mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {activeBook.structure?.hasSections ? (
                        chapter.sections.map((section) => {
                          const sectionKey = `${chapter.id}.${section.id}`;
                          const isSectionExpanded = expandedSections.includes(sectionKey);
                          return (
                            <div key={section.id}>
                              <button 
                                onClick={() => toggleSection(chapter.id, section.id)} 
                                className={`w-full flex items-center justify-between py-1.5 pl-6 pr-2 text-xs rounded transition-colors ${
                                  isSectionExpanded ? 'text-ochre-700 dark:text-ochre-300 font-semibold' : 'text-stone-500 dark:text-stone-500 hover:text-stone-800'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Layers size={12} className="opacity-50"/>
                                  <span>{section.title}</span>
                                </div>
                                <span className="text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 rounded-full min-w-[1.5rem] text-center">{section.verses.length}</span>
                              </button>
                              
                              {isSectionExpanded && (
                                <VerseList 
                                  verses={section.verses} 
                                  currentVerseId={currentVerse?.id} 
                                  onSelect={handleVerseSelect} 
                                />
                              )}
                            </div>
                          );
                        })
                    ) : (
                        <VerseList 
                          verses={chapter.sections.flatMap(s => s.verses)} 
                          currentVerseId={currentVerse?.id} 
                          onSelect={handleVerseSelect} 
                        />
                    )}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="p-8 text-center text-sm text-stone-400 italic">
               No chapters available for this text.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
