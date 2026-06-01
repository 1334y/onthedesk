/**
 * 设置面板
 *
 * 在页面右上角显示一个小齿轮图标
 * 点击展开设置面板
 * 目前支持: API Key 配置, 开机自启开关, 缩放调整
 */

import * as PIXI from 'pixi.js';

export interface Settings {
  apiKey: string;
  autoStart: boolean;
  scale: number;
  soundEnabled: boolean;
}

export class SettingsPanel {
  private container: PIXI.Container;
  private visible: boolean = false;
  private settings: Settings;
  private onChange: ((s: Settings) => void) | null = null;

  // UI 元素
  private gearBtn: PIXI.Container | null = null;
  private panel: PIXI.Container | null = null;

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.container.visible = true;
    parent.addChild(this.container);

    this.settings = this.loadSettings();
    this.createGearButton();
    this.createPanel();
  }

  getSettings(): Readonly<Settings> {
    return { ...this.settings };
  }

  onChangeSettings(cb: (s: Settings) => void): void {
    this.onChange = cb;
  }

  private createGearButton(): void {
    const btn = new PIXI.Container();
    btn.x = window.innerWidth - 50;
    btn.y = 10;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    // 齿轮图标背景
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 36, 36, 8);
    bg.fill({ color: 0x141413, alpha: 0.8 });
    bg.stroke({ color: 0xD97757, width: 1 });

    const icon = new PIXI.Text({
      text: '⚙️',
      style: { fontSize: 18 },
    });
    icon.anchor.set(0.5);
    icon.x = 18;
    icon.y = 18;

    btn.addChild(bg);
    btn.addChild(icon);

    btn.on('pointerdown', () => this.togglePanel());
    btn.on('pointerover', () => { bg.alpha = 0.6; });
    btn.on('pointerout', () => { bg.alpha = 0.8; });

    this.container.addChild(btn);
    this.gearBtn = btn;
  }

  private createPanel(): void {
    const panel = new PIXI.Container();
    panel.visible = false;
    panel.x = window.innerWidth - 310;
    panel.y = 52;

    // 面板背景
    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, 300, 280, 10);
    bg.fill({ color: 0x141413, alpha: 0.95 });
    bg.stroke({ color: 0xD97757, width: 1.5 });

    panel.addChild(bg);

    // 标题
    const title = new PIXI.Text({
      text: '⚙️ 设置',
      style: {
        fontSize: 16,
        fontFamily: 'monospace',
        fill: 0xD97757,
        fontWeight: 'bold',
      },
    });
    title.x = 16;
    title.y = 14;
    panel.addChild(title);

    // API Key 输入
    const apiLabel = new PIXI.Text({
      text: 'Claude API Key (可选)',
      style: { fontSize: 12, fontFamily: 'monospace', fill: 0x888888 },
    });
    apiLabel.x = 16;
    apiLabel.y = 50;
    panel.addChild(apiLabel);

    // 用 HTML input overlay 来处理文本输入 (PixiJS 不方便处理文本输入)
    this.createHTMLInput();

    // 缩放滑块标签
    const scaleLabel = new PIXI.Text({
      text: `缩放: ${this.settings.scale}x`,
      style: { fontSize: 12, fontFamily: 'monospace', fill: 0x888888 },
    });
    scaleLabel.x = 16;
    scaleLabel.y = 120;
    scaleLabel.label = 'scale-label';
    panel.addChild(scaleLabel);

    // 缩放按钮
    const minusBtn = this.createButton('−', 16, 148, 32, 32);
    const plusBtn = this.createButton('+', 56, 148, 32, 32);

    minusBtn.on('pointerdown', () => {
      this.settings.scale = Math.max(1, this.settings.scale - 1);
      scaleLabel.text = `缩放: ${this.settings.scale}x`;
      this.saveAndNotify();
    });
    plusBtn.on('pointerdown', () => {
      this.settings.scale = Math.min(6, this.settings.scale + 1);
      scaleLabel.text = `缩放: ${this.settings.scale}x`;
      this.saveAndNotify();
    });

    panel.addChild(minusBtn);
    panel.addChild(plusBtn);

    // 音效开关
    const soundBtn = this.createToggle(
      '🔊 音效',
      16, 200,
      this.settings.soundEnabled,
      (v) => {
        this.settings.soundEnabled = v;
        this.saveAndNotify();
      }
    );
    panel.addChild(soundBtn);

    // 开机自启
    const autoStartBtn = this.createToggle(
      '🚀 开机自启',
      16, 240,
      this.settings.autoStart,
      (v) => {
        this.settings.autoStart = v;
        this.saveAndNotify();
      }
    );
    panel.addChild(autoStartBtn);

    this.container.addChild(panel);
    this.panel = panel;
  }

  private createButton(text: string, x: number, y: number, w: number, h: number): PIXI.Container {
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';

    const bg = new PIXI.Graphics();
    bg.roundRect(0, 0, w, h, 4);
    bg.fill({ color: 0x2a2a2a });
    bg.stroke({ color: 0x6A9BCC, width: 1 });

    const label = new PIXI.Text({
      text,
      style: { fontSize: 16, fontFamily: 'monospace', fill: 0x6A9BCC },
    });
    label.anchor.set(0.5);
    label.x = w / 2;
    label.y = h / 2;

    btn.addChild(bg);
    btn.addChild(label);

    btn.on('pointerover', () => { bg.tint = 0x3a3a3a; });
    btn.on('pointerout', () => { bg.tint = 0xffffff; });

    return btn;
  }

  private createToggle(
    label: string,
    x: number,
    y: number,
    initial: boolean,
    onChange: (v: boolean) => void
  ): PIXI.Container {
    const toggle = new PIXI.Container();
    toggle.x = x;
    toggle.y = y;
    toggle.eventMode = 'static';
    toggle.cursor = 'pointer';

    let state = initial;

    const bg = new PIXI.Graphics();
    const drawToggle = () => {
      bg.clear();
      bg.roundRect(0, 0, 44, 24, 12);
      bg.fill({ color: state ? 0xD97757 : 0x3a3a3a });
      // 圆形滑块
      const cx = state ? 32 : 12;
      bg.circle(cx, 12, 9);
      bg.fill({ color: 0xffffff });
    };
    drawToggle();
    bg.x = 0;
    bg.y = 0;

    const text = new PIXI.Text({
      text: label,
      style: { fontSize: 12, fontFamily: 'monospace', fill: 0xcccccc },
    });
    text.x = 54;
    text.y = 3;

    toggle.addChild(bg);
    toggle.addChild(text);

    toggle.on('pointerdown', () => {
      state = !state;
      drawToggle();
      onChange(state);
    });

    return toggle;
  }

  private createHTMLInput(): void {
    // 创建实际的 HTML input 用于 API Key 输入
    const container = document.createElement('div');
    container.style.cssText =
      'position:fixed;top:112px;right:58px;z-index:9999998;pointer-events:auto;';
    container.innerHTML = `
      <input type="password" id="clawd-api-key" placeholder="sk-ant-..."
        style="
          width:260px;padding:6px 10px;background:#1a1a1a;color:#D97757;
          border:1px solid #D97757;border-radius:4px;font-family:monospace;font-size:12px;
          outline:none;
        ">
    `;
    document.body.appendChild(container);

    const input = container.querySelector('input')!;
    if (this.settings.apiKey) {
      input.value = this.settings.apiKey;
    }
    input.addEventListener('change', () => {
      this.settings.apiKey = input.value;
      this.saveAndNotify();
    });
  }

  private togglePanel(): void {
    this.visible = !this.visible;
    if (this.panel) {
      this.panel.visible = this.visible;
    }
  }

  private saveAndNotify(): void {
    localStorage.setItem('clawd-settings', JSON.stringify(this.settings));
    this.onChange?.(this.settings);
  }

  private loadSettings(): Settings {
    const defaults: Settings = {
      apiKey: '',
      autoStart: false,
      scale: 3,
      soundEnabled: false,
    };
    try {
      const saved = localStorage.getItem('clawd-settings');
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch {}
    return defaults;
  }
}
