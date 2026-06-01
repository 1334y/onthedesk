const fs = require('fs');
let c = fs.readFileSync('d:/cc/clawd/src/main.ts', 'utf8');

const start = c.indexOf('function exprHappy(): void {');
const end = c.indexOf('const EXPRS:');

const old = c.substring(start, end);

const neu = `function exprHappy(): void {
  // ∩∩
  const m = [[1,1,1,1,1],[1,1,1,1,1],[1,1,0,1,1],[1,0,0,0,1],[0,0,0,0,0],[0,0,0,0,0]];
  exprMask(E, m);
}
function exprHeart(): void {
  const m = [[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0],[0,0,0,0,0]];
  exprMask(HEART, m);
}
function exprAngry(): void {
  const m = [[0,0,1,1,0],[0,1,1,1,1],[0,0,1,1,0],[0,0,1,1,0],[0,0,0,0,0],[0,0,0,0,0]];
  exprMask(E, m);
}
function exprSleepy(): void {
  const m = [[0,0,0,0,0],[1,1,1,1,1],[1,1,1,1,1],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
  exprMask(E, m);
}
function exprStar(): void {
  const m = [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0],[0,0,0,0,0]];
  exprMask(GOLD, m);
}
function exprDizzy(): void {
  const m = [[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,0]];
  exprMask(E, m);
}
function exprBlink(): void {
  const m = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[1,1,1,1,1],[1,1,1,1,1]];
  exprMask(E, m);
}
function exprDead(): void {
  const m = [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[0,0,0,0,0]];
  exprMask(E, m);
}
function exprShock(): void {
  const m = [[1,1,1,1,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,0,0,1],[1,1,1,1,1],[0,0,0,0,0]];
  exprMask(E, m);
  setP(EYE_L.x+1, EYE_L.y+1, WHITE); setP(EYE_R.x+1, EYE_R.y+1, WHITE);
}
function exprMusic(): void {
  const m = [[0,0,1,0,0],[0,1,1,1,0],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1],[1,1,1,1,1]];
  exprMask(E, m);
}
`;

c = c.replace(old, neu);
fs.writeFileSync('d:/cc/clawd/src/main.ts', c);
console.log('Expressions replaced!');
