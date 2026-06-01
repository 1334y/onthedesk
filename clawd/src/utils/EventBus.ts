/**
 * 内部事件总线 - 系统间松耦合通信
 */
type EventHandler = (...args: any[]) => void;

class EventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(h => h(...args));
  }

  clear(): void {
    this.listeners.clear();
  }
}

/** 全局事件总线单例 */
export const eventBus = new EventBus();

/** 事件名常量 */
export const Events = {
  // 养成事件
  STAT_CHANGED: 'stat:changed',
  STAT_CRITICAL: 'stat:critical',
  AFFECTION_LEVEL_UP: 'affection:levelUp',

  // 动画事件
  ANIM_START: 'anim:start',
  ANIM_END: 'anim:end',

  // 交互事件
  PET_CLICKED: 'pet:clicked',
  PET_DOUBLE_CLICKED: 'pet:doubleClicked',
  PET_DRAG_START: 'pet:dragStart',
  PET_DRAG_END: 'pet:dragEnd',
  PET_RIGHT_CLICKED: 'pet:rightClicked',
  MOUSE_NEAR: 'mouse:near',
  MOUSE_FAR: 'mouse:far',

  // 行为事件
  BEHAVIOR_CHANGED: 'behavior:changed',
  STATE_CHANGED: 'state:changed',

  // 对话事件
  DIALOG_SHOW: 'dialog:show',
  DIALOG_HIDE: 'dialog:hide',

  // 系统事件
  TICK: 'system:tick',
  SECOND: 'system:second',
} as const;
