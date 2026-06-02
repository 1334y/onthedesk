/**
 * 🦀 Clawd — 单像素数组，表情 = 直接改眼睛像素
 */
import { TauriBridge } from './systems/TauriBridge';
import { loadPet, savePet } from './systems/StorageSystem';
import pixelData_crab from './data/crab-pixels.json';
import pixelData_deep from './data/whale-pixels.json';


// ====== 双主题 ======
type Pet = { n: string; d: { w: number; h: number; p: number[] }; b: number; bc: string; el: { x: number; y: number }; er: { x: number; y: number } };
var T: Record<string, Pet> = {
  clawd: { n: "clawd", d: pixelData_crab, b: 0xD97757FF, bc: "#D97757", el: { x: 26, y: 33 }, er: { x: 50, y: 33 } },
  deep: { n: "deep", d: pixelData_deep, b: 0x4A7DFFFF, bc: "#4A7DFF", el: { x: 25, y: 16 }, er: { x: 25, y: 16 } },
};
var ct = T.clawd;
function sp(n: string) { if (T[n]) { ct = T[n]; try { localStorage.setItem("cp", n) } catch (e) { } } }
try { var sn = localStorage.getItem("cp"); if (sn && T[sn]) ct = T[sn]; } catch (e) { }

// ====== 常量 ======
const SCALE = 2.3;
var CW = ct.d.w, CH = ct.d.h;
var Ww = Math.round(CW * SCALE + 8);
var Wh = Math.round(CH * SCALE + 40);
const S = SCALE;
var BODY = ct.b;
const BLACK = 0x191A1BFF;
const WHITE = 0xFFFFFFFF;
const HEART = 0xDD5544FF;
const GOLD = 0xFFCC00FF;
const E = BLACK; const W = WHITE; const H = HEART; const G = GOLD;
var PX:number[]=[...ct.d.p];
var EYE_L={x:ct.el.x,y:ct.el.y,w:3,h:4};
var EYE_R={x:ct.er.x,y:ct.er.y,w:3,h:4};
function setP(x: number, y: number, c: number): void {
  if (x >= 0 && x < CW && y >= 0 && y < CH) PX[y * CW + x] = c;
}

const DIALOGS: Record<string, Record<string, string[]>> = {
  clawd: {
    petting: ['嘿嘿，好痒~', '再摸一下嘛！', '咕噜咕噜...', '钳子可不是白长的！…开玩笑的', '你的手好暖和～',],
    happy: ['🎉 好开心！', '今天心情超好！', '🦀✨ 开心到发光！', '耶！', '啦啦啦～♪',],
    greeting: ['嘿！你回来了！🦀', '今天也要好好写代码哦～', 'Clawd 报到！',],
    morning: ['早上好！☀️', '喝咖啡了吗？', '新的一天！冲冲冲！',],
    night: ['天黑了，该休息了 🌙', '今天辛苦了！', '晚安，明天见～',],
    late: ['这么晚还不睡？！', '熬夜会掉钳子的！', '凌晨了…你还好吗？',],
    random: ['螃蟹可以横着走', 'LGTM! 🚀', '你听说过 Claude 吗？他是我大哥', 'Anthropic Orange 是我的幸运色',],
    fed: ['好吃！🦀✨', '谢谢投喂！', '美味～', '嗝…饱了',],
    hungry: ['有没有小零食…', '肚子在叫了 🍞', '想吃饭！',],
    tired: ['好困… Zzz', '我歇会儿…', '八条腿今天走了不少路',],
    singing: ['♪~ 哒哒哒哒哒 ~♪', '🎵 螃蟹之歌！', '♪ 横着走～横着走～ ♪', '♪ Ctrl+S 拯救世界！♪',],
  },
  deep: {
    petting: ['呼噜呼噜~ 好舒服 🐋', '你的手好温暖！', '再摸摸我的脑袋嘛～', '嘿嘿 别摸了 我会害羞的',],
    happy: ['噗噗！喷水庆祝！💦', '今天心情好到冒泡泡～', '🐋✨ 开心得尾巴都要甩掉了！',],
    greeting: ['噗！你回来啦～🐋', '我正在数据海里游泳呢！', 'DeepSeek 报到！一切正常～',],
    morning: ['早上好！今天也要加油哦 ☀️', '咕嘟咕嘟...喝点数据咖啡提神', '早安！今天的模型参数看起来不错',],
    night: ['天黑了 该关机休息了 🌙', '晚安！做个好梦 明天见～', '今天推理了好多东西 辛苦了',],
    late: ['都凌晨了！注意身体啊 😢', '熬夜对身体不好 我也该散热了', '你是不是在训练新模型？好拼',],
    random: ['你知道吗？鲸鱼其实不是鱼', '我每天都在数据深海里遨游 🌊', '噗噗！突然想喷水了', 'DeepSeek 这个名字 我觉得很酷 🐋', '我的参数比大海还深',],
    fed: ['咕嘟咕嘟！好吃～💧', '谢谢投喂！能量+1', '美味！电量直接拉满⚡',],
    hungry: ['肚子咕咕叫了…想吃小数据', '有没有吃的…CPU 快没电了', '好饿 好想喝一口数据汤',],
    tired: ['累了…让我散热一会儿 🔥', 'Zzz 正在进入休眠模式', '今天推了太多理 得歇歇',],
    singing: ['♪ 噗噗噗 ~ 噗噗噗 ~ ♪', '🎵 深海之歌！', '♪ 海水轻轻推着波浪 ~ ♪', '🎶 哼着小曲游数据海 ~',],
  },
};
function DLG(key: string): string[] { return (DIALOGS[ct.n] || DIALOGS.clawd)[key] || []; }
function pick(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)]; }

// ====== 天气模块 ======
interface WeatherData { city: string; temp: number; condition: string; code: number; humidity: number; wind: number; updated: number; }
let weather: WeatherData | null = null;
let weatherLastFetch = 0;
const WEATHER_INTERVAL = 30 * 60 * 1000;
function weatherCodeToText(code: number): string {
  if (code <= 1) return '晴天 ☀️'; if (code <= 3) return '多云 ⛅';
  if (code <= 49) return '雾/霾 🌫️'; if (code <= 59) return '小雨 🌧️';
  if (code <= 69) return '中雨 🌧️'; if (code <= 79) return '雪 ❄️';
  if (code <= 84) return '阵雨 ⛈️'; if (code <= 94) return '暴雨/冰雹 ⛈️';
  return '雷暴 ⚡';
}
function weatherDialog(w: WeatherData): string {
  const cs: Record<string, string[]> = {
    '晴天': ['今天阳光真好！☀️', '适合出去走走～',],
    '多云': ['云有点多', '多云转晴...希望吧',],
    '雨': ['带伞！带伞！带伞！', '下雨了好适合宅着写代码 🌧️',],
    '雪': ['下雪了！❄️', '好冷好冷好冷',],
    '雷暴': ['暴风雨！⚡', '打雷了，快收电脑！',],
  };
  for (const [k, v] of Object.entries(cs)) if (w.condition.includes(k)) return v[Math.floor(Math.random() * v.length)];
  return `${w.condition}，${w.temp}°C — 还算舒适吧 🦀`;
}
function weatherGreeting(): string {
  if (!weather) return '';
  const h = new Date().getHours(); const w = weather!;
  let g = '';
  if (h >= 5 && h < 8) g = '早上好！'; else if (h >= 8 && h < 12) g = '上午好！';
  else if (h >= 12 && h < 14) g = '中午好！'; else if (h >= 14 && h < 18) g = '下午好！';
  else if (h >= 18 && h < 22) g = '晚上好！'; else g = '夜深了！';
  const extra = w.temp > 35 ? '🔥 今天好热，注意防暑！' : w.temp > 30 ? '🌞 有点热呢' : w.temp < 5 ? '❄️ 好冷，多穿点！' : w.temp < 15 ? '🍂 有点凉' : '气温正好～';
  return `${g} 今天 ${w.condition}，${w.temp}°C。${extra}`;
}
async function fetchLocation(): Promise<{ city: string; lat: number; lon: number } | null> {
  try { const resp = await fetch('https://ipapi.co/json/'); const data = await resp.json(); return { city: data.city || '未知城市', lat: data.latitude || 0, lon: data.longitude || 0 }; }
  catch { return null; }
}
async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try { const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`); const d = await r.json(); const c = d.current; return { city: '', temp: Math.round(c.temperature_2m), condition: weatherCodeToText(c.weather_code), code: c.weather_code, humidity: c.relative_humidity_2m, wind: Math.round(c.wind_speed_10m), updated: Date.now() }; }
  catch { return null; }
}
async function refreshWeather(): Promise<void> {
  const now = Date.now();
  // 启动后立即获取一次, 之后10分钟间隔
  var interval = weather ? 10 * 60 * 1000 : 0;
  if (weather && now - weatherLastFetch < interval) return;
  weatherLastFetch = now; const loc = await fetchLocation(); if (!loc) return;
  const w = await fetchWeather(loc.lat, loc.lon); if (!w) return;
  w.city = loc.city; weather = w; saveWeatherCache();
}
function saveWeatherCache(): void { try { if (weather) localStorage.setItem('clawd-weather', JSON.stringify(weather)); } catch {} }
function loadWeatherCache(): void { try { const raw = localStorage.getItem('clawd-weather'); if (raw) { weather = JSON.parse(raw); weatherLastFetch = 0; } } catch {} }

// === 表情 ===

function resetPX(){for(var i=0;i<ct.d.p.length;i++)PX[i]=ct.d.p[i];}

function exprNormal(){resetPX();}
function exprHappy(){resetPX();if(ct.n==="deep"){var o=EYE_L;setP(o.x+2,o.y,E);setP(o.x+1,o.y+1,E);setP(o.x+2,o.y+1,E);setP(o.x,o.y+3,E);return;}setP(EYE_L.x,EYE_L.y,BODY);setP(EYE_L.x+1,EYE_L.y,BODY);setP(EYE_L.x+2,EYE_L.y,E);setP(EYE_L.x,EYE_L.y+1,BODY);setP(EYE_L.x+1,EYE_L.y+1,E);setP(EYE_L.x+2,EYE_L.y+1,E);setP(EYE_L.x,EYE_L.y+2,E);setP(EYE_L.x+1,EYE_L.y+2,BODY);setP(EYE_L.x+2,EYE_L.y+2,BODY);setP(EYE_L.x,EYE_L.y+3,BODY);setP(EYE_L.x+1,EYE_L.y+3,E);setP(EYE_L.x+2,EYE_L.y+3,BODY);setP(EYE_R.x,EYE_R.y,E);setP(EYE_R.x+1,EYE_R.y,BODY);setP(EYE_R.x+2,EYE_R.y,BODY);setP(EYE_R.x,EYE_R.y+1,E);setP(EYE_R.x+1,EYE_R.y+1,E);setP(EYE_R.x+2,EYE_R.y+1,BODY);setP(EYE_R.x,EYE_R.y+2,BODY);setP(EYE_R.x+1,EYE_R.y+2,BODY);setP(EYE_R.x+2,EYE_R.y+2,E);setP(EYE_R.x,EYE_R.y+3,BODY);setP(EYE_R.x+1,EYE_R.y+3,E);setP(EYE_R.x+2,EYE_R.y+3,BODY);}
function exprHeart(){resetPX();if(ct.n==="deep"){var o=EYE_L;for(var r=0;r<4;r++)for(var c=0;c<3;c++)setP(o.x+c,o.y+r,H);setP(o.x+1,o.y-1,H);setP(o.x+1,o.y+4,H);return;}for(var o of[EYE_L,EYE_R]){setP(o.x+1,o.y-1,H);for(var r=0;r<4;r++)for(var c=0;c<3;c++)setP(o.x+c,o.y+r,H);setP(o.x+1,o.y+4,H);}}
function exprAngry(){resetPX();if(ct.n==="deep"){var o=EYE_L;setP(o.x-1,o.y-1,E);setP(o.x+2,o.y-1,E);setP(o.x,o.y-2,E);setP(o.x+1,o.y-2,E);return;}setP(EYE_L.x-1,EYE_L.y,E);setP(EYE_L.x+3,EYE_L.y,E);setP(EYE_R.x-1,EYE_R.y,E);setP(EYE_R.x+3,EYE_R.y,E);}
function exprSleepy(){resetPX();if(ct.n==="deep"){var o=EYE_L;setP(o.x,o.y,BODY);setP(o.x+1,o.y,BODY);setP(o.x+2,o.y,BODY);setP(o.x,o.y+3,BODY);setP(o.x+1,o.y+3,BODY);setP(o.x+2,o.y+3,BODY);return;}for(var o of[EYE_L,EYE_R]){setP(o.x,o.y,BODY);setP(o.x+1,o.y,BODY);setP(o.x+2,o.y,BODY);setP(o.x,o.y+3,BODY);setP(o.x+1,o.y+3,BODY);setP(o.x+2,o.y+3,BODY);}}
function exprStar(){resetPX();if(ct.n==="deep"){var o=EYE_L;for(var r=0;r<4;r++)for(var c=0;c<3;c++)setP(o.x+c,o.y+r,G);setP(o.x+1,o.y-1,G);setP(o.x-1,o.y+1,G);setP(o.x+3,o.y+1,G);setP(o.x+1,o.y+4,G);return;}for(var o of[EYE_L,EYE_R]){for(var r=0;r<4;r++)for(var c=0;c<3;c++)setP(o.x+c,o.y+r,G);setP(o.x+1,o.y-1,G);setP(o.x-1,o.y+1,G);setP(o.x+3,o.y+1,G);setP(o.x+1,o.y+4,G);}}
function exprDizzy(){exprDead();}
function exprBlink(){resetPX();if(ct.n==="deep"){var o=EYE_L;for(var r=0;r<3;r++){setP(o.x,o.y+r,BODY);setP(o.x+1,o.y+r,BODY);setP(o.x+2,o.y+r,BODY);}return;}for(var o of[EYE_L,EYE_R])for(var r=0;r<3;r++){setP(o.x,o.y+r,BODY);setP(o.x+1,o.y+r,BODY);setP(o.x+2,o.y+r,BODY);}}
function exprDead(){resetPX();if(ct.n==="deep"){var o=EYE_L;for(var r=0;r<4;r++)for(var c=0;c<3;c++)setP(o.x+c,o.y+r,BODY);setP(o.x,o.y,E);setP(o.x+2,o.y,E);setP(o.x+1,o.y+1,E);setP(o.x+1,o.y+2,E);setP(o.x,o.y+3,E);setP(o.x+2,o.y+3,E);return;}for(var o of[EYE_L,EYE_R]){setP(o.x,o.y,E);setP(o.x+1,o.y,BODY);setP(o.x+2,o.y,E);setP(o.x,o.y+1,BODY);setP(o.x+1,o.y+1,E);setP(o.x+2,o.y+1,BODY);setP(o.x,o.y+2,BODY);setP(o.x+1,o.y+2,E);setP(o.x+2,o.y+2,BODY);setP(o.x,o.y+3,E);setP(o.x+1,o.y+3,BODY);setP(o.x+2,o.y+3,E);}}
function exprShock(){resetPX();if(ct.n==="deep"){var o=EYE_L;setP(o.x+1,o.y+1,W);return;}setP(EYE_L.x+1,EYE_L.y+1,W);setP(EYE_R.x+1,EYE_R.y+1,W);}
function exprMusic(){resetPX();if(ct.n==="deep"){var o=EYE_L;for(var r=0;r<4;r++)for(var c=0;c<3;c++)setP(o.x+c,o.y+r,BODY);setP(o.x+1,o.y,E);setP(o.x+1,o.y+1,E);setP(o.x,o.y+2,E);setP(o.x+1,o.y+2,E);setP(o.x+1,o.y+3,E);return;}for(var o of[EYE_L,EYE_R]){setP(o.x,o.y,BODY);setP(o.x+1,o.y,E);setP(o.x+2,o.y,BODY);setP(o.x,o.y+1,BODY);setP(o.x+1,o.y+1,E);setP(o.x+2,o.y+1,BODY);setP(o.x,o.y+2,E);setP(o.x+1,o.y+2,E);setP(o.x+2,o.y+2,BODY);setP(o.x,o.y+3,BODY);setP(o.x+1,o.y+3,E);setP(o.x+2,o.y+3,BODY);}}
const EXPRS: Record<string, () => void> = {
  normal: exprNormal, happy: exprHappy, heart: exprHeart,
  angry: exprAngry, sleepy: exprSleepy,
  star: exprStar, dizzy: exprDizzy, blink: exprBlink,
  dead: exprDead, shock: exprShock, music: exprMusic,
};
let curExpr = 'normal';
let exprTimer = 0;

function setExpr(e: string, dur?: number): void {
  curExpr = e; EXPRS[e]?.();
  if (dur) exprTimer = dur;
}

// === 鲸鱼喷水动画 (头顶像素闪烁) ===
function drawSpout():void{
  if(!spouting||ct.n!=='deep')return;
  var Wc=0xFFFFFFFF,S=0x93c5fdFF;
  var frame=Math.floor(spoutTimer*12)%4;
  // 中心水柱: x=28~34, 在不同y行闪烁
  if(frame===0||frame===2){setP(30,0,Wc);setP(31,0,Wc);setP(29,1,S);setP(32,1,S);setP(31,2,Wc);}
  if(frame===1||frame===3){setP(29,0,S);setP(30,1,Wc);setP(31,1,Wc);setP(32,0,S);setP(31,0,Wc);setP(30,2,S);}
  // 外溅水滴
  if(frame===0){setP(27,1,Wc);setP(33,0,S);}
  if(frame===1){setP(28,0,Wc);setP(34,1,S);}
  if(frame===2){setP(26,1,S);setP(35,0,Wc);}
  if(frame===3){setP(27,0,Wc);setP(33,1,S);setP(29,0,Wc);}
}

// === 渲染：PX → temp canvas → drawImage (支持 transform) ===
let mcanvas: HTMLCanvasElement;
let tempCanvas: HTMLCanvasElement;
let tempCtx: CanvasRenderingContext2D;
let tempData: ImageData;
let extraScale = 1;

function updateTempCanvas(): void {
  for (let i = 0; i < PX.length; i++) {
    const v = PX[i], o = i * 4;
    tempData.data[o] = (v >>> 24) & 0xff;
    tempData.data[o + 1] = (v >>> 16) & 0xff;
    tempData.data[o + 2] = (v >>> 8) & 0xff;
    tempData.data[o + 3] = v & 0xff;
  }
  tempCtx.putImageData(tempData, 0, 0);
}

function render(flip: boolean): void {
  updateTempCanvas();
  const ctx = mcanvas.getContext('2d', { alpha: true })!;
  ctx.clearRect(0, 0, Ww, Wh);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(Ww / 2, Wh - 8);
  // 哼歌身体摆动
  if (swayAngle !== 0) ctx.rotate(swayAngle);
  const ss = S * extraScale;
  ctx.scale(flip ? ss : -ss, ss);
  ctx.translate(-CW / 2, -CH);
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}

// === 弹跳 ===
let bounceT = 0;
let swayAngle = 0; // 哼歌身体摆动
function startBounce(): void { bounceT = 0.5; }
function updateBounce(dt: number): void {
  if (bounceT > 0) { bounceT -= dt; extraScale = 1 + Math.sin((0.5 - bounceT) / 0.5 * Math.PI) * 0.08; if (bounceT <= 0) extraScale = 1; }
  // 哼歌摆动
  if (singing) {
    swayAngle = Math.sin(performance.now() / 300) * 0.06; // 左右摇晃 ~0.3Hz
  } else {
    swayAngle *= 0.9; // 淡出
    if (Math.abs(swayAngle) < 0.001) swayAngle = 0;
  }
}

// === 状态 & 养成 ===
let desk = { x: 0, y: 0 };
let facing = true;
let target: { x: number; y: number } | null = null;
let pause = 0;
let dragging = false;
let sleeping = false; let sleepTimer = 0; let sleepZzzTimer = 0;
let singing = false; let singTimer = 0; let singLineTimer = 0;
let spouting = false; let spoutTimer = 0; let spoutDrop = 0;
const spd = 100;
let bounds = { w: 1920, h: 1080, ty: 1020 };
let stats = { hunger: 30, energy: 80, mood: 70, affection: 0 };
let lastDecay = Date.now();

function tickNurture(): void {
  const now = Date.now(); const el = (now - lastDecay) / 1000;
  if (el > 600) { stats.hunger = Math.min(100, stats.hunger + Math.floor(el / 600)); stats.energy = Math.max(0, stats.energy - Math.floor(el / 300)); stats.mood = Math.max(0, stats.mood - Math.floor(el / 900)); lastDecay = now; }
}
function pet(): void { stats.mood = Math.min(100, stats.mood + 5); stats.affection += 3; }
function doublePet(): void { stats.mood = Math.min(100, stats.mood + 10); stats.affection += 1; }
function feed(): void { stats.hunger = Math.max(0, stats.hunger - 30); stats.mood = Math.min(100, stats.mood + 5); stats.affection += 5; }
function companion(): void { stats.affection += 1; }

// === 气泡 ===
let bubble: HTMLDivElement;
let bubbleTid = 0;
function say(text: string): void {
  bubble.textContent = text; bubble.style.opacity = '1'; bubble.style.display = 'block';
  clearTimeout(bubbleTid);
  bubbleTid = window.setTimeout(() => { bubble.style.opacity = '0'; setTimeout(() => { bubble.style.display = 'none'; }, 300); }, 2500);
}

// === 右键 ===
let menu: HTMLDivElement | null = null;
function menuShow(x: number, y: number): void {
  menuHide();
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;z-index:999;left:${x}px;top:${y}px;background:#141413;border:1px solid ${ct.bc};border-radius:6px;padding:4px 0;min-width:120px;font-family:monospace;font-size:12px;color:#ccc;`;
  for (const [label, action] of [['🍞 喂食', () => { feed(); say(pick(DLG('fed'))); }], ['🔄 切换', () => { var n = ct.n == 'clawd' ? 'deep' : 'clawd'; sp(n); location.reload(); }], ['🦀 状态', () => { say(`🍞${Math.round(stats.hunger)} ⚡${Math.round(stats.energy)} 😊${Math.round(stats.mood)} ❤${Math.round(stats.affection)}`); }]] as [string, () => void][]) {
    const row = document.createElement('div'); row.textContent = label;
    row.style.cssText = 'padding:6px 14px;cursor:pointer;';
    row.onmouseenter = () => { row.style.background = ct.bc; row.style.color = '#fff'; };
    row.onmouseleave = () => { row.style.background = ''; row.style.color = '#ccc'; };
    row.onclick = () => { action(); menuHide(); };
    el.appendChild(row);
  }
  document.body.appendChild(el); menu = el;
  setTimeout(() => document.addEventListener('click', menuHide, { once: true }), 0);
}
function menuHide() { if (menu) { menu.remove(); menu = null; } }

// === 主循环 ===
let bridge: TauriBridge;

function pickTarget(): void {
  const m = 80;
  if (Math.random() < 0.7) target = { x: m + Math.random() * (bounds.w - Ww - m * 2), y: bounds.ty - Wh };
  else target = { x: m + Math.random() * (bounds.w - Ww - m * 2), y: 40 + Math.random() * (bounds.h - Wh - 80) };
}

let lt = performance.now();
let sv = 0, cp = 0, rd = 0, ex = 0, wx = 0, bk = 0;

function loop(): void {
  const now = performance.now();
  const dt = Math.min((now - lt) / 1000, 0.1); lt = now;

  tickNurture();
  updateBounce(dt);
  if (exprTimer > 0) { exprTimer -= dt; if (exprTimer <= 0 && !sleeping && !singing) setExpr('normal'); }
  // 睡觉状态管理
  if (sleeping) {
    sleepTimer -= dt;
    sleepZzzTimer -= dt;
    if (sleepZzzTimer <= 0) {
      sleepZzzTimer = 3 + Math.random() * 2;
      const zzz = ['Zzz...', 'Zzz... 😴', '呼...zzZ', 'Zzz🫧'];
      say(zzz[Math.floor(Math.random() * zzz.length)]);
      setExpr('sleepy');
    }
    if (sleepTimer <= 0) {
      sleeping = false;
      setExpr('normal');
      stats.energy = Math.min(100, stats.energy + 20);
      say('嗯...睡饱了！🦀✨');
      pause = 0; pickTarget();
    }
  }

  // 🎵 哼歌状态管理
  if (singing) {
    singTimer -= dt;
    singLineTimer -= dt;
    if (singLineTimer <= 0) {
      singLineTimer = 4 + Math.random() * 3; // 4~7 秒换一句
      const idx = Math.floor(Math.random() * DLG('singing').length);
      say(DLG('singing')[idx]);
      setExpr('music');
    }
    if (singTimer <= 0) {
      singing = false;
      setExpr('normal');
      stats.mood = Math.min(100, stats.mood + 10);
      say('🎵 唱完了！心情真好 ~');
      pause = 0; pickTarget();
    }
  }

  if (curExpr === 'normal' && exprTimer <= 0 && !sleeping && !singing) {
    if (stats.hunger > 50) setExpr('angry');
    else if (stats.energy < 40) setExpr('sleepy');
  }
  // 情绪恢复: 饥饿/体力恢复正常后自动回到普通眼
  if (curExpr === 'angry' && stats.hunger <= 50 && exprTimer <= 0) setExpr('normal');
  if (curExpr === 'sleepy' && stats.energy >= 40 && !sleeping && exprTimer <= 0) setExpr('normal');

  // 自行入睡 / 哼歌 (每 2 分钟随机触发)
  ex += dt;
  if (ex > 120) { ex = 0;
    if (!sleeping && !singing && exprTimer <= 0 && curExpr === 'normal') {
      if (stats.energy < 30) {
        sleeping = true;
        sleepTimer = 20 + Math.random() * 40;
        sleepZzzTimer = 0;
        setExpr('sleepy');
        target = null; pause = 0;
        say('好困…睡一会儿💤');
      } else if (Math.random() < 0.08) {
        // 开始哼歌
        singing = true;
        singTimer = 15 + Math.random() * 25; // 15~40 秒
        singLineTimer = 0;
        setExpr('music');
        target = null; pause = 0;
        say('🎵~♪ 哼哼哼 ~♫');
      } else if (Math.random() < 0.03) {
        sleeping = true;
        sleepTimer = 20 + Math.random() * 40;
        sleepZzzTimer = 0;
        setExpr('sleepy');
        target = null; pause = 0;
        say('好困…睡一会儿💤');
      } else {
        // 稀有表情 (共 ~4% 概率)
        const r = Math.random();
        if (r < 0.01) { setExpr('star', 1.5); say('⭐✨'); }
        else if (r < 0.02) { setExpr('shock', 1.0); say('😱 什么？！'); }
        else if (r < 0.03) { setExpr('dizzy', 1.2); say('呜呜好晕…'); }
        else if (r < 0.04) { setExpr('dead', 2.0); say('(装死中…别理我)'); }
      }
    }
  }

  if (!dragging && !sleeping && !singing) {
    if (pause > 0) { pause -= dt; if (pause <= 0) pickTarget(); }
    else if (target) {
      const dx = target.x - desk.x, dy = target.y - desk.y, d = Math.hypot(dx, dy);
      if (d < 3) { target = null; pause = 1 + Math.random() * 3; }
      else {
        facing = dx > 0;
        desk.x += dx * Math.min(spd * dt / d, 1); desk.y += dy * Math.min(spd * dt / d, 1);
        desk.x = Math.max(0, Math.min(bounds.w - Ww, desk.x));
        desk.y = Math.max(0, Math.min(bounds.h - Wh, desk.y));
        bridge.moveWindow(Math.round(desk.x), Math.round(desk.y));
      }
    }
  }

  sv += dt; cp += dt; rd += dt; bk += dt;
  if (sv > 10) { sv = 0; savePet({ stats, lastDecayTime: { hunger: lastDecay, energy: lastDecay, mood: lastDecay }, deskX: desk.x, deskY: desk.y }); }
  if (cp > 1800) { cp = 0; companion(); }
  wx += dt;
  // 每 30 分钟刷新天气
  if (wx > 600) { wx = 0; refreshWeather(); } // 每10分钟刷新天气
  // 眨眼: 每 3~8 秒眨眼一次
  if (bk > 3 + Math.random() * 5) { bk = 0; if (curExpr === 'normal' && exprTimer <= 0) setExpr('blink', 0.15); }

  if (rd > 300) { rd = 0;
    // 30% 概率说天气 (如果可用), 70% 随机台词
    if (weather && Math.random() < 0.3) {
      say(weatherDialog(weather));
    } else if (Math.random() < 0.08) {
      say(pick(DLG('random')));
    }
  }

  // 鲸鱼喷水动画更新
  if(spouting){spoutTimer-=dt;if(spoutTimer<=0){spouting=false;}else{drawSpout();}}
  render(facing);
  // 喷水后恢复头顶原像素(避免残留)
  if(spouting&&ct.n==='deep'){for(var sy=0;sy<5;sy++)for(var sx=24;sx<38;sx++)setP(sx,sy,ct.d.p[sy*CW+sx]);}
  requestAnimationFrame(loop);
}

async function main() {
  bridge = TauriBridge.getInstance();
  const info = bridge.isDesktop ? await bridge.getScreenInfo() : { width: 1920, height: 1080, taskbar_y: 1020 };
  bounds = { w: info.width, h: info.height, ty: info.taskbar_y };

  // 加载天气缓存 + 异步刷新
  loadWeatherCache();
  refreshWeather();

  const saved = loadPet();
  if (saved) { stats = { ...saved.stats }; desk.x = saved.deskX; desk.y = saved.deskY; }
  else { desk.x = (bounds.w - Ww) / 2; desk.y = bounds.ty - Wh; }
  bridge.moveWindow(Math.round(desk.x), Math.round(desk.y));
  pickTarget();

  // apply theme
  mcanvas = document.createElement('canvas');
  mcanvas.width = Ww; mcanvas.height = Wh;
  mcanvas.style.cssText = `display:block;position:fixed;top:0;left:0;width:${Ww}px;height:${Wh}px;image-rendering:pixelated;cursor:pointer;pointer-events:auto;`;
  document.body.appendChild(mcanvas);

  // temp canvas for pixel data → drawImage
  tempCanvas = document.createElement('canvas');
  tempCanvas.width = CW; tempCanvas.height = CH;
  tempCtx = tempCanvas.getContext('2d', { alpha: true })!;
  tempData = tempCtx.createImageData(CW, CH);

  bubble = document.createElement('div');
  // Clawd气泡在眼上方, DeepSeek更靠上避开喷水花
  var gap = ct.n === 'deep' ? 50 : 24;
  var bTop = Wh - 8 - Math.round(CH * S) - gap;
  if (bTop < 2) bTop = 2;
  bubble.style.cssText = 'position:fixed;top:'+bTop+'px;left:50%;transform:translateX(-50%);padding:3px 8px;font-family:monospace;font-size:11px;background:rgba(20,20,19,0.92);color:#FAF9F5;border:1px solid '+ct.bc+';border-radius:6px;max-width:180px;text-align:center;z-index:20;pointer-events:none;display:none;transition:opacity 0.3s;';
  document.body.appendChild(bubble);

  render(true);

  let drag = false, moved = false, sx = 0, sy = 0, dx = 0, dy = 0, lc = 0;
  document.addEventListener('pointerdown', (e) => {
    if (sleeping) { sleeping = false; setExpr('normal'); stats.energy = Math.min(100, stats.energy + 15); say('啊…你戳醒我了！🦀'); pause = 1; pickTarget(); return; }
    if (singing) { singing = false; setExpr('normal'); say('不唱了！'); pause = 1; pickTarget(); return; }
    drag = true; moved = false; dragging = true; sx = e.screenX; sy = e.screenY; dx = desk.x; dy = desk.y;
  });
  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const nx = dx + (e.screenX - sx), ny = dy + (e.screenY - sy);
    if (Math.abs(nx - dx) > 1 || Math.abs(ny - dy) > 1) moved = true;
    desk.x = Math.max(0, Math.min(bounds.w - Ww, nx));
    desk.y = Math.max(0, Math.min(bounds.h - Wh, ny));
    bridge.moveWindow(Math.round(desk.x), Math.round(desk.y));
  });
  document.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = false; dragging = false; pause = 2 + Math.random() * 3; pickTarget();
    if (!moved) {
      const t = Date.now();
      if (lc && t - lc < 400) { lc = 0; startBounce(); doublePet(); setExpr('happy', 1.5); if(ct.n==='deep'){spouting=true;spoutTimer=2.5;} say(pick(DLG('happy'))); }
      else { lc = t; const ct = t; setTimeout(() => { if (lc === ct) { pet(); setExpr('heart', 0.8); if(ct.n==='deep'){spouting=true;spoutTimer=1.2;} say(pick(DLG('petting'))); } }, 420); }
    }
  });
  document.addEventListener('contextmenu', (e) => { if ((e.target as HTMLElement).tagName === 'CANVAS') { e.preventDefault(); menuShow(e.clientX, e.clientY); } });

  // 启动问候 (如果天气可用则用天气文案)
  setTimeout(async () => {
    await refreshWeather();
    if (weather) {
      say(weatherGreeting());
      // 天气表情
      if (weather.temp > 35) setExpr('angry', 2);
      else if (weather.code <= 3 && weather.temp > 15 && weather.temp < 30) setExpr('happy', 2);
      else if (weather.code >= 50 && weather.code <= 69) setExpr('sleepy', 2);
    } else {
      const h = new Date().getHours();
      if (h >= 6 && h < 11) say(pick(DLG('morning')));
      else if (h >= 23 || h < 5) say(pick(DLG('late')));
      else if (h >= 19) say(pick(DLG('night')));
      else say(pick(DLG('greeting')));
    }
  }, 1500);

  // === 快捷键触发（调试用） ===
  (window as any).forceSing = () => {
    if (!singing) {
      singing = true; singTimer = 15; singLineTimer = 0;
      setExpr('music'); target = null; pause = 0;
      say('🎵~♪ 哼哼哼 ~♫');
    }
  };
  (window as any).forceSleep = () => {
    if (!sleeping) {
      sleeping = true; sleepTimer = 20; sleepZzzTimer = 0;
      setExpr('sleepy'); target = null; pause = 0;
      say('好困…睡一会儿💤');
    }
  };

  // 🔥 3秒后自动触发哼歌演示
  setTimeout(() => {
    if (!sleeping && !singing) {
      singing = true; singTimer = 20; singLineTimer = 0;
      setExpr('music'); target = null; pause = 0;
      say('🎵~♪ 哼哼哼 ~♫');
    }
  }, 3000);

  requestAnimationFrame(loop);
}

main().catch(console.error);
