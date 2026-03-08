/* Premium Glass Effect for Navbar (.navbar-menu)
   - Chromatic aberration via SVG feDisplacementMap per color channel
   - Vanilla JS conversion of GlassSurface (React) tailored for the navbar
*/

(function(){
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function createElNS(name){ return document.createElementNS(SVG_NS, name); }

  function uniqueId(prefix){
    return `${prefix}-${Math.random().toString(36).slice(2,10)}`;
  }

  function supportsSvgBackdropFilter(filterId){
    // Safari and Firefox do not support backdrop-filter: url(#id)
    const ua = navigator.userAgent;
    const isWebkit = /Safari\//.test(ua) && !/Chrome\//.test(ua);
    const isFirefox = /Firefox\//.test(ua);
    if (isWebkit || isFirefox) return false;
    const test = document.createElement('div');
    test.style.backdropFilter = `url(#${filterId})`;
    return test.style.backdropFilter !== '';
  }

  function generateDisplacementMap(rect, options){
    const {
      borderRadius, borderWidth, brightness, opacity, blur,
      mixBlendMode
    } = options;

    const actualWidth = Math.max(1, Math.round(rect.width || 400));
    const actualHeight = Math.max(1, Math.round(rect.height || 200));
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const redGradId = uniqueId('red-grad');
    const blueGradId = uniqueId('blue-grad');

    const svgContent = `
<svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0000"/>
      <stop offset="100%" stop-color="red"/>
    </linearGradient>
    <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0000"/>
      <stop offset="100%" stop-color="blue"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"/>
  <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})"/>
  <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode:${mixBlendMode}"/>
  <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)"/>
</svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }

  function initNavbarPremiumGlass(){
    const menu = document.getElementById('navbarMenu');
    if (!menu) return;

    const options = {
      borderRadius: 9999,
      borderWidth: 0.07,
      brightness: 50,
      opacity: 0.85,
      blur: 11,
      displace: 0.7,
      backgroundOpacity: 0,
      saturation: 1,
      distortionScale: -180,
      redOffset: 0,
      greenOffset: 10,
      blueOffset: 20,
      xChannel: 'R',
      yChannel: 'G',
      mixBlendMode: 'difference'
    };

    // Add base class
    menu.classList.add('glass-surface');
    menu.style.borderRadius = `${options.borderRadius}px`;
    // leicht mattes Glas visuell verstärken
    menu.style.background = 'rgba(255,255,255,0.12)';

    // Build SVG filter
    const filterId = uniqueId('glass-filter');
    const svg = createElNS('svg');
    svg.classList.add('glass-surface__filter');
    const defs = createElNS('defs');
    const filter = createElNS('filter');
    filter.setAttribute('id', filterId);
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    filter.setAttribute('x','0%'); filter.setAttribute('y','0%');
    filter.setAttribute('width','100%'); filter.setAttribute('height','100%');

    const feImage = createElNS('feImage');
    feImage.setAttribute('x','0'); feImage.setAttribute('y','0');
    feImage.setAttribute('width','100%'); feImage.setAttribute('height','100%');
    feImage.setAttribute('preserveAspectRatio','none');
    feImage.setAttribute('result','map');

    const feDispR = createElNS('feDisplacementMap');
    feDispR.setAttribute('in','SourceGraphic'); feDispR.setAttribute('in2','map');
    feDispR.setAttribute('id','redchannel'); feDispR.setAttribute('result','dispRed');
    const feColorR = createElNS('feColorMatrix');
    feColorR.setAttribute('in','dispRed'); feColorR.setAttribute('type','matrix');
    feColorR.setAttribute('values', '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0');
    feColorR.setAttribute('result','red');

    const feDispG = createElNS('feDisplacementMap');
    feDispG.setAttribute('in','SourceGraphic'); feDispG.setAttribute('in2','map');
    feDispG.setAttribute('id','greenchannel'); feDispG.setAttribute('result','dispGreen');
    const feColorG = createElNS('feColorMatrix');
    feColorG.setAttribute('in','dispGreen'); feColorG.setAttribute('type','matrix');
    feColorG.setAttribute('values', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0');
    feColorG.setAttribute('result','green');

    const feDispB = createElNS('feDisplacementMap');
    feDispB.setAttribute('in','SourceGraphic'); feDispB.setAttribute('in2','map');
    feDispB.setAttribute('id','bluechannel'); feDispB.setAttribute('result','dispBlue');
    const feColorB = createElNS('feColorMatrix');
    feColorB.setAttribute('in','dispBlue'); feColorB.setAttribute('type','matrix');
    feColorB.setAttribute('values', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0');
    feColorB.setAttribute('result','blue');

    const feBlendRG = createElNS('feBlend');
    feBlendRG.setAttribute('in','red'); feBlendRG.setAttribute('in2','green');
    feBlendRG.setAttribute('mode','screen'); feBlendRG.setAttribute('result','rg');

    const feBlendRGB = createElNS('feBlend');
    feBlendRGB.setAttribute('in','rg'); feBlendRGB.setAttribute('in2','blue');
    feBlendRGB.setAttribute('mode','screen'); feBlendRGB.setAttribute('result','output');

    const feBlur = createElNS('feGaussianBlur');
    feBlur.setAttribute('in','output');
    feBlur.setAttribute('stdDeviation', String(options.displace));

    [feImage, feDispR, feColorR, feDispG, feColorG, feDispB, feColorB, feBlendRG, feBlendRGB, feBlur]
      .forEach(n => filter.appendChild(n));

    defs.appendChild(filter); svg.appendChild(defs); menu.appendChild(svg);

    function updateMap(){
      const rect = menu.getBoundingClientRect();
      const dataUrl = generateDisplacementMap(rect, options);
      feImage.setAttribute('href', dataUrl);
    }

    function updateChannels(){
      const { distortionScale, redOffset, greenOffset, blueOffset, xChannel, yChannel } = options;
      feDispR.setAttribute('scale', String(distortionScale + redOffset));
      feDispG.setAttribute('scale', String(distortionScale + greenOffset));
      feDispB.setAttribute('scale', String(distortionScale + blueOffset));
      feDispR.setAttribute('xChannelSelector', xChannel); feDispR.setAttribute('yChannelSelector', yChannel);
      feDispG.setAttribute('xChannelSelector', xChannel); feDispG.setAttribute('yChannelSelector', yChannel);
      feDispB.setAttribute('xChannelSelector', xChannel); feDispB.setAttribute('yChannelSelector', yChannel);
    }

    // Apply effect depending on support
    if (supportsSvgBackdropFilter(filterId)) {
      menu.classList.add('glass-surface--svg');
      // For CSS or direct style
      menu.style.setProperty('--glass-saturation', String(options.saturation));
      menu.style.backdropFilter = `url(#${filterId}) blur(6px) saturate(${options.saturation})`;
    } else {
      menu.classList.add('glass-surface--fallback');
      menu.style.backdropFilter = 'blur(12px) saturate(1.8) brightness(1.1)';
      menu.style.webkitBackdropFilter = 'blur(12px) saturate(1.8) brightness(1.1)';
    }

    updateChannels();
    updateMap();

    // Observe size changes
    const ro = new ResizeObserver(() => { setTimeout(updateMap, 0); });
    ro.observe(menu);
    window.addEventListener('resize', () => setTimeout(updateMap, 0));
  }

  document.addEventListener('DOMContentLoaded', initNavbarPremiumGlass);
})();


