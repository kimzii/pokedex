import React, { useEffect, useState } from "react";
import axios from "axios";
import Filter from "./components/Filter.tsx";
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pokemon from "./components/Pokemon.tsx";
import PokemonDetails from "./components/PokemonDetails.tsx";
import PaginationDemo from "./components/PaginationDemo.tsx";
import { Terminal } from "lucide-react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [totalPokemonOfType, setTotalPokemonOfType] =
    useState<number>(totalPokemon);
  const [pokemonCache, setPokemonCache] = useState<Map<number, DataType>>(
    new Map()
  );

  useEffect(() => {
    const totalPages = Math.ceil(totalPokemonOfType / ITEMS_PER_PAGE);
    setTotalPages(totalPages);
  }, [totalPokemonOfType]);

  useEffect(() => {
    async function fetchPokemonPage() {
      setLoading(true);
      try {
        const pokemons: DataType[] = [];
        let fetchedCount = 0;
        let currentId = 1;

        // If we have a specific type filter, we need to fetch more Pokemon to find enough matches
        const targetCount = ITEMS_PER_PAGE;
        const skipCount = (currentPage - 1) * ITEMS_PER_PAGE;
        let skippedCount = 0;

        while (fetchedCount < targetCount && currentId <= totalPokemon) {
          // Check cache first
          let pokemon: DataType;

          if (pokemonCache.has(currentId)) {
            pokemon = pokemonCache.get(currentId)!;
          } else {
            // Fetch from API if not in cache
            const response = await axios.get<DataType>(
              `https://pokeapi.co/api/v2/pokemon/${currentId}/`
            );
            const speciesResponse = await axios.get<SpeciesData>(
              `https://pokeapi.co/api/v2/pokemon-species/${currentId}/`
            );

            pokemon = {
              ...response.data,
              speciesData: speciesResponse.data,
            };

            // Add to cache
            setPokemonCache((prev) => new Map(prev.set(currentId, pokemon)));
          }

          // Check if the Pokemon matches the selected type
          const matchesType =
            selectedType === "" ||
            selectedType === "all" ||
            pokemon.types.some((type) => type.type.name === selectedType);

          if (matchesType) {
            if (skippedCount < skipCount) {
              skippedCount++;
            } else {
              pokemons.push(pokemon);
              fetchedCount++;
            }
          }

          currentId++;
        }

        setPokemonList(pokemons);

        // Calculate total pages based on type filter
        // For simplicity, we'll estimate. A more accurate approach would require
        // fetching all Pokemon data or using specific type endpoints
        const estimatedTotal =
          selectedType === "" || selectedType === "all"
            ? totalPokemon
            : Math.floor(totalPokemon * 0.7);
        const totalPagesCount = Math.ceil(estimatedTotal / ITEMS_PER_PAGE);
        setTotalPages(totalPagesCount);
        setTotalPokemonOfType(estimatedTotal);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemonPage();
  }, [selectedType, currentPage, pokemonCache]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1); // Reset pagination when a new type is selected
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

  // Filter the current page's Pokemon by search query
  const filteredData = pokemonList.filter((pokemon: DataType) =>
    pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Since we're already loading page-specific data, we don't need additional pagination slicing
  const paginatedData = filteredData;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="flex items-center justify-center w-[300px]">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Loading Pokemons...</AlertTitle>
          </Alert>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="flex items-center justify-center w-[300px]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center text-center bg-secondary py-[40px]">
      <h4 className="font-semibold text-3xl">Pokedex</h4>
      <div className="flex flex-col justify-center gap-[20px] my-[40px] md:flex-row">
        <div className="w-[300px] md:w-[400px]">
          <Input
            placeholder="Search Pokemon..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex flex-row justify-center gap-[20px]">
          <Filter onSelectType={handleTypeSelect} />
        </div>
      </div>
      <div className="flex flex-wrap gap-[20px] justify-center">
        {paginatedData.map((pokemon: DataType) => (
          <div key={pokemon.id} onClick={() => handlePokemonClick(pokemon)}>
            <Pokemon data={pokemon} />
          </div>
        ))}
      </div>
      <div className="mx-auto my-8">
        <PaginationDemo
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
      <Button
        onClick={scrollToTop}
        className="fixed bottom-0 right-0 m-6"
        variant="default"
        size="icon"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      {selectedPokemon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative">
            <Button
              onClick={handleCloseDetails}
              className="fixed top-0 left-0 mt-8 ml-2 bg-destructive"
            >
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
