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
  const logos=[
    { src:'https://via.placeholder.com/120x40/333/fff?text=Logo+1', alt:'Partner 1' },
    { src:'https://via.placeholder.com/120x40/333/fff?text=Logo+2', alt:'Partner 2' },
    { src:'https://via.placeholder.com/120x40/333/fff?text=Logo+3', alt:'Partner 3' },
    { src:'https://via.placeholder.com/120x40/333/fff?text=Logo+4', alt:'Partner 4' },
    { src:'https://via.placeholder.com/120x40/333/fff?text=Logo+5', alt:'Partner 5' },
    { src:'https://via.placeholder.com/120x40/333/fff?text=Logo+6', alt:'Partner 6' }
  ];
  const logoLoop=new LogoLoop(container,{ logos, speed:50, gap:48 });
  window.__heroLogoLoop=logoLoop;
}

if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', initLogoLoop); } else { initLogoLoop(); }


