/**
 * 精灵引擎 — 最简螃蟹渲染 + 方向翻转
 */
import * as PIXI from 'pixi.js';
import { AnimState } from './StateMachine';

export const SCALE = 2.3;
export const DISPLAY_W = Math.round(95 * SCALE);
export const DISPLAY_H = Math.round(70 * SCALE);
interface PixelData { w: number; h: number; pixels: number[]; }

export class SpriteEngine {
  container: PIXI.Container;
  private sprite: PIXI.Sprite | null = null;
  private facingRight = true;

  constructor(app: PIXI.Application) {
    this.container = new PIXI.Container();
    app.stage.addChild(this.container);
  }

  async init(pd: PixelData): Promise<void> {
    const c = document.createElement('canvas'); c.width = pd.w; c.height = pd.h;
    const ctx = c.getContext('2d', { alpha: true })!;
    const d = ctx.createImageData(pd.w, pd.h);
    for (let i = 0; i < pd.pixels.length; i++) {
      const v = pd.pixels[i], o = i * 4;
      d.data[o] = (v>>>24)&0xff; d.data[o+1] = (v>>>16)&0xff;
      d.data[o+2] = (v>>>8)&0xff; d.data[o+3] = v&0xff;
    }
    ctx.putImageData(d, 0, 0);
    const tex = PIXI.Texture.from(c);
    tex.source.scaleMode = 'nearest';
    this.sprite = new PIXI.Sprite(tex);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.scale.set(SCALE);
    this.container.addChild(this.sprite);
  }

  setFacing(right: boolean): void {
    this.facingRight = right;
    if (this.sprite) {
      this.sprite.scale.x = right ? SCALE : -SCALE;
    }
  }

  /** 呼吸/爱心等振动 */
  playAnim(_anim: AnimState, _elapsed: number): number {
    return 0; // 暂时不振动，简化
  }

  setPos(x: number, y: number): void { this.container.x = x; this.container.y = y; }
  getContainer(): PIXI.Container { return this.container; }
}
