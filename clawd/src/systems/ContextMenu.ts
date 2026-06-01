/**
 * 右键菜单 — HTML 浮层
 */
export interface MenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
}

export class ContextMenu {
  private el: HTMLDivElement | null = null;

  show(x: number, y: number, items: MenuItem[]): void {
    this.hide();

    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;z-index:2147483647;' +
      'left:' + x + 'px;top:' + y + 'px;' +
      'background:#141413;border:1px solid #D97757;border-radius:6px;' +
      'padding:4px 0;min-width:140px;' +
      'font-family:monospace;font-size:12px;color:#ccc;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.5);pointer-events:auto;';

    for (const item of items) {
      const row = document.createElement('div');
      row.textContent = item.label;
      row.style.cssText =
        'padding:6px 14px;cursor:' + (item.disabled ? 'default' : 'pointer') + ';' +
        'white-space:nowrap;' +
        (item.disabled ? 'color:#555;' : '');
      if (!item.disabled) {
        row.onmouseenter = () => { row.style.background = '#D97757'; row.style.color = '#fff'; };
        row.onmouseleave = () => { row.style.background = ''; row.style.color = '#ccc'; };
        row.onclick = () => { item.action(); this.hide(); };
      }
      el.appendChild(row);
    }

    document.body.appendChild(el);
    this.el = el;

    // 点外部关闭
    const close = () => { this.hide(); document.removeEventListener('click', close); };
    setTimeout(() => document.addEventListener('click', close), 0);
  }

  hide(): void {
    if (this.el) { this.el.remove(); this.el = null; }
  }
}
