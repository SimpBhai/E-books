import React from 'react';
import { ArrowLeft, Feather, Shield, PenTool, Mail } from 'lucide-react';

interface ContributePageProps {
  onBack: () => void;
}

const ContributePage: React.FC<ContributePageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col animate-in fade-in duration-300">
       <header className="p-4 md:p-8 flex items-center">
         <button onClick={onBack} className="flex items-center text-stone-500 hover:text-stone-900 transition-colors font-bold uppercase text-xs tracking-wider">
            <ArrowLeft className="mr-2" size={16} /> Back to Home
         </button>
       </header>
       
       <main className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
         <div className="text-center mb-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Feather className="text-red-600" size={40} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">Contribute to the Library</h1>
            <p className="text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
               We believe knowledge should be preserved collectively. Scholars and students are invited to improve translations, add commentaries, and correct errors.
            </p>
         </div>

         <div className="grid gap-8 md:grid-cols-2 mb-12">
            <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
               <PenTool className="text-stone-800 mb-4" size={32} />
               <h3 className="font-bold text-xl mb-3">For Translators</h3>
               <p className="text-stone-600 mb-6 leading-relaxed">
                  Fluent in Sanskrit? Help us provide accurate translations in English, Hindi, and other regional languages.
               </p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
               <Shield className="text-stone-800 mb-4" size={32} />
               <h3 className="font-bold text-xl mb-3">For Reviewers</h3>
               <p className="text-stone-600 mb-6 leading-relaxed">
                  Verify existing entries for accuracy and ensure the integrity of the scriptures.
               </p>
            </div>
         </div>

         <div className="bg-stone-900 text-stone-200 p-8 rounded-2xl text-center">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">How to Join?</h3>
            <p className="mb-8 opacity-80">We coordinate our efforts through email. Please reach out to us to get started.</p>
            <a href="mailto:contact@sanataniakhada.org" className="bg-white text-stone-900 px-8 py-3 rounded-full font-bold hover:bg-stone-100 transition-colors inline-flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1">
               <Mail size={18} className="mr-2" /> Contact Us
            </a>
         </div>
       </main>
    </div>
  );
};
export default ContributePage;