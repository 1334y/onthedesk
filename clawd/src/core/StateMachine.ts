/**
 * 动画状态机
 *
 * 状态分类:
 *   - 循环状态: IDLE, WALK, CLIMB, SIT, SLEEP
 *   - 一次性状态: FALL, WAKE, EAT, EMOTE, HAPPY, ANGRY, HEART
 *
 * 转换优先级: 用户交互 > 养成需求 > 环境触发 > 随机探索 > 默认
 */

export enum AnimState {
  IDLE = 'idle',
  WALK = 'walk',
  CLIMB = 'climb',
  FALL = 'fall',
  SIT = 'sit',
  SLEEP = 'sleep',
  WAKE = 'wake',
  EAT = 'eat',
  HAPPY = 'happy',
  ANGRY = 'angry',
  HEART = 'heart',
  SPECIAL = 'special',
}

/** 循环状态集合 */
export const LOOPING_STATES = new Set<AnimState>([
  AnimState.IDLE,
  AnimState.WALK,
  AnimState.CLIMB,
  AnimState.SIT,
  AnimState.SLEEP,
]);

/** 一次性状态集合 */
export const ONE_SHOT_STATES = new Set<AnimState>([
  AnimState.FALL,
  AnimState.WAKE,
  AnimState.EAT,
  AnimState.HAPPY,
  AnimState.ANGRY,
  AnimState.HEART,
  AnimState.SPECIAL,
]);

/** 状态转换优先级 (数值越大优先级越高) */
export const TRANSITION_PRIORITY: Record<string, number> = {
  // 用户交互 (最高)
  drag: 100,
  rightClick: 90,
  doubleClick: 85,
  click: 80,

  // 养成紧急需求
  hunger_critical: 70,
  energy_critical: 65,

  // 环境触发
  window_edge: 50,
  mouse_near: 40,

  // 正常行为
  hunger_normal: 30,
  energy_low: 25,
  random_explore: 20,

  // 默认
  default: 0,
};

export interface StateTransition {
  from: AnimState;
  to: AnimState;
  priority: number;
  source: string;
}

export class StateMachine {
  private _current: AnimState = AnimState.IDLE;
  private _previous: AnimState = AnimState.IDLE;
  private _locked: boolean = false;
  private _pendingOneShot: AnimState | null = null;

  get current(): AnimState { return this._current; }
  get previous(): AnimState { return this._previous; }
  get locked(): boolean { return this._locked; }

  /**
   * 尝试转换状态
   * @returns 实际生效的状态
   */
  tryTransition(
    target: AnimState,
    priority: number,
    source: string = 'system'
  ): AnimState | null {
    // 锁定期间拒绝所有转换 (用户拖拽等)
    if (this._locked) return null;

    // 如果当前是一次性状态且未播完，检查优先级
    if (ONE_SHOT_STATES.has(this._current)) {
      // 只有更高优先级才能打断一次性状态
      const currentPriority = TRANSITION_PRIORITY[source] ?? 0;
      if (priority <= currentPriority) return null;
    }

    // 同一状态不重复切换 (循环状态除外，允许重置)
    if (target === this._current && LOOPING_STATES.has(target)) {
      return this._current;
    }

    this._previous = this._current;
    this._current = target;

    // 一次性状态播完后自动回 idle
    if (ONE_SHOT_STATES.has(target)) {
      this._pendingOneShot = target;
    }

    return target;
  }

  /** 标记一次性状态播放完毕，回到 idle */
  onOneShotComplete(): AnimState {
    if (this._pendingOneShot) {
      this._pendingOneShot = null;
      this._previous = this._current;
      this._current = AnimState.IDLE;
    }
    return this._current;
  }

  /** 锁定状态 (如拖拽期间) */
  lock(): void { this._locked = true; }
  unlock(): void { this._locked = false; }

  /** 重置到 idle */
  reset(): void {
    this._locked = false;
    this._pendingOneShot = null;
    this._previous = this._current;
    this._current = AnimState.IDLE;
  }
}
