/* ============================================
   ⭐ NEON PULSE PARTICLE SYSTEM
   Enhanced v0.3 — Performance Optimized
   ============================================ */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseOver = false;
        this.animationId = null;
        this.isVisible = true;
        
        this.config = {
            particleCount: 35,
            particleMinSize: 1,
            particleMaxSize: 3,
            particleSpeed: 0.3,
            connectionDistance: 100,
            mouseRadius: 150,
            colors: [
                'rgba(37, 211, 102, 0.7)',
                'rgba(0, 212, 255, 0.7)',
                'rgba(132, 94, 194, 0.7)',
                'rgba(255, 27, 107, 0.7)',
                'rgba(255, 199, 95, 0.7)'
            ]
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.addEventListeners();
        this.setupVisibilityObserver();
        this.animate();
    }
    
    resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }
    
    createParticles() {
        this.particles = [];
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(this.createParticle(w, h));
        }
    }
    
    createParticle(w, h) {
        const size = Math.random() * (this.config.particleMaxSize - this.config.particleMinSize) + this.config.particleMinSize;
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            size,
            baseSize: size,
            colorIndex: Math.floor(Math.random() * this.config.colors.length),
            vx: (Math.random() - 0.5) * this.config.particleSpeed,
            vy: (Math.random() - 0.5) * this.config.particleSpeed,
            opacity: Math.random() * 0.4 + 0.3,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2
        };
    }
    
    addEventListeners() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
                this.adjustForScreenSize();
            }, 250);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            this.isMouseOver = true;
        }, { passive: true });
        
        document.addEventListener('mouseleave', () => {
            this.isMouseOver = false;
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mousePosition.x = e.touches[0].clientX;
                this.mousePosition.y = e.touches[0].clientY;
                this.isMouseOver = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            this.isMouseOver = false;
        }, { passive: true });
    }
    
    setupVisibilityObserver() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isVisible = false;
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            } else {
                this.isVisible = true;
                if (!this.animationId) this.animate();
            }
        });
    }
    
    updateParticles() {
        const time = performance.now() * 0.001;
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.size = p.baseSize + Math.sin(time * p.pulseSpeed * 10 + p.pulseOffset) * 0.4;
            
            if (p.x < 0) p.x = w;
            else if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            else if (p.y > h) p.y = 0;
            
            if (this.isMouseOver) {
                const dx = this.mousePosition.x - p.x;
                const dy = this.mousePosition.y - p.y;
                const distSq = dx * dx + dy * dy;
                const radiusSq = this.config.mouseRadius * this.config.mouseRadius;
                if (distSq < radiusSq) {
                    const force = (this.config.mouseRadius - Math.sqrt(distSq)) / this.config.mouseRadius;
                    p.x -= dx * force * 0.015;
                    p.y -= dy * force * 0.015;
                }
            }
        }
    }
    
    drawParticles() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        // Skip connections if disabled (mobile)
        if (this.config.connectionDistance > 0) {
            this.drawConnections();
        }
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = this.config.colors[p.colorIndex];
            ctx.globalAlpha = p.opacity;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    
    drawConnections() {
        const ctx = this.ctx;
        const maxDist = this.config.connectionDistance;
        const maxDistSq = maxDist * maxDist;
        const particles = this.particles;
        const len = particles.length;
        
        ctx.lineWidth = 0.5;
        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;
                if (distSq < maxDistSq) {
                    const opacity = (1 - Math.sqrt(distSq) / maxDist) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        if (!this.isVisible) return;
        this.updateParticles();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    adjustForScreenSize() {
        const screenArea = window.innerWidth * window.innerHeight;
        const baseArea = 1920 * 1080;
        const ratio = Math.min(Math.max(screenArea / baseArea, 0.3), 1.5);
        const isMobile = window.innerWidth < 768;
        
        // Aggressive reduction for smooth scrolling
        this.config.particleCount = Math.floor((isMobile ? 15 : 35) * ratio);
        this.config.connectionDistance = isMobile ? 0 : 100; // Disable connections on mobile
        this.createParticles();
    }
    
    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.particles = [];
    }
}

/* ============================================
   🌟 FLOATING STARS
   ============================================ */
class FloatingStars {
    constructor(container) {
        this.container = container;
        this.stars = [];
        this.starCount = window.innerWidth < 768 ? 8 : 18;
        this.init();
    }
    
    init() {
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < this.starCount; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 1;
            star.style.cssText = `
                position:absolute;width:${size}px;height:${size}px;
                background:white;border-radius:50%;
                left:${Math.random()*100}%;top:${Math.random()*100}%;
                opacity:${Math.random()*0.4+0.2};
                animation:twinkle ${Math.random()*3+2}s ease-in-out infinite;
                animation-delay:${Math.random()*3}s;pointer-events:none;
            `;
            fragment.appendChild(star);
            this.stars.push(star);
        }
        this.container.appendChild(fragment);
    }
    
    destroy() {
        this.stars.forEach(s => s.remove());
        this.stars = [];
    }
}

/* ============================================
   🚀 INITIALIZE
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        window.particleSystem = new ParticleSystem('particles-canvas');
        window.particleSystem.adjustForScreenSize();
    }
    
    const bg = document.querySelector('.background-container');
    if (bg) {
        window.floatingStars = new FloatingStars(bg);
    }
});
