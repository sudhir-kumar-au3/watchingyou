import{i as d,m as t,h as m,v as s,d as k,l as b,k as f,p as w}from"./index-0lIJ4NIF.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=d("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=d("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=d("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=d("SkipBack",[["polygon",{points:"19 20 9 12 19 4 19 20",key:"o2sva"}],["line",{x1:"5",x2:"5",y1:"19",y2:"5",key:"1ocqjk"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=d("SkipForward",[["polygon",{points:"5 4 15 12 5 20 5 4",key:"16p6eg"}],["line",{x1:"19",x2:"19",y1:"5",y2:"19",key:"futhcm"}]]),x=({children:n,label:r,variant:c="ghost",size:a="md",className:l,...i})=>t.jsx("button",{type:"button","aria-label":r,title:r,className:m("inline-flex items-center justify-center rounded-xl transition","disabled:cursor-not-allowed disabled:opacity-30",a==="lg"?"h-14 w-14":"h-11 w-11",c==="primary"?"bg-cyan text-void shadow-glow hover:brightness-110 active:scale-95":"glass text-mist hover:border-cyan/50 hover:text-cyan active:scale-95",l),...i,children:n}),E=()=>{const n=s(e=>e.status),r=s(e=>e.index),c=s(e=>e.frameCount),a=s(e=>e.speed),l=s(e=>e.toggle),i=s(e=>e.restart),o=s(e=>e.stepForward),y=s(e=>e.stepBackward),h=s(e=>e.setSpeed),p=n==="playing",u=b(r),g=f(r,c);return t.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-4",children:[t.jsxs("div",{className:"flex items-center gap-2.5",children:[t.jsx(x,{label:"Restart",onClick:i,disabled:u,children:t.jsx(S,{size:18})}),t.jsx(x,{label:"Step backward",onClick:y,disabled:u,children:t.jsx(N,{size:18})}),t.jsx(x,{label:p?"Pause":"Play",variant:"primary",size:"lg",onClick:l,children:p?t.jsx(v,{size:22}):t.jsx(j,{size:22,className:"ml-0.5"})}),t.jsx(x,{label:"Step forward",onClick:o,disabled:g,children:t.jsx(C,{size:18})})]}),t.jsx("div",{className:"flex items-center gap-1 rounded-xl glass p-1",role:"group","aria-label":"Playback speed",children:k.map(e=>t.jsxs("button",{type:"button",onClick:()=>h(e),"aria-pressed":a===e,className:m("rounded-lg px-3 py-1.5 font-mono text-xs transition",a===e?"bg-cyan/20 text-cyan":"text-haze hover:text-mist"),children:[e,"×"]},e))}),t.jsx("span",{className:"w-full text-center font-mono text-[10px] text-haze/60",children:"space play/pause · ← → step · R restart"})]})},R=()=>{const n=s(o=>o.index),r=s(o=>o.frameCount),c=s(o=>o.seek),a=Math.max(r-1,0),l=a===0?0:n/a*100,i=o=>{c(Number(o.target.value))};return t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("span",{className:"font-mono text-xs text-haze tabular-nums",children:String(n).padStart(3,"0")}),t.jsx("input",{type:"range",min:0,max:a,value:n,onChange:i,"aria-label":"Timeline position",className:"h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none",style:{background:`linear-gradient(to right, var(--color-cyan) ${l}%, var(--color-edge) ${l}%)`}}),t.jsx("span",{className:"font-mono text-xs text-haze tabular-nums",children:String(a).padStart(3,"0")})]})},P=360,B=()=>{const n=s(a=>a.status),r=s(a=>a.speed),c=s(a=>a.advance);w.useEffect(()=>{if(n!=="playing")return;const a=window.setInterval(c,P/r);return()=>window.clearInterval(a)},[n,r,c])};export{j as P,S as R,R as T,E as a,B as u};
