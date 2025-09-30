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

interface PokemonListItem {
  name: string;
  url: string;
}

const ITEMS_PER_PAGE = 24;
const totalPokemon = 1025;

const App: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<DataType[]>([]);
  const [allPokemonNames, setAllPokemonNames] = useState<PokemonListItem[]>([]);
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
  const [searchResults, setSearchResults] = useState<DataType[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Fetch all Pokemon names on component mount for search functionality
  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon?limit=${totalPokemon}`
        );
        setAllPokemonNames(response.data.results);
      } catch (error) {
        console.error("Failed to fetch Pokemon names:", error);
      }
    };

    fetchAllPokemonNames();
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(totalPokemonOfType / ITEMS_PER_PAGE);
    setTotalPages(totalPages);
  }, [totalPokemonOfType]);

  // Handle search functionality
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim() === "") {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setLoading(true);

      try {
        // Filter Pokemon names that match the search query
        const matchingNames = allPokemonNames.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Limit search results to avoid too many API calls
        const limitedResults = matchingNames.slice(0, ITEMS_PER_PAGE);

        // Fetch detailed data for matching Pokemon
        const searchResultsPromises = limitedResults.map(async (pokemon) => {
          // Extract ID from URL (e.g., "https://pokeapi.co/api/v2/pokemon/1/" -> 1)
          const pokemonId = parseInt(
            pokemon.url.split("/").filter(Boolean).pop() || "0"
          );

          if (pokemonCache.has(pokemonId)) {
            return pokemonCache.get(pokemonId)!;
          }

          const response = await axios.get<DataType>(pokemon.url);
          const speciesResponse = await axios.get<SpeciesData>(
            `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`
          );

          const pokemonData = {
            ...response.data,
            speciesData: speciesResponse.data,
          };

          // Cache the fetched Pokemon
          setPokemonCache((prev) => new Map(prev.set(pokemonId, pokemonData)));

          return pokemonData;
        });

        const results = await Promise.all(searchResultsPromises);

        // Apply type filter to search results if a type is selected
        const filteredResults = results.filter((pokemon) => {
          if (selectedType === "" || selectedType === "all") return true;
          return pokemon.types.some((type) => type.type.name === selectedType);
        });

        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, allPokemonNames, selectedType, pokemonCache]);

  useEffect(() => {
    // Only fetch paginated data when not searching
    if (isSearching) return;

    async function fetchPokemonPage() {
      setLoading(true);
      try {
        const pokemons: DataType[] = [];
        let fetchedCount = 0;
        let currentId = 1;

        const targetCount = ITEMS_PER_PAGE;
        const skipCount = (currentPage - 1) * ITEMS_PER_PAGE;
        let skippedCount = 0;

        while (fetchedCount < targetCount && currentId <= totalPokemon) {
          let pokemon: DataType;

          if (pokemonCache.has(currentId)) {
            pokemon = pokemonCache.get(currentId)!;
          } else {
            try {
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

              setPokemonCache((prevCache) => {
                const newCache = new Map(prevCache);
                newCache.set(currentId, pokemon);
                return newCache;
              });
            } catch (pokemonError) {
              currentId++;
              continue;
            }
          }

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
  }, [selectedType, currentPage, isSearching]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handlePokemonClick = (pokemon: DataType) => {
    setSelectedPokemon(pokemon);
  };

  const handleCloseDetails = () => {
    setSelectedPokemon(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Use search results when searching, otherwise use paginated data
  const displayData = isSearching ? searchResults : pokemonList;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="flex items-center justify-center w-[300px]">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>
              {isSearching ? "Searching Pokemons..." : "Loading Pokemons..."}
            </AlertTitle>
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

      {/* Show search info */}
      {isSearching && (
        <div className="mb-4 text-sm text-muted-foreground">
          Found {searchResults.length} Pokemon matching "{searchQuery}"
          {searchResults.length === ITEMS_PER_PAGE && " (showing first 24)"}
        </div>
      )}

      <div className="flex flex-wrap gap-[20px] justify-center">
        {displayData.map((pokemon: DataType) => (
          <div key={pokemon.id} onClick={() => handlePokemonClick(pokemon)}>
            <Pokemon data={pokemon} />
          </div>
        ))}
      </div>

      {/* Only show pagination when not searching */}
      {!isSearching && (
        <div className="mx-auto my-8">
          <PaginationDemo
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      )}

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
