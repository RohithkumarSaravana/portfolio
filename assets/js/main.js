// ============================================================
// Rohithkumar Saravanan — Portfolio interactions
// ============================================================

// Mobile Menu
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

// Year
const yearSpan = document.getElementById('y');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// IntersectionObserver — scroll reveal
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// Safety net: a fast/instant scroll (reduced-motion users, or a direct anchor
// jump) can skip past an element's intersecting frame entirely, leaving it
// stuck at opacity 0 forever. Catch anything the observer missed.
let revealSafetyTicking = false;
function revealPassedElements() {
    document.querySelectorAll('.reveal:not(.in)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.1) {
            el.classList.add('in');
            obs.unobserve(el);
        }
    });
    revealSafetyTicking = false;
}
window.addEventListener('scroll', () => {
    if (!revealSafetyTicking) {
        revealSafetyTicking = true;
        requestAnimationFrame(revealPassedElements);
    }
}, { passive: true });
window.addEventListener('load', revealPassedElements);

// Tilt (skip on touch devices / reduced motion)
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

// Cursor glow (skip on touch devices / reduced motion)
const glow = document.getElementById('glow');
if (glow && !prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
        });
    });
}

// Stat counters — animate numeric stat tiles into view
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

// GSAP Text Animation
window.addEventListener('load', () => {
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

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
            // Subtle scroll-linked stagger for skill icons per category
            document.querySelectorAll('.skill-row').forEach((row) => {
                const icons = row.querySelectorAll('.flex-col');
                gsap.from(icons, {
                    opacity: 0,
                    y: 16,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: row,
                        start: 'top 85%',
                    },
                });
            });
        }
    }
});
