/* ============================================
   ⭐ NEON PULSE PARTICLE SYSTEM
   Animated Background Particles
   ============================================ */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('Particle canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseOver = false;
        
        // Configuration
        this.config = {
            particleCount: 80,
            particleMinSize: 1,
            particleMaxSize: 4,
            particleSpeed: 0.5,
            connectionDistance: 150,
            mouseRadius: 200,
            colors: [
                'rgba(37, 211, 102, 0.8)',   // Neon Green
                'rgba(0, 212, 255, 0.8)',     // Neon Cyan
                'rgba(132, 94, 194, 0.8)',    // Neon Purple
                'rgba(255, 27, 107, 0.8)',    // Neon Pink
                'rgba(255, 199, 95, 0.8)'     // Neon Gold
            ]
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        const size = Math.random() * (this.config.particleMaxSize - this.config.particleMinSize) + this.config.particleMinSize;
        const color = this.config.colors[Math.floor(Math.random() * this.config.colors.length)];
        
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: size,
            baseSize: size,
            color: color,
            vx: (Math.random() - 0.5) * this.config.particleSpeed,
            vy: (Math.random() - 0.5) * this.config.particleSpeed,
            opacity: Math.random() * 0.5 + 0.3,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2
        };
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            this.isMouseOver = true;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseOver = false;
        });
        
        // Touch support
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mousePosition.x = e.touches[0].clientX;
                this.mousePosition.y = e.touches[0].clientY;
                this.isMouseOver = true;
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.isMouseOver = false;
        });
    }
    
    updateParticles() {
        const time = Date.now() * 0.001;
        
        this.particles.forEach(particle => {
            // Move particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Pulse effect
            particle.size = particle.baseSize + Math.sin(time * particle.pulseSpeed * 10 + particle.pulseOffset) * 0.5;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Mouse interaction
            if (this.isMouseOver) {
                const dx = this.mousePosition.x - particle.x;
                const dy = this.mousePosition.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.mouseRadius) {
                    const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
                    particle.x -= dx * force * 0.02;
                    particle.y -= dy * force * 0.02;
                }
            }
        });
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.drawConnections();
        
        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
            
            // Glow effect
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = particle.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * 0.3;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
    
    // Method to update particle count based on screen size
    adjustForScreenSize() {
        const screenArea = window.innerWidth * window.innerHeight;
        const baseArea = 1920 * 1080; // Reference screen size
        const ratio = Math.min(screenArea / baseArea, 2);
        
        this.config.particleCount = Math.floor(60 * ratio);
        this.createParticles();
    }
}

/* ============================================
   🌟 FLOATING STARS EFFECT
   ============================================ */

class FloatingStars {
    constructor(container) {
        this.container = container;
        this.stars = [];
        this.starCount = 30;
        
        this.init();
    }
    
    init() {
        this.createStars();
    }
    
    createStars() {
        for (let i = 0; i < this.starCount; i++) {
            const star = document.createElement('div');
            star.className = 'floating-star';
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.3};
                animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 3}s;
                pointer-events: none;
            `;
            
            this.container.appendChild(star);
            this.stars.push(star);
        }
    }
    
    destroy() {
        this.stars.forEach(star => star.remove());
        this.stars = [];
    }
}

/* ============================================
   🎆 INITIALIZE ON DOM LOAD
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const particleCanvas = document.getElementById('particles-canvas');
    if (particleCanvas) {
        window.particleSystem = new ParticleSystem('particles-canvas');
        
        // Adjust particles for screen size
        window.particleSystem.adjustForScreenSize();
    }
    
    // Initialize floating stars
    const bgContainer = document.querySelector('.background-container');
    if (bgContainer) {
        window.floatingStars = new FloatingStars(bgContainer);
    }
});

// Adjust on resize
window.addEventListener('resize', () => {
    if (window.particleSystem) {
        window.particleSystem.adjustForScreenSize();
    }
});
