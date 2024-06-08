import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Filter from './components/Filter.tsx';
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react";
import { ChevronLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Pokemon from './components/Pokemon.tsx';
import PokemonDetails from './components/PokemonDetails.tsx';
import PaginationDemo from './components/PaginationDemo.tsx';

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

interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
    url: string;
  };
}

interface SpeciesData {
  evolves_from_species?: {
    name: string;
  };
  flavor_text_entries: FlavorTextEntry[];
}

interface DataType {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Type[];
  stats: Stats[];
  speciesData?: SpeciesData;
}

const ITEMS_PER_PAGE = 24;
const totalPokemon = 151;

const App: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedPokemon, setSelectedPokemon] = useState<DataType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  useEffect(() => {
    const totalPages = Math.ceil(totalPokemon / ITEMS_PER_PAGE);
    setTotalPages(totalPages);
  }, []);
  
  useEffect(() => {
    async function fetchPokemon(page: number) {
      setLoading(true);
      try {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const limit = ITEMS_PER_PAGE;
        const pokemons: DataType[] = [];
        for (let i = offset + 1;  i <= Math.min(offset + limit, totalPokemon); i++) {
          const response = await axios.get<DataType>(`https://pokeapi.co/api/v2/pokemon/${i}/`);
          const speciesResponse = await axios.get<SpeciesData>(`https://pokeapi.co/api/v2/pokemon-species/${i}/`);

          const pokemonWithSpeciesData: DataType = {
            ...response.data,
            speciesData: speciesResponse.data
          };

          pokemons.push(pokemonWithSpeciesData);
        }
        setPokemonList(pokemons);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemon(currentPage);
  }, [currentPage]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handlePokemonClick = (pokemon: DataType) => {
    setSelectedPokemon(pokemon); // Set the selected Pokemon
  };

  const handleCloseDetails = () => {
    setSelectedPokemon(null); // Close the details view
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredData = pokemonList
    .filter(pokemon =>
      selectedType && selectedType !== "all"
        ? pokemon.types.some(t => t.type.name === selectedType)
        : true
    )
    .filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <section className='flex flex-col items-center text-center bg-secondary py-[40px]'>
      <h4 className='font-semibold text-3xl'>Pokedex</h4>
      <div className='flex flex-col justify-center gap-[20px] my-[40px] md:flex-row'>
        <div className='w-[300px] md:w-[400px]'>
          <Input 
            placeholder='Search Pokemon...'
            value={searchQuery}
            onChange={handleSearchChange}
          />
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
      <div className='mx-auto my-8'>
        <PaginationDemo currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
      </div>
      <Button onClick={scrollToTop} className='fixed bottom-0 right-0 m-6' variant="default" size="icon">
        <ChevronUp className="h-4 w-4" />
      </Button>
      {selectedPokemon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative">
            <Button onClick={handleCloseDetails} className="fixed top-0 left-0 mt-8 ml-2 bg-destructive">
              <ChevronLeft />
            </Button>
            <PokemonDetails data={selectedPokemon} />
          </div>
        </div>
      )}
    </section>
  );
};

export default App;
