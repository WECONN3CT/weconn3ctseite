/**
 * SERVICES - Bento Grid Animations
 * Scroll Animations + Counter Animation
 */

(function () {
    'use strict';

    // ================================
    // SCROLL ANIMATIONS
    // ================================
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.dataset.delay || 0;
                    setTimeout(() => {
                        el.classList.add('is-visible');
                    }, parseInt(delay));
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        elements.forEach(el => observer.observe(el));
    }

    // ================================
    // COUNTER ANIMATION
    // ================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('[data-count-to]');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.countTo, 10);
                    const duration = 1500;
                    const start = performance.now();

                    function tick(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const ease = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
                        if (progress < 1) requestAnimationFrame(tick);
                    }
                    requestAnimationFrame(tick);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }

    // ================================
    // CARD SPOTLIGHT (3D-Tilt entfernt – kollidiert mit clip-path)
    // ================================
    function initCardSpotlight() {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                card.style.setProperty('--mouse-x', `${x * 100}%`);
                card.style.setProperty('--mouse-y', `${y * 100}%`);
                card.style.transform = 'translateY(-8px) scale(1.01)';
                card.style.transition = 'box-shadow 0.1s ease, background 0.3s ease, border-color 0.3s ease';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, background 0.3s ease, border-color 0.3s ease';
            });
        });
    }

    // ================================
    // PUZZLE CARD SHAPES
    // Berechnet clip-path Pfade damit alle 6 Karten wie echte Puzzleteile
    // zusammenpassen ("Alles aus einer Hand").
    //
    // Kernregel: DO − DI = gap (≈20px), damit sich Tab-Kopf und Kerben-Kopf
    // exakt an derselben globalen Position treffen. Höheres z-index legt Tab
    // sichtbar über die Kerbe des Nachbarn.
    // ================================
    function initPuzzleCards() {
        const grid = document.querySelector('.services-bento-grid');
        if (!grid) return;

        const cards = [...grid.querySelectorAll('.service-card')];
        const TOL = 30; // Toleranz für Nachbar-Erkennung (gap≈20px)

        // Computed gap aus CSS auslesen (1.25rem ≈ 20px)
        const GAP = parseFloat(getComputedStyle(grid).gap) || 20;

        /**
         * Rect relativ zum Grid-Origin – ignoriert CSS-Transforms.
         */
        function relRect(el) {
            const savedTr = el.style.transform;
            const savedTi = el.style.transition;
            el.style.transition = 'none';
            el.style.transform  = 'none';
            const g = grid.getBoundingClientRect();
            const e = el.getBoundingClientRect();
            el.style.transform  = savedTr;
            el.style.transition = savedTi;
            return { x: e.left - g.left, y: e.top - g.top, w: e.width, h: e.height };
        }

        /**
         * Baut den SVG-Pfad für eine Puzzle-Karte.
         *
         * Tab-Geometrie (Schulter → Hals → runder Kopf → Hals → Schulter):
         *   DO  = Tiefe nach außen (Tab überragt Kartenkante in den Gap / Nachbar hinein)
         *   DI  = Tiefe nach innen (Kerbe geht ins Karteninnere)
         *   DO - DI = GAP  →  Tab-Kopf und Kerben-Kopf liegen global übereinander
         *   S   = halbe Schulterbreite
         *   R   = Kopfradius
         *
         * bumps.{top|right|bottom|left} = [{pos, out}]
         *   out=true  → Tab   (ragt nach außen, DO)
         *   out=false → Kerbe (geht nach innen,  DI)
         */
        function buildPath(r, bumps) {
            const { w, h } = r;

            // ── Puzzle-Dimensionen ──────────────────────────────────────
            const DO = Math.round(GAP * 2.0);   // Tab-Tiefe (überragt Kante + Nachbar)
            const DI = Math.round(GAP * 1.0);   // Kerben-Tiefe  → DO − DI = GAP ✓
            const R  = Math.round(GAP * 1.3);   // Kopfradius (größer, runder)
            const S  = Math.round(GAP * 1.6);   // Schulter-Halbbreite
            const BR = 18;                       // Karten-Ecken-Radius
            const K  = 0.5523;                  // Bezier-Kreisannäherung (exakter Kreis)
            // ────────────────────────────────────────────────────────────

            const top    = (bumps.top    || []).slice().sort((a,b) => a.pos - b.pos);
            const right  = (bumps.right  || []).slice().sort((a,b) => a.pos - b.pos);
            const bottom = (bumps.bottom || []).slice().sort((a,b) => b.pos - a.pos);
            const left   = (bumps.left   || []).slice().sort((a,b) => b.pos - a.pos);

            const f = v => Math.round(v * 10) / 10;

            // Horizontaler Bump – L→R (obere Kante, dir=-1=nach oben / untere Kante kommt via hRTL)
            function hLTR(cx, ey, dir, out) {
                const d  = out ? DO * dir : -DI * dir; // Kopfmitte-Offset von Kante
                const sd = out ? dir : -dir;            // Richtung zum Kopf-Cap
                const hc = f(ey + d);                  // Kopfmitte y
                const cp = f(ey + d + sd * R);         // Kopf-Cap y (rundester Punkt)
                return `L ${f(cx-S)},${f(ey)} ` +
                    // Hals (Schulter → Kopfeintritt, smooth)
                    `C ${f(cx-S)},${f(ey+d*0.45)} ${f(cx-R)},${f(ey+d*0.7)} ${f(cx-R)},${hc} ` +
                    // Halber Kreis: links → Cap (Viertelkreis)
                    `C ${f(cx-R)},${f(hc+sd*R*K)} ${f(cx-R*K)},${cp} ${f(cx)},${cp} ` +
                    // Halber Kreis: Cap → rechts (Viertelkreis)
                    `C ${f(cx+R*K)},${cp} ${f(cx+R)},${f(hc+sd*R*K)} ${f(cx+R)},${hc} ` +
                    // Hals zurück (Kopfaustritt → Schulter)
                    `C ${f(cx+R)},${f(ey+d*0.7)} ${f(cx+S)},${f(ey+d*0.45)} ${f(cx+S)},${f(ey)}`;
            }

            // Horizontaler Bump – R→L (untere Kante)
            function hRTL(cx, ey, dir, out) {
                const d  = out ? DO * dir : -DI * dir;
                const sd = out ? dir : -dir;
                const hc = f(ey + d);
                const cp = f(ey + d + sd * R);
                return `L ${f(cx+S)},${f(ey)} ` +
                    `C ${f(cx+S)},${f(ey+d*0.45)} ${f(cx+R)},${f(ey+d*0.7)} ${f(cx+R)},${hc} ` +
                    `C ${f(cx+R)},${f(hc+sd*R*K)} ${f(cx+R*K)},${cp} ${f(cx)},${cp} ` +
                    `C ${f(cx-R*K)},${cp} ${f(cx-R)},${f(hc+sd*R*K)} ${f(cx-R)},${hc} ` +
                    `C ${f(cx-R)},${f(ey+d*0.7)} ${f(cx-S)},${f(ey+d*0.45)} ${f(cx-S)},${f(ey)}`;
            }

            // Vertikaler Bump – T→B (rechte Kante, dir=+1=nach rechts)
            function vTTB(cy, ex, dir, out) {
                const d  = out ? DO * dir : -DI * dir;
                const sd = out ? dir : -dir;
                const hc = f(ex + d);
                const cp = f(ex + d + sd * R);
                return `L ${f(ex)},${f(cy-S)} ` +
                    `C ${f(ex+d*0.45)},${f(cy-S)} ${f(ex+d*0.7)},${f(cy-R)} ${hc},${f(cy-R)} ` +
                    `C ${f(hc+sd*R*K)},${f(cy-R)} ${cp},${f(cy-R*K)} ${cp},${f(cy)} ` +
                    `C ${cp},${f(cy+R*K)} ${f(hc+sd*R*K)},${f(cy+R)} ${hc},${f(cy+R)} ` +
                    `C ${f(ex+d*0.7)},${f(cy+R)} ${f(ex+d*0.45)},${f(cy+S)} ${f(ex)},${f(cy+S)}`;
            }

            // Vertikaler Bump – B→T (linke Kante, dir=-1=nach links)
            function vBTT(cy, ex, dir, out) {
                const d  = out ? DO * dir : -DI * dir;
                const sd = out ? dir : -dir;
                const hc = f(ex + d);
                const cp = f(ex + d + sd * R);
                return `L ${f(ex)},${f(cy+S)} ` +
                    `C ${f(ex+d*0.45)},${f(cy+S)} ${f(ex+d*0.7)},${f(cy+R)} ${hc},${f(cy+R)} ` +
                    `C ${f(hc+sd*R*K)},${f(cy+R)} ${cp},${f(cy+R*K)} ${cp},${f(cy)} ` +
                    `C ${cp},${f(cy-R*K)} ${f(hc+sd*R*K)},${f(cy-R)} ${hc},${f(cy-R)} ` +
                    `C ${f(ex+d*0.7)},${f(cy-R)} ${f(ex+d*0.45)},${f(cy-S)} ${f(ex)},${f(cy-S)}`;
            }

            let d = `M ${BR},0 `;
            for (const b of top)    d += hLTR(b.pos, 0, -1, b.out) + ' ';
            d += `L ${f(w-BR)},0 Q ${w},0 ${w},${BR} `;
            for (const b of right)  d += vTTB(b.pos, w,  1, b.out) + ' ';
            d += `L ${w},${f(h-BR)} Q ${w},${h} ${f(w-BR)},${h} `;
            for (const b of bottom) d += hRTL(b.pos, h,  1, b.out) + ' ';
            d += `L ${BR},${h} Q 0,${h} 0,${f(h-BR)} `;
            for (const b of left)   d += vBTT(b.pos, 0, -1, b.out) + ' ';
            d += `L 0,${BR} Q 0,0 ${BR},0 Z`;
            return d;
        }

        function apply() {
            const rects = cards.map(relRect);

            cards.forEach((card, i) => {
                const ri = rects[i];
                const bumps = { top: [], right: [], bottom: [], left: [] };

                rects.forEach((rj, j) => {
                    if (i === j) return;

                    // j RECHTS von i → Tab nach rechts
                    if (Math.abs((ri.x + ri.w) - rj.x) < TOL) {
                        const ot = Math.max(ri.y, rj.y), ob = Math.min(ri.y + ri.h, rj.y + rj.h);
                        if (ob - ot > 50) bumps.right.push({ pos: (ot + ob) / 2 - ri.y, out: true });
                    }
                    // j LINKS von i → Kerbe links
                    if (Math.abs(ri.x - (rj.x + rj.w)) < TOL) {
                        const ot = Math.max(ri.y, rj.y), ob = Math.min(ri.y + ri.h, rj.y + rj.h);
                        if (ob - ot > 50) bumps.left.push({ pos: (ot + ob) / 2 - ri.y, out: false });
                    }
                    // j UNTER i → Tab nach unten
                    if (Math.abs((ri.y + ri.h) - rj.y) < TOL) {
                        const ol = Math.max(ri.x, rj.x), or_ = Math.min(ri.x + ri.w, rj.x + rj.w);
                        if (or_ - ol > 50) bumps.bottom.push({ pos: (ol + or_) / 2 - ri.x, out: true });
                    }
                    // j ÜBER i → Kerbe oben
                    if (Math.abs(ri.y - (rj.y + rj.h)) < TOL) {
                        const ol = Math.max(ri.x, rj.x), or_ = Math.min(ri.x + ri.w, rj.x + rj.w);
                        if (or_ - ol > 50) bumps.top.push({ pos: (ol + or_) / 2 - ri.x, out: false });
                    }
                });

                card.style.clipPath = `path('${buildPath(ri, bumps)}')`;
                card.classList.add('puzzle-active');
            });
        }

        // Layout stabilisieren lassen (fonts + grid-Berechnung), dann anwenden
        setTimeout(apply, 300);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            cards.forEach(c => { c.style.clipPath = ''; c.classList.remove('puzzle-active'); });
            resizeTimer = setTimeout(() => requestAnimationFrame(apply), 250);
        });
    }

    // ================================
    // PROCESS TIMELINE – Peek-Stack
    // gsap.ticker läuft synchron mit Lenis-RAF.
    // Lerp (LERP = 0.05) glättet den Fortschritt: schnelles Scrollen
    // → Animation zieht träge nach, kein abruptes Springen.
    // Kein ScrollTrigger → kein Initialisierungs-Bug bei Karte 3.
    // ================================
    function initProcessTimeline() {
        const wrapper     = document.getElementById('processHxWrapper');
        const stack       = document.getElementById('processHxStack');
        const dots        = document.querySelectorAll('.process-hx-dot');
        const progressBar = document.getElementById('hxProgressFill');
        const currentEl   = document.getElementById('hxCurrent');

        if (!wrapper || !stack || window.innerWidth < 768) return;
        if (typeof gsap === 'undefined') return;

        const cards = [...stack.querySelectorAll('.process-hx-card')];
        const TRANS = cards.length - 1; // 3 Übergänge
        const SEG   = 1 / TRANS;
        const PEEK  = 40;   // px sichtbarer Streifen
        const LERP  = 0.05; // Glättung – kleiner = träger/smoother

        let smoothP = 0;
        let lastDot = -1;

        // easeInOutCubic: langsamer Anlauf → smooth Mitte → sanftes Ende
        function ease(t) {
            t = Math.min(1, Math.max(0, t));
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function segProg(s, p) {
            return Math.min(1, Math.max(0, (p - s * SEG) / SEG));
        }

        function getTarget() {
            const rect  = wrapper.getBoundingClientRect();
            const range = wrapper.offsetHeight - window.innerHeight;
            return range > 0 ? Math.max(0, Math.min(1, -rect.top / range)) : 0;
        }

        function render(p) {
            const vw     = window.innerWidth;
            const stackW = stack.offsetWidth;

            cards.forEach((card, i) => {
                const centerX      = (stackW - card.offsetWidth) / 2;
                const arrivalEased = i === 0 ? 1 : ease(segProg(i - 1, p));
                const entryOffset  = (1 - arrivalEased) * vw;

                let stackShift = 0;
                for (let s = i; s < TRANS; s++) stackShift += ease(segProg(s, p));

                card.style.transform = `translateX(${centerX + entryOffset - stackShift * PEEK}px) translateY(-50%)`;
                card.style.zIndex    = i + 1;
            });

            if (progressBar) progressBar.style.width = (p * 100) + '%';

            const dot = Math.min(TRANS, Math.round(p * TRANS));
            if (dot !== lastDot) {
                lastDot = dot;
                dots.forEach((d, i) => d.classList.toggle('active', i === dot));
                if (currentEl) currentEl.textContent = String(dot + 1).padStart(2, '0');
            }
        }

        // Immer bei Karte 1 starten
        render(0);

        // GSAP-Ticker: synchron mit Lenis-RAF, kein Tab-Catch-up
        gsap.ticker.lagSmoothing(0);

        function tickFn() {
            smoothP += (getTarget() - smoothP) * LERP;
            render(smoothP);
        }
        gsap.ticker.add(tickFn);

        window.addEventListener('resize', () => {
            if (window.innerWidth < 768) {
                gsap.ticker.remove(tickFn);
                cards.forEach(c => { c.style.transform = ''; c.style.zIndex = ''; });
            }
        }, { passive: true });
    }

    // ================================
    // FAQ ACCORDION
    // ================================
    function initFaqAccordion() {
        const triggers = document.querySelectorAll('.faq-trigger');
        if (!triggers.length) return;

        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item   = trigger.closest('.faq-item');
                const isOpen = item.classList.contains('open');

                // Close all open items smoothly
                document.querySelectorAll('.faq-item.open').forEach(openItem => {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
                });

                // Open clicked item (unless it was already open → closes it)
                if (!isOpen) {
                    item.classList.add('open');
                    trigger.setAttribute('aria-expanded', 'true');
                    // Smooth scroll if item is below fold
                    setTimeout(() => {
                        const rect = item.getBoundingClientRect();
                        if (rect.bottom > window.innerHeight - 80) {
                            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }, 200);
                }
            });
        });
    }

    // ================================
    // HOLOGRAPHIC CARD – Tilt + Shine (wie ProfileCard)
    // ================================
    function initHoloCard() {
        const cards = document.querySelectorAll('.holo-card');
        if (!cards.length) return;

        const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
        const round = (v, p) => parseFloat(v.toFixed(p || 3));
        const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

        const TAU = 0.14;

        cards.forEach(function(card) {
            let running = false;
            let lastTs = 0;
            let currentX = 0, currentY = 0;
            let targetX = 0, targetY = 0;

            function setVarsFromXY(x, y) {
                const w = card.clientWidth || 1;
                const h = card.clientHeight || 1;

                const pctX = clamp((100 / w) * x, 0, 100);
                const pctY = clamp((100 / h) * y, 0, 100);
                const centerX = pctX - 50;
                const centerY = pctY - 50;

                card.style.setProperty('--pointer-x', pctX + '%');
                card.style.setProperty('--pointer-y', pctY + '%');
                card.style.setProperty('--background-x', adjust(pctX, 0, 100, 35, 65) + '%');
                card.style.setProperty('--background-y', adjust(pctY, 0, 100, 35, 65) + '%');
                card.style.setProperty('--pointer-from-center', clamp(Math.hypot(pctY - 50, pctX - 50) / 50, 0, 1));
                card.style.setProperty('--pointer-from-top', pctY / 100);
                card.style.setProperty('--pointer-from-left', pctX / 100);
                card.style.setProperty('--rotate-x', round(-(centerX / 5)) + 'deg');
                card.style.setProperty('--rotate-y', round(centerY / 4) + 'deg');
            }

            function step(ts) {
                if (!running) return;
                if (lastTs === 0) lastTs = ts;
                const dt = (ts - lastTs) / 1000;
                lastTs = ts;

                const k = 1 - Math.exp(-dt / TAU);
                currentX += (targetX - currentX) * k;
                currentY += (targetY - currentY) * k;

                setVarsFromXY(currentX, currentY);

                if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
                    requestAnimationFrame(step);
                } else {
                    running = false;
                    lastTs = 0;
                }
            }

            function startLoop() {
                if (running) return;
                running = true;
                lastTs = 0;
                requestAnimationFrame(step);
            }

            function setTarget(x, y) {
                targetX = x;
                targetY = y;
                startLoop();
            }

            function toCenter() {
                setTarget(card.clientWidth / 2, card.clientHeight / 2);
            }

            // Initialer Zustand: Mitte
            const initX = card.clientWidth / 2;
            const initY = card.clientHeight / 2;
            currentX = initX;
            currentY = initY;
            setVarsFromXY(initX, initY);

            // Pointer-Events
            card.addEventListener('pointerenter', function(e) {
                card.classList.add('active');
                const rect = card.getBoundingClientRect();
                setTarget(e.clientX - rect.left, e.clientY - rect.top);
            });

            card.addEventListener('pointermove', function(e) {
                const rect = card.getBoundingClientRect();
                setTarget(e.clientX - rect.left, e.clientY - rect.top);
            });

            card.addEventListener('pointerleave', function() {
                toCenter();

                function checkSettle() {
                    const settled = Math.hypot(targetX - currentX, targetY - currentY) < 0.6;
                    if (settled) {
                        card.classList.remove('active');
                    } else {
                        requestAnimationFrame(checkSettle);
                    }
                }
                requestAnimationFrame(checkSettle);
            });
        });
    }

    // ================================
    // INIT
    // ================================
    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimations();
        initCounterAnimation();
        initCardSpotlight();
        initProcessTimeline();
        initFaqAccordion();
        initHoloCard();
    });

})();
