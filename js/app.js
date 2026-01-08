/* ============================================
   🚀 NEON PULSE - MAIN APPLICATION
   WhatsApp Link Generator
   ============================================ */

/* ============================================
   📌 GLOBAL STATE
   ============================================ */

const AppState = {
    linkHistory: [],
    maxHistoryItems: 5,
    isGenerating: false,
    countryCode: '966' // Saudi Arabia
};

/* ============================================
   🔧 UTILITY FUNCTIONS
   ============================================ */

// Convert Arabic numerals to English
function convertArabicNumbers(str) {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    
    let result = '';
    for (let char of str) {
        const index = arabicNumbers.indexOf(char);
        result += index > -1 ? englishNumbers[index] : char;
    }
    return result;
}

// Normalize phone number
function normalizePhoneNumber(phone) {
    // Remove all non-digit characters
    phone = phone.replace(/\D/g, '');
    
    // Remove leading zeros or country code prefix
    if (phone.startsWith('00')) {
        phone = phone.substring(2);
    } else if (phone.startsWith('0')) {
        phone = phone.substring(1);
    }
    
    // Add country code if not present
    if (!phone.startsWith(AppState.countryCode)) {
        phone = AppState.countryCode + phone;
    }
    
    return phone;
}

// Validate Saudi phone number
function validateSaudiNumber(normalizedPhone) {
    // Saudi numbers: 9665XXXXXXXX (12 digits)
    return normalizedPhone.startsWith('9665') && normalizedPhone.length === 12;
}

// Copy text to clipboard
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            input.setSelectionRange(0, 99999);
            document.execCommand('copy');
            document.body.removeChild(input);
            return true;
        }
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
    const generateBtn = document.querySelector('.btn-primary');
    
    // Clear previous states
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('has-result');
    errorContainer.innerHTML = '';
    errorContainer.style.display = 'none';
    
    // Get and clean phone number
    let phone = phoneInput.value.trim();
    phone = convertArabicNumbers(phone);
    
    // Validation
    if (phone === '') {
        showError('يرجى إدخال رقم الهاتف.');
        window.inputAnimations?.shakeError(phoneInput);
        return;
    }
    
    if (!/^\d+$/.test(phone.replace(/[\s\-\+]/g, ''))) {
        showError('يرجى إدخال أرقام فقط.');
        window.inputAnimations?.shakeError(phoneInput);
        return;
    }
    
    const normalizedPhone = normalizePhoneNumber(phone);
    
    if (!validateSaudiNumber(normalizedPhone)) {
        showError('يرجى إدخال رقم جوال سعودي صحيح.');
        window.inputAnimations?.shakeError(phoneInput);
        return;
    }
    
    // Check if link already exists
    const whatsappLink = `https://wa.me/${normalizedPhone}`;
    const existingIndex = AppState.linkHistory.indexOf(whatsappLink);
    
    if (existingIndex !== -1) {
        showError(`تم إنشاء رابط لهذا الرقم مسبقًا وهو موجود في السجل رقم ${existingIndex + 1}.`);
        return;
    }
    
    // Generate link with animation
    AppState.isGenerating = true;
    generateBtn?.classList.add('loading');
    
    setTimeout(() => {
        // Show result
        showResult(whatsappLink);
        
        // Add to history
        addToHistory(whatsappLink);
        
        // Success animations
        window.inputAnimations?.success(phoneInput);
        window.confetti?.burstFromElement(resultContainer, 30);
        window.toast?.success('تم إنشاء الرابط بنجاح! 🎉');
        
        AppState.isGenerating = false;
        generateBtn?.classList.remove('loading');
    }, 300);
}

// Show result
function showResult(link) {
    const resultContainer = document.getElementById('result');
    resultContainer.classList.add('has-result');
    
    resultContainer.innerHTML = `
        <a href="${link}" target="_blank" class="result-link">
            <i class="fab fa-whatsapp"></i>
            <span>${link}</span>
        </a>
    `;
    
    // Animate in
    const resultLink = resultContainer.querySelector('.result-link');
    resultLink.animate([
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' }
    ], {
        duration: 400,
        easing: 'ease-out',
        fill: 'forwards'
    });
}

// Show error
function showError(message) {
    const errorContainer = document.getElementById('error');
    errorContainer.style.display = 'flex';
    errorContainer.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Animate in
    errorContainer.animate([
        { opacity: 0, transform: 'translateY(-10px)' },
        { opacity: 1, transform: 'translateY(0)' }
    ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    });
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
    const historySection = document.querySelector('.history-section');
    const historyBadge = document.querySelector('.history-badge');
    
    historyList.innerHTML = '';
    
    if (AppState.linkHistory.length === 0) {
        historySection.style.display = 'none';
        return;
    }
    
    historySection.style.display = 'block';
    
    // Update badge
    if (historyBadge) {
        historyBadge.textContent = AppState.linkHistory.length;
    }
    
    AppState.linkHistory.forEach((link, index) => {
        const phoneNumber = link.split('/').pop();
        
        const li = document.createElement('li');
        li.className = 'history-item';
        li.style.animationDelay = `${index * 0.1}s`;
        
        li.innerHTML = `
            <a href="${link}" target="_blank" class="history-link">
                <i class="fab fa-whatsapp"></i> ${link}
            </a>
            <div class="history-actions">
                <a href="${link}" target="_blank" class="history-btn history-btn-chat">
                    <i class="fab fa-whatsapp"></i>
                    <span>ابدأ الدردشة</span>
                </a>
                <button class="history-btn history-btn-lookup" onclick="lookupFromHistory('${phoneNumber}')">
                    <i class="fas fa-search"></i>
                    <span>استعلام عن الرقم</span>
                </button>
                <button class="history-btn history-btn-copy" onclick="copyPhoneNumber('${phoneNumber}')">
                    <i class="fas fa-copy"></i>
                    <span>نسخ الرقم</span>
                </button>
            </div>
        `;
        
        historyList.appendChild(li);
        
        // Animate new items
        if (index === 0) {
            window.historyAnimations?.addItem(li);
        }
    });
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
   📤 SHARE FUNCTIONALITY
   ============================================ */

async function shareLink() {
    const resultLink = document.querySelector('.result-link');
    
    if (!resultLink) {
        window.toast?.warning('يرجى إنشاء الرابط أولاً.');
        return;
    }
    
    const link = resultLink.href;
    
    // Use Web Share API if available
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
                console.error('Share failed:', err);
                // Fallback to copy
                await copyAndNotify(link);
            }
        }
    } else {
        // Fallback to copy
        await copyAndNotify(link);
    }
}

async function copyAndNotify(link) {
    const success = await copyToClipboard(link);
    if (success) {
        window.toast?.info('تم نسخ الرابط إلى الحافظة! 📋');
    }
}

/* ============================================
   🔍 LOOKUP NUMBER
   ============================================ */

// Main menu lookup - opens site without phone number
function lookupNumber() {
    const lookupUrl = 'https://storage.googleapis.com/ksa-n/index.html';
    
    // Open in new tab
    window.open(lookupUrl, '_blank');
    
    // Show toast
    window.toast?.info('جاري الانتقال للاستعلام... 🔍');
}

// History lookup - opens site (same URL, no phone param as requested)
function lookupFromHistory(phoneNumber) {
    const lookupUrl = 'https://storage.googleapis.com/ksa-n/index.html';
    
    // Open in new tab
    window.open(lookupUrl, '_blank');
    
    // Show toast
    window.toast?.info('جاري الانتقال للاستعلام... 🔍');
}

/* ============================================
   🧹 CLEAR INPUT
   ============================================ */

function clearInput() {
    const phoneInput = document.getElementById('phoneNumber');
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    
    // Animate clear
    phoneInput.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(0.98)' },
        { transform: 'scale(1)' }
    ], {
        duration: 200,
        easing: 'ease-out'
    });
    
    phoneInput.value = '';
    resultContainer.innerHTML = '';
    resultContainer.classList.remove('has-result');
    errorContainer.innerHTML = '';
    errorContainer.style.display = 'none';
    
    phoneInput.focus();
    
    window.toast?.info('تم مسح الحقل 🧹');
}

/* ============================================
   💾 LOCAL STORAGE
   ============================================ */

function saveHistoryToStorage() {
    try {
        localStorage.setItem('whatsapp_link_history', JSON.stringify(AppState.linkHistory));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadHistoryFromStorage() {
    try {
        const saved = localStorage.getItem('whatsapp_link_history');
        if (saved) {
            AppState.linkHistory = JSON.parse(saved);
            updateHistoryDisplay();
        }
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

/* ============================================
   ⌨️ KEYBOARD SHORTCUTS
   ============================================ */

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Enter to generate
        if (e.key === 'Enter' && e.target.id === 'phoneNumber') {
            e.preventDefault();
            generateWhatsAppLink();
        }
        
        // Escape to clear
        if (e.key === 'Escape') {
            clearInput();
        }
        
        // Ctrl/Cmd + Shift + C to copy result
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
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
   🎯 INITIALIZATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Load saved history
    loadHistoryFromStorage();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Focus input on load
    setTimeout(() => {
        document.getElementById('phoneNumber')?.focus();
    }, 800);
    
    console.log('🚀 WhatsApp Link Generator initialized!');
    console.log('✨ Neon Pulse Theme Active');
});

// Expose functions globally
window.generateWhatsAppLink = generateWhatsAppLink;
window.clearInput = clearInput;
window.shareLink = shareLink;
window.copyPhoneNumber = copyPhoneNumber;
window.lookupNumber = lookupNumber;
window.lookupFromHistory = lookupFromHistory;
