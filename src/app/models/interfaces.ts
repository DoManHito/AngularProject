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
  mercury: number;
}

// Unit stats
export interface Unit {
  id: string;
  name: string;
  level: number;
  damage: number; 
  defense: number;
  health: number;
  currentHealth: number;
  speed: number; 
  quantity: number;
  image: string; 
}

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
}

export interface BatleFloor{
  type: 'arena-floor' | 'arena-rock';
  isPassable: boolean;
}