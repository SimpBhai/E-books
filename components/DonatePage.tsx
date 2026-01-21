import React from 'react';
import { ArrowLeft, Heart, Coffee, CreditCard } from 'lucide-react';

interface DonatePageProps {
  onBack: () => void;
}

const DonatePage: React.FC<DonatePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col animate-in fade-in duration-300">
       <header className="p-4 md:p-8 flex items-center">
         <button onClick={onBack} className="flex items-center text-stone-500 hover:text-stone-900 transition-colors font-bold uppercase text-xs tracking-wider">
            <ArrowLeft className="mr-2" size={16} /> Back to Home
         </button>
       </header>
       
       <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full">
         <div className="text-center mb-12">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Heart className="text-orange-600 fill-orange-600" size={40} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">Support Our Dharma</h1>
            <p className="text-lg text-stone-600 leading-relaxed">
               Your contribution helps us digitize more ancient scriptures, maintain servers, and keep this knowledge free for everyone.
            </p>
         </div>

         <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-center group">
               <Coffee size={32} className="mx-auto mb-4 text-stone-400 group-hover:text-amber-700 transition-colors" />
               <h3 className="font-bold text-lg mb-2">Buy us a Coffee</h3>
               <p className="text-stone-500 text-sm mb-4">Small one-time support via UPI.</p>
               <button className="bg-amber-100 text-amber-800 px-6 py-2 rounded-full font-bold text-sm hover:bg-amber-200 transition-colors">
                  Donate ₹100
               </button>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all text-center group">
               <CreditCard size={32} className="mx-auto mb-4 text-stone-400 group-hover:text-green-700 transition-colors" />
               <h3 className="font-bold text-lg mb-2">Monthly Support</h3>
               <p className="text-stone-500 text-sm mb-4">Become a patron of the library.</p>
               <button className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold text-sm hover:bg-green-200 transition-colors">
                  Donate Monthly
               </button>
            </div>
         </div>
       </main>
    </div>
  );
};
export default DonatePage;