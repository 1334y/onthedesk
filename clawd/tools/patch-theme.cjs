// Patch main.ts with dual-theme support
const fs = require('fs');
let c = fs.readFileSync('d:/cc/clawd/src/main.ts', 'utf8');

// 1. Add whale import
c = c.replace(
  "import pixelData from './data/crab-pixels.json';",
  "import pixelData_crab from './data/crab-pixels.json';\nimport pixelData_deep from './data/whale-pixels.json';"
);

// 2. Add theme system before constants
c = c.replace(
  '// ====== 常量 ======',
  '// ====== 双主题 ======\n' +
  'type Pet = { n: string; d: { w: number; h: number; p: number[] }; b: number; el: { x: number; y: number }; er: { x: number; y: number } };\n' +
  'var T: Record<string, Pet> = {\n' +
  '  clawd: { n: "Clawd", d: pixelData_crab, b: 0xD97757FF, el: { x: 26, y: 33 }, er: { x: 50, y: 33 } },\n' +
  '  deep: { n: "DeepSeek", d: pixelData_deep, b: 0x2563ebFF, el: { x: 15, y: 20 }, er: { x: 31, y: 20 } },\n' +
  '};\n' +
  'var ct = T.clawd;\n' +
  'function sp(n: string) { if (T[n]) { ct = T[n]; try { localStorage.setItem("cp", n) } catch (e) { } } }\n' +
  'try { var sn = localStorage.getItem("cp"); if (sn && T[sn]) ct = T[sn]; } catch (e) { }\n' +
  '\n// ====== 常量 ======'
);

// 3. Dynamic sizes
c = c.replace('const CW = 95, CH = 70;', 'var CW = ct.d.w, CH = ct.d.h;');
c = c.replace('const WIN_W = Math.round(CW * SCALE + 8);', 'var Ww = Math.round(CW * SCALE + 8);');
c = c.replace('const WIN_H = Math.round(CH * SCALE + 14);', 'var Wh = Math.round(CH * SCALE + 14);');
c = c.replace(/WIN_W/g, 'Ww');
c = c.replace(/WIN_H/g, 'Wh');

// 4. Dynamic BODY, PX
c = c.replace('const BODY = 0xD97757FF;', 'var BODY = ct.b;');
c = c.replace('const PX: number[] = [...pixelData.pixels];', 'var PX: number[] = [...ct.d.p];');

// 5. Dynamic EYE
c = c.replace('const EYE_L = { x: 26, y: 33, w: 3, h: 4 };', 'var EYE_L = { x: ct.el.x, y: ct.el.y, w: 3, h: 4 };');
c = c.replace('const EYE_R = { x: 50, y: 33, w: 3, h: 4 };', 'var EYE_R = { x: ct.er.x, y: ct.er.y, w: 3, h: 4 };');

// 6. Replace pixelData refs
c = c.split('pixelData.pixels').join('ct.d.p');
c = c.split('pixelData[').join('ct.d[');

// 7. Switch menu
c = c.replace(
  "['🍞 喂食', () => { feed(); say(pick(DIALOGS.fed)); }],",
  "['🍞 喂食', () => { feed(); say(pick(DIALOGS.fed)); }], ['🔄 切换', () => { var n = ct.n == 'Clawd' ? 'deep' : 'clawd'; sp(n); location.reload(); }],"
);

fs.writeFileSync('d:/cc/clawd/src/main.ts', c);
console.log('Patched OK');
