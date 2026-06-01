/**
 * 交互 — HTML canvas 原生事件，不用 PIXI
 */
import { eventBus, Events } from '../utils/EventBus';

const DBL_MS = 400;

export class InteractionSystem {
  dragging = false;
  private lastClick = 0;
  private canvas: HTMLCanvasElement | null = null;

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    canvas.addEventListener('pointerdown', () => {
      if (this.dragging) return;
      this.dragging = true;
      eventBus.emit(Events.PET_DRAG_START);
    });

    canvas.addEventListener('pointerup', async () => {
      if (!this.dragging) return;
      this.dragging = false;

      // 读拖拽后位置
      let moved = false;
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const p = await getCurrentWindow().outerPosition();
        eventBus.emit(Events.PET_DRAG_END, { x: p.x, y: p.y });
        moved = true;
      } catch {
        eventBus.emit(Events.PET_DRAG_END, { x: 0, y: 0 });
      }

      if (!moved) {
        // 双击检测
        const t = Date.now();
        if (this.lastClick > 0 && t - this.lastClick < DBL_MS) {
          this.lastClick = 0;
          eventBus.emit(Events.PET_DOUBLE_CLICKED);
        } else {
          this.lastClick = t;
          const ct = t;
          setTimeout(() => { if (this.lastClick === ct) eventBus.emit(Events.PET_CLICKED); }, DBL_MS);
        }
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      eventBus.emit(Events.PET_RIGHT_CLICKED, { x: e.clientX, y: e.clientY });
    });
  }
}
