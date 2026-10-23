#!/usr/bin/env node
/**
 * render-demo.mjs
 *
 * Renders the README demo video from real inputs:
 *   1. a terminal scene played back from session.json (see build-session.mjs),
 *   2. a before/after of the source page and the generated theme running in WordPress,
 *   3. a scroll through the full WordPress page, labelled with the pattern file behind each section.
 * Frames are drawn in headless Chromium and encoded to MP4 and GIF with ffmpeg.
 *
 * Dev-only tooling: needs Playwright (with Chromium) and ffmpeg, unlike the theme-quality scripts.
 *
 * Usage:
 *   node scripts/demo/render-demo.mjs --session session.json --source-shot source.png --wp-shot wp.png \
 *     --sections sections.json --out-dir out/ [--fps 15] [--only-frame 12.5]
 *
 * sections.json: [{ "y": 0, "label": "patterns/hero.php" }, …]  (y in px of the full-page WP screenshot)
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const sessionPath = arg('session');
const sourceShot = arg('source-shot');
const wpShot = arg('wp-shot');
const sectionsPath = arg('sections');
const outDir = resolve(arg('out-dir', 'demo-out'));
const FPS = Number(arg('fps', '15'));
const onlyFrame = arg('only-frame');
if (!sessionPath || !sourceShot || !wpShot || !sectionsPath) {
  console.error('usage: render-demo.mjs --session s.json --source-shot a.png --wp-shot b.png --sections c.json --out-dir dir');
  process.exit(2);
}

const session = JSON.parse(readFileSync(sessionPath, 'utf8'));
const sections = JSON.parse(readFileSync(sectionsPath, 'utf8'));
const facts = arg('facts', '');

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const clean = (s) => s.replace(/\*\*|`/g, '').replace(/^#+\s*/, '');
/** Greedy word wrap to `width` columns. */
const wrap = (text, width) => {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  return line ? [...lines, line] : lines;
};
const trunc = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ── Terminal timeline ───────────────────────────────────────────────────────
// Each entry is one rendered line group with a duration weight; times are normalised into the window.
const TERM_TYPE_END = 2.6;
const TERM_WINDOW = [3.0, 13.0];
const TERM_TOTAL = 15.5;

function terminalLines() {
  const out = []; // { html, weight }
  const add = (html, weight) => out.push({ html, weight });
  for (const p of session.prompt) add(`<span class="dim">  ${esc(trunc(p, 112))}</span>`, 0);
  for (const step of session.steps) {
    if (step.t === 'say') {
      const first = clean(step.text).split('\n')[0];
      if (step.text.length > 400) continue; // the long closing report is shown separately
      add(`<span class="dot">●</span> ${esc(trunc(first, 108))}`, 1.0);
    } else if (step.t === 'tool') {
      const shown = [...new Set(step.items)].slice(0, 3).map((i) => (step.name === 'Bash' ? trunc(i, 64) : trunc(i, 30)));
      const more = step.count > shown.length ? ` <span class="dim">+${step.count - shown.length} more</span>` : '';
      const head = step.count > 1 ? `${step.name} <span class="dim">× ${step.count}</span>` : step.name;
      const body = step.doctor ? esc(trunc(step.items[0], 78)) : esc(shown.join(', '));
      add(`<span class="dot">●</span> <b>${head}</b>  <span class="dim">${body}</span>${more}`, step.doctor ? 1.4 : 0.55);
    } else if (step.t === 'out') {
      step.lines.forEach((l, idx) => {
        const html = esc(l)
          .replace(/✅/g, '<span class="ok">✔</span>')
          .replace(/❌/g, '<span class="bad">✘</span>')
          .replace(/(Overall: )(\d+\/\d+ scripts passed\.)/, '$1<span class="ok">$2</span>');
        add(`<span class="out">  ${idx === 0 ? '⎿' : ' '} ${html}</span>`, 0.14);
      });
    }
  }
  const paragraphs = session.final.map(clean).filter((l) => l.length > 40 && !l.startsWith('|')).slice(0, 2);
  for (const para of paragraphs) {
    wrap(para, 106).slice(0, 2).forEach((line, n, all) => {
      const more = n === all.length - 1 && wrap(para, 106).length > all.length ? '…' : '';
      add(`${n === 0 ? '<span class="dot">●</span>' : ' '} ${esc(line)}${more}`, n === 0 ? 0.8 : 0.5);
    });
  }
  return out;
}

const TL = terminalLines();
const weightTotal = TL.reduce((a, l) => a + l.weight, 0) || 1;
let acc = 0;
const timed = TL.map((l) => {
  const at = TERM_WINDOW[0] + (acc / weightTotal) * (TERM_WINDOW[1] - TERM_WINDOW[0]);
  acc += l.weight;
  return { ...l, at };
});

const SCENES = {
  terminal: [0, TERM_TOTAL],
  compare: [TERM_TOTAL, TERM_TOTAL + 6.5],
  scroll: [TERM_TOTAL + 6.5, TERM_TOTAL + 20],
  end: [TERM_TOTAL + 20, TERM_TOTAL + 24.5],
};
const DURATION = SCENES.end[1];

const dataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;

const html = `<!doctype html><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1280px;height:720px;overflow:hidden;background:#0b1020;font-family:"DejaVu Sans","Liberation Sans",sans-serif;color:#e6edf3}
.scene{position:absolute;inset:0;opacity:0}
.mono{font-family:"DejaVu Sans Mono","Liberation Mono",monospace}
.win{position:absolute;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 24px 60px rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.12)}
.bar{height:34px;background:#1c2333;display:flex;align-items:center;gap:8px;padding:0 14px;font-size:13px;color:#9aa7bd}
.bar i{width:12px;height:12px;border-radius:50%;display:block}
.bar span{margin-left:10px;white-space:nowrap}
.url{margin-left:auto;margin-right:auto;background:#0f1524;border-radius:6px;padding:3px 14px;font-size:12px;color:#8b98b0}
/* terminal */
#term{background:radial-gradient(circle at 20% 0%,#1a2440 0%,#0b1020 60%)}
#termwin{left:60px;top:42px;width:1160px;height:636px;background:#0d1117}
#termbody{position:absolute;left:0;right:0;top:34px;bottom:0;padding:18px 22px;font-size:15.5px;line-height:23px;overflow:hidden;white-space:pre;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 46px);mask-image:linear-gradient(to bottom,transparent 0,#000 46px)}
#termlines{position:absolute;left:22px;right:22px;bottom:16px}
.dot{color:#d97757}.dim{color:#8b949e}.ok{color:#3fb950}.bad{color:#f85149}.out{color:#c9d1d9}
.prompt{color:#e6edf3}.prompt b{color:#d97757}
.cursor{display:inline-block;width:9px;height:17px;background:#e6edf3;vertical-align:-3px;margin-left:2px}
/* compare */
.cap{position:absolute;font-size:17px;font-weight:600;letter-spacing:.2px}
.shot{position:absolute;left:0;top:34px;transform-origin:0 0}
#arrow{position:absolute;left:608px;top:300px;width:64px;font-size:44px;text-align:center;color:#8b9cff}
#facts{position:absolute;left:0;right:0;bottom:34px;text-align:center;font-size:20px;color:#c7d2fe}
#facts b{color:#fff}
/* scroll */
#chip{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);background:#4f46e5;color:#fff;padding:8px 18px;border-radius:999px;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.4)}
/* end */
#end{background:linear-gradient(135deg,#1e1b4b 0%,#0b1020 70%);text-align:center}
#end h1{position:absolute;left:0;right:0;top:190px;font-size:64px;letter-spacing:-1px}
#end h2{position:absolute;left:0;right:0;top:290px;font-size:26px;font-weight:400;color:#a5b4fc}
#end .cmd{position:absolute;left:210px;right:210px;top:390px;background:#0d1117;border:1px solid #30363d;border-radius:10px;padding:18px 24px;font-size:20px;text-align:left;line-height:34px}
#end .foot{position:absolute;left:0;right:0;bottom:60px;font-size:18px;color:#8b98b0}
</style>
<div id="term" class="scene"><div id="termwin" class="win"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><span>claude — northstar-demo</span></div>
<div id="termbody" class="mono"><div id="termlines"></div></div></div></div>

<div id="compare" class="scene">
 <div class="cap" style="left:60px;top:34px;color:#cbd5e1">BEFORE · static HTML, CSS &amp; JS</div>
 <div class="cap" style="left:660px;top:34px;color:#c7d2fe">AFTER · WordPress block theme</div>
 <div class="win" style="left:60px;top:80px;width:560px;height:500px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">source/index.html</div></div><img class="shot" id="srcimg" src="${dataUrl(sourceShot)}" style="width:560px"></div>
 <div id="arrow">→</div>
 <div class="win" style="left:660px;top:80px;width:560px;height:500px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">localhost · WordPress ${esc(arg('wp-version', '6.6'))}</div></div><img class="shot" id="wpimg0" src="${dataUrl(wpShot)}" style="width:560px"></div>
 <div id="facts">${facts}</div>
</div>

<div id="scroll" class="scene">
 <div class="win" id="scrollwin" style="left:140px;top:36px;width:1000px;height:648px"><div class="bar"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i><div class="url">Northstar · WordPress ${esc(arg('wp-version', '6.6'))}</div></div>
  <div style="position:absolute;left:0;top:34px;right:0;bottom:0;overflow:hidden"><img id="wpimg" src="${dataUrl(wpShot)}" style="position:absolute;left:0;top:0;width:1000px"></div>
  <div id="chip" class="mono"></div></div>
</div>

<div id="end" class="scene">
 <h1>HTML in. Block theme out.</h1>
 <h2>wp-block-theme-converter · a Claude Code plugin</h2>
 <div class="cmd mono"><span class="dim">/plugin marketplace add</span> siddik-web/wp-block-theme-converter<br><span class="dim">/plugin install</span> wp-block-theme-converter@siddik-web</div>
 <div class="foot">${esc(arg('footer', ''))}</div>
</div>
<script>
const TL=${JSON.stringify(timed)}, PROMPT=${JSON.stringify(session.command)}, SC=${JSON.stringify(SCENES)}, SECTIONS=${JSON.stringify(sections)};
const $=id=>document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>0.5-0.5*Math.cos(Math.PI*clamp(x));
function fade(el,[a,b],t,f=0.4){el.style.opacity=clamp(Math.min((t-a)/f,(b-t)/f,1));}
const wpImg=$('wpimg');
window.__render=function(t){
  for(const [name,id] of [['terminal','term'],['compare','compare'],['scroll','scroll'],['end','end']]) fade($(id),SC[name],t, name==='terminal'&&t<1?0.01:0.4);
  // terminal
  const typed=PROMPT.slice(0,Math.floor(clamp(t/${TERM_TYPE_END})*PROMPT.length));
  let h='<div class="prompt"><b>❯</b> '+typed.replace(/&/g,'&amp;')+(t<${TERM_TYPE_END}+0.6&&Math.floor(t*2)%2===0?'<span class="cursor"></span>':'')+'</div>';
  if(t>=${TERM_TYPE_END}) for(const l of TL) if(t>=l.at) h+='<div>'+l.html+'</div>';
  $('termlines').innerHTML=h;
  // compare: reveal the right shot's top
  const [c0,c1]=SC.compare; const k=ease((t-c0)/1.0);
  $('facts').style.opacity=ease((t-c0-1.2)/0.8);
  // scroll
  const [s0,s1]=SC.scroll; const p=ease(clamp((t-s0-0.7)/(s1-s0-1.8)));
  const imgH=wpImg.naturalHeight*1000/wpImg.naturalWidth, view=648-34;
  wpImg.style.top=(-p*(imgH-view))+'px';
  const mid=(p*(imgH-view)+view*0.5)*wpImg.naturalWidth/1000;
  let label=SECTIONS[0].label; for(const s of SECTIONS) if(mid>=s.y) label=s.label;
  $('chip').textContent=label;
  $('chip').style.opacity=t>s0+0.5?1:0;
};
</script>`;

mkdirSync(outDir, { recursive: true });
const htmlPath = join(outDir, 'scene.html');
writeFileSync(htmlPath, html);

// Playwright: resolve from the project, else the global install.
let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  ({ chromium } = createRequire(`${root}/`)('playwright'));
}
const chromePath = process.env.CHROME_PATH;
const browser = await chromium.launch({ args: ['--no-sandbox'], ...(chromePath ? { executablePath: chromePath } : {}) });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(pathToFileURL(htmlPath).href);
await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
// The "compare" shots are cropped by the window; size the AFTER image to the source's scale.
await page.evaluate(() => {
  for (const id of ['srcimg', 'wpimg0']) document.getElementById(id).style.width = '560px';
});

if (onlyFrame !== undefined) {
  await page.evaluate((t) => window.__render(t), Number(onlyFrame));
  const file = join(outDir, `frame-${onlyFrame}.png`);
  await page.screenshot({ path: file });
  console.log(file);
  await browser.close();
  process.exit(0);
}

const frames = join(outDir, 'frames');
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
const total = Math.round(DURATION * FPS);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.__render(t), i / FPS);
  await page.screenshot({ path: join(frames, `${String(i).padStart(5, '0')}.png`) });
  if (i % 60 === 0) process.stdout.write(`\rframe ${i}/${total}`);
}
await browser.close();
console.log(`\nrendered ${total} frames (${DURATION.toFixed(1)}s @ ${FPS}fps)`);

const mp4 = join(outDir, 'demo.mp4');
const gif = join(outDir, 'demo.gif');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, '%05d.png'),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-preset', 'slow', '-movflags', '+faststart', mp4]);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf',
  'fps=10,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle', gif]);
console.log(`wrote ${mp4} and ${gif}`);
if (existsSync(frames)) rmSync(frames, { recursive: true, force: true });
