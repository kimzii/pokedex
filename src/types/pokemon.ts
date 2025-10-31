export interface Type {
  type: {
    name: string;
    url: string;
  };
}

export interface Stats {
  base_stat: string;
  stat: {
    name: string;
  };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
    url: string;
  };
}

export interface SpeciesData {
  evolves_from_species?: {
    name: string;
  };
  flavor_text_entries: FlavorTextEntry[];
}

export interface DataType {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Type[];
  stats: Stats[];
  speciesData?: SpeciesData;
}

export interface CustomPokemon {
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
