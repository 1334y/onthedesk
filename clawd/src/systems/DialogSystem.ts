/**
 * 对话气泡系统
 *
 * 渲染角色头上的对话气泡
 * 台词来源: 本地 JSON 库 (~200条) + 可选 Claude API
 *
 * 情境分类:
 *   greeting, petting, hungry, tired, happy, angry,
 *   time_morning, time_night, time_late,
 *   random, code_related
 */

import * as PIXI from 'pixi.js';
import { AffectionLevel } from './NurtureSystem';

export type DialogContext =
  | 'greeting'
  | 'petting'
  | 'hungry'
  | 'tired'
  | 'happy'
  | 'angry'
  | 'time_morning'
  | 'time_night'
  | 'time_late'
  | 'random'
  | 'code_related'
  | 'level_up';

interface DialogEntry {
  text: string;
  minAffection?: number;
}

type DialogDB = Record<DialogContext, DialogEntry[]>;

/** 内置台词库 */
const DEFAULT_DIALOGS: DialogDB = {
  greeting: [
    { text: '嘿！你回来了！🦀' },
    { text: '今天也要好好写代码哦～' },
    { text: '我刚才在桌子上巡逻了一圈！' },
    { text: '注意到你啦！' },
    { text: 'Clawd 报到！' },
  ],
  petting: [
    { text: '嘿嘿，好痒~' },
    { text: '再摸一下嘛！' },
    { text: '你的手好暖和' },
    { text: '咕噜咕噜...' },
    { text: '✧*٩(ˊωˋ*)و✧*' },
  ],
  hungry: [
    { text: '有没有小零食...' },
    { text: '肚子在叫了 🍞' },
    { text: '想吃东西！' },
    { text: '饿得钳子都举不起来了...' },
  ],
  tired: [
    { text: '好困... Zzz' },
    { text: '我歇会儿...' },
    { text: '写代码写累了，你也休息下吧' },
    { text: '眼皮好重...' },
  ],
  happy: [
    { text: '今天心情超好！' },
    { text: '啦啦啦～♪' },
    { text: '桌面上的空气真新鲜！' },
    { text: '我们是最好的搭档！' },
  ],
  angry: [
    { text: '哼！不理你了' },
    { text: '钳子警告 ⚠️' },
    { text: '刚才有个 bug 从屏幕前跑过去了' },
  ],
  time_morning: [
    { text: '早上好！新的一天！☀️' },
    { text: '今天天气看起来不错～' },
    { text: '喝咖啡了吗？' },
  ],
  time_night: [
    { text: '天黑了，该休息了' },
    { text: '今天写了好多代码，辛苦了 🌙' },
  ],
  time_late: [
    { text: '这么晚还不睡？！' },
    { text: '凌晨了...你还好吗？' },
    { text: '熬夜会掉钳子的！' },
  ],
  random: [
    { text: '你知道吗？螃蟹可以横着走' },
    { text: '我有 9 种颜色哦，数数看？' },
    { text: '你听说过 Claude 吗？他是我大哥' },
    { text: '我觉得这个桌面挺好看的' },
    { text: '偶尔也想换个方向走...' },
    { text: 'Anthropic Orange 是我的幸运色' },
  ],
  code_related: [
    { text: '这个缩进看起来很整齐！' },
    { text: '你的代码风格我很喜欢' },
    { text: '好像有个 typo... 算了当我没说' },
    { text: 'LGTM! 🚀' },
  ],
  level_up: [
    { text: '我们越来越熟了！', minAffection: 25 },
    { text: '我感觉和你特别亲近了 ❤️', minAffection: 50 },
    { text: '你是我最棒的朋友！🦀✨', minAffection: 75 },
  ],
};

export class DialogSystem {
  private container: PIXI.Container;
  private bubble: PIXI.Container | null = null;
  private bubbleText: PIXI.Text | null = null;
  private bubbleTimer: number = 0;
  private bubbleTTL: number = 0;
  private dialogs: DialogDB;
  private shownDialogs: Set<string> = new Set();

  constructor(parent: PIXI.Container) {
    this.container = new PIXI.Container();
    this.container.visible = false;
    parent.addChild(this.container);
    this.dialogs = DEFAULT_DIALOGS;
  }

  /**
   * 加载自定义台词库
   */
  loadDialogs(dialogs: DialogDB): void {
    this.dialogs = { ...DEFAULT_DIALOGS, ...dialogs };
  }

  /**
   * 显示对话气泡
   */
  show(
    context: DialogContext,
    affection: number = 0,
    x: number = 0,
    y: number = -60,
    customText?: string
  ): void {
    const text = customText ?? this.pickDialog(context, affection);
    if (!text) return;

    // 清除旧气泡
    this.hide();

    // 创建气泡
    const bubble = new PIXI.Container();

    // 气泡背景
    const bg = new PIXI.Graphics();
    const padding = 8;
    const maxWidth = 200;

    const style = new PIXI.TextStyle({
      fontSize: 12,
      fontFamily: 'monospace',
      fill: 0xFAF9F5,
      wordWrap: true,
      wordWrapWidth: maxWidth - padding * 2,
      align: 'left',
    });

    const textObj = new PIXI.Text({ text, style });
    const bgWidth = Math.min(textObj.width + padding * 2, maxWidth);
    const bgHeight = textObj.height + padding * 2 + 4;

    // 气泡形状
    bg.roundRect(0, 0, bgWidth, bgHeight, 6);
    bg.fill({ color: 0x141413, alpha: 0.92 });
    bg.stroke({ color: 0xD97757, width: 1 });

    // 小三角
    const triX = bgWidth / 2;
    bg.moveTo(triX - 6, bgHeight);
    bg.lineTo(triX, bgHeight + 8);
    bg.lineTo(triX + 6, bgHeight);
    bg.fill({ color: 0x141413, alpha: 0.92 });
    bg.stroke({ color: 0xD97757, width: 1 });

    textObj.x = padding;
    textObj.y = padding;

    bubble.addChild(bg);
    bubble.addChild(textObj);

    // 居中定位
    bubble.x = x - bgWidth / 2;
    bubble.y = y - bgHeight - 8;

    this.container.addChild(bubble);
    this.bubble = bubble;
    this.bubbleText = textObj;
    this.container.visible = true;

    // 自动消失
    this.bubbleTTL = Math.max(2000, text.length * 80); // 按字数决定显示时间
    this.bubbleTimer = 0;
  }

  /** 每帧更新 */
  update(delta: number): void {
    if (!this.bubble || this.bubbleTTL <= 0) return;

    this.bubbleTimer += delta * (1000 / 60);

    // 渐隐
    if (this.bubbleTimer >= this.bubbleTTL * 0.7) {
      const fadeProgress = (this.bubbleTimer - this.bubbleTTL * 0.7) / (this.bubbleTTL * 0.3);
      this.bubble.alpha = 1 - fadeProgress;
    }

    if (this.bubbleTimer >= this.bubbleTTL) {
      this.hide();
    }
  }

  private hide(): void {
    if (this.bubble) {
      this.container.removeChild(this.bubble);
      this.bubble.destroy({ children: true });
      this.bubble = null;
      this.bubbleText = null;
    }
    this.container.visible = false;
    this.bubbleTimer = 0;
    this.bubbleTTL = 0;
  }

  private pickDialog(context: DialogContext, affection: number): string {
    const entries = this.dialogs[context];
    if (!entries || entries.length === 0) {
      // fallback to random
      return this.pickDialog('random', affection);
    }

    // 根据好感度过滤
    const candidates = entries.filter(
      e => !e.minAffection || affection >= e.minAffection
    );
    if (candidates.length === 0) return entries[0].text;

    // 避免重复 (优先选没说过的话)
    const fresh = candidates.filter(c => !this.shownDialogs.has(c.text));
    const pool = fresh.length > 0 ? fresh : candidates;

    const picked = pool[Math.floor(Math.random() * pool.length)];
    this.shownDialogs.add(picked.text);

    // 防止 shownDialogs 无限增长
    if (this.shownDialogs.size > 100) {
      const arr = [...this.shownDialogs];
      this.shownDialogs = new Set(arr.slice(arr.length - 50));
    }

    return picked.text;
  }

  destroy(): void {
    this.hide();
    this.container.destroy({ children: true });
  }
}
