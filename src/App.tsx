import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Filter from './components/Filter.tsx';
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react";
import {ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Pokemon from './components/Pokemon.tsx';
import PokemonDetails from './components/PokemonDetails.tsx';

interface Type {
  type: {
    name: string;
    url: string;
  };
}

interface Stats {
  base_stat: string;
  stat: {
    name: string;
  };
}

interface DataType {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Type[];
  stats: Stats[];
}

const App: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedPokemon, setSelectedPokemon] = useState<DataType | null>(null);

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

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handlePokemonClick = (pokemon: DataType) => {
    setSelectedPokemon(pokemon); // Set the selected Pokemon
  };

  const handleCloseDetails = () => {
    setSelectedPokemon(null); // Close the details view
  };

  const filteredData = selectedType && selectedType !== "all"
    ? pokemonList.filter(pokemon =>
        pokemon.types.some(t => t.type.name === selectedType)
      )
    : pokemonList;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <section className='flex flex-col text-center bg-secondary py-[40px]'>
      <h4 className='font-semibold text-3xl'>Pokedex</h4>
      <div className='flex flex-row justify-center gap-[20px] my-[40px]'>
        <div className='w-[360px]'>
          <Input placeholder='Search Pokemon...'></Input>
        </div>
        <div className='flex flex-row justify-center gap-[20px]'>
          <Filter onSelectType={handleTypeSelect} />
        </div>
      </div>
      <div className="flex flex-wrap gap-[20px] justify-center">
        {filteredData.map(pokemon => (
         <div key={pokemon.id} onClick={() => handlePokemonClick(pokemon)}>
            <Pokemon data={pokemon} />
         </div>
        ))}
      </div>
      <Button onClick={scrollToTop} className='fixed bottom-0 right-0 m-6' variant="default" size="icon">
        <ChevronUp className="h-4 w-4" />
      </Button>
      {selectedPokemon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-4 rounded-lg">
            <Button onClick={handleCloseDetails} className="fixed top-0 left-0 mt-10 ml-2">
              <ChevronLeft></ChevronLeft>
            </Button>
            <PokemonDetails data={selectedPokemon} />
          </div>
        </div>
      )}
    </section>
  );
};

export default App;
