import React, { useState } from 'react';
import { Commentary } from '../types';
import { Globe } from 'lucide-react';

interface CommentaryCardProps {
  commentary: Commentary;
}

const CommentaryCard: React.FC<CommentaryCardProps> = ({ commentary }) => {
  // 'original' or the id of the translation
  const [activeViewId, setActiveViewId] = useState<string>('original');

  const activeContent = activeViewId === 'original' 
    ? { text: commentary.text, lang: commentary.language, author: commentary.author }
    : commentary.translations?.find(t => t.id === activeViewId);

  if (!activeContent) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-ochre-500"></div>
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 border-b border-stone-100 pb-3">
        <div className="flex items-center">
           <span className="font-serif font-bold text-lg text-stone-800 mr-2">{commentary.author}</span>
        </div>

        {/* Translation Tabs */}
        {commentary.translations && commentary.translations.length > 0 && (
          <div className="flex flex-wrap gap-1">
             <button
               onClick={() => setActiveViewId('original')}
               className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeViewId === 'original' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
             >
               {commentary.language} <span className="opacity-60">(Orig)</span>
             </button>
             {commentary.translations.map(t => (
               <button
                 key={t.id}
                 onClick={() => setActiveViewId(t.id)}
                 className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeViewId === t.id ? 'bg-ochre-600 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
               >
                 {t.language}
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="prose prose-stone max-w-none font-serif">
         <p className="text-stone-700 leading-relaxed whitespace-pre-line text-lg">
           {activeContent.text}
         </p>
      </div>

      {/* Footer Info (Translator credit if viewing translation) */}
      {activeViewId !== 'original' && activeContent && 'author' in activeContent && (
        <div className="mt-4 pt-3 border-t border-stone-50 flex justify-end">
           <span className="text-xs text-stone-400 italic flex items-center">
             <Globe size={12} className="mr-1" /> Translated by {activeContent.author}
           </span>
        </div>
      )}
    </div>
  );
};

export default CommentaryCard;