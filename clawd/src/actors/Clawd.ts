import * as PIXI from 'pixi.js';
import { SpriteEngine } from '../core/SpriteEngine';
import { MovementSystem } from '../systems/MovementSystem';
import type { DesktopBounds } from '../systems/MovementSystem';
import { NurtureSystem } from '../systems/NurtureSystem';
import { DialogSystem } from '../systems/DialogSystem';
import type { DialogContext } from '../systems/DialogSystem';
import { ContextMenu } from '../systems/ContextMenu';
import { TauriBridge } from '../systems/TauriBridge';
import { savePet, loadPet } from '../systems/StorageSystem';
import { eventBus, Events } from '../utils/EventBus';

export interface ClawdConfig extends DesktopBounds { winW: number; winH: number; }
interface PixelData { w: number; h: number; pixels: number[]; }

export class Clawd {
  private sprite: SpriteEngine;
  private nurture = new NurtureSystem();
  movement: MovementSystem;
  private dialog: DialogSystem;
  private ctxMenu = new ContextMenu();
  private cfg: ClawdConfig;
  private elapsed = 0;

  constructor(app: PIXI.Application, bridge: TauriBridge, cfg: ClawdConfig) {
    this.cfg = cfg;
    this.sprite = new SpriteEngine(app);
    const sx = (cfg.screenW - cfg.winW) / 2, sy = cfg.taskbarY - cfg.winH;
    this.movement = new MovementSystem(sx, sy, cfg.winW, cfg.winH, cfg, bridge);
    const bc = new PIXI.Container(); app.stage.addChild(bc); this.dialog = new DialogSystem(bc);
  }

  async init(pd: PixelData): Promise<void> {
    await this.sprite.init(pd);
    this.sprite.setPos(this.cfg.winW / 2, this.cfg.winH - 6);
    this.sprite.setFacing(true);
    const saved = loadPet();
    if (saved) {
      this.nurture.load({ ...saved.stats, lastDecayTime: saved.lastDecayTime });
      this.movement.deskX = saved.deskX;
      this.movement.deskY = saved.deskY;
    }

    // 紧急状态
    eventBus.on(Events.STAT_CRITICAL, (d: { stat: string }) => this.showDialog(d.stat === 'hunger' ? 'hungry' : 'tired'));

    setTimeout(() => this.showDialog('greeting'), 800);
    this.checkTimeGreeting();
  }

  update(t: PIXI.Ticker): void {
    const dt = t.deltaMS / 1000; this.elapsed += t.deltaMS;

    // 养成 tick
    if (Math.floor(this.elapsed / 1000) !== Math.floor((this.elapsed - t.deltaMS) / 1000)) {
      this.nurture.tick(Date.now());
    }

    // 移动 + 方向
    if (!this.movement.dragging) {
      this.movement.update(dt);
      this.sprite.setFacing(this.movement.facing === 'right');
    }

    this.dialog.update(t.deltaTime);

    // 自动保存 (每10秒)
    if (this.elapsed % 10000 < t.deltaMS) {
      savePet({ stats: this.nurture.getStats(), lastDecayTime: this.nurture.save().lastDecayTime, deskX: this.movement.deskX, deskY: this.movement.deskY });
    }
  }

  private showDialog(ctx: DialogContext, text?: string) {
    this.dialog.show(ctx, this.nurture.getStats().affection, this.cfg.winW / 2, -6, text);
  }
  private checkTimeGreeting() {
    const h = new Date().getHours();
    if (h >= 6 && h < 11) this.showDialog('time_morning');
    else if (h >= 23 || h < 5) this.showDialog('time_late');
    else if (h >= 19) this.showDialog('time_night');
  }
  feed(): void { this.nurture.feed(); this.showDialog('happy', '好吃！🦀'); }

  // ── 直接调用的交互 (main.ts → 这里) ──
  click(): void { this.nurture.pet(); this.showDialog('petting'); }
  doubleClick(): void { this.nurture.doublePet(); this.showDialog('happy'); }
  rightClick(x: number, y: number): void {
    this.ctxMenu.show(x, y, [
      { label: '🍞 喂食', action: () => this.feed() },
      { label: '🦀 状态', action: () => {
        const s = this.nurture.getStats();
        this.showDialog('random', `🍞${Math.round(s.hunger)} ⚡${Math.round(s.energy)} 😊${Math.round(s.mood)} ❤${Math.round(s.affection)}`);
      }},
    ]);
  }

  getStats() { return { ...this.nurture.getStats(), level: this.nurture.getLevel() }; }
}
