import React, { useState, useEffect } from 'react';
import { Bookmark, Verse, Book } from '../types';
import { X, Bookmark as BookmarkIcon, Trash2, ArrowRight, Loader2, Search, Edit2, Check, StickyNote } from 'lucide-react';
import { getVerseById, getBookMetadata } from '../services/library';
import { fuzzyMatch } from '../services/searchUtils';

interface BookmarksPanelProps {
  bookmarks: Bookmark[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBookmark: (bookId: string, verseId: string) => void;
  onRemoveBookmark: (bookId: string, verseId: string) => void;
  onUpdateBookmark: (bookId: string, verseId: string, note: string) => void;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({
  bookmarks,
  isOpen,
  onClose,
  onSelectBookmark,
  onRemoveBookmark,
  onUpdateBookmark,
}) => {
  const [hydratedBookmarks, setHydratedBookmarks] = useState<{bm: Bookmark, verse: Verse | undefined, book: Book | undefined}[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');

  useEffect(() => {
    if (isOpen && bookmarks.length > 0) {
      setLoading(true);
      const fetchDetails = async () => {
        const promises = bookmarks.map(async (bm) => {
            const book = getBookMetadata(bm.bookId);
            const verse = await getVerseById(bm.bookId, bm.verseId);
            return { bm, verse, book };
        });
        const results = await Promise.all(promises);
        results.sort((a,b) => b.bm.timestamp - a.bm.timestamp);
        setHydratedBookmarks(results);
        setLoading(false);
      };
      fetchDetails();
    } else if (isOpen && bookmarks.length === 0) {
        setHydratedBookmarks([]);
    }
  }, [isOpen, bookmarks]);

  const startEditing = (id: string, currentNote?: string) => {
      setEditingId(id);
      setTempNote(currentNote || '');
  };

  const saveNote = (bookId: string, verseId: string) => {
      onUpdateBookmark(bookId, verseId, tempNote);
      setEditingId(null);
  };

  const filteredBookmarks = hydratedBookmarks.filter(({ bm, verse, book }) => {
     if (!verse || !book) return false;
     return fuzzyMatch(
       searchQuery,
       book.title,
       verse.sanskrit,
       verse.id,
       verse.transliteration,
       bm.note,
       ...(verse.sutrarth?.map(s => s.text) || []),
       ...(verse.summary?.map(s => s.text) || [])
     );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
       <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
       <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
             <div className="flex items-center space-x-2 text-stone-800">
                <BookmarkIcon className="w-5 h-5 text-ochre-600 fill-ochre-600" />
                <h2 className="font-serif font-bold text-lg">My Bookmarks</h2>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-stone-100 bg-white">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Search bookmarks or notes..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-ochre-400 focus:ring-1 focus:ring-ochre-100 transition-all"
                />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
             {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                   <BookmarkIcon className="w-12 h-12 mb-3 opacity-20" />
                   <p>No bookmarks yet.</p>
                </div>
             ) : loading ? (
                 <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p className="text-xs">Loading saved verses...</p>
                 </div>
             ) : filteredBookmarks.length === 0 ? (
                 <div className="text-center py-8 text-stone-400 text-sm">
                    No bookmarks match your search.
                 </div>
             ) : (
                filteredBookmarks.map(({ bm, verse, book }) => {
                   if (!book || !verse) return null;
                   const uniqueId = `${bm.bookId}-${bm.verseId}`;
                   const isEditing = editingId === uniqueId;

                   return (
                      <div key={uniqueId} className="group bg-white border border-stone-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-ochre-600 bg-ochre-50 px-2 py-1 rounded">{book.title}</span>
                            <div className="flex items-center space-x-1">
                                {!isEditing && (
                                    <button 
                                        onClick={() => startEditing(uniqueId, bm.note)} 
                                        className="p-1.5 text-stone-300 hover:text-stone-600 hover:bg-stone-100 rounded-md transition-colors"
                                        title="Add/Edit Note"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemoveBookmark(bm.bookId, bm.verseId); }} 
                                    className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    title="Remove Bookmark"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                         </div>
                         
                         <h3 className="font-deva text-xl text-stone-800 mb-1 leading-snug">{verse.sanskrit}</h3>
                         <div className="flex items-center justify-between mt-2">
                             <span className="text-xs text-stone-500 font-mono">Verse {verse.id}</span>
                             <button onClick={() => { onSelectBookmark(bm.bookId, bm.verseId); onClose(); }} className="flex items-center text-xs font-semibold text-ochre-700 hover:underline">
                                Read <ArrowRight size={12} className="ml-1" />
                             </button>
                         </div>

                         {/* Notes Section */}
                         <div className="mt-3 pt-3 border-t border-stone-50">
                            {isEditing ? (
                                <div className="space-y-2 animate-in fade-in duration-200">
                                    <textarea 
                                        value={tempNote}
                                        onChange={(e) => setTempNote(e.target.value)}
                                        placeholder="Add a personal note..."
                                        className="w-full text-sm p-2 border border-stone-200 rounded bg-stone-50 focus:bg-white focus:border-ochre-400 focus:outline-none min-h-[60px]"
                                        autoFocus
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 text-stone-500 hover:text-stone-800">Cancel</button>
                                        <button onClick={() => saveNote(bm.bookId, bm.verseId)} className="flex items-center text-xs bg-stone-800 text-white px-3 py-1 rounded hover:bg-stone-700">
                                            <Check size={12} className="mr-1" /> Save
                                        </button>
                                    </div>
                                </div>
                            ) : bm.note ? (
                                <div className="bg-yellow-50 p-2 rounded border border-yellow-100 text-sm text-stone-700 flex items-start gap-2">
                                    <StickyNote size={14} className="text-yellow-600 mt-0.5 shrink-0" />
                                    <p className="italic">{bm.note}</p>
                                </div>
                            ) : null}
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