import React, { useState } from 'react';
import { Chapter, Verse, Book as BookType } from '../types';
import { ChevronRight, ChevronDown, Book, ArrowLeft, ChevronsUp } from 'lucide-react';

interface SidebarProps {
  activeBook: BookType;
  chapters: Chapter[];
  currentVerse: Verse | null;
  onSelectVerse: (verse: Verse) => void;
  onBackToLibrary: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeBook, chapters, currentVerse, onSelectVerse, onBackToLibrary, isOpen, setIsOpen }) => {
  const [expandedChapters, setExpandedChapters] = useState<number[]>([1]);
  const [expandedSections, setExpandedSections] = useState<string[]>(["1.1"]); 

  const toggleChapter = (id: number) => {
    setExpandedChapters(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleSection = (cId: number, sId: number) => {
    const key = `${cId}.${sId}`;
    setExpandedSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const collapseAll = () => {
    setExpandedChapters([]);
    setExpandedSections([]);
  };

  // Helper to render verse list
  const renderVerses = (verses: Verse[]) => (
     <div className="ml-2 space-y-0.5 mt-1 mb-2">
        {verses.length > 0 ? verses.map((verse) => (
            <button key={verse.id} onClick={() => { onSelectVerse(verse); if (window.innerWidth < 768) setIsOpen(false); }} className={`w-full text-left px-3 py-1.5 text-xs rounded border-l-2 transition-all ${currentVerse?.id === verse.id ? 'border-ochre-500 bg-white shadow-sm text-ochre-900 font-semibold' : 'border-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-800'}`}>
              <span className="mr-2 opacity-50">{verse.id}</span>
              <span className="font-deva">{verse.sanskrit}</span>
            </button>
          )) : <div className="px-3 py-2 text-xs text-stone-400 italic">No verses</div>}
     </div>
  );

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed left-0 top-0 bottom-0 z-30 w-72 bg-stone-50 border-r border-stone-200 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen`}>
        <div className="flex flex-col border-b border-stone-200 bg-white shrink-0">
           <button onClick={onBackToLibrary} className="flex items-center px-6 py-3 text-xs font-bold text-stone-500 hover:text-ochre-600 hover:bg-stone-50 uppercase tracking-wider transition-colors border-b border-stone-100">
             <ArrowLeft size={12} className="mr-1" /> Back to Library
           </button>
           <div className="h-14 flex items-center justify-between px-6">
              <div className="flex items-center min-w-0">
                <Book className="w-5 h-5 text-ochre-600 mr-2 shrink-0" />
                <span className="font-serif font-bold text-lg text-stone-800 tracking-tight truncate" title={activeBook.title}>{activeBook.title}</span>
              </div>
              <button onClick={collapseAll} className="p-1.5 ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"><ChevronsUp size={18} /></button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chapters.length > 0 ? chapters.map((chapter) => (
            <div key={chapter.id} className="select-none">
              <button onClick={() => toggleChapter(chapter.id)} className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-colors ${expandedChapters.includes(chapter.id) ? 'bg-ochre-50 text-ochre-800' : 'text-stone-600 hover:bg-stone-100'}`}>
                <span className="text-left">{chapter.title}</span>
                {expandedChapters.includes(chapter.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {expandedChapters.includes(chapter.id) && (
                <div className="ml-2 mt-1 pl-2 border-l border-stone-200 space-y-1">
                  {/* Conditional Rendering based on Structure Metadata */}
                  {activeBook.structure?.hasSections ? (
                      /* Standard: Render Sections then Verses */
                      chapter.sections.map((section) => {
                        const sectionKey = `${chapter.id}.${section.id}`;
                        const isExpanded = expandedSections.includes(sectionKey);
                        return (
                          <div key={section.id}>
                            <button onClick={() => toggleSection(chapter.id, section.id)} className={`w-full flex items-center justify-between py-1.5 px-2 text-sm rounded hover:text-ochre-700 transition-colors ${isExpanded ? 'text-ochre-700 font-medium' : 'text-stone-500'}`}>
                              <span>{section.title}</span>
                              <span className="text-xs text-stone-300">{section.verses.length}</span>
                            </button>
                            {isExpanded && renderVerses(section.verses)}
                          </div>
                        );
                      })
                  ) : (
                      /* Flat: Render Verses directly (skip Section accordion) */
                      renderVerses(chapter.sections.flatMap(s => s.verses))
                  )}
                </div>
              )}
            </div>
          )) : <div className="p-4 text-center text-sm text-stone-400 italic">No chapters available.</div>}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;