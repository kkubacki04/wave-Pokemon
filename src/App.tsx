import React, { useState, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchPokemons, fetchTypes } from './api/PokeApi';
import { PokemonModal } from './components/PokemonModal';

const typeColors: Record<string, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705898',
  steel: '#B7B7CE', fairy: '#D685AD',
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);

  const {
    data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isListLoading, isError: isListError
  } = useInfiniteQuery({
    queryKey: ['pokemons'],
    queryFn: fetchPokemons,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const { data: types } = useQuery({ queryKey: ['types'], queryFn: fetchTypes });

  const { data: searchedPokemon } = useQuery({
    queryKey: ['pokemon-search', debouncedSearch],
    queryFn: async () => {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${debouncedSearch.toLowerCase().trim()}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: debouncedSearch.length > 0,
    retry: false
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const allPokemons = data?.pages.flatMap(page => page.results) || [];

  let displayPokemons = [];
  let isSearchingGlobal = false;

  if (debouncedSearch) {
    const localMatches = allPokemons.filter((p: any) => {
      const matchName = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchType = selectedTypes.length === 0 || selectedTypes.every(t => p.types.some((pt: any) => pt.type.name === t));
      return matchName && matchType;
    });

    if (localMatches.length > 0) {
      displayPokemons = localMatches;
    } else if (searchedPokemon) {
      displayPokemons = [searchedPokemon];
      isSearchingGlobal = true;
    }
  } else {
    displayPokemons = allPokemons.filter((p: any) => {
      if (selectedTypes.length === 0) return true;
      return selectedTypes.every(t => p.types.some((pt: any) => pt.type.name === t));
    });
  }

  const getBackgroundStyle = (types: any[]) => {
    if (types.length === 1) return { backgroundColor: typeColors[types[0].type.name] || '#ccc' };
    const color1 = typeColors[types[0].type.name] || '#ccc';
    const color2 = typeColors[types[1].type.name] || '#ccc';
    return { background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)` };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-800 flex flex-col">
      <header className="mb-8 flex items-center gap-4">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball" className="w-12 h-12" />
        <h1 className="text-4xl font-extrabold">Pokemon Explorer</h1>
      </header>

      <div className="mb-8 space-y-6">
        <input
          type="text"
          placeholder="Search Pokemon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap gap-2">
          {types?.map((type: string) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              style={{ backgroundColor: typeColors[type] || '#ccc' }}
              className={`px-4 py-1.5 rounded-full text-white font-semibold capitalize transition-all ${
                selectedTypes.includes(type) ? 'ring-4 ring-offset-2 ring-slate-400 scale-105' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {isListLoading && <p className="text-xl font-semibold mb-4">Ładowanie Pokedexu...</p>}
      {isListError && <p className="text-xl text-red-500 font-semibold mb-4">Błąd połączenia z API.</p>}

      <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10 flex-grow">
        {displayPokemons.map((pokemon: any) => (
          <article 
            key={pokemon.id} 
            onClick={() => setSelectedPokemon(pokemon)}
            style={getBackgroundStyle(pokemon.types)}
            className="rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center border border-slate-100 text-white cursor-pointer"
          >
            <span className="font-bold self-start mb-2 opacity-80">#{String(pokemon.id).padStart(3, '0')}</span>
            <img 
              src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
              alt={pokemon.name} 
              className="w-32 h-32 object-contain drop-shadow-lg bg-white/20 rounded-full p-2 mb-4"
            />
            <h2 className="text-xl font-bold capitalize mb-3 drop-shadow-sm">{pokemon.name}</h2>
            <div className="flex gap-2">
              {pokemon.types.map((t: any) => (
                <span key={t.type.name} className="px-3 py-1 rounded-full text-xs font-bold bg-white/30 backdrop-blur-sm border border-white/40 capitalize shadow-sm">
                  {t.type.name}
                </span>
              ))}
            </div>
          </article>
        ))}
        {displayPokemons.length === 0 && !isListLoading && (
          <p className="col-span-full text-lg text-slate-500">Nie znaleziono pokemona.</p>
        )}
      </main>

      {hasNextPage && !isSearchingGlobal && selectedTypes.length === 0 && !debouncedSearch && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="mx-auto block px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {isFetchingNextPage ? 'Ładowanie...' : 'Load More'}
        </button>
      )}

      <PokemonModal pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
    </div>
  );
}

export default App;