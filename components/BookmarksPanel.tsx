import React from 'react';
import { Bookmark, Verse, Book } from '../types';
import { X, Bookmark as BookmarkIcon, Trash2, ArrowRight } from 'lucide-react';

interface BookmarksPanelProps {
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBookmark: (bookId: string, verseId: string) => void;
  onRemoveBookmark: (bookId: string, verseId: string) => void;
  getBookDetails: (bookId: string) => Book | undefined;
  getVerseDetails: (bookId: string, verseId: string) => Verse | undefined;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  bookmarks,
  isOpen,
  onClose,
  onSelectBookmark,
  onRemoveBookmark,
  getBookDetails,
  getVerseDetails
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
       <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
       <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
             <div className="flex items-center space-x-2 text-stone-800">
                <BookmarkIcon className="w-5 h-5 text-ochre-600 fill-ochre-600" />
                <h2 className="font-serif font-bold text-lg">My Bookmarks</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                   <BookmarkIcon className="w-12 h-12 mb-3 opacity-20" />
                   <p>No bookmarks yet.</p>
                </div>
             ) : (
                bookmarks.sort((a,b) => b.timestamp - a.timestamp).map((bm) => {
                   const book = getBookDetails(bm.bookId);
                   const verse = getVerseDetails(bm.bookId, bm.verseId);
                   
                   if (!book || !verse) return null;

                   return (
                      <div key={`${bm.bookId}-${bm.verseId}`} className="group bg-white border border-stone-200 rounded-lg p-4 hover:border-ochre-300 hover:shadow-md transition-all">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ochre-600 bg-ochre-50 px-2 py-1 rounded">{book.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); onRemoveBookmark(bm.bookId, bm.verseId); }} className="text-stone-300 hover:text-red-500 transition-colors">
                               <Trash2 size={16} />
                            </button>
                         </div>
                         <h3 className="font-deva text-xl text-stone-800 mb-1">{verse.sanskrit}</h3>
                         <div className="flex items-center justify-between mt-3">
                             <span className="text-xs text-stone-500 font-mono">Verse {verse.id}</span>
                             <button onClick={() => { onSelectBookmark(bm.bookId, bm.verseId); onClose(); }} className="flex items-center text-xs font-semibold text-ochre-700 hover:underline">
                                Read <ArrowRight size={12} className="ml-1" />
                             </button>
                         </div>
                      </div>
                   )
                })
             )}
          </div>
       </div>
    </div>
  );
};

export default BookmarksPanel;
