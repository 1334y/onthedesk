/**
 * Clawd 官方 9 色调色板
 * 基于 Claude Code 官方螃蟹 SVG (output.svg) 提取
 * 严格原则: 所有动画帧和皮肤变体均使用此调色板
 */
export const PALETTE = {
  /** 背景/眼睛 - #191A1B */
  BG:        0x191A1B,
  /** 🦀 主体色 (Anthropic 官方 Orange) - #D97757 */
  BODY:      0xD97757,
  /** 暗部/最深阴影 - #312623 */
  SHADOW_0:  0x312623,
  /** 阴影/暗面 - #905440 */
  SHADOW_1:  0x905440,
  /** 阴影过渡 - #794839 */
  SHADOW_2:  0x794839,
  /** 亮部/高光面 - #C16B4F */
  HIGHLIGHT: 0xC16B4F,
  /** 深阴影 - #623D32 */
  SHADOW_3:  0x623D32,
  /** 深阴影 - #49312A */
  SHADOW_4:  0x49312A,
  /** 中间调 - #A86048 */
  MIDTONE:   0xA86048,
} as const;

/** 调色板颜色列表 (按像素数排序) */
export const PALETTE_LIST: readonly number[] = [
  PALETTE.BG,
  PALETTE.BODY,
  PALETTE.SHADOW_0,
  PALETTE.SHADOW_1,
  PALETTE.SHADOW_2,
  PALETTE.HIGHLIGHT,
  PALETTE.SHADOW_3,
  PALETTE.SHADOW_4,
  PALETTE.MIDTONE,
] as const;

/** 角色原生尺寸 */
export const NATIVE_WIDTH = 95;
export const NATIVE_HEIGHT = 70;

/** 显示缩放倍率 (默认 3x = 285x210) */
export const DEFAULT_SCALE = 2.3;

/** 调色板工具 */
export function isInPalette(color: number): boolean {
  return PALETTE_LIST.includes(color);
}
