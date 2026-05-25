import React from 'react';

export const PokemonModal = ({ pokemon, onClose }: { pokemon: any, onClose: () => void }) => {
  if (!pokemon) return null;

  const sprites = [
    pokemon.sprites.front_default,
    pokemon.sprites.back_default,
    pokemon.sprites.front_shiny,
    pokemon.sprites.back_shiny,
  ].filter(Boolean);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-3xl font-extrabold capitalize text-slate-800">
            {pokemon.name} <span className="text-slate-400">#{String(pokemon.id).padStart(3, '0')}</span>
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-800 text-3xl font-bold transition-colors"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col items-center">
            <img 
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
              alt={pokemon.name} 
              className="w-64 h-64 object-contain drop-shadow-xl mb-6" 
            />
            <div className="flex gap-3 flex-wrap justify-center bg-slate-50 p-4 rounded-2xl w-full">
              {sprites.map((sprite, i) => (
                <img 
                  key={i} 
                  src={sprite} 
                  alt="sprite" 
                  className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100" 
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl text-slate-800 mb-4">Base Stats</h3>
            <div className="space-y-4">
              {pokemon.stats.map((stat: any) => (
                <div key={stat.stat.name}>
                  <div className="flex justify-between text-sm font-semibold text-slate-600 mb-1 capitalize">
                    <span>{stat.stat.name.replace('-', ' ')}</span>
                    <span>{stat.base_stat}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${Math.min(stat.base_stat, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-2xl flex-1 text-center border border-slate-100">
                <span className="block text-slate-400 font-semibold mb-1">Weight</span>
                <span className="font-bold text-lg text-slate-700">{pokemon.weight / 10} kg</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex-1 text-center border border-slate-100">
                <span className="block text-slate-400 font-semibold mb-1">Height</span>
                <span className="font-bold text-lg text-slate-700">{pokemon.height / 10} m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}