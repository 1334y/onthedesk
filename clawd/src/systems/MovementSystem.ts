import { TauriBridge } from './TauriBridge';

export interface DesktopBounds { screenW: number; screenH: number; taskbarY: number; }

export class MovementSystem {
  deskX: number; deskY: number;
  private winW: number; private winH: number;
  private spd = 100;
  facingRight = true;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private pause = 0;
  private bounds: DesktopBounds;
  private bridge: TauriBridge;
  dragging = false;

  constructor(startX: number, startY: number, winW: number, winH: number, bounds: DesktopBounds, bridge: TauriBridge) {
    this.deskX = startX; this.deskY = startY;
    this.winW = winW; this.winH = winH;
    this.bounds = bounds; this.bridge = bridge;
    this.pickTarget();
  }

  get facing(): 'left' | 'right' { return this.facingRight ? 'right' : 'left'; }

  startDrag(): void { this.dragging = true; }
  endDrag(): void {
    this.dragging = false;
    this.pause = 2 + Math.random() * 3;
    this.pickTarget();
  }

  update(dt: number): void {
    if (this.dragging) return;
    if (this.pause > 0) { this.pause -= dt; if (this.pause <= 0) this.pickTarget(); return; }
    if (this.targetX === null || this.targetY === null) return;
    const dx = this.targetX - this.deskX, dy = this.targetY - this.deskY;
    const d = Math.hypot(dx, dy);
    if (d < 3) { this.targetX = null; this.targetY = null; this.pause = 1 + Math.random() * 3; return; }
    this.facingRight = dx > 0;
    const r = Math.min(this.spd * dt / d, 1);
    this.deskX += dx * r; this.deskY += dy * r;
    this.clamp();
    this.bridge.moveWindow(Math.round(this.deskX), Math.round(this.deskY));
  }

  private clamp(): void {
    this.deskX = Math.max(0, Math.min(this.bounds.screenW - this.winW, this.deskX));
    this.deskY = Math.max(0, Math.min(this.bounds.screenH - this.winH, this.deskY));
  }

  private pickTarget(): void {
    const m = 80;
    if (Math.random() < 0.7) {
      this.targetX = m + Math.random() * (this.bounds.screenW - this.winW - m * 2);
      this.targetY = this.bounds.taskbarY - this.winH;
    } else {
      this.targetX = m + Math.random() * (this.bounds.screenW - this.winW - m * 2);
      this.targetY = 40 + Math.random() * (this.bounds.screenH - this.winH - 80);
    }
  }
}
