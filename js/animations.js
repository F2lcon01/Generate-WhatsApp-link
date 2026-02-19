/* ============================================
   🎬 NEON PULSE UI ANIMATIONS — Enhanced v0.3
   ============================================ */

/* 🎆 CONFETTI */
class ConfettiExplosion {
    constructor() {
        this.container = null;
        this.colors = ['#FF1B6B','#00D4FF','#25D366','#845EC2','#FFC75F','#FF6B6B','#4FC3F7'];
    }
    init() {
        this.container = document.createElement('div');
        this.container.className = 'confetti-container';
        this.container.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.container);
    }
    explode(x, y, count = 40) {
        if (!this.container) this.init();
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const c = document.createElement('div');
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const size = Math.random() * 8 + 4;
            const angle = Math.random() * Math.PI * 2;
            const vel = Math.random() * 400 + 200;
            const rot = Math.random() * 720 - 360;
            c.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random()>0.5?'50%':'2px'};pointer-events:none;z-index:10000;`;
            frag.appendChild(c);
            c.animate([
                { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${Math.cos(angle)*vel}px,${Math.sin(angle)*vel+400}px) rotate(${rot}deg)`, opacity: 0 }
            ], { duration: 1500 + Math.random() * 800, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)' }).onfinish = () => c.remove();
        }
        this.container.appendChild(frag);
    }
    burstFromElement(el, count = 25) {
        const r = el.getBoundingClientRect();
        this.explode(r.left + r.width/2, r.top + r.height/2, count);
    }
}
window.confetti = new ConfettiExplosion();

/* 🔔 TOAST */
class ToastNotification {
    constructor() { this.active = []; this.max = 3; }
    show(msg, type = 'success', dur = 3000) {
        if (this.active.length >= this.max) this.hide(this.active[0]);
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.setAttribute('role', 'status');
        t.setAttribute('aria-live', 'polite');
        const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
        const colors = { success:'linear-gradient(135deg,#25D366,#128C7E)', error:'linear-gradient(135deg,#FF6B6B,#ee5a5a)', warning:'linear-gradient(135deg,#FFC75F,#e6a800)', info:'linear-gradient(135deg,#00D4FF,#0099cc)' };
        t.innerHTML = `<i class="fas ${icons[type]||icons.info}" aria-hidden="true"></i><span>${msg}</span>`;
        t.style.background = colors[type] || colors.info;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        this.active.push(t);
        t._timer = setTimeout(() => this.hide(t), dur);
        return t;
    }
    hide(t) {
        if (!t?.parentNode) return;
        clearTimeout(t._timer);
        t.classList.remove('show');
        setTimeout(() => { if (t.parentNode) t.remove(); this.active = this.active.filter(x => x !== t); }, 500);
    }
    success(m, d) { return this.show(m, 'success', d); }
    error(m, d) { return this.show(m, 'error', d); }
    warning(m, d) { return this.show(m, 'warning', d); }
    info(m, d) { return this.show(m, 'info', d); }
}
window.toast = new ToastNotification();

/* 🌊 RIPPLE — Event delegation */
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .history-btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;background:rgba(255,255,255,0.3);border-radius:50%;transform:scale(0);pointer-events:none;`;
    btn.appendChild(ripple);
    ripple.animate([
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(4)', opacity: 0 }
    ], { duration: 600, easing: 'ease-out' }).onfinish = () => ripple.remove();
});

/* 🎯 BUTTON MAGNETIC (Desktop) */
if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                btn.style.transform = `translate(${x*0.08}px,${y*0.08}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    });
}

window.buttonAnimations = {
    success(el) {
        el.classList.add('animate-pulse');
        window.confetti?.burstFromElement(el, 20);
        setTimeout(() => el.classList.remove('animate-pulse'), 1000);
    },
    error(el) {
        el.classList.add('animate-shake');
        setTimeout(() => el.classList.remove('animate-shake'), 500);
    }
};

/* 📝 INPUT ANIMATIONS */
window.inputAnimations = {
    shakeError(input) {
        input.animate([
            { transform: 'translateX(0)', borderColor: '#FF6B6B' },
            { transform: 'translateX(-8px)' },
            { transform: 'translateX(8px)' },
            { transform: 'translateX(-8px)' },
            { transform: 'translateX(8px)' },
            { transform: 'translateX(0)' }
        ], { duration: 400, easing: 'ease-in-out' });
        input.style.borderColor = '#FF6B6B';
        setTimeout(() => { input.style.borderColor = ''; }, 2000);
    },
    success(input) {
        input.animate([
            { boxShadow: '0 0 0 0 rgba(37,211,102,0.5)' },
            { boxShadow: '0 0 0 10px rgba(37,211,102,0)' }
        ], { duration: 500, easing: 'ease-out' });
        input.style.borderColor = '#25D366';
        setTimeout(() => { input.style.borderColor = ''; }, 2000);
    }
};

/* 📜 HISTORY ANIMATIONS */
window.historyAnimations = {
    addItem(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-20px) scale(0.95)';
        requestAnimationFrame(() => {
            el.style.transition = 'all 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Input focus/blur animations
    document.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('focus', () => {
            const wrapper = input.closest('.input-wrapper');
            if (wrapper) wrapper.classList.add('focused');
            const icon = input.nextElementSibling;
            if (icon?.classList.contains('input-icon')) {
                icon.animate([
                    { transform: 'translateY(-50%) scale(1)' },
                    { transform: 'translateY(-50%) scale(1.15)' }
                ], { duration: 250, easing: 'ease-out', fill: 'forwards' });
            }
        });
        input.addEventListener('blur', () => {
            const wrapper = input.closest('.input-wrapper');
            if (wrapper) wrapper.classList.remove('focused');
        });
    });
});
