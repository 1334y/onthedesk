const fs=require('fs');
let c=fs.readFileSync('d:/cc/clawd/src/main.ts','utf8');

// Restore theme loading from localStorage
c=c.replace(
  'try { /* var sn = localStorage.getItem("cp"); if (sn && T[sn]) ct = T[sn]; */ } catch (e) { }',
  'try { var sn = localStorage.getItem("cp"); if (sn && T[sn]) ct = T[sn]; } catch (e) { }'
);

// Make PX dynamically sized so both themes get correct array
c=c.replace(
  'var PX: number[] = new Array(ct.d.w*ct.d.h).fill(0);\nif(ct.draw)ct.draw(PX);else for(var _i=0;_i<ct.d.p.length;_i++)PX[_i]=ct.d.p[_i];',
  'function initPX(){PX=new Array(ct.d.w*ct.d.h).fill(0);CW=ct.d.w;CH=ct.d.h;Ww=Math.round(CW*SCALE+8);Wh=Math.round(CH*SCALE+14);EYE_L.x=ct.el.x;EYE_L.y=ct.el.y;EYE_R.x=ct.er.x;EYE_R.y=ct.er.y;BODY=ct.b;if(ct.draw)ct.draw(PX);else for(var _i=0;_i<ct.d.p.length;_i++)PX[_i]=ct.d.p[_i];}\nvar PX:number[]=[];\nvar CW=ct.d.w,CH=ct.d.h;\nvar Ww=Math.round(CW*SCALE+8);\nvar Wh=Math.round(CH*SCALE+14);\nvar BODY=ct.b;\nvar EYE_L={x:ct.el.x,y:ct.el.y,w:3,h:4};\nvar EYE_R={x:ct.er.x,y:ct.er.y,w:3,h:4};\ninitPX();'
);

// Fix resetPX to also reconstruct PX when switching
c=c.replace(
  "function resetPX(){if(ct.draw){ct.draw(PX);return;}for(var i=0;i<ct.d.p.length;i++)PX[i]=ct.d.p[i];}",
  "function resetPX(){initPX();}"
);

fs.writeFileSync('d:/cc/clawd/src/main.ts',c);
console.log('Fixed: switch should work now');
