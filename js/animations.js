/* ============================================
   🎬 NEON PULSE UI ANIMATIONS
   Interactive Animation Library
   ============================================ */

/* ============================================
   🎆 CONFETTI EXPLOSION
   ============================================ */

class ConfettiExplosion {
    constructor() {
        this.container = null;
        this.colors = [
            '#FF1B6B', // Pink
            '#00D4FF', // Cyan
            '#25D366', // Green
            '#845EC2', // Purple
            '#FFC75F', // Gold
            '#FF6B6B', // Coral
            '#4FC3F7'  // Light Blue
        ];
    }
    
    init() {
        this.container = document.createElement('div');
        this.container.className = 'confetti-container';
        document.body.appendChild(this.container);
    }
    
    explode(x, y, count = 50) {
        if (!this.container) this.init();
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const size = Math.random() * 10 + 5;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 500 + 200;
            const rotation = Math.random() * 720 - 360;
            
            const endX = Math.cos(angle) * velocity;
            const endY = Math.sin(angle) * velocity;
            
            confetti.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                pointer-events: none;
                z-index: 10000;
            `;
            
            this.container.appendChild(confetti);
            
            // Animate
            confetti.animate([
                { 
                    transform: 'translate(0, 0) rotate(0deg)', 
                    opacity: 1 
                },
                { 
                    transform: `translate(${endX}px, ${endY + 500}px) rotate(${rotation}deg)`, 
                    opacity: 0 
                }
            ], {
                duration: 2000 + Math.random() * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => confetti.remove();
        }
    }
    
    // Quick burst from element center
    burstFromElement(element, count = 30) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        this.explode(x, y, count);
    }
}

// Global confetti instance
window.confetti = new ConfettiExplosion();

/* ============================================
   🔔 TOAST NOTIFICATIONS
   ============================================ */

class ToastNotification {
    constructor() {
        this.activeToasts = [];
        this.maxToasts = 3;
    }
    
    show(message, type = 'success', duration = 3000) {
        // Remove oldest toast if max reached
        if (this.activeToasts.length >= this.maxToasts) {
            this.hide(this.activeToasts[0]);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        // Style based on type
        const colors = {
            success: 'linear-gradient(135deg, #25D366, #128C7E)',
            error: 'linear-gradient(135deg, #FF6B6B, #ee5a5a)',
            warning: 'linear-gradient(135deg, #FFC75F, #e6a800)',
            info: 'linear-gradient(135deg, #00D4FF, #0099cc)'
        };
        
        toast.style.background = colors[type] || colors.info;
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        this.activeToasts.push(toast);
        
        // Auto hide
        setTimeout(() => this.hide(toast), duration);
        
        return toast;
    }
    
    hide(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            this.activeToasts = this.activeToasts.filter(t => t !== toast);
        }, 500);
    }
    
    success(message, duration) {
        return this.show(message, 'success', duration);
    }
    
    error(message, duration) {
        return this.show(message, 'error', duration);
    }
    
    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }
    
    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Global toast instance
window.toast = new ToastNotification();

/* ============================================
   🌊 RIPPLE EFFECT
   ============================================ */

class RippleEffect {
    constructor() {
        this.init();
    }
    
    init() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .history-btn');
            if (button) {
                this.createRipple(e, button);
            }
        });
    }
    
    createRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        ripple.animate([
            { transform: 'scale(0)', opacity: 1 },
            { transform: 'scale(4)', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        }).onfinish = () => ripple.remove();
    }
}

// Initialize ripple effect
window.rippleEffect = new RippleEffect();

/* ============================================
   🎯 BUTTON ANIMATIONS
   ============================================ */

class ButtonAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        // Magnetic effect on hover (desktop only)
        if (window.matchMedia('(hover: hover)').matches) {
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('mousemove', (e) => this.magneticEffect(e, btn));
                btn.addEventListener('mouseleave', (e) => this.resetMagnetic(btn));
            });
        }
    }
    
    magneticEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        
        element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    }
    
    resetMagnetic(element) {
        element.style.transform = '';
    }
    
    // Success animation
    success(element) {
        element.classList.add('animate-pulse');
        window.confetti.burstFromElement(element, 20);
        
        setTimeout(() => {
            element.classList.remove('animate-pulse');
        }, 1000);
    }
    
    // Error animation
    error(element) {
        element.classList.add('animate-shake');
        
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, 500);
    }
}

// Initialize button animations
window.buttonAnimations = new ButtonAnimations();

/* ============================================
   📝 INPUT ANIMATIONS
   ============================================ */

class InputAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('.input-field').forEach(input => {
            // Focus animation
            input.addEventListener('focus', () => this.onFocus(input));
            input.addEventListener('blur', () => this.onBlur(input));
            
            // Input animation
            input.addEventListener('input', () => this.onInput(input));
        });
    }
    
    onFocus(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.add('focused');
        }
        
        // Animate icon
        const icon = input.nextElementSibling;
        if (icon && icon.classList.contains('input-icon')) {
            icon.animate([
                { transform: 'translateY(-50%) scale(1)' },
                { transform: 'translateY(-50%) scale(1.2)' },
                { transform: 'translateY(-50%) scale(1.1)' }
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards'
            });
        }
    }
    
    onBlur(input) {
        const wrapper = input.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.remove('focused');
        }
    }
    
    onInput(input) {
        // Quick pulse on input
        if (input.value.length === 1) {
            input.animate([
                { boxShadow: '0 0 0 4px rgba(37, 211, 102, 0.3)' },
                { boxShadow: '0 0 0 2px rgba(37, 211, 102, 0.1)' }
            ], {
                duration: 300,
                easing: 'ease-out'
            });
        }
    }
    
    // Shake for error
    shakeError(input) {
        input.animate([
            { transform: 'translateX(0)', borderColor: '#FF6B6B' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 400,
            easing: 'ease-in-out'
        });
        
        // Flash red
        input.style.borderColor = '#FF6B6B';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 2000);
    }
    
    // Success animation
    success(input) {
        input.animate([
            { boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.5)' },
            { boxShadow: '0 0 0 10px rgba(37, 211, 102, 0)' }
        ], {
            duration: 500,
            easing: 'ease-out'
        });
        
        input.style.borderColor = '#25D366';
        setTimeout(() => {
            input.style.borderColor = '';
        }, 2000);
    }
}

// Initialize input animations
window.inputAnimations = new InputAnimations();

/* ============================================
   📜 HISTORY LIST ANIMATIONS
   ============================================ */

class HistoryAnimations {
    constructor() {
        this.observer = null;
        this.init();
    }
    
    init() {
        // Intersection observer for scroll animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });
    }
    
    // Animate new item being added
    addItem(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px) scale(0.95)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        });
    }
    
    // Animate item removal
    removeItem(element) {
        return new Promise(resolve => {
            element.style.transition = 'all 0.3s ease-out';
            element.style.opacity = '0';
            element.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                element.remove();
                resolve();
            }, 300);
        });
    }
    
    // Reorder animation
    reorder(list) {
        const items = Array.from(list.children);
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

// Initialize history animations
window.historyAnimations = new HistoryAnimations();

/* ============================================
   🌈 GRADIENT TEXT ANIMATION
   ============================================ */

class GradientTextAnimation {
    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        this.init();
    }
    
    init() {
        this.elements.forEach(el => {
            el.style.backgroundSize = '200% 200%';
            el.style.animation = 'gradientText 3s ease infinite';
        });
    }
}

/* ============================================
   🎭 PAGE LOAD ORCHESTRATOR
   ============================================ */

class PageLoadOrchestrator {
    constructor() {
        this.timeline = [];
    }
    
    // Orchestrate the page load animation sequence
    async play() {
        // Step 1: Fade in background
        await this.animate('.background-container', {
            opacity: [0, 1]
        }, 500);
        
        // Step 2: Slide down header
        await this.animate('.header', {
            transform: ['translateY(-50px)', 'translateY(0)'],
            opacity: [0, 1]
        }, 600);
        
        // Step 3: Scale in card
        await this.animate('.glass-card', {
            transform: ['scale(0.9)', 'scale(1)'],
            opacity: [0, 1]
        }, 500);
        
        // Step 4: Slide up history
        await this.animate('.history-section', {
            transform: ['translateY(50px)', 'translateY(0)'],
            opacity: [0, 1]
        }, 400);
    }
    
    async animate(selector, keyframes, duration) {
        const element = document.querySelector(selector);
        if (!element) return;
        
        return new Promise(resolve => {
            element.animate(keyframes, {
                duration,
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = resolve;
        });
    }
}

/* ============================================
   🚀 INITIALIZE ALL ANIMATIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Gradient text animation
    new GradientTextAnimation('.main-title');
    
    // Page load sequence (optional - CSS handles this by default)
    // new PageLoadOrchestrator().play();
    
    console.log('🎬 Neon Pulse Animations initialized!');
});
