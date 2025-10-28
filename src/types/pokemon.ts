export interface Pokemon {
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
