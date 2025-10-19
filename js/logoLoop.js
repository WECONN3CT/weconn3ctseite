console.log('🎬 LogoLoop wird geladen...');

class LogoLoop {
  constructor(container, options = {}) {
    this.container = container;
    this.track = container.querySelector('.logo-loop__track');
    if (!this.track) { console.error('❌ LogoLoop: Track nicht gefunden'); return; }
    this.speed = options.speed || 50; // px/s
    this.gap = options.gap || 48;
    this.logos = options.logos || [];
    this.copies = 3;
    this.offset = 0; this.velocity = this.speed; this.isRunning = false;
    this.rafId = null; this.lastTimestamp = null; this.itemWidth = 0;
    this.init();
  }
  init(){
    console.log('🎨 Initialisiere LogoLoop mit', this.logos.length, 'Logos');
    if(this.logos.length===0){ console.warn('⚠️ Keine Logos definiert'); return; }
    this.createLogoElements();
    this.calculateDimensions();
    // Markiere: JS läuft (deaktiviert CSS-Fallback-Animation)
    this.track.setAttribute('data-js-running','true');
    this.start();
    this.setupEventListeners();
    console.log('✅ LogoLoop erfolgreich initialisiert');
  }
  createLogoElements(){
    this.track.innerHTML='';
    for(let copy=0; copy<this.copies; copy++){
      this.logos.forEach((logo)=>{
        const item=document.createElement('div');
        item.className='logo-loop__item shiny';
        const img=document.createElement('img');
        img.src=logo.src; img.alt=logo.alt||'Logo'; img.loading='lazy'; img.draggable=false;
        // Shine nur über Schrift: Bild als Mask direkt auf dem Item setzen (breiter Browser-Support)
        const setMask=()=>{
          try{
            item.style.webkitMaskImage = `url('${img.src}')`;
            item.style.maskImage = `url('${img.src}')`;
          }catch(_e){}
        };
        if(img.complete){ setMask(); } else { img.addEventListener('load', setMask); img.addEventListener('error', setMask); }
        if(logo.href){ const link=document.createElement('a'); link.href=logo.href; link.target='_blank'; link.rel='noopener noreferrer'; link.appendChild(img); item.appendChild(link); }
        else { item.appendChild(img); }
        this.track.appendChild(item);
      });
    }
  }
  calculateDimensions(){
    const images=this.track.querySelectorAll('img'); let loaded=0;
    const check=()=>{ loaded++; if(loaded===images.length) this.updateDimensions(); };
    images.forEach(img=>{ if(img.complete) check(); else { img.addEventListener('load',check); img.addEventListener('error',check);} });
  }
  updateDimensions(){
    const firstSet=Array.from(this.track.children).slice(0,this.logos.length);
    let totalWidth=0; firstSet.forEach(item=>{ totalWidth+=item.getBoundingClientRect().width + this.gap; });
    this.itemWidth=totalWidth; console.log('📏 Loop-Breite:', this.itemWidth, 'px');
  }
  animate(ts){ if(!this.lastTimestamp){ this.lastTimestamp=ts; }
    const dt=(ts-this.lastTimestamp)/1000; this.lastTimestamp=ts; this.offset+=this.velocity*dt;
    if(this.offset>=this.itemWidth){ this.offset=this.offset % this.itemWidth; }
    this.track.style.transform=`translate3d(-${this.offset}px,0,0)`;
    if(this.isRunning){ this.rafId=requestAnimationFrame(this.animate.bind(this)); }
  }
  start(){ if(this.isRunning) return; this.isRunning=true; this.lastTimestamp=null; this.rafId=requestAnimationFrame(this.animate.bind(this)); console.log('▶️ LogoLoop gestartet'); }
  stop(){ if(!this.isRunning) return; this.isRunning=false; if(this.rafId){ cancelAnimationFrame(this.rafId); this.rafId=null; } this.lastTimestamp=null; console.log('⏸️ LogoLoop gestoppt'); }
  setupEventListeners(){ this.container.addEventListener('mouseenter',()=>{}); this.container.addEventListener('mouseleave',()=>{}); window.addEventListener('resize',()=>{ this.updateDimensions(); }); window.addEventListener('beforeunload',()=>{ this.destroy(); }); }
  destroy(){ this.stop(); console.log('🗑️ LogoLoop destroyed'); }
}

function initLogoLoop(){
  console.log('🔍 Suche LogoLoop Container...');
  const container=document.getElementById('heroLogoLoop');
  if(!container){ console.warn('⚠️ LogoLoop Container nicht gefunden'); return; }
  console.log('✅ Container gefunden');
  // Fiktive Logos als transparente SVG-Data-URIs
  function svgLogo(text, color='#E0E7FF', width=140, height=40, fontSize=18, fontWeight=800){
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>\n`+
                `<g font-family='Inter, Space Grotesk, system-ui, -apple-system, Arial, sans-serif' font-weight='${fontWeight}' text-anchor='middle' dominant-baseline='middle'>\n`+
                `<text x='50%' y='50%' fill='${color}' font-size='${fontSize}'>${text}</text>\n`+
                `</g></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  const logos=[
    { src: svgLogo('RheinTech'), alt: 'RheinTech' },
    { src: svgLogo('AlpenCloud'), alt: 'AlpenCloud' },
    { src: svgLogo('SiebenCode'), alt: 'SiebenCode' },
    { src: svgLogo('DeltaSoft'), alt: 'DeltaSoft' },
    { src: svgLogo('NovaWorks'), alt: 'NovaWorks' },
    { src: svgLogo('GammaLabs'), alt: 'GammaLabs' },
    { src: svgLogo('BonnAI'), alt: 'BonnAI' },
    { src: svgLogo('Honnef IT'), alt: 'Honnef IT' }
  ];
  const logoLoop=new LogoLoop(container,{ logos, speed:50, gap:48 });
  window.__heroLogoLoop=logoLoop;
}

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', initLogoLoop); } else { initLogoLoop(); }


