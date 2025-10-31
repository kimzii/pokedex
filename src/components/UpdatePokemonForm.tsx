import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataType } from "../types/pokemon";
import axios from "axios";

const pokemonTypes = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

interface UpdatePokemonFormProps {
  pokemon: DataType;
  onSubmit: (updatedPokemon: DataType) => void;
  onCancel: () => void;
}

const UpdatePokemonForm: React.FC<UpdatePokemonFormProps> = ({
  pokemon,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: pokemon.name,
    sprites: {
      front_default: pokemon.sprites.front_default,
    },
    types: pokemon.types,
    stats: pokemon.stats,
    speciesData: pokemon.speciesData || {
      evolves_from_species: { name: "" },
      flavor_text_entries: [
        {
          flavor_text: "",
          language: {
            name: "en",
            url: "https://pokeapi.co/api/v2/language/9/",
          },
        },
      ],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const customPokemonData = {
        id: pokemon.id,
        name: formData.name,
        imageUrl: formData.sprites.front_default,
        type: formData.types[0].type.name,
        stats: {
          hp: formData.stats[0].base_stat,
          attack: formData.stats[1].base_stat,
          defense: formData.stats[2].base_stat,
          specialAttack: formData.stats[3].base_stat,
          specialDefense: formData.stats[4].base_stat,
          speed: formData.stats[5].base_stat,
        },
        description:
          formData.speciesData?.flavor_text_entries[0]?.flavor_text || "",
        evolvesFrom: formData.speciesData?.evolves_from_species?.name || "",
      };

      console.log("Updating Pokemon with ID:", pokemon.id);
      console.log("Sending data:", customPokemonData);

      const response = await axios.put(
        `http://localhost:5000/api/pokemon/custom/${pokemon.id}`,
        customPokemonData
      );

      console.log("Server response:", response.data); // Add this log

      if (response.status === 200 && response.data.success) {
        // Transform response data
        const updatedPokemon: DataType = {
          id: pokemon.id,
          name: response.data.data.name,
          sprites: {
            front_default: response.data.data.imageUrl,
          },
          types: [
            {
              type: {
                name: response.data.data.type,
                url: `https://pokeapi.co/api/v2/type/${response.data.data.type}`,
              },
            },
          ],
          stats: [
            { base_stat: response.data.data.stats.hp, stat: { name: "hp" } },
            {
              base_stat: response.data.data.stats.attack,
              stat: { name: "attack" },
            },
            {
              base_stat: response.data.data.stats.defense,
              stat: { name: "defense" },
            },
            {
              base_stat: response.data.data.stats.specialAttack,
              stat: { name: "special-attack" },
            },
            {
              base_stat: response.data.data.stats.specialDefense,
              stat: { name: "special-defense" },
            },
            {
              base_stat: response.data.data.stats.speed,
              stat: { name: "speed" },
            },
          ],
          speciesData: {
            evolves_from_species: { name: response.data.data.evolvesFrom },
            flavor_text_entries: [
              {
                flavor_text: response.data.data.description,
                language: {
                  name: "en",
                  url: "https://pokeapi.co/api/v2/language/9/",
                },
              },
            ],
          },
        };

        onSubmit(updatedPokemon);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Update failed:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        alert(
          `Failed to update Pokemon: ${
            error.response?.data?.message || error.message
          }`
        );
      } else if (error instanceof Error) {
        console.error("Update failed:", error.message);
        alert(`Failed to update Pokemon: ${error.message}`);
      } else {
        console.error("An unknown error occurred:", error);
        alert("Failed to update Pokemon: Unknown error occurred");
      }
    }
  };

  return (
    <div className="flex gap-8">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <section className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Pokemon Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                value={formData.sprites.front_default}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sprites: {
                      ...formData.sprites,
                      front_default: e.target.value,
                    },
                  })
                }
                required
              />
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.types[0].type.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      types: [
                        {
                          type: {
                            name: e.target.value,
                            url: `https://pokeapi.co/api/v2/type/${e.target.value}`,
                          },
                        },
                      ],
                    })
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select type</option>
                  {pokemonTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.speciesData.flavor_text_entries[0].flavor_text}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    speciesData: {
                      ...formData.speciesData,
                      flavor_text_entries: [
                        {
                          ...formData.speciesData.flavor_text_entries[0],
                          flavor_text: e.target.value,
                        },
                      ],
                    },
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
                rows={3}
              />
            </div>
          </section>

          {/* Right Column */}
          <section className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Stats</label>
              {formData.stats.map((stat, index) => (
                <div key={stat.stat.name} className="flex items-center gap-2">
                  <label className="w-24 text-sm">
                    {stat.stat.name.charAt(0).toUpperCase() +
                      stat.stat.name.slice(1)}
                    :
                  </label>
                  <Input
                    type="number"
                    value={stat.base_stat}
                    onChange={(e) => {
                      const newStats = [...formData.stats];
                      newStats[index] = {
                        ...newStats[index],
                        base_stat: e.target.value,
                      };
                      setFormData({
                        ...formData,
                        stats: newStats,
                      });
                    }}
                    required
                    min="1"
                    max="255"
                    className="w-20"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Update Pokemon</Button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePokemonForm;
