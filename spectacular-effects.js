/* SPECTACULAR EFFECTS JS - Cleaned */
(function() {
    'use strict';

    // Particle Animation
    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = 0, mouseY = 0;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.2;
                const colors = ['rgba(139,92,246,', 'rgba(59,130,246,', 'rgba(6,182,212,', 'rgba(236,72,153,'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                const dx = mouseX - this.x, dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                }
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
                this.opacity = Math.max(0.1, Math.min(0.7, this.opacity + (Math.random() - 0.5) * 0.02));
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.opacity + ')';
                ctx.fill();
            }
        }

        const count = Math.min(80, window.innerWidth / 20);
        for (let i = 0; i < count; i++) particles.push(new Particle());

        document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(139,92,246,${(1 - dist / 120) * 0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        (function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(animate);
        })();
    }

    // Floating Shapes
    function initFloatingShapes() {
        const container = document.getElementById('floatingShapes');
        if (!container) return;

        const shapes = ['circle', 'square', 'triangle'];
        function createShape() {
            const shape = document.createElement('div');
            shape.className = 'floating-shape ' + shapes[Math.floor(Math.random() * shapes.length)];
            shape.style.left = Math.random() * 100 + '%';
            shape.style.animationDuration = (15 + Math.random() * 20) + 's';
            container.appendChild(shape);
            setTimeout(() => shape.remove(), 35000);
        }
        for (let i = 0; i < 5; i++) setTimeout(createShape, i * 2000);
        setInterval(createShape, 6000);
    }

    // Magnetic Buttons
    function initMagneticButtons() {
        document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
            btn.classList.add('btn-magnetic');
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });
            btn.addEventListener('mouseleave', () => btn.style.transform = 'translate(0,0)');
        });
    }

    // Card 3D Tilt
    function initCardEffects() {
        document.querySelectorAll('.service-card, .portfolio-item, .stat-card').forEach(card => {
            card.classList.add('shimmer-card');
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const rotateX = (e.clientY - rect.top - rect.height / 2) / 20;
                const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 20;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });
            card.addEventListener('mouseleave', () => card.style.transform = 'none');
        });
    }

    // Gradient Text Glow
    function initGradientText() {
        document.querySelectorAll('.gradient-text').forEach(t => t.classList.add('glow-text'));
    }

    // Scroll Reveal
    function initScrollReveal() {
        const elements = document.querySelectorAll('.reveal, .service-card, .stat-card');
        const reveal = () => {
            elements.forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight - 100) {
                    el.classList.add('active');
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }
            });
        };
        window.addEventListener('scroll', reveal, { passive: true });
        reveal();
    }

    // Inject Elements
    function injectElements() {
        if (document.getElementById('particles-canvas')) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);

        const aurora = document.createElement('div');
        aurora.className = 'aurora';
        aurora.innerHTML = '<div class="aurora-beam"></div><div class="aurora-beam"></div><div class="aurora-beam"></div>';
        document.body.insertBefore(aurora, document.body.firstChild);

        const shapes = document.createElement('div');
        shapes.className = 'floating-shapes';
        shapes.id = 'floatingShapes';
        document.body.insertBefore(shapes, document.body.firstChild);
    }

    // Init
    function init() {
        injectElements();
        initParticles();
        initFloatingShapes();
        initMagneticButtons();
        initCardEffects();
        initGradientText();
        initScrollReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
