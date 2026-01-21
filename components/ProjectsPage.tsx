import React from 'react';
import { ArrowLeft, LayoutGrid, ExternalLink } from 'lucide-react';

interface ProjectsPageProps {
  onBack: () => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onBack }) => {
  const projects = [
    {
       title: "Vedic Heritage Portal",
       desc: "A comprehensive database of Vedic hymns and recitations.",
       link: "#",
       color: "bg-blue-50 text-blue-700"
    },
    {
       title: "Sanskrit Grammar Tool",
       desc: "Interactive tools to learn Paninian grammar.",
       link: "#",
       color: "bg-emerald-50 text-emerald-700"
    },
    {
       title: "Dharma Sindhu",
       desc: "Digitization of Dharma Shastras.",
       link: "#",
       color: "bg-purple-50 text-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col animate-in fade-in duration-300">
       <header className="p-4 md:p-8 flex items-center">
         <button onClick={onBack} className="flex items-center text-stone-500 hover:text-stone-900 transition-colors font-bold uppercase text-xs tracking-wider">
            <ArrowLeft className="mr-2" size={16} /> Back to Home
         </button>
       </header>
       
       <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
         <div className="text-center mb-12">
            <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
               <LayoutGrid className="text-stone-700" size={40} />
            </div>
            <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">Our Projects</h1>
            <p className="text-lg text-stone-600 leading-relaxed">
               Exploring the depths of Indian Knowledge Systems through technology.
            </p>
         </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
                <a key={i} href={p.link} className="block bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                   <div className={`w-12 h-12 rounded-lg ${p.color} flex items-center justify-center mb-4`}>
                      <LayoutGrid size={24} />
                   </div>
                   <h3 className="font-bold text-xl mb-2 text-stone-800 flex items-center justify-between">
                      {p.title}
                      <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400" />
                   </h3>
                   <p className="text-stone-600 text-sm">{p.desc}</p>
                </a>
            ))}
         </div>
       </main>
    </div>
  );
};
export default ProjectsPage;