import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

interface CustomPokemonData {
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
  description?: string;
  evolvesFrom?: string;
}

interface CustomPokemonDetailsProps {
  data: CustomPokemonData;
}

const CustomPokemonDetails: React.FC<CustomPokemonDetailsProps> = ({
  data,
}) => {
  return (
    <Card className="w-[360px] md:w-[760px] p-8">
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
            className={`badge rounded px-[6px] bg-${data.type.toLowerCase()}`}
          >
            {data.type}
          </span>
        </div>
      </CardContent>
      <CardFooter className="grid gap-8 border-solid border-2 border-primary rounded p-4">
        <div className="text-start flex flex-col gap-2">
          {data.evolvesFrom && <p>Evolves from: {data.evolvesFrom}</p>}
          {data.description && <p>Description: {data.description}</p>}
        </div>

        <div className="grid md:grid-cols-3 justify-items-start gap-4">
          <div>HP: {data.stats.hp}</div>
          <div>Attack: {data.stats.attack}</div>
          <div>Defense: {data.stats.defense}</div>
          <div>Sp. Attack: {data.stats.specialAttack}</div>
          <div>Sp. Defense: {data.stats.specialDefense}</div>
          <div>Speed: {data.stats.speed}</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CustomPokemonDetails;
