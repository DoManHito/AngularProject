import { Component, computed, effect, signal } from '@angular/core';
import { GameStateService } from '../../services/game-state';
import { BatleFloor, Point, Spell, Unit } from '../../models/interfaces';
import { InventoryService } from '../../services/inventory';
import { MapService } from '../../services/map';

@Component({
  selector: 'app-batle',
  imports: [],
  templateUrl: './batle.html',
  styleUrl: './batle.css',
})

export class BatleComponent {
  isStats = signal<boolean>(false);
  selectedUnitId: string | undefined = undefined;
  posiblePath: Point[] | undefined = undefined;
  activatedSpell: Spell | undefined = undefined;

  batleMap = signal<BatleFloor[][]>([]);
  unitsInBattle = signal<Unit[]>([]);
  activeUnit = signal<Unit | null>(null);

  currentTurnIndex = 0;

  turnQueue = computed(() => {
    return [...this.unitsInBattle()]
      .sort((a, b) => b.speed - a.speed)
  });
  
  readonly batleMapX = 10;
  readonly batleMapY = this.batleMapX / 2;
  readonly batleMapTileSize = 120;

  constructor(public gameState : GameStateService, public inventory : InventoryService, public mapService : MapService) {
    document.documentElement.style.setProperty('--map-x', this.batleMapX.toString());
    document.documentElement.style.setProperty('--map-y', this.batleMapY.toString());
    document.documentElement.style.setProperty('--batle-tile-size', this.batleMapTileSize.toString() + 'px');
    document.documentElement.style.setProperty('--unit-size', (this.batleMapTileSize / 2).toString() + 'px');

    effect(() => {
      if(this.gameState.isBatle()){
        this.generateBatleMap();
        this.placeUnit();

        setTimeout(() => this.startBattle(), 100);
      }
    })
  };

  startBattle() {
    this.currentTurnIndex = -1;
    this.nextTurn();
  }

  nextTurn() {
    const queue = this.turnQueue();
    if (queue.length === 0) return;

    this.currentTurnIndex++;
    
    if (this.currentTurnIndex >= queue.length) {
      this.currentTurnIndex = 0;
    }

    const nextUnit = queue[this.currentTurnIndex];
    this.activeUnit.set(nextUnit);
    this.selectedUnitId = nextUnit.id;

    if (nextUnit.race === 'human') {
        this.activatePosiblePath(nextUnit.pos, nextUnit.speed);
    } else {
        this.processEnemyTurn(nextUnit);
    }
  }

  finishAction() {
    this.clearPosiblePath();
    this.activeUnit.set(null);
    setTimeout(() => this.nextTurn(), 100);
  }

  openStats(){
    this.isStats.set(!this.isStats());
  }

  selectUnitFromQueue(unit: Unit) {
    if (this.selectedUnitId === unit.id) {
      this.selectedUnitId = undefined;
    } else {
      this.selectedUnitId = unit.id;
    }
  }

  getUnitStyle(unit: Unit) {
    const pos = unit.pos;
    if (!pos) return '';
    
    const tx = pos.y * this.batleMapTileSize;
    const ty = pos.x * this.batleMapTileSize;
    return `translate(${tx}px, ${ty}px)`;
  }

  generateBatleMap(){
    const newBatleMap : BatleFloor[][] = [];
    for (let i = 0; i < this.batleMapY; i++) {
      const row : BatleFloor[] = [];
      for (let j = 0; j < this.batleMapX; j++) {
        row.push({
          type: 'arena-floor',
          isPassable: true,
        });
      }
      newBatleMap.push(row)
    }
    this.batleMap.set(newBatleMap);
  }

  placeUnit(){
    const playerUnits : Unit[] = this.inventory.units().map((unit, index) => ({
      ...unit,
      pos: {x: index, y: 0}
    }))

    const enemy = this.generateEnemy(playerUnits);

    const enemyUnits = enemy.map((unit, index) => ({
      ...unit,
      pos: {x: index, y: this.batleMapX - 1}
    }))

    this.unitsInBattle.set([...playerUnits, ...enemyUnits])
  }
      
  generateEnemy(playerUnits: Unit[]): Unit[] {
    const enemy: Unit[] = [];
    
    const avgLevel = Math.round(playerUnits.reduce((sum, u) => sum + u.level, 0) / playerUnits.length);

    const enemyCount = Math.max(1, playerUnits.length + (Math.floor(Math.random() * 4) - 1));

    const types = ['warrior', 'archer', 'mage'];

    for (let i = 0; i < enemyCount; i++) {
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const enemyLevel = Math.max(1, avgLevel + (Math.floor(Math.random() * 3) - 1));

      let newEnemy: Unit;
      if (randomType === 'archer') {
        newEnemy = this.inventory.getArcher(enemyLevel, 'goblin');
      } else if (randomType === 'warrior') {
        newEnemy = this.inventory.getWarrior(enemyLevel, 'goblin');
      } else {
        newEnemy = this.inventory.getMage(enemyLevel, 'goblin');
      }

      newEnemy = this.applyRandomStats(newEnemy);

      enemy.push(newEnemy);
    }

    return enemy;
  }

  applyRandomStats(unit: Unit): Unit {
    const variation = 0.1;
    const factor = 1 + (Math.random() * variation * 2 - variation);

    unit.damage = Math.round(unit.damage * factor);
    unit.defense = Math.round(unit.defense * factor);
    unit.health = Math.round(unit.health * factor);
    unit.currentHealth = unit.health;
    
    return unit;
  }

  getUnitAt (target : Point){
    return this.unitsInBattle().find(u => (u.pos.x === target.x && u.pos.y === target.y));
  }

  onTileClick(target : Point){
    const currentActive = this.activeUnit();

    if(!currentActive) return;
    if(currentActive.race !== 'human') return;

    const tile = this.batleMap()[target.x][target.y];
    if(tile.isAtack){
      this.doAtack();
    }
    this.clearActivatedSpells();

    if(tile.isProcessing){
      this.changePosition(target);
    }
  }

  changePosition(target: Point){
    this.unitsInBattle.update(units => 
      units.map(u => {
        if (this.activeUnit() === u){
          return {...u, pos: {...target}};
        }
        return u;
      })
    );
    this.activeUnit.set(this.getUnitAt(target)!);
  }

  activatePosiblePath(startPos : Point, speed : number){
    this.batleMap.update(map => {
      return map.map((row, x) => 
        row.map((tile, y) => {
          const distance = Math.abs(startPos.x - x) + Math.abs(startPos.y - y);
          
          return {
            ...tile,
            isProcessing : ((distance <= speed && tile.isPassable && !this.getUnitAt({x, y})) 
            || this.getUnitAt(startPos) === this.getUnitAt({x, y})),
          };
        })
      );
    });
  }

  clearPosiblePath(){
    this.batleMap.update(map => 
      map.map(row => row.map(tile => ({ ...tile, isProcessing : undefined}))))
  }

  spellActivate(spell : Spell){
    const activeUnit = this.activeUnit();
    if(!activeUnit) return;

    this.activatedSpell = spell;
    const hitCoords = new Set(
      spell.range.map(offset => `${activeUnit.pos.x + offset.x},${activeUnit.pos.y + offset.y}`)
    );
    
    this.batleMap.update(map => {
      return map.map((row, x) => 
        row.map((tile, y) => {   
          return {
            ...tile,
            isAtack: hitCoords.has(`${x},${y}`)
          };
        })
      );
    });
  }

  clearActivatedSpells(){
    this.batleMap.update(map => 
      map.map(row => row.map(tile => ({ ...tile, isAtack : undefined}))))
  }

  doAtack(){
    const map = this.batleMap();
  
    this.unitsInBattle.update(units => units.map(unit => {
      const tile = map[unit.pos.x][unit.pos.y];
      
      if (tile.isAtack) {
        const damageTaken = this.activatedSpell!.damageFactor * this.activeUnit()!.damage; 
        const newHealth = Math.max(0, unit.currentHealth - damageTaken);
        
        return { ...unit, currentHealth: newHealth };
      }
      return unit;
    }));

    this.checkDeads();
    this.finishAction();

  }

  checkDeads(){
    const deadUnits = this.unitsInBattle().filter(u => u.currentHealth <= 0);

    if (deadUnits.length > 0) {
      const totalXpGained = deadUnits.reduce((sum, unit) => sum + (unit.level * 100), 0);
      const attackerId = this.activeUnit()?.id;

      this.unitsInBattle.update(units => {
        const aliveUnits = units.filter(u => u.currentHealth > 0);

        return aliveUnits.map(u => {
          if (u.id === attackerId) {
            let updatedUnit = { ...u, xp: u.xp + totalXpGained };
            
            while (updatedUnit.xp >= updatedUnit.xpForLvl) {
              updatedUnit = this.calculateLvlUp(updatedUnit);
            }
            return updatedUnit;
          }
          return u;
        });
      });
    }
    if(this.checkEndFight()) return;
  }

  checkEndFight() : boolean{
    const enemy = this.unitsInBattle().filter(u => u.race === 'goblin');
    this.activeUnit.set(null);
    if(enemy.length === 0){
      const tile = this.gameState.currentTile();
      if(!tile) return false;
      this.mapService.map()[tile.x][tile.y].content = undefined;
      setTimeout(() => this.endBatle(), 1000);
      return true;
    }
    const ally = this.unitsInBattle().filter(u => u.race === 'human');
    if(ally.length === 0){
      setTimeout(() => this.endBatle(), 1000);
      return true;
    }
    return false;
  }

  calculateLvlUp(unit : Unit) : Unit {
    return {
      ...this.inventory.getUnit(unit.type, unit.level + 1, unit.race),
      id: unit.id,
      xp: unit.xp - unit.xpForLvl,
      xpForLvl: Math.floor(unit.xpForLvl * Math.pow(1.5, unit.level + 1)),
      pos: unit.pos,
    };
  }

  endBatle(){
    const survivors = this.unitsInBattle().filter(u => u.race === 'human');
    this.inventory.units.update(inventoryUnits => {
      return inventoryUnits.map(invUnit => {
        const updatedUnit = survivors.find(s => s.id === invUnit.id);
        return updatedUnit ? { ...updatedUnit } : invUnit;
      });
    });
    this.gameState.isBatle.set(false);
  }

  // TODO action
  processEnemyTurn(enemy: Unit) {
    setTimeout(() => {
      
      this.finishAction(); 
    }, 1000);
  }
}
