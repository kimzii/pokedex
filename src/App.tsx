import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Filter from "./components/Filter.tsx";
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PokemonCard from "./components/Pokemon.tsx";
import PokemonDetails from "./components/PokemonDetails.tsx";
import PaginationDemo from "./components/PaginationDemo.tsx";
import { AlertCircle } from "lucide-react";
import Hero from "./components/Hero.tsx";
import AddPokemonForm from "./components/AddPokemonForm.tsx";

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

interface CustomPokemon {
  id: number;
  name: string;
  imageUrl: string;
  type: string;
  stats: {
    hp: string;
    attack: string;
    defense: string;
    specialAttack: string;
    specialDefense: string;
    speed: string;
  };
  description: string;
  evolvesFrom: string;
}

const ITEMS_PER_PAGE = 24;
const totalPokemon = 151;

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
  const [pokemonCache, setPokemonCache] = useState<Map<number, DataType>>(
    new Map()
  );
  const [customPokemon, setCustomPokemon] = useState<DataType[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Ref for scrolling to pokedex section
  const pokedexRef = useRef<HTMLDivElement>(null);

  // Fetch all Pokemon names on component mount
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

  // Fetch custom Pokemon from the local API
  useEffect(() => {
    const fetchCustomPokemon = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/pokemon/custom"
        );

        // Transform custom Pokemon to match DataType structure
        const transformedData: DataType[] = response.data.map(
          (pokemon: CustomPokemon) => ({
            id: pokemon.id,
            name: pokemon.name,
            sprites: {
              front_default: pokemon.imageUrl,
            },
            types: [
              {
                type: {
                  name: pokemon.type,
                  url: `https://pokeapi.co/api/v2/type/${pokemon.type}`,
                },
              },
            ],
            stats: [
              { base_stat: pokemon.stats.hp, stat: { name: "hp" } },
              { base_stat: pokemon.stats.attack, stat: { name: "attack" } },
              { base_stat: pokemon.stats.defense, stat: { name: "defense" } },
              {
                base_stat: pokemon.stats.specialAttack,
                stat: { name: "special-attack" },
              },
              {
                base_stat: pokemon.stats.specialDefense,
                stat: { name: "special-defense" },
              },
              { base_stat: pokemon.stats.speed, stat: { name: "speed" } },
            ],
            speciesData: {
              evolves_from_species: { name: pokemon.evolvesFrom },
              flavor_text_entries: [
                {
                  flavor_text: pokemon.description,
                  language: {
                    name: "en",
                    url: "https://pokeapi.co/api/v2/language/9/",
                  },
                },
              ],
            },
          })
        );

        setCustomPokemon(transformedData);
        console.log("Custom Pokemon loaded:", transformedData);
      } catch (error) {
        console.error("Failed to fetch custom Pokemon:", error);
      }
    };

    fetchCustomPokemon();
  }, []);

  // Helper function to fetch Pokemon data
  const fetchPokemonData = async (
    pokemonId: number
  ): Promise<DataType | null> => {
    if (pokemonCache.has(pokemonId)) {
      return pokemonCache.get(pokemonId)!;
    }

    try {
      const [pokemonResponse, speciesResponse] = await Promise.all([
        axios.get<DataType>(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`),
        axios.get<SpeciesData>(
          `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`
        ),
      ]);

      const pokemonData = {
        ...pokemonResponse.data,
        speciesData: speciesResponse.data,
      };

      // Update cache
      setPokemonCache((prev) => new Map(prev).set(pokemonId, pokemonData));
      return pokemonData;
    } catch (error) {
      console.error(`Failed to fetch Pokemon ${pokemonId}:`, error);
      return null;
    }
  };

  // Helper function to check if Pokemon matches type filter
  const matchesTypeFilter = (pokemon: DataType): boolean => {
    return (
      !selectedType ||
      selectedType === "all" ||
      pokemon.types.some((type) => type.type.name === selectedType)
    );
  };

  // Main data fetching effect - handles both search and pagination
  useEffect(() => {
    const fetchData = async () => {
      if (!allPokemonNames.length) return;

      setLoading(true);
      const results: DataType[] = [];

      try {
        if (searchQuery.trim()) {
          // Search mode
          const matchingNames = allPokemonNames.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          // Process in batches
          for (
            let i = 0;
            i < Math.min(matchingNames.length, 50) &&
            results.length < ITEMS_PER_PAGE;
            i += 10
          ) {
            const batch = matchingNames.slice(i, i + 10);
            const batchPromises = batch.map((pokemon) => {
              const pokemonId = parseInt(
                pokemon.url.split("/").filter(Boolean).pop() || "0"
              );
              return fetchPokemonData(pokemonId);
            });

            const batchResults = await Promise.all(batchPromises);

            // Filter and add to results
            for (const pokemon of batchResults) {
              if (
                pokemon &&
                matchesTypeFilter(pokemon) &&
                results.length < ITEMS_PER_PAGE
              ) {
                results.push(pokemon);
              }
            }
          }
        } else {
          // Pagination mode
          const startId = (currentPage - 1) * ITEMS_PER_PAGE;
          let currentId = 1;
          let found = 0;
          let skipped = 0;

          while (found < ITEMS_PER_PAGE && currentId <= totalPokemon) {
            const pokemon = await fetchPokemonData(currentId);

            if (pokemon && matchesTypeFilter(pokemon)) {
              if (skipped >= startId) {
                results.push(pokemon);
                found++;
              } else {
                skipped++;
              }
            }
            currentId++;
          }

          // Calculate total pages
          const estimatedTotal =
            selectedType && selectedType !== "all"
              ? Math.floor(totalPokemon * 0.7)
              : totalPokemon;
          setTotalPages(Math.ceil(estimatedTotal / ITEMS_PER_PAGE));
        }

        setPokemonList(results);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(fetchData, searchQuery ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedType, currentPage, allPokemonNames, pokemonCache]);

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
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToPokedex = () => {
    pokedexRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isSearching = searchQuery.trim() !== "";

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="flex flex-col items-center justify-center">
          <img
            src="/pikachu.gif"
            alt={isSearching ? "Searching Pokémon..." : "Loading Pokémon..."}
            className="w-32 h-32 object-contain"
          />
          <p className="mt-4 text-lg font-medium">
            {isSearching ? "Searching Pokémon..." : "Loading Pokémon..."}
          </p>
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

  // Add this with your other handler functions
  const handleAddPokemonSubmit = (pokemon: CustomPokemon) => {
    const transformedPokemon: DataType = {
      id: pokemon.id,
      name: pokemon.name,
      sprites: {
        front_default: pokemon.imageUrl,
      },
      types: [
        {
          type: {
            name: pokemon.type,
            url: `https://pokeapi.co/api/v2/type/${pokemon.type}`,
          },
        },
      ],
      stats: [
        { base_stat: pokemon.stats.hp, stat: { name: "hp" } },
        { base_stat: pokemon.stats.attack, stat: { name: "attack" } },
        { base_stat: pokemon.stats.defense, stat: { name: "defense" } },
        {
          base_stat: pokemon.stats.specialAttack,
          stat: { name: "special-attack" },
        },
        {
          base_stat: pokemon.stats.specialDefense,
          stat: { name: "special-defense" },
        },
        { base_stat: pokemon.stats.speed, stat: { name: "speed" } },
      ],
      speciesData: {
        evolves_from_species: { name: pokemon.evolvesFrom },
        flavor_text_entries: [
          {
            flavor_text: pokemon.description,
            language: {
              name: "en",
              url: "https://pokeapi.co/api/v2/language/9/",
            },
          },
        ],
      },
    };

    setCustomPokemon((prev) => [...prev, transformedPokemon]);
    setIsAddFormOpen(false);
  };

  const handleDeletePokemon = async (pokemonId: number) => {
    try {
      console.log("Attempting to delete Pokemon:", pokemonId);

      const response = await axios.delete(
        `http://localhost:5000/api/pokemon/custom/${pokemonId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Delete response:", response);

      if (response.status === 200) {
        setCustomPokemon((prev) =>
          prev.filter((pokemon) => pokemon.id !== pokemonId)
        );
        handleCloseDetails();
        alert("Pokemon deleted successfully");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Delete request failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        alert(
          `Failed to delete Pokemon: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <Hero onViewDeck={scrollToPokedex} />

      {/* Pokedex Section */}
      <section
        ref={pokedexRef}
        className="flex flex-col items-center text-center bg-secondary py-[40px]"
      >
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
            Found {pokemonList.length} Pokemon matching "{searchQuery}"
            {pokemonList.length === ITEMS_PER_PAGE && " (showing first 24)"}
          </div>
        )}

        <div className="flex flex-wrap gap-[20px] justify-center">
          {pokemonList.map((pokemon: DataType) => (
            <div key={pokemon.id} onClick={() => handlePokemonClick(pokemon)}>
              <PokemonCard data={pokemon} />
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
      </section>

      <section className="flex flex-col items-center text-center bg-primary/5 py-[40px]">
        <div className="flex items-center gap-4 mb-8">
          <h4 className="font-semibold text-3xl">Custom Pokemon</h4>
          <Button onClick={() => setIsAddFormOpen(true)} variant="default">
            Add Pokemon
          </Button>
        </div>
        <div className="">
          <div className="flex flex-wrap gap-[20px] justify-center">
            {customPokemon.map((pokemon: DataType) => (
              <div
                key={`custom-${pokemon.id}`}
                onClick={() => handlePokemonClick(pokemon)}
                className="transition-transform hover:scale-105"
              >
                <PokemonCard data={pokemon} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add this just before the closing </> */}
      {isAddFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add New Pokemon</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddFormOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <AddPokemonForm
              onSubmit={handleAddPokemonSubmit}
              onCancel={() => setIsAddFormOpen(false)}
            />
          </div>
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
            <div className="flex gap-2 fixed top-0 left-0 mt-8 ml-2">
              <Button onClick={handleCloseDetails} className="bg-destructive">
                <ChevronLeft />
              </Button>

              {selectedPokemon.id >= 1001 && (
                <Button
                  onClick={() => {
                    console.log(
                      "Attempting to delete Pokemon with ID:",
                      selectedPokemon.id
                    ); // Debug log
                    if (
                      window.confirm(
                        "Are you sure you want to delete this Pokemon?"
                      )
                    ) {
                      handleDeletePokemon(selectedPokemon.id);
                    }
                  }}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
            <PokemonDetails data={selectedPokemon} />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
