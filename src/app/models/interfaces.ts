import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Interfaces {
  
}

// Coordinates on map
export interface Point {
  x: number;
  y: number;
}

// Game resources
export interface Resources {
  gold: number;
  wood: number;
  ore: number;
}

export interface Spell{
  damageFactor: number;
  name: string;
  type: string;
  icon: string;
}

// Unit stats
export interface Unit {
  id?: string;
  race: 'human' | 'goblin';
  pos: {
      x: number;
      y: number;
  };
  type: 'warrior' | 'archer' | 'mage';
  level: number;
  xp: number;
  damage: number; 
  defense: number;
  health: number;
  currentHealth: number;
  speed: number;
  image: string; 
  spells: Spell[];
}

export const UNIT_ICONS = {
  warrior: {
    human: '⚔️',
    goblin: '🗡️'
  },
  archer: {    
    human: '🏹',
    goblin: '🎯'
  },
  mage: {
    human: '🧙‍♂️',
    goblin: '🧪'
  }
};

// Hero stats
export interface Hero {
  name: string;
  level: number;
  attack: number;
  defense: number;
  spellPower: number;
  knowledge: number;
  army: (Unit | null)[];
}

export type TileType = 'grass' | 'water' | 'mountain';

export interface Tile {
  type: TileType;
  isPassable: boolean;  
  isVisible: boolean;
  content?: {
    id: string;
    type: 'resource' | 'monster' | 'artifact' | 'castle';
    value?: any;  
    icon?: string;
  };
  status?: 'visited' | 'processing';
}

export interface BatleFloor{
  type: 'arena-floor' | 'arena-rock';
  isPassable: boolean;
  status?: boolean;
}