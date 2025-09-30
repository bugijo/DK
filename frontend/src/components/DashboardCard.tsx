import React from 'react';

interface DashboardCardProps {
  Icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick?: () => void;
}

export function DashboardCard({ Icon, title, description, buttonText, onClick }: DashboardCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md border-2 border-amber-600/30 rounded-xl p-8 flex flex-col justify-between text-center transform transition-all duration-500 hover:scale-110 hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/20 shadow-xl shadow-black/50 relative overflow-hidden group">
      {/* Efeito de brilho sutil no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="mx-auto filter drop-shadow-lg relative z-10 transition-all duration-300 group-hover:scale-110 flex justify-center">
            {Icon}
          </div>
        </div>
        <h3 className="font-title text-3xl font-bold text-amber-100 mb-3 tracking-wider drop-shadow-lg">{title}</h3>
        <p className="font-body text-gray-300 text-base mb-8 leading-relaxed">{description}</p>
      </div>
      
      <button 
        onClick={onClick}
        className="relative bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-50 font-bold py-3 px-6 rounded-lg w-full transition-all duration-300 font-body text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-amber-500/50 hover:border-amber-400"
      >
        <span className="relative z-10">{buttonText}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      </button>
    </div>
  );
}