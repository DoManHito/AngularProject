import { Component, computed, effect, signal } from '@angular/core';
import { GameStateService } from '../../services/game-state';
import { BatleFloor, Point, Spell, Unit } from '../../models/interfaces';
import { InventoryService } from '../../services/inventory';
import { MapService } from '../../services/map';
import { SocketService } from '../../services/socket';

@Component({
  selector: 'app-batle',
  imports: [],
  templateUrl: './batle.html',
  styleUrl: './batle.css',
})

export class BatleComponent {
  selectedUnitId: string | undefined = undefined;
  posiblePath: Point[] | undefined = undefined;
  activatedSpell: Spell | undefined = undefined;

  isStats = signal<boolean>(false);
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

  constructor(
    public gameState : GameStateService, 
    public inventory : InventoryService, 
    public mapService : MapService,
    public socketService : SocketService) {
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

    const enemyCount = Math.max(1, playerUnits.length + (Math.floor(Math.random() * 2) - 1));

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
        const damageTaken = this.activatedSpell!.damageFactor * this.activeUnit()!.damage - unit.defense; 
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

      const newQueue = this.turnQueue();
      const newIndex = newQueue.findIndex(u => u.id === attackerId);
      if (newIndex === -1) {
        this.currentTurnIndex--; 
      } else {
        this.currentTurnIndex = newIndex;
      }
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
    const survivors = this.unitsInBattle().filter(u => u.race === 'human' && u.currentHealth > 0);
    this.inventory.units.update(inventoryUnits => {
      return inventoryUnits.map(invUnit => {
        const updatedUnit = survivors.find(s => s.id === invUnit.id);
        return updatedUnit ? { ...updatedUnit } : invUnit;
      })
      .filter(invUnit => {
        return survivors.some(s => s.id === invUnit.id);
      });;
    });
    this.gameState.isBatle.set(false);
  }

  processEnemyTurn(enemy: Unit) {
    const target = this.findClosestTarget(enemy, this.unitsInBattle());
    if (!target) return this.finishAction();

    const bestSpell = this.getBestAvailableSpell(enemy, target);

    const goalPoint = this.findBestPosition(enemy, target, bestSpell);

    this.moveEnemyTowardsPoint(enemy, goalPoint, (updatedEnemy) => {
      const distance = Math.abs(target.pos.x - updatedEnemy.pos.x) + Math.abs(target.pos.y - updatedEnemy.pos.y);
      const canHitNow = bestSpell 
        ? bestSpell.range.some(o => (updatedEnemy.pos.x - o.x === target.pos.x) && (updatedEnemy.pos.y - o.y === target.pos.y))
        : distance === 1;

      if (canHitNow) {
        this.performEnemyAttack(updatedEnemy, target, bestSpell);
      } else {
        this.finishAction();
      }
    });
  }

  performEnemyAttack(attacker: Unit, victim: Unit, spell?: Spell) {
    setTimeout(() => {
      if (spell) {
        const hitCoords = new Set(
          spell.range.map(offset => `${attacker.pos.x - offset.x},${attacker.pos.y - offset.y}`)
        );

        this.batleMap.update(map => map.map((row, x) => 
          row.map((tile, y) => ({
            ...tile,
            isAtack: hitCoords.has(`${x},${y}`)
          }))
        ));

        setTimeout(() => {
          this.applyDamage(attacker, spell, hitCoords);
        }, 500);

      } else {
        const hitCoords = new Set([`${victim.pos.x},${victim.pos.y}`]);
        this.applyDamage(attacker, undefined, hitCoords);
      }
    }, 1000);
  }

  moveEnemyTowardsPoint(attacker: Unit, goal: Point, onComplete: (u: Unit) => void) {
    let stepsLeft = attacker.speed;

    const step = () => {
      const diffX = goal.x - attacker.pos.x;
      const diffY = goal.y - attacker.pos.y;

      if ((diffX === 0 && diffY === 0) || stepsLeft <= 0) {
        onComplete(attacker);
        return;
      }

      let nextX = attacker.pos.x + Math.sign(diffX);
      let nextY = attacker.pos.y + Math.sign(diffY);

      if (!this.isTileFree(nextX, nextY)) {
          nextX = attacker.pos.x;
          nextY = attacker.pos.y + (diffY === 0 ? 0 : Math.sign(diffY));
      }

      if (this.isTileFree(nextX, nextY)) {
        this.changePosition({ x: nextX, y: nextY });
        attacker.pos = { x: nextX, y: nextY };
        stepsLeft--;
        setTimeout(step, 250);
      } else {
        onComplete(attacker);
      }
    };
    step();
  }

  findBestPosition(attacker: Unit, target: Unit, spell?: Spell): Point {
    let bestPos = { ...attacker.pos };
    let minSteps = 1000;

    for (let x = 0; x < this.batleMapY; x++) {
      for (let y = 0; y < this.batleMapX; y++) {
        
        if (this.isTileFree(x, y) || (x === attacker.pos.x && y === attacker.pos.y)) {
          
          let canHit = false;
          if (spell) {
            canHit = spell.range.some(offset => 
              (x - offset.x === target.pos.x) && (y - offset.y === target.pos.y)
            );
          }

          if (canHit) {
            const stepsToPos = Math.abs(x - attacker.pos.x) + Math.abs(y - attacker.pos.y);
            if (stepsToPos < minSteps) {
              minSteps = stepsToPos;
              bestPos = { x, y };
            }
          }
        }
      }
    }
    return bestPos;
  }

  findClosestTarget(me: Unit, allUnits: Unit[]): Unit | null {
    const targets = allUnits.filter(u => u.race === 'human' && u.currentHealth > 0);
    if (targets.length === 0) return null;

    let closest = targets[0];
    let minDistancce = 10000;

    for (const t of targets) {
      const dst = Math.abs(t.pos.x - me.pos.x) + Math.abs(t.pos.y - me.pos.y);
      if (dst < minDistancce) {
        minDistancce = dst;
        closest = t;
      }
    }
    return closest;
  }

  getBestAvailableSpell(attacker: Unit, target: Unit): Spell | undefined {
    if (!attacker.spells || attacker.spells.length === 0) return undefined;

    return attacker.spells[0];
  }

  isTileFree(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.batleMapY || y >= this.batleMapX) return false;
    return !this.unitsInBattle().some(u => u.pos.x === x && u.pos.y === y && u.currentHealth > 0);
  }

  applyDamage(attacker: Unit, spell: Spell | undefined, hitCoords: Set<string>) {
    this.unitsInBattle.update(units => units.map(u => {
      if (hitCoords.has(`${u.pos.x},${u.pos.y}`)) {
        
        let damage = attacker.damage;
        
        if (spell) {
          this.spellActivate(spell)
          damage = Math.round(damage * spell.damageFactor);
        }

        const finalDamage = Math.max(1, damage - u.defense);
        return { ...u, currentHealth: Math.max(0, u.currentHealth - finalDamage) };
      }
      return u;
    }));

    if (spell) {
      setTimeout(() => this.clearActivatedSpells(), 300);
    }

    this.checkDeads();
    
    setTimeout(() => this.finishAction(), 800);
  }
}
