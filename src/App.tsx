import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Filter from "./components/Filter.tsx";
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Pokemon from "./components/Pokemon.tsx";
import PokemonDetails from "./components/PokemonDetails.tsx";
import PaginationDemo from "./components/PaginationDemo.tsx";
import { AlertCircle } from "lucide-react";
import Hero from "./components/Hero.tsx";
import AddPokemonForm from "./components/AddPokemonForm.tsx";
import CustomPokemon from "./components/CustomPokemon";
import CustomPokemonDetails from "./components/CustomPokemonDetails";

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

interface Pokemon {
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
  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);

  // Add these state variables at the top with other states
  const [customPokemonLoading, setCustomPokemonLoading] =
    useState<boolean>(true);
  const [customPokemonError, setCustomPokemonError] = useState<string | null>(
    null
  );

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

  // Update the useEffect for fetching custom Pokemon
  useEffect(() => {
    const fetchCustomPokemon = async () => {
      setCustomPokemonLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/api/pokemon/custom"
        );
        setCustomPokemon(response.data);
        setCustomPokemonError(null);
      } catch (error) {
        console.error("Error fetching custom Pokemon:", error);
        setCustomPokemonError(
          "Failed to load custom Pokemon. Please try again later."
        );
      } finally {
        setCustomPokemonLoading(false);
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
      </section>

      {/* Custom Pokemon Section */}
      <section className="flex flex-col items-center text-center bg-primary-foreground py-[40px]">
        <h4 className="font-semibold text-2xl mb-8">Custom Pokemon</h4>
        <Button
          variant="outline"
          className="mb-8"
          onClick={() => setIsAddFormOpen(true)}
        >
          Add Custom Pokemon
        </Button>

        {customPokemonLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : customPokemonError ? (
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{customPokemonError}</AlertDescription>
          </Alert>
        ) : (
          <div className="flex flex-wrap gap-[20px] justify-center">
            {customPokemon.map((pokemon) => (
              <div
                key={pokemon?.id}
                onClick={() => handlePokemonClick(pokemon)}
              >
                <CustomPokemon
                  data={{
                    id: pokemon?.id || Date.now(),
                    name: pokemon?.name || "",
                    imageUrl: pokemon?.sprites?.front_default || "",
                    type: pokemon?.types?.[0]?.type?.name || "normal",
                    stats: {
                      hp: String(pokemon?.stats?.[0]?.base_stat || 45),
                      attack: String(pokemon?.stats?.[1]?.base_stat || 45),
                      defense: String(pokemon?.stats?.[2]?.base_stat || 45),
                      specialAttack: String(
                        pokemon?.stats?.[3]?.base_stat || 45
                      ),
                      specialDefense: String(
                        pokemon?.stats?.[4]?.base_stat || 45
                      ),
                      speed: String(pokemon?.stats?.[5]?.base_stat || 45),
                    },
                    description:
                      pokemon?.speciesData?.flavor_text_entries?.[0]
                        ?.flavor_text || "",
                    evolvesFrom:
                      pokemon?.speciesData?.evolves_from_species?.name || "",
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

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
            {customPokemon.find((p) => p.id === selectedPokemon.id) ? (
              // Use CustomPokemonDetails for custom Pokemon
              <CustomPokemonDetails
                data={{
                  id: selectedPokemon.id,
                  name: selectedPokemon.name,
                  imageUrl: selectedPokemon.sprites.front_default,
                  type: selectedPokemon.types[0].type.name,
                  stats: {
                    hp: String(selectedPokemon.stats[0]?.base_stat || 45),
                    attack: String(selectedPokemon.stats[1]?.base_stat || 45),
                    defense: String(selectedPokemon.stats[2]?.base_stat || 45),
                    specialAttack: String(
                      selectedPokemon.stats[3]?.base_stat || 45
                    ),
                    specialDefense: String(
                      selectedPokemon.stats[4]?.base_stat || 45
                    ),
                    speed: String(selectedPokemon.stats[5]?.base_stat || 45),
                  },
                  description:
                    selectedPokemon.speciesData?.flavor_text_entries[0]
                      ?.flavor_text || "",
                  evolvesFrom:
                    selectedPokemon.speciesData?.evolves_from_species?.name ||
                    "",
                }}
              />
            ) : (
              // Use regular PokemonDetails for API Pokemon
              <PokemonDetails data={selectedPokemon} />
            )}
          </div>
        </div>
      )}

      {isAddFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg">
            <AddPokemonForm
              onSubmit={(pokemonData: Pokemon) => {
                const newPokemon: DataType = {
                  id: pokemonData.id,
                  name: pokemonData.name,
                  sprites: {
                    front_default: pokemonData.imageUrl,
                  },
                  types: [
                    {
                      type: {
                        name: pokemonData.type,
                        url: `https://pokeapi.co/api/v2/type/${pokemonData.type}`,
                      },
                    },
                  ],
                  stats: [
                    { base_stat: pokemonData.stats.hp, stat: { name: "hp" } },
                    {
                      base_stat: pokemonData.stats.attack,
                      stat: { name: "attack" },
                    },
                    {
                      base_stat: pokemonData.stats.defense,
                      stat: { name: "defense" },
                    },
                    {
                      base_stat: pokemonData.stats.specialAttack,
                      stat: { name: "special-attack" },
                    },
                    {
                      base_stat: pokemonData.stats.specialDefense,
                      stat: { name: "special-defense" },
                    },
                    {
                      base_stat: pokemonData.stats.speed,
                      stat: { name: "speed" },
                    },
                  ],
                  speciesData: {
                    evolves_from_species: { name: pokemonData.evolvesFrom },
                    flavor_text_entries: [
                      {
                        flavor_text: pokemonData.description,
                        language: {
                          name: "en",
                          url: "https://pokeapi.co/api/v2/language/9/",
                        },
                      },
                    ],
                  },
                };

                setCustomPokemon((prev) => [...prev, newPokemon]);
                setIsAddFormOpen(false);
              }}
              onCancel={() => setIsAddFormOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
