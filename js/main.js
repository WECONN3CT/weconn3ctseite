/**
 * WECONN3CT - Main JavaScript
 */

(function() {
    'use strict';

    // ================================
    // Lenis Smooth Scroll
    // ================================
    let lenis = null;

    function initLenis() {
        if (typeof Lenis === 'undefined') {
            console.warn('Lenis not loaded');
            return;
        }

        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });
        window.lenis = lenis;

        // Lenis über GSAP Ticker antreiben (offizielle Integration)
        // So sind Lenis + GSAP ScrollTrigger immer synchron im gleichen Frame
        if (typeof gsap !== 'undefined') {
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            // Fallback falls GSAP nicht geladen
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    // ================================
    // DOM Elements
    // ================================
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarMenu = document.getElementById('navbarMenu');
    // ================================
    // Navbar Scroll Effect (Hide on scroll down, show on scroll up)
    // ================================
    let lastScrollY = 0;
    let navbarHidden = false;

    function handleNavbarScroll() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/Show navbar based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide navbar
            if (!navbarHidden) {
                navbar.style.transform = 'translateY(-100%)';
                navbarHidden = true;
            }
        } else {
            // Scrolling up - show navbar
            if (navbarHidden) {
                navbar.style.transform = 'translateY(0)';
                navbarHidden = false;
            }
        }

        lastScrollY = currentScrollY;
    }

    // ================================
    // Mobile Menu Toggle – Fullscreen Overlay
    // ================================
    function toggleNavbarMenu() {
        if (!navbarMenu || !navbarToggle) return;

        const isOpen = navbarMenu.classList.contains('active');

        navbarMenu.classList.toggle('active');
        navbarToggle.classList.toggle('active');
        document.body.classList.toggle('menu-open');

        // Accessibility
        navbarToggle.setAttribute('aria-expanded', !isOpen);
        navbarToggle.setAttribute('aria-label', isOpen ? 'Menü öffnen' : 'Menü schließen');
    }

    function closeNavbarMenu() {
        if (navbarMenu && navbarMenu.classList.contains('active')) {
            navbarMenu.classList.remove('active');
            navbarToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
            navbarToggle.setAttribute('aria-expanded', 'false');
            navbarToggle.setAttribute('aria-label', 'Menü öffnen');
        }
    }

    // Escape-Key schließt Menü
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navbarMenu && navbarMenu.classList.contains('active')) {
            toggleNavbarMenu();
        }
    });

    // ================================
    // Scroll Animations (Scroll Animation Style)
    // Viewport: once: true, margin: "-50px"
    // Transition: duration: 0.6s, ease: "easeOut"
    // ================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');

        const observerOptions = {
            root: null,
            rootMargin: '-50px 0px -50px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay) || 0;

                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);

                    // Once: true - unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // ================================
    // Smooth Scroll for Anchor Links (with Lenis)
    // ================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();

                const target = document.querySelector(href);
                if (target) {
                    const navbarHeight = navbar ? navbar.offsetHeight : 0;

                    // Use Lenis if available, otherwise fallback
                    if (lenis) {
                        lenis.scrollTo(target, {
                            offset: -navbarHeight,
                            duration: 1.2
                        });
                    } else {
                        const targetPosition = target.offsetTop - navbarHeight;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }

                    closeNavbarMenu();
                }
            });
        });
    }

    // ================================
    // Rotating Word Animation
    // ================================
    function initRotatingWord() {
        const rotatingWord = document.getElementById('rotating-word');
        if (!rotatingWord) return;

        const words = [
            'Kreative',
            'Entwickler',
            'Designer',
            'Strategen',
            'Innovatoren',
            'Problemlöser',
            'Visionäre',
            'WECONN3CT'
        ];

        let currentIndex = 0;

        function rotateWord() {
            // Exit animation
            rotatingWord.classList.add('exit');

            setTimeout(() => {
                // Update word
                currentIndex = (currentIndex + 1) % words.length;
                rotatingWord.textContent = words[currentIndex];

                // Apply color class
                rotatingWord.className = 'font-extrabold word-color-' + currentIndex;

                // Enter animation
                rotatingWord.classList.add('enter');

                setTimeout(() => {
                    rotatingWord.classList.remove('enter');
                }, 50);
            }, 500);
        }

        // Start rotation
        setInterval(rotateWord, 2500);
    }

    // ================================
    // Showcase Glow Container Scroll Animation
    // Kasten kommt beim Scrollen hoch über die Hero-Section
    // ================================
    function initShowcaseScrollAnimation() {
        const container = document.getElementById('showcase-glow-container');
        const section = document.getElementById('showcase-glow-section');
        const heroSection = document.getElementById('hero-section');
        const wrapper = document.querySelector('.hero-scroll-wrapper');

        if (!container || !section || !heroSection) return;

        const maxOffset = 200;

        function updateParallax() {
            const scrollY = window.scrollY;
            const heroHeight = heroSection.offsetHeight;

            // Animation startet sofort und endet bei heroHeight
            const triggerStart = 0;
            const triggerEnd = heroHeight;

            let progress = (scrollY - triggerStart) / (triggerEnd - triggerStart);
            progress = Math.max(0, Math.min(1, progress));

            // Ease-out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            const translateY = maxOffset * (1 - easedProgress);
            const opacity = easedProgress;
            const scale = 0.92 + (easedProgress * 0.08);

            container.style.transform = `translateY(${translateY}px) scale(${scale})`;
            container.style.opacity = opacity;
        }

        container.style.transform = `translateY(${maxOffset}px) scale(0.92)`;
        container.style.opacity = '0';

        let showcaseRafId = null;
        function animate() {
            updateParallax();
            if (!document.hidden) {
                showcaseRafId = requestAnimationFrame(animate);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (showcaseRafId) cancelAnimationFrame(showcaseRafId);
            } else {
                showcaseRafId = requestAnimationFrame(animate);
            }
        });

        showcaseRafId = requestAnimationFrame(animate);
    }

    // ================================
    // Flutter Code Typing Animation
    // ================================
    function initCodeTyping() {
        const codeEl = document.getElementById('flutter-code');
        if (!codeEl) return;

        const lines = [
            { text: '// MARK: - Traust du dich? Challenge App', cls: 'comment' },
            { text: 'import', cls: 'keyword', rest: [{ text: ' SwiftUI', cls: 'class-name' }] },
            { text: 'import', cls: 'keyword', rest: [{ text: ' Combine', cls: 'class-name' }] },
            { text: '' },
            { text: '@main', cls: 'property' },
            { text: 'struct', cls: 'keyword', rest: [{ text: ' ChallengeApp', cls: 'class-name' }, { text: ': ' }, { text: 'App', cls: 'class-name' }, { text: ' {' }] },
            { text: '  @StateObject', cls: 'property', rest: [{ text: ' private var', cls: 'keyword' }, { text: ' gameManager = ' }, { text: 'GameManager', cls: 'class-name' }, { text: '()' }] },
            { text: '  var', cls: 'keyword', rest: [{ text: ' body: ' }, { text: 'some', cls: 'keyword' }, { text: ' Scene', cls: 'class-name' }, { text: ' {' }] },
            { text: '    WindowGroup', cls: 'class-name', rest: [{ text: ' {' }] },
            { text: '      ContentView', cls: 'class-name', rest: [{ text: '().environmentObject', cls: 'function' }, { text: '(gameManager)' }] },
            { text: '        .preferredColorScheme', cls: 'function', rest: [{ text: '(.' }, { text: 'dark', cls: 'property' }, { text: ')' }] },
            { text: '    }' },
            { text: '  }' },
            { text: '}' },
            { text: '' },
            { text: '// MARK: - Game Manager', cls: 'comment' },
            { text: 'class', cls: 'keyword', rest: [{ text: ' GameManager', cls: 'class-name' }, { text: ': ' }, { text: 'ObservableObject', cls: 'class-name' }, { text: ' {' }] },
            { text: '  @Published', cls: 'property', rest: [{ text: ' var', cls: 'keyword' }, { text: ' currentChallenge: ' }, { text: 'Challenge', cls: 'class-name' }, { text: '?' }] },
            { text: '  @Published', cls: 'property', rest: [{ text: ' var', cls: 'keyword' }, { text: ' score: ' }, { text: 'Int', cls: 'class-name' }, { text: ' = ' }, { text: '0', cls: 'number' }] },
            { text: '  @Published', cls: 'property', rest: [{ text: ' var', cls: 'keyword' }, { text: ' players: [' }, { text: 'Player', cls: 'class-name' }, { text: '] = []' }] },
            { text: '  @Published', cls: 'property', rest: [{ text: ' var', cls: 'keyword' }, { text: ' isGameActive = ' }, { text: 'false', cls: 'keyword' }] },
            { text: '  private', cls: 'keyword', rest: [{ text: ' let', cls: 'keyword' }, { text: ' apiService = ' }, { text: 'APIService', cls: 'class-name' }, { text: '.shared', cls: 'property' }] },
            { text: '  private', cls: 'keyword', rest: [{ text: ' var', cls: 'keyword' }, { text: ' cancellables = ' }, { text: 'Set', cls: 'class-name' }, { text: '<' }, { text: 'AnyCancellable', cls: 'class-name' }, { text: '>()' }] },
            { text: '' },
            { text: '  func', cls: 'keyword', rest: [{ text: ' startGame', cls: 'function' }, { text: '() {' }] },
            { text: '    isGameActive = ', rest: [{ text: 'true', cls: 'keyword' }] },
            { text: '    score = ', rest: [{ text: '0', cls: 'number' }] },
            { text: '    fetchNextChallenge', cls: 'function', rest: [{ text: '()' }] },
            { text: '  }' },
            { text: '' },
            { text: '  func', cls: 'keyword', rest: [{ text: ' fetchNextChallenge', cls: 'function' }, { text: '() {' }] },
            { text: '    apiService.getChallenge', cls: 'function', rest: [{ text: '(for: players)' }] },
            { text: '      .receive', cls: 'function', rest: [{ text: '(on: ' }, { text: 'DispatchQueue', cls: 'class-name' }, { text: '.main', cls: 'property' }, { text: ')' }] },
            { text: '      .sink', cls: 'function', rest: [{ text: ' { [' }, { text: 'weak', cls: 'keyword' }, { text: ' self', cls: 'keyword' }, { text: '] challenge ' }, { text: 'in', cls: 'keyword' }] },
            { text: '        self', cls: 'keyword', rest: [{ text: '?.currentChallenge = challenge' }] },
            { text: '      }.store', cls: 'function', rest: [{ text: '(in: &cancellables)' }] },
            { text: '  }' },
            { text: '' },
            { text: '  func', cls: 'keyword', rest: [{ text: ' addPlayer', cls: 'function' }, { text: '(_ name: ' }, { text: 'String', cls: 'class-name' }, { text: ') {' }] },
            { text: '    let', cls: 'keyword', rest: [{ text: ' player = ' }, { text: 'Player', cls: 'class-name' }, { text: '(name: name, id: ' }, { text: 'UUID', cls: 'class-name' }, { text: '())' }] },
            { text: '    players.append', cls: 'function', rest: [{ text: '(player)' }] },
            { text: '  }' },
            { text: '' },
            { text: '  func', cls: 'keyword', rest: [{ text: ' completeChallenge', cls: 'function' }, { text: '(accepted: ' }, { text: 'Bool', cls: 'class-name' }, { text: ') {' }] },
            { text: '    if', cls: 'keyword', rest: [{ text: ' accepted { score += currentChallenge?.points ?? ' }, { text: '0', cls: 'number' }, { text: ' }' }] },
            { text: '    fetchNextChallenge', cls: 'function', rest: [{ text: '()' }] },
            { text: '  }' },
            { text: '}' },
            { text: '' },
            { text: '// MARK: - Models', cls: 'comment' },
            { text: 'struct', cls: 'keyword', rest: [{ text: ' Player', cls: 'class-name' }, { text: ': ' }, { text: 'Identifiable', cls: 'class-name' }, { text: ', ' }, { text: 'Codable', cls: 'class-name' }, { text: ' {' }] },
            { text: '  let', cls: 'keyword', rest: [{ text: ' id: ' }, { text: 'UUID', cls: 'class-name' }] },
            { text: '  var', cls: 'keyword', rest: [{ text: ' name: ' }, { text: 'String', cls: 'class-name' }] },
            { text: '  var', cls: 'keyword', rest: [{ text: ' avatar: ' }, { text: 'String', cls: 'class-name' }, { text: ' = ' }, { text: '"shark"', cls: 'string' }] },
            { text: '}' },
            { text: '' },
            { text: 'struct', cls: 'keyword', rest: [{ text: ' Challenge', cls: 'class-name' }, { text: ': ' }, { text: 'Identifiable', cls: 'class-name' }, { text: ', ' }, { text: 'Codable', cls: 'class-name' }, { text: ' {' }] },
            { text: '  let', cls: 'keyword', rest: [{ text: ' id: ' }, { text: 'UUID', cls: 'class-name' }] },
            { text: '  let', cls: 'keyword', rest: [{ text: ' title: ' }, { text: 'String', cls: 'class-name' }] },
            { text: '  let', cls: 'keyword', rest: [{ text: ' description: ' }, { text: 'String', cls: 'class-name' }] },
            { text: '  let', cls: 'keyword', rest: [{ text: ' points: ' }, { text: 'Int', cls: 'class-name' }] },
            { text: '  let', cls: 'keyword', rest: [{ text: ' difficulty: ' }, { text: 'Difficulty', cls: 'class-name' }] },
            { text: '}' },
            { text: '' },
            { text: 'enum', cls: 'keyword', rest: [{ text: ' Difficulty', cls: 'class-name' }, { text: ': ' }, { text: 'String', cls: 'class-name' }, { text: ', ' }, { text: 'Codable', cls: 'class-name' }, { text: ', ' }, { text: 'CaseIterable', cls: 'class-name' }, { text: ' {' }] },
            { text: '  case', cls: 'keyword', rest: [{ text: ' easy, medium, hard, extreme' }] },
            { text: '}' },
            { text: '' },
            { text: '// MARK: - Content View', cls: 'comment' },
            { text: 'struct', cls: 'keyword', rest: [{ text: ' ContentView', cls: 'class-name' }, { text: ': ' }, { text: 'View', cls: 'class-name' }, { text: ' {' }] },
            { text: '  @EnvironmentObject', cls: 'property', rest: [{ text: ' var', cls: 'keyword' }, { text: ' gm: ' }, { text: 'GameManager', cls: 'class-name' }] },
            { text: '  @State', cls: 'property', rest: [{ text: ' private var', cls: 'keyword' }, { text: ' showAnim = ' }, { text: 'false', cls: 'keyword' }] },
            { text: '  @Namespace', cls: 'property', rest: [{ text: ' private var', cls: 'keyword' }, { text: ' ns' }] },
            { text: '  var', cls: 'keyword', rest: [{ text: ' body: ' }, { text: 'some', cls: 'keyword' }, { text: ' View', cls: 'class-name' }, { text: ' {' }] },
            { text: '    ZStack', cls: 'class-name', rest: [{ text: ' {' }] },
            { text: '      LinearGradient', cls: 'class-name', rest: [{ text: '(colors: [' }, { text: 'Color', cls: 'class-name' }, { text: '(' }, { text: '"deepPurple"', cls: 'string' }, { text: '), .' }, { text: 'purple', cls: 'property' }, { text: '.opacity', cls: 'function' }, { text: '(' }, { text: '0.8', cls: 'number' }, { text: ')],' }] },
            { text: '        startPoint: .topLeading, endPoint: .bottomTrailing' },
            { text: '      ).ignoresSafeArea', cls: 'function', rest: [{ text: '()' }] },
            { text: '      VStack', cls: 'class-name', rest: [{ text: '(spacing: ' }, { text: '24', cls: 'number' }, { text: ') {' }] },
            { text: '        Image', cls: 'class-name', rest: [{ text: '(' }, { text: '"logo"', cls: 'string' }, { text: ').resizable', cls: 'function' }, { text: '().scaledToFit', cls: 'function' }, { text: '()' }] },
            { text: '          .frame', cls: 'function', rest: [{ text: '(width: ' }, { text: '200', cls: 'number' }, { text: ')' }] },
            { text: '          .matchedGeometryEffect', cls: 'function', rest: [{ text: '(id: ' }, { text: '"logo"', cls: 'string' }, { text: ', in: ns)' }] },
            { text: '        Text', cls: 'class-name', rest: [{ text: '(' }, { text: '"Die ultimative Challenge-App"', cls: 'string' }, { text: ')' }] },
            { text: '          .font', cls: 'function', rest: [{ text: '(.' }, { text: 'headline', cls: 'property' }, { text: ').foregroundColor', cls: 'function' }, { text: '(.' }, { text: 'white', cls: 'property' }, { text: ')' }] },
            { text: '        // Start Button', cls: 'comment' },
            { text: '        Button', cls: 'class-name', rest: [{ text: '(action: gm.startGame) {' }] },
            { text: '          Text', cls: 'class-name', rest: [{ text: '(' }, { text: '"Los geht\'s!"', cls: 'string' }, { text: ').font', cls: 'function' }, { text: '(.' }, { text: 'title3', cls: 'property' }, { text: '.bold', cls: 'function' }, { text: '())' }] },
            { text: '            .foregroundColor', cls: 'function', rest: [{ text: '(.' }, { text: 'white', cls: 'property' }, { text: ').frame', cls: 'function' }, { text: '(maxWidth: .' }, { text: 'infinity', cls: 'property' }, { text: ')' }] },
            { text: '            .padding', cls: 'function', rest: [{ text: '().background', cls: 'function' }, { text: '(' }, { text: 'Capsule', cls: 'class-name' }, { text: '().fill', cls: 'function' }, { text: '(.' }, { text: 'blue', cls: 'property' }, { text: '))' }] },
            { text: '        }.padding', cls: 'function', rest: [{ text: '(.' }, { text: 'horizontal', cls: 'property' }, { text: ', ' }, { text: '40', cls: 'number' }, { text: ')' }] },
            { text: '        // Creator Code Input', cls: 'comment' },
            { text: '        TextField', cls: 'class-name', rest: [{ text: '(' }, { text: '"Creator-Code eingeben"', cls: 'string' }, { text: ', text: $creatorCode)' }] },
            { text: '          .textFieldStyle', cls: 'function', rest: [{ text: '(.' }, { text: 'roundedBorder', cls: 'property' }, { text: ')' }] },
            { text: '          .padding', cls: 'function', rest: [{ text: '(.' }, { text: 'horizontal', cls: 'property' }, { text: ', ' }, { text: '40', cls: 'number' }, { text: ')' }] },
            { text: '        HStack', cls: 'class-name', rest: [{ text: '(spacing: ' }, { text: '16', cls: 'number' }, { text: ') {' }] },
            { text: '          NavigationLink', cls: 'class-name', rest: [{ text: '(' }, { text: '"Tutorial"', cls: 'string' }, { text: ', destination: ' }, { text: 'TutorialView', cls: 'class-name' }, { text: '())' }] },
            { text: '          NavigationLink', cls: 'class-name', rest: [{ text: '(' }, { text: '"Spielregeln"', cls: 'string' }, { text: ', destination: ' }, { text: 'RulesView', cls: 'class-name' }, { text: '())' }] },
            { text: '        }' },
            { text: '      }' },
            { text: '      .scaleEffect', cls: 'function', rest: [{ text: '(showAnim ? ' }, { text: '1', cls: 'number' }, { text: ' : ' }, { text: '0.8', cls: 'number' }, { text: ')' }] },
            { text: '      .opacity', cls: 'function', rest: [{ text: '(showAnim ? ' }, { text: '1', cls: 'number' }, { text: ' : ' }, { text: '0', cls: 'number' }, { text: ')' }] },
            { text: '      .onAppear', cls: 'function', rest: [{ text: ' { withAnimation', cls: 'function' }, { text: '(.' }, { text: 'spring', cls: 'function' }, { text: '()) { showAnim = ' }, { text: 'true', cls: 'keyword' }, { text: ' } }' }] },
            { text: '    }' },
            { text: '  }' },
            { text: '}' },
            { text: '' },
            { text: '// MARK: - API Service', cls: 'comment' },
            { text: 'class', cls: 'keyword', rest: [{ text: ' APIService', cls: 'class-name' }, { text: ' {' }] },
            { text: '  static', cls: 'keyword', rest: [{ text: ' let', cls: 'keyword' }, { text: ' shared = ' }, { text: 'APIService', cls: 'class-name' }, { text: '()' }] },
            { text: '  private', cls: 'keyword', rest: [{ text: ' let', cls: 'keyword' }, { text: ' baseURL = ' }, { text: '"https://api.traustdudich.de"', cls: 'string' }] },
            { text: '  func', cls: 'keyword', rest: [{ text: ' getChallenge', cls: 'function' }, { text: '(for players: [' }, { text: 'Player', cls: 'class-name' }, { text: ']) -> ' }, { text: 'AnyPublisher', cls: 'class-name' }, { text: '<' }, { text: 'Challenge', cls: 'class-name' }, { text: ', ' }, { text: 'Never', cls: 'class-name' }, { text: '> {' }] },
            { text: '    let', cls: 'keyword', rest: [{ text: ' url = ' }, { text: 'URL', cls: 'class-name' }, { text: '(string: "\\(baseURL)/challenges/random")!' }] },
            { text: '    return', cls: 'keyword', rest: [{ text: ' URLSession', cls: 'class-name' }, { text: '.shared.dataTaskPublisher', cls: 'property' }, { text: '(for: url)' }] },
            { text: '      .map', cls: 'function', rest: [{ text: '(\\.data).decode', cls: 'function' }, { text: '(type: ' }, { text: 'Challenge', cls: 'class-name' }, { text: '.self', cls: 'keyword' }, { text: ', decoder: ' }, { text: 'JSONDecoder', cls: 'class-name' }, { text: '())' }] },
            { text: '      .replaceError', cls: 'function', rest: [{ text: '(with: ' }, { text: 'Challenge', cls: 'class-name' }, { text: '.fallback).eraseToAnyPublisher', cls: 'function' }, { text: '()' }] },
            { text: '  }' },
            { text: '}' },
        ];

        let currentLine = 0;
        let currentChar = 0;
        let outputHTML = '';
        let isRunning = false;
        let intervalId = null;

        function getLineHTML(line) {
            if (!line.text && !line.rest) return '';
            let html = '';
            if (line.cls) {
                html += '<span class="' + line.cls + '">' + line.text + '</span>';
            } else {
                html += line.text;
            }
            if (line.rest) {
                line.rest.forEach(part => {
                    if (part.cls) {
                        html += '<span class="' + part.cls + '">' + part.text + '</span>';
                    } else {
                        html += part.text;
                    }
                });
            }
            return html;
        }

        function getFullLineText(line) {
            let text = line.text || '';
            if (line.rest) {
                line.rest.forEach(part => { text += part.text; });
            }
            return text;
        }

        function typeLine() {
            if (!isRunning) return;
            if (currentLine >= lines.length) {
                // Loop: nach Pause prefilled neu starten
                setTimeout(() => {
                    prefillCode();
                    isRunning = false;
                    startTyping();
                }, 3000);
                return;
            }

            const line = lines[currentLine];
            const fullText = getFullLineText(line);

            if (fullText.length === 0) {
                outputHTML += '\n';
                codeEl.innerHTML = outputHTML + '<span class="cursor"></span>';
                scrollToVisible();
                currentLine++;
                setTimeout(typeLine, 100);
                return;
            }

            currentChar = 0;
            const lineHTML = getLineHTML(line);

            function typeChar() {
                currentChar++;
                if (currentChar > fullText.length) {
                    outputHTML += lineHTML + '\n';
                    codeEl.innerHTML = outputHTML + '<span class="cursor"></span>';
                    currentLine++;
                    setTimeout(typeLine, 80 + Math.random() * 120);
                    return;
                }

                // Zeige Teil-Text als plain, dann cursor
                const partialText = fullText.substring(0, currentChar);
                codeEl.innerHTML = outputHTML + partialText + '<span class="cursor"></span>';
                scrollToVisible();

                const delay = 25 + Math.random() * 45;
                setTimeout(typeChar, delay);
            }

            typeChar();
        }

        function startTyping() {
            if (isRunning) return;
            isRunning = true;
            typeLine();
        }

        function stopTyping() {
            isRunning = false;
        }

        // Ersten Zeilen sofort anzeigen, dann weiter tippen
        const prefilledLines = 4;

        let lineHeight = 20; // Geschätzte Zeilenhöhe
        let visibleLines = 5; // Sichtbare Zeilen im kleinen Mockup

        function prefillCode() {
            outputHTML = '';
            for (let i = 0; i < Math.min(prefilledLines, lines.length); i++) {
                outputHTML += getLineHTML(lines[i]) + '\n';
            }
            currentLine = prefilledLines;
            codeEl.innerHTML = outputHTML + '<span class="cursor"></span>';
            const editorBody = codeEl.parentElement;
            if (editorBody) {
                editorBody.scrollTop = 0;
                // Berechne echte Zeilenhöhe
                if (prefilledLines > 0) {
                    lineHeight = codeEl.scrollHeight / prefilledLines;
                }
                // Berechne sichtbare Zeilen basierend auf Editor-Höhe
                visibleLines = Math.floor(editorBody.clientHeight / lineHeight);
            }
        }

        function scrollToVisible() {
            const editorBody = codeEl.parentElement;
            if (!editorBody) return;

            // Berechne wie viele Zeilen aktuell existieren
            const totalLines = currentLine + 1;

            // Starte Scrollen bei 10% der sichtbaren Höhe
            const scrollStartLine = Math.max(1, Math.floor(visibleLines * 0.1));

            if (totalLines > scrollStartLine) {
                const targetScroll = (totalLines - scrollStartLine) * lineHeight;
                // Smooth scroll mit kleinen Schritten
                const currentScroll = editorBody.scrollTop;
                const diff = targetScroll - currentScroll;
                if (diff > 0) {
                    editorBody.scrollTop = currentScroll + Math.min(diff, lineHeight * 0.5);
                }
            }
        }

        // Starte wenn Apps-Tab aktiv wird (wird von Tab-Handler aufgerufen)
        window._startCodeTyping = function() {
            isRunning = false;
            prefillCode();
            startTyping();
        };

        window._stopCodeTyping = function() {
            stopTyping();
        };
    }

    // ================================
    // Mockup Carousel – automatischer Bildwechsel
    // ================================
    function initMockupCarousel() {
        const track = document.querySelector('.mockup-carousel-track');
        const slides = document.querySelectorAll('.mockup-carousel-slide');
        const urlDisplay = document.getElementById('mockup-url');
        if (!track || slides.length < 2) return;

        let current = 0;
        const total = slides.length;

        function next() {
            current = (current + 1) % total;
            track.style.transform = `translateX(-${current * 100}%)`;

            // URL nur aktualisieren wenn der websites Tab aktiv ist
            const activeTab = document.querySelector('.project-tab.active');
            if (urlDisplay && slides[current].dataset.url && activeTab && activeTab.dataset.tab === 'websites') {
                urlDisplay.textContent = slides[current].dataset.url;
                urlDisplay.href = slides[current].dataset.href;
            }
        }

        setInterval(next, 8000);
    }

    // ================================
    // Hero Scroll Shrink Effect
    // Elemente schrumpfen und verblassen beim Runterscrollen
    // ================================
    function initHeroScrollShrink() {
        const heroSection = document.getElementById('hero-section');
        if (!heroSection) return;

        const heroContent = heroSection.querySelector('.max-w-7xl');
        if (!heroContent) return;

        let heroRafId = null;
        function update() {
            const scrollY = window.scrollY;
            const heroHeight = heroSection.offsetHeight;

            let progress = scrollY / (heroHeight * 0.7);
            progress = Math.max(0, Math.min(1, progress));

            const scale = 1 - (progress * 0.15);
            const opacity = 1 - (progress * 0.8);
            const translateY = progress * -30;

            heroContent.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            heroContent.style.opacity = opacity;

            if (!document.hidden) {
                heroRafId = requestAnimationFrame(update);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (heroRafId) cancelAnimationFrame(heroRafId);
            } else {
                heroRafId = requestAnimationFrame(update);
            }
        });

        heroRafId = requestAnimationFrame(update);
    }

    // ================================
    // Showcase Feature Tabs
    // ================================
    function initProjectTabs() {
        const tabsContainer = document.querySelector('.project-tabs');
        const tabs = document.querySelectorAll('.project-tab');
        const description = document.getElementById('tab-description');

        if (!tabs.length || !description || !tabsContainer) return;

        const tabContent = {
            'apps': 'Native iOS & Android Apps sowie Cross-Platform-Entwicklung mit Flutter und React Native. Vom Konzept bis zum App Store.',
            'websites': 'Moderne, responsive Websites mit perfekter Performance, SEO-Optimierung und beeindruckendem Design für maximale Conversion.',
            'ki': 'KI-gestützte Lösungen mit ChatGPT, Claude und Custom Models. Automatisierung, Chatbots und intelligente Prozesse.',
            'software': 'Individuelle Business-Software, APIs und Backend-Systeme. Sicher, skalierbar und maßgeschneidert für dein Unternehmen.',
            'branding': 'Markenidentität, Logo-Design, Werbedesign und digitale Präsenz – alles aus einer Hand für deinen starken Auftritt.'
        };

        // Gooey-Container erstellen
        const gooeyContainer = document.createElement('div');
        gooeyContainer.classList.add('project-tabs-gooey');
        tabsContainer.appendChild(gooeyContainer);

        // Blob-Indikator erstellen (im Gooey-Container für Metaball-Effekt)
        const blob = document.createElement('div');
        blob.classList.add('project-tab-blob');
        gooeyContainer.appendChild(blob);

        // Trail-Tropfen erstellen
        const trail1 = document.createElement('div');
        trail1.classList.add('project-tab-blob-trail');
        gooeyContainer.appendChild(trail1);

        const trail2 = document.createElement('div');
        trail2.classList.add('project-tab-blob-trail');
        gooeyContainer.appendChild(trail2);

        // Glow-Overlay (außerhalb Gooey, damit Glow sauber bleibt)
        const glow = document.createElement('div');
        glow.classList.add('project-tab-blob-glow');
        tabsContainer.appendChild(glow);

        // Blob + Glow zum Tab bewegen
        function moveBlob(target) {
            const containerRect = tabsContainer.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const left = (targetRect.left - containerRect.left) + 'px';
            const width = targetRect.width + 'px';

            blob.style.width = width;
            blob.style.left = left;

            glow.style.width = width;
            glow.style.left = left;
        }

        // Trail-Tropfen animieren
        function animateTrails(fromTab, toTab) {
            const containerRect = tabsContainer.getBoundingClientRect();
            const fromRect = fromTab.getBoundingClientRect();
            const toRect = toTab.getBoundingClientRect();
            const fromCenter = fromRect.left - containerRect.left + fromRect.width / 2;
            const toCenter = toRect.left - containerRect.left + toRect.width / 2;
            const mid1 = fromCenter + (toCenter - fromCenter) * 0.3;
            const mid2 = fromCenter + (toCenter - fromCenter) * 0.6;

            // Trail 1
            trail1.style.left = fromCenter + 'px';
            trail1.classList.remove('fade');
            trail1.classList.add('active');

            setTimeout(() => {
                trail1.style.left = mid1 + 'px';
            }, 50);

            setTimeout(() => {
                trail1.classList.remove('active');
                trail1.classList.add('fade');
            }, 250);

            // Trail 2
            setTimeout(() => {
                trail2.style.left = (fromCenter + (toCenter - fromCenter) * 0.15) + 'px';
                trail2.classList.remove('fade');
                trail2.classList.add('active');

                setTimeout(() => {
                    trail2.style.left = mid2 + 'px';
                }, 50);

                setTimeout(() => {
                    trail2.classList.remove('active');
                    trail2.classList.add('fade');
                }, 200);
            }, 60);
        }

        // Initial positionieren
        const activeTab = tabsContainer.querySelector('.project-tab.active');
        if (activeTab) {
            moveBlob(activeTab);
        }

        let currentActiveTab = activeTab;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab === currentActiveTab) return;

                const prevTab = currentActiveTab;

                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Trail-Tropfen animieren
                if (prevTab) {
                    animateTrails(prevTab, tab);
                }

                // Blob bewegen
                moveBlob(tab);

                currentActiveTab = tab;

                // Update description with fade effect
                const tabId = tab.dataset.tab;
                description.style.opacity = '0';
                description.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    description.textContent = tabContent[tabId] || '';
                    description.style.opacity = '1';
                    description.style.transform = 'translateY(0)';
                }, 200);

                // Mockup-Inhalt je nach Tab wechseln
                const mockupContents = document.querySelectorAll('.mockup-tab-content');
                const urlDisplay = document.getElementById('mockup-url');
                mockupContents.forEach(el => {
                    if (el.dataset.tab === tabId) {
                        el.style.opacity = '1';
                    } else {
                        el.style.opacity = '0';
                    }
                });
                if (urlDisplay) {
                    urlDisplay.style.opacity = '1';
                    if (tabId === 'apps') {
                        urlDisplay.textContent = 'Traust Du Dich?';
                        urlDisplay.removeAttribute('href');
                        urlDisplay.style.cursor = 'default';
                    } else if (tabId === 'websites') {
                        // URL der aktuellen Slide setzen
                        const activeSlide = document.querySelector('.mockup-carousel-slide.active') || document.querySelector('.mockup-carousel-slide');
                        if (activeSlide && activeSlide.dataset.url) {
                            urlDisplay.textContent = activeSlide.dataset.url;
                            urlDisplay.href = activeSlide.dataset.href;
                        }
                        urlDisplay.style.cursor = 'pointer';
                    } else if (tabId === 'software') {
                        urlDisplay.textContent = 'ordable.io';
                        urlDisplay.href = 'https://ordable.io/';
                        urlDisplay.style.cursor = 'pointer';
                    } else {
                        urlDisplay.textContent = 'weconn3ct.app';
                        urlDisplay.removeAttribute('href');
                        urlDisplay.style.cursor = 'default';
                    }
                }

                // Code-Typing starten/stoppen
                if (tabId === 'apps' && window._startCodeTyping) {
                    window._startCodeTyping();
                } else if (window._stopCodeTyping) {
                    window._stopCodeTyping();
                }

                // Branding Video-Switch starten/stoppen
                if (tabId === 'branding') {
                    startBrandingSwitch();
                } else {
                    stopBrandingSwitch();
                }
            });
        });

        // Bei Resize neu positionieren
        window.addEventListener('resize', () => {
            const current = tabsContainer.querySelector('.project-tab.active');
            if (current) moveBlob(current);
        });

        // Add transition to description
        description.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        // Branding Video Switch (bei Video-Ende wechseln)
        let brandingActive = false;

        function startBrandingSwitch() {
            const v1 = document.getElementById('branding-video-1');
            const v2 = document.getElementById('branding-video-2');
            const label = document.getElementById('branding-video-label');
            if (!v1 || !v2) return;
            brandingActive = true;
            v1.currentTime = 0;
            v1.play();
            v1.style.opacity = '1';
            v2.style.opacity = '0';
            if (label) label.textContent = 'Case Study 1 – Feinkost Kaya';

            v1.onended = function() {
                if (!brandingActive) return;
                v1.style.opacity = '0';
                v2.style.opacity = '1';
                v2.currentTime = 0;
                v2.play();
                if (label) label.textContent = 'Case Study 2 – Mertes';
            };
            v2.onended = function() {
                if (!brandingActive) return;
                v2.style.opacity = '0';
                v1.style.opacity = '1';
                v1.currentTime = 0;
                v1.play();
                if (label) label.textContent = 'Case Study 1 – Feinkost Kaya';
            };
        }

        function stopBrandingSwitch() {
            brandingActive = false;
            const v1 = document.getElementById('branding-video-1');
            const v2 = document.getElementById('branding-video-2');
            if (v1) v1.onended = null;
            if (v2) v2.onended = null;
        }
    }

    // ================================
    // Active Navigation State
    // ================================
    function initActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        if (!sections.length || !navLinks.length) return;

        window.addEventListener('scroll', () => {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === `#${current}`) {
                    link.classList.add('text-white');
                    link.classList.remove('text-slate-400');
                } else {
                    link.classList.remove('text-white');
                    link.classList.add('text-slate-400');
                }
            });
        }, { passive: true });
    }

    // ================================
    // Throttle Function
    // ================================
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ================================
    // Case Study Slideshow
    // ================================
    function initCaseStudySlideshow() {
        // Find all slideshow containers
        const slideshowContainers = [
            document.getElementById('caseStudySlideshow'),
            document.getElementById('caseStudy2Slideshow'),
            document.getElementById('caseStudy3Slideshow')
        ].filter(container => container !== null);

        if (slideshowContainers.length === 0) return;

        slideshowContainers.forEach((slideshowContainer, containerIndex) => {
            const slides = slideshowContainer.querySelectorAll('.case-study-slide');
            if (slides.length === 0) return;

            let currentSlide = 0;
            const isCS3 = slideshowContainer.id === 'caseStudy3Slideshow';
            let nextSlideTimeout = null;

            function showSlide(index) {
                slides.forEach((slide, i) => {
                    if (i === index) {
                        slide.classList.add('active');

                        // If it's a video, play it
                        if (slide.tagName === 'VIDEO') {
                            // Remove any existing event listeners
                            slide.removeEventListener('ended', handleVideoEnd);

                            // Play the video
                            slide.currentTime = 0; // Reset to start
                            slide.play().catch(err => {
                                // Video autoplay prevented
                            });

                            slide.addEventListener('ended', handleVideoEnd);
                        } else {
                            // For images, show for 5 seconds (CS3) or 3 seconds (CS1)
                            clearTimeout(nextSlideTimeout);
                            const imageDelay = isCS3 ? 5000 : 3000;
                            nextSlideTimeout = setTimeout(nextSlide, imageDelay);
                        }
                    } else {
                        slide.classList.remove('active');

                        // If it's a video, pause it
                        if (slide.tagName === 'VIDEO') {
                            slide.pause();
                            slide.currentTime = 0;
                        }
                    }
                });
            }

            function handleVideoEnd() {
                // When video ends, go to next slide
                nextSlide();
            }

            function nextSlide() {
                clearTimeout(nextSlideTimeout);
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            }

            // Start slideshow
            showSlide(0);


        });
    }

    // ================================
    // Initialize
    // ================================
    function init() {
        // Event Listeners
        window.addEventListener('scroll', throttle(handleNavbarScroll, 50), { passive: true });

        // Navbar toggle (hamburger → fullscreen overlay)
        if (navbarToggle) {
            navbarToggle.addEventListener('click', toggleNavbarMenu);
        }

        // Menü-Links schließen bei Klick
        if (navbarMenu) {
            navbarMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function() {
                    if (navbarMenu.classList.contains('active')) {
                        toggleNavbarMenu();
                    }
                });
            });
        }

        // Initialize features
        initLenis();
        initScrollAnimations();
        initSmoothScroll();
        initActiveNavigation();
        initRotatingWord();
        initProjectTabs();
        initShowcaseScrollAnimation();
        initHeroScrollShrink();
        initMockupCarousel();
        initCodeTyping();
        initCaseStudySlideshow();


    }

    // ================================
    // Run on DOM Ready
    // ================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

// (Logo Hover: reines CSS – kein JS nötig)

// ================================
// Contact Form Handler (contact.html)
// ================================
if (document.getElementById('contact-form')) {
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const form = this;
        const formData = new FormData(form);
        const button = form.querySelector('button[type="submit"]');
        const originalText = button.innerHTML;

        button.innerHTML = `
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Wird gesendet...
        `;
        button.disabled = true;

        fetch('https://formspree.io/f/mwvkpall', {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(function(response) {
            if (response.ok) {
                button.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Nachricht gesendet!
                `;
                button.classList.remove('from-primary-500', 'to-accent-500');
                button.classList.add('from-green-500', 'to-green-600');
                form.reset();
                setTimeout(function() {
                    button.innerHTML = originalText;
                    button.classList.remove('from-green-500', 'to-green-600');
                    button.classList.add('from-primary-500', 'to-accent-500');
                    button.disabled = false;
                }, 3000);
            } else {
                throw new Error('Fehler beim Senden');
            }
        })
        .catch(function() {
            button.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Fehler – bitte erneut versuchen
            `;
            button.classList.remove('from-primary-500', 'to-accent-500');
            button.classList.add('from-red-500', 'to-red-600');
            setTimeout(function() {
                button.innerHTML = originalText;
                button.classList.remove('from-red-500', 'to-red-600');
                button.classList.add('from-primary-500', 'to-accent-500');
                button.disabled = false;
            }, 3000);
        });
    });
}

/* ================================
   Logo Scroll – JS-basiert (für zuverlässigen Hover)
   ================================ */
(function initLogoScroll() {
    const scroller = document.querySelector('.logo-scroll');
    if (!scroller || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let pos = 0;
    const speed = 0.5; // px pro Frame

    function tick() {
        pos -= speed;
        // Bei Hälfte zurücksetzen (Duplikat-Logos sorgen für nahtlosen Loop)
        if (Math.abs(pos) >= scroller.scrollWidth / 2) pos = 0;
        scroller.style.transform = 'translateX(' + pos + 'px)';
        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
})();
