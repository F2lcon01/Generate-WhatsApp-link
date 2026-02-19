/* ============================================
   🚀 NEON PULSE - MAIN APPLICATION
   WhatsApp Link Generator — Enhanced v0.3
   Security + Performance + Accessibility Fixes
   ============================================ */

/* ============================================
   📌 GLOBAL STATE
   ============================================ */
const AppState = {
    linkHistory: [],
    maxHistoryItems: 5,
    isGenerating: false,
    countryCode: '966'
};

/* ============================================
   🔧 UTILITY FUNCTIONS
   ============================================ */

// Convert Arabic/Persian numerals to English
function convertArabicNumbers(str) {
    const map = { '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
                  '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9' };
    return str.replace(/[٠-٩۰-۹]/g, c => map[c] || c);
}

/**
 * 🧠 Smart Saudi Phone Number Normalizer
 * Accepts ANY format and converts to international: 966XXXXXXXXX (12 digits)
 * 
 * Supported formats:
 *   05XXXXXXXX          → 9665XXXXXXXX
 *   5XXXXXXXX           → 9665XXXXXXXX
 *   966 5XXXXXXXX       → 9665XXXXXXXX
 *   +966 5XXXXXXXX      → 9665XXXXXXXX
 *   00966 5XXXXXXXX     → 9665XXXXXXXX
 *   009665XXXXXXXX      → 9665XXXXXXXX
 *   +966 05XXXXXXXX     → 9665XXXXXXXX  (extra 0 after code)
 *   966 05XXXXXXXX      → 9665XXXXXXXX  (extra 0 after code)
 * 
 * With any combination of spaces, dashes, dots, parentheses:
 *   +966 55 994 8149
 *   +966-55-994-8149
 *   (05) 599 48149
 *   966.55.994.8149
 */
function normalizePhoneNumber(rawInput) {
    // Step 1: Strip ALL non-digit characters
    let digits = rawInput.replace(/\D/g, '');
    
    // Step 2: Remove international prefix variations
    // 00966... → remove 00966
    if (digits.startsWith('00966')) {
        digits = digits.substring(5);
    }
    // 966... → remove 966
    else if (digits.startsWith('966')) {
        digits = digits.substring(3);
    }
    
    // Step 3: Now we should have local number, remove leading 0 if present
    // 05XXXXXXXX → 5XXXXXXXX
    if (digits.startsWith('0')) {
        digits = digits.substring(1);
    }
    
    // Step 4: Add country code back
    return '966' + digits;
}

/**
 * Validate Saudi mobile number
 * After normalization, must be: 9665XXXXXXXX (12 digits total)
 * Saudi mobile numbers start with 05 (5 after country code)
 */
function validateSaudiNumber(normalizedPhone) {
    return /^9665\d{8}$/.test(normalizedPhone);
}

// Safe text escaping for HTML context (XSS prevention)
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Copy to clipboard with fallback
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    } catch (err) {
        console.error('Copy failed:', err);
        return false;
    }
}

/* ============================================
   🔗 LINK GENERATION
   ============================================ */
function generateWhatsAppLink() {
    if (AppState.isGenerating) return;
    
    const phoneInput = document.getElementById('phoneNumber');
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    const generateBtn = document.getElementById('generateBtn');
    
    // Clear previous
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('has-result');
    errorContainer.innerHTML = '';
    errorContainer.style.display = 'none';
    
    let phone = phoneInput.value.trim();
    phone = convertArabicNumbers(phone);
    
    // Validations
    if (!phone) {
        showError('يرجى إدخال رقم الهاتف.');
        window.inputAnimations?.shakeError(phoneInput);
        return;
    }
    
    // Check: only allow digits, spaces, +, -, (, ), .
    if (/[^\d\s\+\-\.\(\)]/.test(phone)) {
        showError('يرجى إدخال أرقام فقط — بدون أحرف.');
        window.inputAnimations?.shakeError(phoneInput);
        return;
    }
    
    // Check: must contain at least some digits
    if (!/\d/.test(phone)) {
        showError('يرجى إدخال أرقام فقط.');
        window.inputAnimations?.shakeError(phoneInput);
        return;
    }
    
    // Normalize handles ALL formats: +966 55 994 8149, 05XXXXXXXX, 966XXXXXXXX, etc.
    const normalizedPhone = normalizePhoneNumber(phone);
    
    if (!validateSaudiNumber(normalizedPhone)) {
        // Give specific error message
        const digits = normalizedPhone.replace(/\D/g, '');
        if (!normalizedPhone.startsWith('9665')) {
            showError('الرقم يجب أن يبدأ بـ 05 أو 9665 — تأكد من صحة الرقم.');
        } else if (digits.length < 12) {
            const missing = 12 - digits.length;
            showError(`الرقم ناقص ${missing} ${missing === 1 ? 'رقم' : 'أرقام'} — الرقم السعودي يتكون من 10 أرقام (05XXXXXXXX).`);
        } else if (digits.length > 12) {
            showError('الرقم طويل جداً — الرقم السعودي يتكون من 10 أرقام (05XXXXXXXX).');
        } else {
            showError('يرجى إدخال رقم جوال سعودي صحيح (يبدأ بـ 05).');
        }
        window.inputAnimations?.shakeError(phoneInput);
        return;
    }
    
    const whatsappLink = `https://wa.me/${normalizedPhone}`;
    
    // Check duplicates
    const existingIndex = AppState.linkHistory.indexOf(whatsappLink);
    if (existingIndex !== -1) {
        showError(`تم إنشاء رابط لهذا الرقم مسبقًا — موجود في السجل رقم ${existingIndex + 1}.`);
        return;
    }
    
    // Generate with brief loading state
    AppState.isGenerating = true;
    generateBtn?.classList.add('loading');
    
    setTimeout(() => {
        showResult(whatsappLink);
        addToHistory(whatsappLink);
        window.inputAnimations?.success(phoneInput);
        window.confetti?.burstFromElement(resultContainer, 30);
        window.toast?.success('تم إنشاء الرابط بنجاح! 🎉');
        AppState.isGenerating = false;
        generateBtn?.classList.remove('loading');
    }, 250);
}

// Show result — safe from XSS since we construct the link ourselves
function showResult(link) {
    const container = document.getElementById('result');
    container.classList.add('has-result');
    
    // Build DOM elements instead of innerHTML for safety
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'result-link';
    
    const icon = document.createElement('i');
    icon.className = 'fab fa-whatsapp';
    icon.setAttribute('aria-hidden', 'true');
    
    const span = document.createElement('span');
    span.textContent = link;
    
    a.appendChild(icon);
    a.appendChild(span);
    container.innerHTML = '';
    container.appendChild(a);
    
    a.animate([
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 400, easing: 'ease-out', fill: 'forwards' });
}

// Show error — safe via textContent
function showError(message) {
    const container = document.getElementById('error');
    container.style.display = 'flex';
    container.innerHTML = '';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-exclamation-circle';
    icon.setAttribute('aria-hidden', 'true');
    
    const span = document.createElement('span');
    span.textContent = message;
    
    container.appendChild(icon);
    container.appendChild(span);
    
    container.animate([
        { opacity: 0, transform: 'translateY(-10px)' },
        { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 300, easing: 'ease-out', fill: 'forwards' });
}

/* ============================================
   📜 HISTORY MANAGEMENT
   ============================================ */
function addToHistory(link) {
    AppState.linkHistory.unshift(link);
    if (AppState.linkHistory.length > AppState.maxHistoryItems) {
        AppState.linkHistory.pop();
    }
    updateHistoryDisplay();
    saveHistoryToStorage();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    const historySection = document.getElementById('history-section');
    const historyBadge = document.querySelector('.history-badge');
    
    historyList.innerHTML = '';
    
    if (AppState.linkHistory.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    if (historyBadge) historyBadge.textContent = AppState.linkHistory.length;
    
    const fragment = document.createDocumentFragment();
    
    AppState.linkHistory.forEach((link, index) => {
        const phoneNumber = link.split('/').pop();
        
        const li = document.createElement('li');
        li.className = 'history-item';
        li.style.animationDelay = `${index * 0.1}s`;
        
        // Build link
        const historyLink = document.createElement('a');
        historyLink.href = link;
        historyLink.target = '_blank';
        historyLink.rel = 'noopener noreferrer';
        historyLink.className = 'history-link';
        
        const whatsappIcon = document.createElement('i');
        whatsappIcon.className = 'fab fa-whatsapp';
        whatsappIcon.setAttribute('aria-hidden', 'true');
        historyLink.appendChild(whatsappIcon);
        historyLink.appendChild(document.createTextNode(' ' + link));
        
        // Actions container
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        
        // Chat button
        const chatBtn = document.createElement('a');
        chatBtn.href = link;
        chatBtn.target = '_blank';
        chatBtn.rel = 'noopener noreferrer';
        chatBtn.className = 'history-btn history-btn-chat';
        chatBtn.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i><span>ابدأ الدردشة</span>';
        
        // Lookup button
        const lookupBtn = document.createElement('button');
        lookupBtn.type = 'button';
        lookupBtn.className = 'history-btn history-btn-lookup';
        lookupBtn.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i><span>استعلام</span>';
        lookupBtn.addEventListener('click', () => lookupFromHistory(phoneNumber));
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'history-btn history-btn-copy';
        copyBtn.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i><span>نسخ الرقم</span>';
        copyBtn.addEventListener('click', () => copyPhoneNumber(phoneNumber));
        
        actions.appendChild(chatBtn);
        actions.appendChild(lookupBtn);
        actions.appendChild(copyBtn);
        
        li.appendChild(historyLink);
        li.appendChild(actions);
        fragment.appendChild(li);
        
        // Animate first item
        if (index === 0) {
            requestAnimationFrame(() => window.historyAnimations?.addItem(li));
        }
    });
    
    historyList.appendChild(fragment);
}

// Copy phone number
async function copyPhoneNumber(phone) {
    const success = await copyToClipboard(phone);
    if (success) {
        window.toast?.success('تم نسخ الرقم! 📋');
    } else {
        window.toast?.error('حدث خطأ أثناء النسخ');
    }
}

/* ============================================
   📤 SHARE
   ============================================ */
async function shareLink() {
    const resultLink = document.querySelector('.result-link');
    if (!resultLink) {
        window.toast?.warning('يرجى إنشاء الرابط أولاً.');
        return;
    }
    
    const link = resultLink.href;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'رابط واتساب',
                text: 'انضم إلى الدردشة عبر واتساب:',
                url: link
            });
            window.toast?.success('تم المشاركة بنجاح! 🚀');
        } catch (err) {
            if (err.name !== 'AbortError') {
                const ok = await copyToClipboard(link);
                if (ok) window.toast?.info('تم نسخ الرابط إلى الحافظة! 📋');
            }
        }
    } else {
        const ok = await copyToClipboard(link);
        if (ok) window.toast?.info('تم نسخ الرابط إلى الحافظة! 📋');
    }
}

/* ============================================
   🔍 LOOKUP
   ============================================ */
function lookupNumber() {
    window.open('https://storage.googleapis.com/ksa-n/index.html', '_blank', 'noopener,noreferrer');
    window.toast?.info('جاري الانتقال للاستعلام... 🔍');
}

function lookupFromHistory(_phoneNumber) {
    window.open('https://storage.googleapis.com/ksa-n/index.html', '_blank', 'noopener,noreferrer');
    window.toast?.info('جاري الانتقال للاستعلام... 🔍');
}

/* ============================================
   🧹 CLEAR INPUT
   ============================================ */
function clearInput() {
    const phoneInput = document.getElementById('phoneNumber');
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    
    phoneInput.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.98)' },
        { transform: 'scale(1)' }
    ], { duration: 200, easing: 'ease-out' });
    
    phoneInput.value = '';
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('has-result');
    errorContainer.innerHTML = '';
    errorContainer.style.display = 'none';
    phoneInput.focus();
    window.toast?.info('تم مسح الحقل 🧹');
}

/* ============================================
   🗑️ CLEAR HISTORY
   ============================================ */
function clearHistory() {
    if (AppState.linkHistory.length === 0) return;
    
    const historyList = document.getElementById('historyList');
    const items = Array.from(historyList.children);
    
    // Animate each item out with stagger
    items.forEach((item, i) => {
        item.style.transition = `all 0.3s ease ${i * 0.05}s`;
        item.style.opacity = '0';
        item.style.transform = 'translateX(50px) scale(0.95)';
    });
    
    // After animation completes, clear data
    setTimeout(() => {
        AppState.linkHistory = [];
        updateHistoryDisplay();
        saveHistoryToStorage();
        window.toast?.success('تم مسح السجل بالكامل! 🗑️');
    }, items.length * 50 + 300);
}

/* ============================================
   💾 LOCAL STORAGE — with error handling
   ============================================ */
function saveHistoryToStorage() {
    try {
        localStorage.setItem('whatsapp_link_history', JSON.stringify(AppState.linkHistory));
    } catch (e) {
        // Storage might be full or disabled
        console.warn('localStorage save failed:', e);
    }
}

function loadHistoryFromStorage() {
    try {
        const saved = localStorage.getItem('whatsapp_link_history');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Validate: must be array of strings starting with https://wa.me/
            if (Array.isArray(parsed) && parsed.every(l => typeof l === 'string' && l.startsWith('https://wa.me/'))) {
                AppState.linkHistory = parsed.slice(0, AppState.maxHistoryItems);
                updateHistoryDisplay();
            }
        }
    } catch (e) {
        console.warn('localStorage load failed:', e);
    }
}

/* ============================================
   ⌨️ KEYBOARD SHORTCUTS
   ============================================ */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Enter to generate (only when phone input is focused)
        if (e.key === 'Enter' && e.target.id === 'phoneNumber') {
            e.preventDefault();
            generateWhatsAppLink();
        }
        
        // Escape to clear
        if (e.key === 'Escape') {
            clearInput();
        }
        
        // Ctrl/Cmd + Shift + C to copy result
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'C') {
            const resultLink = document.querySelector('.result-link');
            if (resultLink) {
                e.preventDefault();
                copyToClipboard(resultLink.href);
                window.toast?.success('تم نسخ الرابط! 📋');
            }
        }
    });
}

/* ============================================
   🎯 INITIALIZATION — No inline onclick!
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Load saved history
    loadHistoryFromStorage();
    
    // Keyboard shortcuts
    initKeyboardShortcuts();
    
    // Bind button events (replacing inline onclick)
    document.getElementById('generateBtn')?.addEventListener('click', generateWhatsAppLink);
    document.getElementById('lookupBtn')?.addEventListener('click', lookupNumber);
    document.getElementById('clearBtn')?.addEventListener('click', clearInput);
    document.getElementById('shareBtn')?.addEventListener('click', shareLink);
    document.getElementById('clearHistoryBtn')?.addEventListener('click', clearHistory);
    
    // Focus input after animations settle
    setTimeout(() => {
        document.getElementById('phoneNumber')?.focus();
    }, 800);
    
    console.log('🚀 WhatsApp Link Generator v0.3 initialized!');
});
