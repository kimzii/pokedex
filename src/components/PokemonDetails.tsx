import React from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";

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

interface PokemonProps {
  data: DataType;
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const PokemonDetails: React.FC<PokemonProps> = ({ data }) => {
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

  const latestFlavorTextEntry = data.speciesData?.flavor_text_entries
  .filter((entry: FlavorTextEntry) => entry.language.name === 'en')
  .pop();

  return (
    <Card className="w-[360px] md:w-[760px] p-8">
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
      <CardFooter className='grid gap-8 border-solid border-2 border-primary rounded p-4'>
        {data.speciesData && (
            <div className='text-start flex flex-col gap-2'>
               <p>Evolves from: {capitalizeFirstLetter(data.speciesData.evolves_from_species?.name ?? '') || 'None'}</p>
              {latestFlavorTextEntry && <p>Description: {latestFlavorTextEntry.flavor_text}</p>}
            </div>
          )}

          <div className='grid md:grid-cols-3 justify-items-start gap-4'>
            {data.stats.map(stat => (
              
              <div key={stat.stat.name}>
                <span className=" px-[6px]">
                  {capitalizeFirstLetter(stat.stat.name)}:
                </span>
                <span className=" px-[6px]">
                  {stat.base_stat}
                </span>
              </div>
            ))}
          </div>
      </CardFooter>
    </Card>
  );
};

export default PokemonDetails;
