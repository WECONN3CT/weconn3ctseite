// Blur Text Animation - Vanilla JS (kein React/Framer Motion)
console.log('✨ BlurText Animation loaded');

class BlurText {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      delay: options.delay || 150,
      animateBy: options.animateBy || 'words',
      direction: options.direction || 'top',
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px',
      duration: options.duration || 700,
      easing: options.easing || 'cubic-bezier(0.22, 1, 0.36, 1)'
    };
    
    this.originalText = element.textContent;
    this.init();
  }

  init() {
    const text = this.originalText;
    const elements = this.options.animateBy === 'words' 
      ? text.split(' ') 
      : text.split('');

    // Clear element
    this.element.innerHTML = '';
    this.element.style.display = 'flex';
    this.element.style.flexWrap = 'wrap';
    this.element.style.justifyContent = 'center';
    this.element.style.textAlign = 'center';
    this.element.style.gap = '0';

    // Create spans for each word/letter
    const spans = [];
    elements.forEach((segment, index) => {
      const span = document.createElement('span');
      span.textContent = segment;
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, filter, opacity';
      span.style.opacity = '0';
      span.style.filter = 'blur(8px)';

      if (this.options.direction === 'top') {
        span.style.transform = 'translate3d(0,-40px,0)';
      } else {
        span.style.transform = 'translate3d(0,40px,0)';
      }

      this.element.appendChild(span);
      
      // Add space between words
      if (this.options.animateBy === 'words' && index < elements.length - 1) {
        const space = document.createTextNode('\u00A0');
        this.element.appendChild(space);
      }
      
      spans.push(span);
    });

    this.spans = spans;
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate();
            observer.unobserve(this.element);
          }
        });
      },
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );

    observer.observe(this.element);
  }

  animate() {
    let finishedCount = 0;
    const total = this.spans.length;

    this.spans.forEach((span, index) => {
      const delay = index * this.options.delay;

      // Multi-step, GPU-friendly (translate3d), sanfter Verlauf
      const keyframes = [
        // Start
        {
          opacity: 0,
          filter: 'blur(8px)',
          transform: this.options.direction === 'top' ? 'translate3d(0,-40px,0)' : 'translate3d(0,40px,0)'
        },
        // Mid (sanftes Überschwingen)
        {
          opacity: 0.6,
          filter: 'blur(3px)',
          transform: this.options.direction === 'top' ? 'translate3d(0,6px,0)' : 'translate3d(0,-6px,0)',
          offset: 0.55
        },
        // End
        {
          opacity: 1,
          filter: 'blur(0px)',
          transform: 'translate3d(0,0,0)'
        }
      ];

      const timing = {
        duration: this.options.duration,
        easing: this.options.easing || 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards',
        delay
      };

      const animation = span.animate(keyframes, timing);
      animation.addEventListener('finish', () => {
        finishedCount += 1;
        if (finishedCount === total) {
          // Markiere den Container als abgeschlossen, damit CSS den stabilen Zustand erzwingt
          this.element.classList.add('blur-text-complete');
        }
      });
    });
  }
}

// Auto-initialize on elements with [data-blur-text]
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-blur-text]');
  
  elements.forEach(element => {
    const options = {
      delay: parseInt(element.dataset.blurDelay) || 150,
      animateBy: element.dataset.blurAnimateBy || 'words',
      direction: element.dataset.blurDirection || 'top',
      threshold: parseFloat(element.dataset.blurThreshold) || 0.1,
      duration: parseInt(element.dataset.blurDuration) || 700
    };
    
    new BlurText(element, options);
  });

  console.log('✅ BlurText animations initialized');
});

export { BlurText };


