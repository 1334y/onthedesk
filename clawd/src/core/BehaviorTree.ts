/**
 * 行为树 + 仲裁器
 *
 * 三层决策:
 *   Layer 1: 需求评估 (Stats)
 *   Layer 2: 行为仲裁 (Arbiter)
 *   Layer 3: 行为执行 (StateMachine + Animation)
 *
 * 仲裁优先级: 需求行为 > 用户交互 > 环境触发 > 随机探索
 */

import { AnimState } from './StateMachine';

export interface BehaviorRequest {
  state: AnimState;
  priority: number;
  source: string;
  data?: Record<string, unknown>;
}

export class BehaviorArbiter {
  private currentRequest: BehaviorRequest | null = null;

  /**
   * 提交行为请求，返回获胜者
   */
  submit(request: BehaviorRequest): BehaviorRequest | null {
    if (!this.currentRequest) {
      this.currentRequest = request;
      return request;
    }

    // 竞争: 优先级高者获胜
    if (request.priority > this.currentRequest.priority) {
      this.currentRequest = request;
      return request;
    }

    // 同等优先级: 新请求替换旧请求
    if (request.priority === this.currentRequest.priority) {
      this.currentRequest = request;
      return request;
    }

    // 被拒绝
    return null;
  }

  /** 清除当前行为 (一次性状态播完后调用) */
  clear(): void {
    this.currentRequest = null;
  }

  get current(): BehaviorRequest | null {
    return this.currentRequest;
  }
}

/**
 * Layer 1: 需求评估器
 * 根据养成数值生成行为请求
 */
export interface NurtureStats {
  hunger: number;
  energy: number;
  mood: number;
  affection: number;
}

export function evaluateNeeds(stats: NurtureStats): BehaviorRequest | null {
  // 紧急: 饥饿 > 90
  if (stats.hunger >= 90) {
    return {
      state: AnimState.IDLE, // 焦急 idle (特殊表现)
      priority: 70,
      source: 'hunger_critical',
      data: { critical: true }
    };
  }

  // 紧急: 体力耗尽
  if (stats.energy <= 10) {
    return {
      state: AnimState.SLEEP,
      priority: 65,
      source: 'energy_critical',
    };
  }

  // 体力偏低 → 倾向休息
  if (stats.energy < 30) {
    return {
      state: AnimState.SIT,
      priority: 25,
      source: 'energy_low',
    };
  }

  // 饥饿 → 觅食行为
  if (stats.hunger >= 70) {
    return {
      state: AnimState.WALK, // 焦急走动
      priority: 30,
      source: 'hunger_normal',
    };
  }

  return null; // 无紧急需求
}
