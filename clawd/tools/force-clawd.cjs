const fs=require('fs');
let c=fs.readFileSync('d:/cc/clawd/src/main.ts','utf8');
// Force always start with Clawd
c=c.replace(
  'try { var sn = localStorage.getItem("cp"); if (sn && T[sn]) ct = T[sn]; } catch (e) { }',
  'try { /* var sn = localStorage.getItem("cp"); if (sn && T[sn]) ct = T[sn]; */ } catch (e) { }'
);
fs.writeFileSync('d:/cc/clawd/src/main.ts',c);
console.log('forced clawd default');
