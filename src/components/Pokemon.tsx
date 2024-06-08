import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Type {
  type: {
    name: string;
    url: string;
  };
}

interface DataType {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Type[];
}

interface PokemonProps {
  data: DataType;
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const Pokemon: React.FC<PokemonProps> = ({ data }) => {
  const getTypeColorClass = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'grass':
        return 'bg-grass';
      case 'fire':
        return 'bg-fire';
      case 'water':
        return 'bg-water';
      case 'poison':
        return 'bg-poison';
      case 'normal':
        return 'bg-normal';
      case 'flying':
        return 'bg-flying';
      case 'ground':
        return 'bg-ground';
      case 'psychic':
        return 'bg-psychic';
      case 'bug':
        return 'bg-bug';
      case 'fairy':
        return 'bg-fairy';
      case 'fighting':
        return 'bg-fighting';
      case 'rock':
        return 'bg-rock';
      case 'electric':
        return 'bg-electric';
      case 'steel':
        return 'bg-steel';
      case 'ice':
        return 'bg-ice';
      case 'ghost':
        return 'bg-ghost';
      default:
        return 'bg-gray-500'; 
    }
  };

  return (
    <Card className="w-[360px] h-[420px] p-8 hover:bg-secondary">
      <CardHeader className="bg-[url('./assets/bg-pokeball.png')] bg-contain bg-no-repeat bg-[length:260px] bg-center">
        <p className='text-end font-bold text-2xl'>{data.id}</p>
        <img src={data.sprites.front_default} alt="" className="w-[200px] mx-auto" />
      </CardHeader>
      <CardContent className="flex justify-between">
        <CardTitle>{capitalizeFirstLetter(data.name)}</CardTitle>
        <div className='flex flex-col gap-[6px]'>
          {data.types.map(type => (
            <span key={type.type.name} className={`badge rounded px-[6px] ${getTypeColorClass(type.type.name)}`}>
              {capitalizeFirstLetter(type.type.name)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Pokemon;
