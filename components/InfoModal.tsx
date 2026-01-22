import React from 'react';
import { X, Heart, Github, Mail, Coffee } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-stone-100 bg-stone-50">
          <h2 className="font-serif font-bold text-xl text-stone-800">About SutraLibrary</h2>
          <button onClick={onClose} className="p-1 hover:bg-stone-200 rounded-full transition-colors">
            <X size={20} className="text-stone-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
           <div className="text-center">
              <div className="w-16 h-16 bg-ochre-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Heart className="text-ochre-600 fill-ochre-600" size={32} />
              </div>
              <h3 className="font-bold text-stone-800 text-lg mb-2">Support This Project</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                SutraLibrary is an open-source initiative to make ancient texts accessible. 
                Your donations help us add more books and translations.
              </p>
              <button className="mt-4 bg-ochre-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-ochre-700 transition-colors shadow-lg shadow-ochre-200 flex items-center justify-center mx-auto gap-2">
                 <Coffee size={16} /> Donate via UPI / PayPal
              </button>
           </div>

           <div className="border-t border-stone-100 pt-6">
              <h4 className="font-bold text-stone-800 mb-2">About</h4>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">
                 This platform mimics the structure of traditional manuscripts while providing modern tools like search, bookmarks, and multi-language commentary.
              </p>
              <div className="flex gap-4 justify-center">
                 <a href="#" className="flex items-center text-xs font-bold text-stone-500 hover:text-stone-900"><Github size={14} className="mr-1"/> GitHub</a>
                 <a href="mailto:contact@sanataniakhada.org" className="flex items-center text-xs font-bold text-stone-500 hover:text-stone-900"><Mail size={14} className="mr-1"/> Contact</a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;