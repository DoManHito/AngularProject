import { Injectable, signal } from '@angular/core';
import { Unit, UNIT_ICONS } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  units = signal<Unit[]>([]);
  constructor(){
    this.generateInventory();
  }

  generateInventory(){
    this.addUnit(this.getWarrior(1, 'human'));
    this.addUnit(this.getArcher(1, 'human'));
    this.addUnit(this.getMage(1, 'human'));
  }

  getWarrior(level: number, race : 'human' | 'goblin'){
    const newUnit : Unit = 
    {
      type: 'warrior',
      level: level,
      xp: 0,
      damage: 8 + level * 2,
      defense: 5 + level * 1.5,
      health: 50 + level * 10,
      currentHealth: 50 + level * 10,
      speed: 2,
      image: UNIT_ICONS.warrior[race]
    };
    return newUnit;
  }

  getArcher(level: number, race : 'human' | 'goblin'){
    const newUnit : Unit = 
    {
      type: 'archer',
      level: 1,
      xp: 0,
      damage: 12 + level * 3,
      defense: 2 + level * 0.5,
      health: 30 + level * 5,
      currentHealth: 30 + level * 5,
      speed: 4,
      image: UNIT_ICONS.archer[race]
    };
    return newUnit;
  }

  getMage(level: number, race : 'human' | 'goblin'){
    const newUnit : Unit = 
    {
      type: 'mage',
      level: 1,
      xp: 0,
      damage: 25 + level * 5,
      defense: 1,
      health: 20 + level * 3,
      currentHealth: 20 + level * 3,
      speed: 3,
      image: UNIT_ICONS.mage[race]
    };
    return newUnit;
  }

  addUnit(unit : Unit){
    this.units.update(currentUnits => [...currentUnits, unit]);
  }
}
