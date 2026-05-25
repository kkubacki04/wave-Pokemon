export const fetchPokemons = async ({ pageParam = 0 }) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=24&offset=${pageParam}`);
    if (!response.ok) throw new Error('Błąd API');
    const data = await response.json();

    const detailedPokemons = await Promise.all(
        data.results.map(async (pokemon : { url: string }) => {
            const res = await fetch(pokemon.url);
            return res.json(); 
        })
    );
    
    return {
        results: detailedPokemons,
        nextOffset: data.next ? pageParam + 24 : undefined
    };
}

export const fetchTypes = async () => {
    const response = await fetch('https://pokeapi.co/api/v2/type');
    const data = await response.json();
    return data.results
        .map((t: { name: string }) => t.name)
        .filter((n: string) => n !== 'unknown' && n !== 'shadow');
}