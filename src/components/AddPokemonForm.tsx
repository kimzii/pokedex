import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface Pokemon {
  name: string;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: string;
    stat: {
      name: string;
    };
  }>;
  speciesData: {
    evolves_from_species: {
      name: string;
    };
    flavor_text_entries: Array<{
      flavor_text: string;
      language: {
        name: string;
        url: string;
      };
    }>;
  };
}

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

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const pokemonData = {
        name: formData.name.trim(),
        imageUrl: formData.sprites.front_default.trim(),
        type: formData.types[0].type.name,
        stats: formData.stats,
        description:
          formData.speciesData?.flavor_text_entries[0]?.flavor_text || "",
        evolvesFrom: formData.speciesData?.evolves_from_species?.name || "",
      };

      const response = await axios.post(
        "http://localhost:5000/api/pokemon/custom",
        pokemonData
      );

      if (response.status === 201) {
        console.log("Pokemon saved successfully:", response.data);
        onSubmit(response.data);
        // Reset form
        setFormData({
          name: "",
          sprites: { front_default: "" },
          types: [{ type: { name: "normal", url: "" } }],
          stats: [
            { base_stat: "45", stat: { name: "hp" } },
            { base_stat: "45", stat: { name: "attack" } },
            { base_stat: "45", stat: { name: "defense" } },
            { base_stat: "45", stat: { name: "special-attack" } },
            { base_stat: "45", stat: { name: "special-defense" } },
            { base_stat: "45", stat: { name: "speed" } },
          ],
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
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          alert("A Pokemon with this name already exists");
          return;
        }
        console.error("Error:", error.response?.data);
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    types: [
                      {
                        type: {
                          name: e.target.value,
                          url: `https://pokeapi.co/api/v2/type/${
                            pokemonTypes.indexOf(e.target.value) + 1
                          }`,
                        },
                      },
                    ],
                  })
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                {pokemonTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
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
