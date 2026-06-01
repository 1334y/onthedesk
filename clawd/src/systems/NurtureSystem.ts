/**
 * 养成数值系统
 *
 * 管理 4 维状态:
 *   🍞 饥饿 Hunger  - 范围 0-100, 衰减 -1/10min
 *   ⚡ 体力 Energy   - 范围 0-100, 衰减 -1/5min (活动时)
 *   😊 心情 Mood     - 范围 0-100, 衰减 -1/15min
 *   ❤️ 好感 Affection - 范围 0-100, 不衰减, 累积型
 *
 * 好感度等级:
 *   0-25   陌生 - 基本动作
 *   26-50  熟悉 - 坐下晃腿、招手
 *   51-75  亲近 - 跳舞、特殊表情、主动靠近鼠标
 *   76-100 羁绊 - 彩蛋动作、稀有台词、金色皮肤
 */

import { eventBus, Events } from '../utils/EventBus';

export interface PetStats {
  hunger: number;
  energy: number;
  mood: number;
  affection: number;
}

export enum AffectionLevel {
  STRANGER = 'stranger',   // 0-25
  FAMILIAR = 'familiar',   // 26-50
  CLOSE = 'close',         // 51-75
  BONDED = 'bonded',       // 76-100
}

const DECAY_RATES = {
  hunger: { amount: 1, intervalMs: 10 * 60 * 1000 },   // 1 per 10 min
  energy: { amount: 1, intervalMs: 5 * 60 * 1000 },     // 1 per 5 min (active)
  mood: { amount: 1, intervalMs: 15 * 60 * 1000 },      // 1 per 15 min
};

export class NurtureSystem {
  private stats: PetStats = {
    hunger: 30,
    energy: 80,
    mood: 70,
    affection: 0,
  };

  private lastDecayTime: Record<string, number> = {};
  private level: AffectionLevel = AffectionLevel.STRANGER;
  private active: boolean = true; // 是否处于活动状态 (影响体力衰减)

  constructor() {
    const now = Date.now();
    this.lastDecayTime = {
      hunger: now,
      energy: now,
      mood: now,
    };
  }

  getStats(): Readonly<PetStats> {
    return { ...this.stats };
  }

  getLevel(): AffectionLevel {
    return this.level;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  /** 每次 tick 调用 (建议每秒一次) */
  tick(now: number): void {
    // 检查衰减
    const hungerInterval = DECAY_RATES.hunger.intervalMs;
    if (now - this.lastDecayTime.hunger >= hungerInterval) {
      this.modifyStat('hunger', DECAY_RATES.hunger.amount);
      this.lastDecayTime.hunger = now;
    }

    if (this.active) {
      const energyInterval = DECAY_RATES.energy.intervalMs;
      if (now - this.lastDecayTime.energy >= energyInterval) {
        this.modifyStat('energy', DECAY_RATES.energy.amount);
        this.lastDecayTime.energy = now;
      }
    }

    const moodInterval = DECAY_RATES.mood.intervalMs;
    if (now - this.lastDecayTime.mood >= moodInterval) {
      this.modifyStat('mood', DECAY_RATES.mood.amount);
      this.lastDecayTime.mood = now;
    }
  }

  private modifyStat(stat: keyof PetStats, delta: number): void {
    const old = this.stats[stat];
    this.stats[stat] = Math.max(0, Math.min(100, this.stats[stat] + delta));
    const current = this.stats[stat];

    eventBus.emit(Events.STAT_CHANGED, { stat, old, current, delta });

    // 检查紧急状态
    if ((stat === 'hunger' && current >= 90) ||
        (stat === 'energy' && current <= 5)) {
      eventBus.emit(Events.STAT_CRITICAL, { stat, value: current });
    }

    // 检查好感度等级提升
    if (stat === 'affection') {
      this.checkLevelUp();
    }
  }

  /** 好感度等级检查 */
  private checkLevelUp(): void {
    const oldLevel = this.level;
    const aff = this.stats.affection;

    if (aff >= 76) this.level = AffectionLevel.BONDED;
    else if (aff >= 51) this.level = AffectionLevel.CLOSE;
    else if (aff >= 26) this.level = AffectionLevel.FAMILIAR;
    else this.level = AffectionLevel.STRANGER;

    if (this.level !== oldLevel) {
      eventBus.emit(Events.AFFECTION_LEVEL_UP, {
        oldLevel,
        newLevel: this.level,
        affection: aff,
      });
    }
  }

  // === 交互影响 ===

  /** 抚摸 (单击) */
  pet(): void {
    this.modifyStat('mood', 5);
    this.modifyStat('affection', 3);
  }

  /** 双击 - 开心互动 */
  doublePet(): void {
    this.modifyStat('mood', 10);
    this.modifyStat('affection', 1);
  }

  /** 喂食 */
  feed(amount: number = 30): void {
    this.modifyStat('hunger', -amount);
    this.modifyStat('mood', 5);
    this.modifyStat('affection', 5);
  }

  /** 聊天互动 */
  chat(): void {
    this.modifyStat('mood', 3);
    this.modifyStat('affection', 2);
  }

  /** 长时间陪伴加成 */
  companionBonus(): void {
    this.modifyStat('affection', 1);
  }

  /** 加载存档 */
  load(data: PetStats & { lastDecayTime: Record<string, number> }): void {
    this.stats = {
      hunger: data.hunger,
      energy: data.energy,
      mood: data.mood,
      affection: data.affection,
    };
    this.lastDecayTime = data.lastDecayTime;
    this.checkLevelUp();
  }

  /** 获取存档数据 */
  save(): PetStats & { lastDecayTime: Record<string, number> } {
    return {
      ...this.stats,
      lastDecayTime: { ...this.lastDecayTime },
    };
  }
}
