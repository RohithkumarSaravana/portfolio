// ============================================================
// Rohithkumar Saravanan — Portfolio interactions
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Mobile Menu ----
const menuBtn = document.getElementById('menuBtn');
const mobileMenuRoot = document.getElementById('mobileMenu');
const mobileMenuPanel = mobileMenuRoot ? mobileMenuRoot.firstElementChild : null;

if (menuBtn && mobileMenuRoot) {
    menuBtn.addEventListener('click', () => {
        const isHidden = mobileMenuRoot.classList.contains('hidden');
        if (isHidden) {
            mobileMenuRoot.classList.remove('hidden');
            if (mobileMenuPanel) mobileMenuPanel.classList.remove('hidden');
        } else {
            mobileMenuRoot.classList.add('hidden');
        }
        menuBtn.setAttribute('aria-expanded', String(isHidden));
    });

    if (mobileMenuPanel) {
        mobileMenuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenuRoot.classList.add('hidden')));
    }
}

// ---- Year ----
const yearSpan = document.getElementById('y');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ---- Tilt (skip on touch devices / reduced motion) ----
if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const b = el.getBoundingClientRect();
            const px = (e.clientX - b.left) / b.width - 0.5;
            const py = (e.clientY - b.top) / b.height - 0.5;
            el.style.transform = `rotateX(${-py * 4}deg) rotateY(${px * 4}deg) translateY(-4px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 300ms var(--ease)';
            setTimeout(() => el.style.transition = '', 300);
        });
    });
}

// ---- Cursor glow (skip on touch devices / reduced motion) ----
const glow = document.getElementById('glow');
if (glow && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    });
}

// ---- Stat counters — animate numeric stat tiles into view ----
function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.count.includes('.') ? el.dataset.count.split('.')[1].length : 0;
    if (prefersReducedMotion) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
    }
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); statObs.unobserve(e.target); }
    });
}, { threshold: 0.4 });
document.querySelectorAll('[data-count]').forEach(el => statObs.observe(el));

// ============================================================
// Node-field ambient background — a sparse, quiet network graph.
// Fixed behind all content, low opacity. A single static frame
// is drawn for reduced-motion users instead of a running loop.
// ============================================================
(function nodeField() {
    const canvas = document.getElementById('nodeField');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let nodes = [];
    const GOLD = 'rgba(234,176,90,';
    const BLUE = 'rgba(91,141,239,';
    const LINE = 'rgba(130,145,180,';

    function resize() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        const area = window.innerWidth * window.innerHeight;
        const count = Math.max(16, Math.min(46, Math.round(area / 42000)));
        nodes = Array.from({ length: count }, (_, i) => ({
            x: Math.random(),
            y: Math.random(),
            vx: (Math.random() - 0.5) * 0.00035,
            vy: (Math.random() - 0.5) * 0.00035,
            gold: i % 5 === 0,
        }));
    }

    function drawFrame() {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const linkDist = Math.min(w, h) * 0.16;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const a = nodes[i], b = nodes[j];
                const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < linkDist) {
                    ctx.strokeStyle = LINE + (0.1 * (1 - dist / linkDist)) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x * w, a.y * h);
                    ctx.lineTo(b.x * w, b.y * h);
                    ctx.stroke();
                }
            }
        }
        nodes.forEach(n => {
            ctx.beginPath();
            ctx.fillStyle = (n.gold ? GOLD : BLUE) + '0.55)';
            ctx.arc(n.x * w, n.y * h, 2 * dpr, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function tick() {
        nodes.forEach(n => {
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0 || n.x > 1) n.vx *= -1;
            if (n.y < 0 || n.y > 1) n.vy *= -1;
        });
        drawFrame();
        requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', () => { resize(); if (prefersReducedMotion) drawFrame(); });

    if (prefersReducedMotion) {
        drawFrame();
    } else {
        requestAnimationFrame(tick);
    }
})();

// ============================================================
// Scroll reveal, driven by GSAP ScrollTrigger.
// ScrollTrigger evaluates the current scroll position directly
// rather than waiting to observe an intersecting frame, so a
// fast/instant scroll (reduced-motion users, a direct anchor
// jump) can't leave an element stuck hidden the way a plain
// IntersectionObserver could.
// ============================================================
window.addEventListener('load', () => {
    if (typeof gsap === 'undefined') {
        // GSAP failed to load — fall back to showing everything so
        // content is never stuck invisible.
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.reveal').forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 92%',
            once: true,
            onEnter: () => el.classList.add('in'),
        });
    });

    // Hero name reveal
    const lines = document.querySelectorAll('.pop-line');
    if (lines.length > 0) {
        gsap.set(lines, { yPercent: 100, opacity: 0 });
        gsap.to(lines, {
            yPercent: 0,
            opacity: 1,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.12,
            delay: 0.2,
        });
    }

    if (!prefersReducedMotion) {
        // Staggered skill icons per category
        document.querySelectorAll('.skill-row').forEach((row) => {
            const icons = row.querySelectorAll('.flex-col');
            gsap.from(icons, {
                opacity: 0,
                y: 16,
                duration: 0.5,
                stagger: 0.06,
                ease: 'power2.out',
                scrollTrigger: { trigger: row, start: 'top 85%' },
            });
        });

        // Staggered grid entrances for project/certification cards — these
        // grids don't use the .reveal class, GSAP owns their opacity + y
        // fully so the whole grid cascades in as one coordinated moment.
        document.querySelectorAll('#projects .grid, #certifications .grid').forEach((grid) => {
            gsap.from(grid.children, {
                opacity: 0,
                y: 24,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: { trigger: grid, start: 'top 88%' },
            });
        });
    }
});
