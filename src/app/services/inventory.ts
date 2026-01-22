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

  getUnit(type : 'warrior' | 'archer' | 'mage', level : number, race : 'human' | 'goblin') : Unit{
    switch (type){
      case 'archer':
        return this.getArcher(level, race);
      case 'mage':
        return this.getMage(level, race)
      case 'warrior':
        return this.getWarrior(level, race)
    }
  }

  getWarrior(level: number, race : 'human' | 'goblin'){
    const newUnit : Unit = 
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'warrior',
      level: level,
      xp: 0,
      xpForLvl: 50,
      damage: 8 + level * 2,
      defense: 5 + level * 1.5,
      health: 50 + level * 10,
      currentHealth: 50 + level * 10,
      speed: 3,
      image: UNIT_ICONS.warrior[race],
      race: race,
      pos: {x:0,y:0},
      spells: [{
        damageFactor : 1,
        name: 'Powerful hit',
        type: 'swish',
        icon: 'swish.png',
        range: [{x : -1, y : 1}, {x : 0, y : 1}, {x : 1, y : 1}],
        // 0 0 1
        // 0 h 1
        // 0 0 1
      }],
    };
    return newUnit;
  }

  getArcher(level: number, race : 'human' | 'goblin'){
    const newUnit : Unit = 
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'archer',
      level: level,
      xp: 0,
      xpForLvl: 50,
      damage: 12 + level * 3,
      defense: 2 + level * 0.5,
      health: 30 + level * 5,
      currentHealth: 30 + level * 5,
      speed: 4,
      image: UNIT_ICONS.archer[race],
      race: race,
      pos: {x:0,y:0},
      spells: [{
        damageFactor : 1,
        name: 'Empower shot',
        type: 'shot',
        icon: 'arrow.png',
        range: [{x : 0, y : 1}, {x : 0, y : 2}, {x : 0, y : 3}, {x : 0, y : 4}, {x : 0, y : 5}],
        // 0 0 0 0 0 0 0
        // 0 h 1 1 1 1 1
        // 0 0 0 0 0 0 0
      }],
    };
    return newUnit;
  }

  getMage(level: number, race : 'human' | 'goblin'){
    const newUnit : Unit = 
    {
      id: Math.random().toString(36).substr(2, 9),
      type: 'mage',
      level: level,
      xp: 0,
      xpForLvl: 50,
      damage: 25 + level * 5,
      defense: 1,
      health: 20 + level * 3,
      currentHealth: 20 + level * 3,
      speed: 3,
      image: UNIT_ICONS.mage[race],
      race: race,
      pos: {x:0,y:0},
      spells: [{
        damageFactor : 1,
        name: 'Fireball',
        type: 'fireball',
        icon: `fireball.png`,
        range: [{x : -1, y : 2}, {x : 0, y : 2}, {x : 1, y : 2},
                {x : -1, y : 3}, {x : 0, y : 3}, {x : 1, y : 3},
                {x : -1, y : 4}, {x : 0, y : 4}, {x : 1, y : 4}],
        // 0 0 0 1 1 1
        // 0 h 0 1 1 1
        // 0 0 0 1 1 1
      }],
    };
    return newUnit;
  }

  addUnit(unit : Unit){
    this.units.update(currentUnits => [...currentUnits, unit]);
  }
}
