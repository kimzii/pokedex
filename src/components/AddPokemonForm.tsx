import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Pokemon } from "../types/pokemon";

interface AddPokemonFormProps {
  onSubmit: (data: Pokemon) => void;
  onCancel: () => void;
}

const AddPokemonForm: React.FC<AddPokemonFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    sprites: {
      front_default: "",
    },
    types: [
      {
        type: {
          name: "normal",
          url: "https://pokeapi.co/api/v2/type/1",
        },
      },
    ],
    stats: [
      { base_stat: "45", stat: { name: "hp" } },
      { base_stat: "45", stat: { name: "attack" } },
      { base_stat: "45", stat: { name: "defense" } },
      { base_stat: "45", stat: { name: "special-attack" } },
      { base_stat: "45", stat: { name: "special-defense" } },
      { base_stat: "45", stat: { name: "speed" } },
    ],
    speciesData: {
      evolves_from_species: {
        name: "",
      },
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

  // Update the pokemonTypes array with type IDs
  const pokemonTypes = [
    { name: "normal", id: 1 },
    { name: "fighting", id: 2 },
    { name: "flying", id: 3 },
    { name: "poison", id: 4 },
    { name: "ground", id: 5 },
    { name: "rock", id: 6 },
    { name: "bug", id: 7 },
    { name: "ghost", id: 8 },
    { name: "steel", id: 9 },
    { name: "fire", id: 10 },
    { name: "water", id: 11 },
    { name: "grass", id: 12 },
    { name: "electric", id: 13 },
    { name: "psychic", id: 14 },
    { name: "ice", id: 15 },
    { name: "dragon", id: 16 },
    { name: "dark", id: 17 },
    { name: "fairy", id: 18 },
  ];

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get the selected type from form state
      const selectedType = pokemonTypes.find(
        (t) => t.name === formData.types[0].type.name
      );

      const pokemonData = {
        name: formData.name.trim(),
        imageUrl: formData.sprites.front_default.trim(),
        // Send type as a simple string instead of an array
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

      console.log("Selected type:", selectedType?.name); // Debug log
      console.log("Type being sent:", formData.types[0].type.name); // Debug log

      const response = await axios.post(
        "http://localhost:5000/api/pokemon/custom",
        pokemonData
      );

      if (response.status === 201) {
        console.log("Pokemon saved:", response.data);
        onSubmit(response.data);
        // Reset form while keeping the current type
        setFormData((prev) => ({
          ...prev,
          name: "",
          sprites: { front_default: "" },
          speciesData: {
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
        }));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Full error:", error.response?.data); // More detailed error logging
        alert("Failed to save Pokemon. Please try again.");
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
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Enter Pokemon name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Sprite URL
              </label>
              <Input
                type="url"
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
                placeholder="Enter sprite URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.types[0].type.name}
                onChange={(e) => {
                  const selectedType = pokemonTypes.find(
                    (t) => t.name === e.target.value
                  );
                  setFormData({
                    ...formData,
                    types: [
                      {
                        type: {
                          name: e.target.value,
                          url: `https://pokeapi.co/api/v2/type/${
                            selectedType?.id || 1
                          }`,
                        },
                      },
                    ],
                  });
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                {pokemonTypes.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                  </option>
                ))}
              </select>
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Evolves From
              </label>
              <Input
                type="text"
                value={formData.speciesData.evolves_from_species.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    speciesData: {
                      ...formData.speciesData,
                      evolves_from_species: {
                        name: e.target.value,
                      },
                    },
                  })
                }
                placeholder="Enter evolution source (optional)"
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

        {/* Form Actions */}
        <div className="flex gap-2 justify-end mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Pokemon</Button>
        </div>
      </form>
    </div>
  );
};

export default AddPokemonForm;
