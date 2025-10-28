import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomPokemonData {
  id: number;
  name: string;
  imageUrl: string;
  type: string;
  stats?: {
    hp: string;
    attack: string;
    defense: string;
    specialAttack: string;
    specialDefense: string;
    speed: string;
  };
  description?: string;
  evolvesFrom?: string;
}

interface CustomPokemonProps {
  data: CustomPokemonData;
}

const CustomPokemon: React.FC<CustomPokemonProps> = ({ data }) => {
  const getTypeColorClass = (type: string): string => {
    switch (type.toLowerCase()) {
      case "grass":
        return "bg-grass";
      case "fire":
        return "bg-fire";
      case "water":
        return "bg-water";
      // ...existing type colors...
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="w-[360px] h-[420px] p-8 hover:bg-secondary">
      <CardHeader className="bg-[url('./assets/bg-pokeball.png')] bg-no-repeat bg-[length:260px] bg-center">
        <p className="text-end font-bold text-2xl">{data.id}</p>
        <img
          src={data.imageUrl}
          alt={data.name}
          className="w-[200px] mx-auto"
        />
      </CardHeader>
      <CardContent className="flex justify-between">
        <CardTitle>{data.name}</CardTitle>
        <div className="flex flex-col gap-[6px]">
          <span
            className={`badge rounded px-[6px] ${getTypeColorClass(data.type)}`}
          >
            {data.type}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomPokemon;
