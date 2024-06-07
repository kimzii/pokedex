import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pokemon from './components/Pokemon.tsx';
import Filter from './components/Filter.tsx';
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"


interface Type {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

interface DataType {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Type[];
}

const App: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAllPokemon() {
      try {
        const pokemons: DataType[] = [];
        for (let i = 1; i <= 151; i++) { // Adjust the range as needed
          const response = await axios.get<DataType>(`https://pokeapi.co/api/v2/pokemon/${i}/`);
          pokemons.push(response.data);
        }
        setPokemonList(pokemons);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllPokemon();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <section className='flex flex-col text-center bg-secondary py-[40px]'>
      <h4 className='font-semibold text-3xl'>Pokedex</h4>
      <div className='flex flex-row justify-center gap-[20px] my-[40px] p'>
        <div className='w-[360px]'>
          <Input placeholder='Search Pokemon...'></Input>
        </div>
        <Filter></Filter>
      </div>
      <div className="flex flex-wrap gap-[20px] justify-center">
        {pokemonList.map(pokemon => (
          <Pokemon key={pokemon.id} data={pokemon} />
        ))}
      </div>
      <Button onClick={scrollToTop} className='fixed bottom-0 right-0 m-6 bg-primary' variant="default" size="icon">
      <ChevronUp  color="white" className="h-4 w-4" />
      </Button>
    </section>
  );
};

export default App;
