/* ============================================
   SQUEEN668 RTP SCANNER — JavaScript
   Slot game data generated from 99laju.net
   Run: python3 generate_99laju_slot_data.py
   ============================================ */

// ==========================================
// DATA SOURCE
// ==========================================
const GAME_DATABASE = window.SQUEEN668_GAME_DATABASE || {};
const PROVIDER_ORDER = window.SQUEEN668_PROVIDER_ORDER || Object.keys(GAME_DATABASE);

// ==========================================
// TIME-SEEDED PRNG (deterministic RTP within time window)
// ==========================================
function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}

function getTimeSeed(provider, intervalMinutes) {
    const slot = Math.floor(Date.now() / (intervalMinutes * 60 * 1000));
    let hash = 0;
    const str = provider + '-' + slot + '-30-97-85-65-10-30';
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return hash;
}

const SCANNER_CONFIG = {
    minRtp: 30, maxRtp: 97,
    hotThreshold: 85, warmThreshold: 65,
    hotPercent: 10, warmPercent: 30,
    seedInterval: 60
};

// ==========================================
// STATE
// ==========================================
let currentProvider = (window.SQUEEN668_DEFAULT_PROVIDER && GAME_DATABASE[window.SQUEEN668_DEFAULT_PROVIDER]
    ? window.SQUEEN668_DEFAULT_PROVIDER
    : PROVIDER_ORDER[0]) || '';
let currentFilter = 'all';
let currentGames = [];
let isScanning = false;

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    buildProviderGrid();
    initTypingEffect();
    initFilterTabs();
    initSortSelect();
    initBottomNav();
    initMatrixRain();
    initDeviceIntel();
    initCarousel();
    loadGames(currentProvider);
    updateTimestamp();
    setInterval(updateTimestamp, 60000);
    setInterval(function() { loadGames(currentProvider); }, SCANNER_CONFIG.seedInterval * 60 * 1000);
});

// ==========================================
// BANNER CAROUSEL
// ==========================================
var carouselCurrent = 0;
var carouselTotal = 0;
var carouselTimer = null;

function initCarousel() {
    var track = document.getElementById('carouselTrack');
    var dotsContainer = document.getElementById('carouselDots');
    if (!track || !dotsContainer) return;

    var slides = track.querySelectorAll('.carousel-slide');
    carouselTotal = slides.length;
    if (carouselTotal === 0) return;

    // Build dots
    dotsContainer.innerHTML = '';
    for (var i = 0; i < carouselTotal; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', function() {
            goToSlide(parseInt(this.getAttribute('data-index')));
        });
        dotsContainer.appendChild(dot);
    }

    // Arrow buttons
    var prevBtn = document.getElementById('carouselPrev');
    var nextBtn = document.getElementById('carouselNext');
    if (prevBtn) prevBtn.addEventListener('click', function() { goToSlide(carouselCurrent - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { goToSlide(carouselCurrent + 1); });

    // Swipe support
    var carousel = document.querySelector('.banner-carousel');
    if (carousel) {
        var startX = 0;
        carousel.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
        carousel.addEventListener('touchend', function(e) {
            var diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                goToSlide(diff > 0 ? carouselCurrent + 1 : carouselCurrent - 1);
            }
        }, { passive: true });
    }

    // Auto-play
    startCarouselTimer();
}

function goToSlide(index) {
    if (carouselTotal === 0) return;
    carouselCurrent = ((index % carouselTotal) + carouselTotal) % carouselTotal;
    var track = document.getElementById('carouselTrack');
    track.style.transform = 'translateX(-' + (carouselCurrent * (100 / carouselTotal)) + '%)';

    // Update dots
    var dots = document.querySelectorAll('.carousel-dot');
    dots.forEach(function(d, i) {
        d.classList.toggle('active', i === carouselCurrent);
    });

    // Reset auto-play timer
    startCarouselTimer();
}

function startCarouselTimer() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(function() {
        goToSlide(carouselCurrent + 1);
    }, 4000);
}

// ==========================================
// BUILD PROVIDER GRID
// ==========================================
function buildProviderGrid() {
    var grid = document.getElementById('providerGrid');
    if (!grid) return;
    grid.innerHTML = '';
    PROVIDER_ORDER.forEach(function(key, i) {
        var p = GAME_DATABASE[key];
        if (!p) return;
        var btn = document.createElement('button');
        btn.className = 'provider-card' + (i === 0 ? ' active' : '');
        btn.setAttribute('data-provider', key);
        btn.innerHTML = '<div class="provider-icon"><img src="' + p.logo + '" alt="' + p.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(\'' + p.name + '\')"></div><span class="provider-name">' + p.name + '</span><span class="provider-check">✓</span>';
        btn.addEventListener('click', function() {
            if (isScanning) return;
            grid.querySelectorAll('.provider-card').forEach(function(c) { c.classList.remove('active'); });
            btn.classList.add('active');
            currentProvider = key;
            startScan();
        });
        grid.appendChild(btn);
    });
}

// ==========================================
// MATRIX RAIN
// ==========================================
function initMatrixRain() {
    var canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var chars = '01アイウエオカキ@#$%&ABCDEF0123456789';
    var fontSize = 12;
    var columns, drops;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; columns = Math.floor(canvas.width / fontSize); drops = new Array(columns).fill(1); }
    resize();
    window.addEventListener('resize', resize);
    setInterval(function() {
        ctx.fillStyle = 'rgba(5, 10, 15, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < columns; i++) {
            var c = chars[Math.floor(Math.random() * chars.length)];
            var b = Math.random();
            ctx.fillStyle = b > 0.7 ? 'rgba(255,107,0,0.35)' : b > 0.4 ? 'rgba(255,140,66,0.2)' : 'rgba(255,80,0,0.1)';
            ctx.font = fontSize + 'px monospace';
            ctx.fillText(c, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }, 60);
}

// ==========================================
// DEVICE INTELLIGENCE
// ==========================================
function initDeviceIntel() {
    var panel = document.getElementById('deviceIntel');
    if (!panel) return;
    var info = { device: 'Unknown', screen: window.screen.width + '×' + window.screen.height, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language, network: '—', isp: '—', location: '—', ip: '•••.•••.•••.•••' };
    var ua = navigator.userAgent;
    if (/iPhone/.test(ua)) { var m = ua.match(/iPhone\s?OS\s([\d_]+)/); info.device = 'iPhone (iOS ' + (m ? m[1].replace(/_/g, '.') : '') + ')'; }
    else if (/Android/.test(ua)) { var m2 = ua.match(/Android\s([\d.]+);\s*([^;)]+)/); info.device = m2 ? m2[2].trim() + ' (Android ' + m2[1] + ')' : 'Android Device'; }
    else if (/Windows/.test(ua)) info.device = 'Windows PC';
    else if (/Mac/.test(ua)) info.device = 'MacOS';
    try { var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection; if (conn) { info.network = (conn.effectiveType || conn.type || 'unknown').toUpperCase(); if (info.network === '4G') info.network = '4G LTE'; } } catch(e) {}
    fetch('https://ip-api.com/json/?fields=query,isp,city,country').then(function(r) { return r.json(); }).then(function(geo) {
        info.isp = geo.isp || '—'; info.location = (geo.city || '') + ', ' + (geo.country || '');
        var parts = (geo.query || '').split('.'); if (parts.length === 4) info.ip = parts[0] + '.' + parts[1] + '.xxx.' + parts[3];
        renderDevicePanel(info);
    }).catch(function() { renderDevicePanel(info); });
}

function renderDevicePanel(info) {
    var panel = document.getElementById('deviceIntel');
    if (!panel) return;
    panel.innerHTML = '<div class="intel-header"><span>📡</span><span>DEVICE INTELLIGENCE</span><span class="intel-live">● LIVE</span></div><div class="intel-grid">' +
        '<div class="intel-row"><span>📱</span><span>Device</span><span>' + info.device + '</span></div>' +
        '<div class="intel-row"><span>🌐</span><span>ISP</span><span>' + info.isp + '</span></div>' +
        '<div class="intel-row"><span>📍</span><span>Location</span><span>' + info.location + '</span></div>' +
        '<div class="intel-row"><span>📶</span><span>Network</span><span>' + info.network + '</span></div>' +
        '<div class="intel-row"><span>🖥️</span><span>Screen</span><span>' + info.screen + '</span></div>' +
        '<div class="intel-row"><span>🕐</span><span>Timezone</span><span>' + info.timezone + '</span></div>' +
        '<div class="intel-row"><span>🔒</span><span>IP</span><span class="intel-ip">' + info.ip + '</span></div></div>';
}

// ==========================================
// TYPING EFFECT
// ==========================================
function initTypingEffect() {
    var texts = ['Initializing RTP Scanner v4.2.1...', 'Connecting to game servers...', 'Scanning slot RTP data...', 'SQUEEN668 Scanner READY.'];
    var ti = 0, ci = 0;
    var el = document.getElementById('typedText');
    if (!el) return;
    function typeNext() {
        if (ti >= texts.length) ti = 0;
        if (ci < texts[ti].length) { el.textContent += texts[ti].charAt(ci); ci++; setTimeout(typeNext, 40 + Math.random() * 30); }
        else { setTimeout(function() { el.textContent = ''; ci = 0; ti++; typeNext(); }, 2000); }
    }
    typeNext();
}

// ==========================================
// HELPERS
// ==========================================
function randHex(len) { len = len || 8; var r = ''; for (var i = 0; i < len; i++) r += Math.floor(Math.random() * 16).toString(16).toUpperCase(); return r; }
function randIP() { return (Math.floor(Math.random() * 200 + 10)) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255); }
function randPort() { return Math.floor(Math.random() * 9000 + 1000); }
function getStatusLabel(s) { return s === 'hot' ? '🔥 HOT' : s === 'warm' ? '⚡ WARM' : '❄️ COLD'; }
function getStatusEmoji(s) { return s === 'hot' ? '🔥' : s === 'warm' ? '⚡' : '❄️'; }

window.getFallbackImage = function(gameName) {
    if (!gameName) gameName = "GAME";
    var words = gameName.split(' ');
    var initials = words.length > 1 ? (words[0][0] + words[1][0]) : gameName.substring(0, 2);
    initials = initials.toUpperCase();
    var hash = 0;
    for (var i = 0; i < gameName.length; i++) hash = gameName.charCodeAt(i) + ((hash << 5) - hash);
    var colors = ['#FF6B00', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
    var color = colors[Math.abs(hash) % colors.length];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<rect width="100" height="100" fill="#0F141C" />' +
        '<rect width="100" height="100" fill="url(#grad)" opacity="0.4" />' +
        '<defs>' +
            '<radialGradient id="grad" cx="50%" cy="50%" r="50%">' +
                '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.8"/>' +
                '<stop offset="100%" stop-color="#0F141C" stop-opacity="0"/>' +
            '</radialGradient>' +
        '</defs>' +
        '<circle cx="50" cy="50" r="35" fill="none" stroke="' + color + '" stroke-width="2" stroke-dasharray="4 4" opacity="0.3" />' +
        '<text x="50%" y="54%" font-family="sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle" letter-spacing="2" style="text-shadow: 0 0 10px ' + color + '">' + initials + '</text>' +
        '</svg>';
    return 'data:image/svg+xml;base64,' + btoa(svg);
};

// ==========================================
// HACKER TERMINAL SCAN LOG
// ==========================================
function runTerminalScan(providerName, onComplete) {
    var termBody = document.getElementById('terminalLog');
    var termProgress = document.getElementById('termProgressBar');
    var termPercent = document.getElementById('termPercent');
    if (!termBody) { onComplete(); return; }
    var ip = randIP(), session = randHex(12), port = randPort(), gc = Math.floor(Math.random() * 10 + 15);
    var lines = [
        { text: '[SYS] Initializing SQUEEN668 Scanner v4.2.1...', type: 'info', delay: 300 },
        { text: '[NET] Resolving DNS → sq668-sg1.internal.io', type: 'normal', delay: 500 },
        { text: '[NET] Connection established: ' + ip + ':' + port, type: 'normal', delay: 400 },
        { text: '[AUTH] Authenticating session: ' + session, type: 'normal', delay: 600 },
        { text: '[AUTH] Session verified ✓', type: 'success', delay: 300 },
        { text: '[SCAN] Target: ' + providerName + ' • SQUEEN668', type: 'info', delay: 400 },
        { text: '[SCAN] Accessing RTP memory block 0x' + randHex(4) + '...', type: 'normal', delay: 500 },
        { text: '[WARN] Firewall detected — bypassing...', type: 'warning', delay: 700 },
        { text: '[SCAN] Firewall bypassed ✓', type: 'success', delay: 400 },
        { text: '[DATA] Reading slot tables: ' + gc + ' entries found', type: 'normal', delay: 500 },
        { text: '[DATA] Decrypting percentage values [AES-256]...', type: 'normal', delay: 600 },
        { text: '[DATA] Mapping RTP distributions...', type: 'normal', delay: 400 },
        { text: '[DATA] Cross-referencing hot patterns [0x' + randHex(4) + ']', type: 'normal', delay: 500 },
        { text: '[CALC] Running probability analysis...', type: 'normal', delay: 400 },
        { text: '[SYS] Compiling results ██████████ 100%', type: 'info', delay: 300 },
        { text: '[DONE] Scan complete — ' + gc + ' games analyzed ✓', type: 'success', delay: 200 },
    ];
    termBody.innerHTML = '';
    var cumDelay = 0;
    lines.forEach(function(line, i) {
        cumDelay += line.delay;
        setTimeout(function() {
            var div = document.createElement('div');
            div.className = 'term-line term-' + line.type;
            if (i === lines.length - 1) div.classList.add('term-latest');
            div.textContent = line.text;
            termBody.appendChild(div);
            termBody.scrollTop = termBody.scrollHeight;
            var pct = Math.round(((i + 1) / lines.length) * 100);
            if (termProgress) termProgress.style.width = pct + '%';
            if (termPercent) termPercent.textContent = 'sq668_scanner.exe — ' + pct + '%';
            if (i === lines.length - 1) setTimeout(onComplete, 500);
        }, cumDelay);
    });
}

// ==========================================
// SCANNING FLOW
// ==========================================
function startScan() {
    if (isScanning) return;
    isScanning = true;
    var scanSection = document.getElementById('scanningSection');
    var resultsSection = document.getElementById('resultsSection');
    var gameList = document.getElementById('gameList');
    var top3Section = document.getElementById('top3Section');
    var pName = GAME_DATABASE[currentProvider] ? GAME_DATABASE[currentProvider].name : currentProvider.toUpperCase();
    scanSection.style.display = 'block';
    resultsSection.style.display = 'none';
    gameList.innerHTML = '';
    if (top3Section) top3Section.innerHTML = '';
    var sd = document.getElementById('scanDetail');
    if (sd) sd.textContent = 'Target: ' + pName + ' • SQUEEN668';
    scanSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    runTerminalScan(pName, function() {
        var flash = document.getElementById('scanFlash');
        if (flash) { flash.classList.add('active'); setTimeout(function() { flash.classList.remove('active'); }, 400); }
        document.body.classList.add('scan-shake');
        setTimeout(function() { document.body.classList.remove('scan-shake'); }, 500);
        scanSection.style.display = 'none';
        resultsSection.style.display = 'block';
        isScanning = false;
        loadGames(currentProvider);
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

// ==========================================
// GENERATE RTP (time-seeded)
// ==========================================
function generateResults(providerKey) {
    var provider = GAME_DATABASE[providerKey];
    if (!provider) return [];
    var allGames = provider.games;
    var seed = getTimeSeed(providerKey, SCANNER_CONFIG.seedInterval);
    var rand = seededRandom(seed);
    var cfg = SCANNER_CONFIG;
    return allGames.map(function(g, i) {
        var tierRoll = rand() * 100;
        var rtp, status;
        var gameRand = seededRandom(seed + i + 1);
        gameRand();
        if (tierRoll < cfg.hotPercent) { rtp = Math.floor(gameRand() * (cfg.maxRtp - cfg.hotThreshold + 1) + cfg.hotThreshold); status = 'hot'; }
        else if (tierRoll < cfg.hotPercent + cfg.warmPercent) { rtp = Math.floor(gameRand() * (cfg.hotThreshold - cfg.warmThreshold) + cfg.warmThreshold); status = 'warm'; }
        else { rtp = Math.floor(gameRand() * (cfg.warmThreshold - cfg.minRtp) + cfg.minRtp); status = 'cold'; }
        return { name: g.name, img: g.img, provider: provider.name, rtp: rtp, status: status };
    }).sort(function(a, b) { return b.rtp - a.rtp; });
}

function loadGames(providerKey) {
    currentGames = generateResults(providerKey);
    currentGames.forEach(function(g, i) { g.rank = i + 1; });
    updateStats();
    renderTop3();
    renderGames();
}

// ==========================================
// SVG CIRCULAR GAUGE
// ==========================================
function createRtpGauge(rtp, size) {
    size = size || 52;
    var sw = 4, r = (size - sw) / 2, c = 2 * Math.PI * r, o = c - (rtp / 100) * c;
    var color = rtp >= 85 ? '#22C55E' : rtp >= 65 ? '#F59E0B' : '#EF4444';
    return '<div class="rtp-gauge" style="width:' + size + 'px;height:' + size + 'px"><svg viewBox="0 0 ' + size + ' ' + size + '"><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="' + sw + '"/><circle cx="' + (size/2) + '" cy="' + (size/2) + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + o + '" class="gauge-fill" transform="rotate(-90 ' + (size/2) + ' ' + (size/2) + ')"/></svg><span class="gauge-text" style="color:' + color + '">' + rtp + '%</span></div>';
}

// ==========================================
// TOP 3 PODIUM
// ==========================================
function renderTop3() {
    var section = document.getElementById('top3Section');
    if (!section || currentGames.length < 3) return;
    var top3 = currentGames.slice(0, 3);
    var medals = ['👑', '🥈', '🥉'], classes = ['gold', 'silver', 'bronze'];
    var html = '<h3 class="top3-heading">🏆 Top 3 Game Terpanas</h3><div class="top3-cards">';
    top3.forEach(function(game, i) {
        html += '<div class="top3-card top3-' + classes[i] + '" style="animation-delay:' + (i * 0.15) + 's"><span class="top3-medal">' + medals[i] + '</span><div class="top3-thumb"><img src="' + game.img + '" alt="' + game.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><span class="top3-name">' + game.name + '</span>' + createRtpGauge(game.rtp, 50) + '<span class="top3-status top3-status-' + game.status + '">' + getStatusLabel(game.status) + '</span></div>';
    });
    section.innerHTML = html + '</div>';
}

// ==========================================
// STATS
// ==========================================
function updateStats() {
    var hot = currentGames.filter(function(g) { return g.status === 'hot'; }).length;
    var warm = currentGames.filter(function(g) { return g.status === 'warm'; }).length;
    var cold = currentGames.filter(function(g) { return g.status === 'cold'; }).length;
    animateCounter('statHot', hot); animateCounter('statWarm', warm); animateCounter('statCold', cold);
    document.getElementById('statProviders').textContent = PROVIDER_ORDER.length;
    document.getElementById('totalGames').textContent = currentGames.length;
}
function animateCounter(id, target) {
    var el = document.getElementById(id); if (!el) return;
    var cur = parseInt(el.textContent) || 0; if (cur === target) return;
    var step = target > cur ? 1 : -1;
    var t = setInterval(function() { cur += step; el.textContent = cur; if (cur === target) clearInterval(t); }, 50);
}

// ==========================================
// RENDER GAMES
// ==========================================
function renderGames() {
    var gameList = document.getElementById('gameList');
    if (!gameList) return;
    var filtered = currentFilter === 'all' ? currentGames.slice(3) : currentGames.filter(function(g) { return g.status === currentFilter; });
    gameList.innerHTML = '';
    if (!filtered.length) { gameList.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-dim);font-size:12px;">Tiada game ditemui untuk filter ini.</div>'; return; }
    filtered.forEach(function(game, index) {
        var card = document.createElement('div');
        card.className = 'game-card ' + game.status;
        card.style.animationDelay = (index * 0.04) + 's';
        var rankNum = currentFilter === 'all' ? index + 4 : index + 1;
        card.innerHTML = '<div class="game-rank">#' + rankNum + '</div><div class="game-thumb"><img src="' + game.img + '" alt="' + game.name + '" onerror="this.onerror=null; this.src=window.getFallbackImage(this.alt)"></div><div class="game-info"><div class="game-name">' + game.name + '</div><div class="game-provider-name">' + game.provider + '</div><div class="game-rtp-bar"><div class="game-rtp-fill ' + game.status + '" style="width:0%"></div></div></div><div class="game-rtp-value">' + createRtpGauge(game.rtp, 48) + '<span class="rtp-label ' + game.status + '">' + getStatusEmoji(game.status) + ' ' + game.status.toUpperCase() + '</span></div>';
        gameList.appendChild(card);
        setTimeout(function() { var fill = card.querySelector('.game-rtp-fill'); if (fill) fill.style.width = Math.max(0, Math.min(100, ((game.rtp - 25) / 75) * 100)) + '%'; }, 100 + index * 60);
    });
}

// ==========================================
// FILTER / SORT / NAV
// ==========================================
function initFilterTabs() {
    document.querySelectorAll('.filter-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active'); currentFilter = this.getAttribute('data-filter'); renderGames();
        });
    });
}
function initSortSelect() {
    var select = document.getElementById('sortSelect'); if (!select) return;
    select.addEventListener('change', function() {
        if (this.value === 'rtp-desc') currentGames.sort(function(a, b) { return b.rtp - a.rtp; });
        else if (this.value === 'rtp-asc') currentGames.sort(function(a, b) { return a.rtp - b.rtp; });
        else if (this.value === 'name') currentGames.sort(function(a, b) { return a.name.localeCompare(b.name); });
        currentGames.forEach(function(g, i) { g.rank = i + 1; }); renderTop3(); renderGames();
    });
}
function initBottomNav() {
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function(e) { e.preventDefault(); document.querySelectorAll('.nav-item').forEach(function(i) { i.classList.remove('active'); }); this.classList.add('active'); });
    });
}
function updateTimestamp() {
    var el = document.getElementById('lastUpdate'); if (el) el.textContent = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
}

// ==========================================
// SHARE
// ==========================================
function shareResults(method) {
    if (!currentGames.length) return;
    var pName = GAME_DATABASE[currentProvider] ? GAME_DATABASE[currentProvider].name : currentProvider;
    var now = new Date().toLocaleString('ms-MY');
    var top5 = currentGames.slice(0, 5);
    var text = '🛡️ *SQUEEN668 SCAN RESULT*\n🎮 Provider: ' + pName + '\n📅 ' + now + '\n────────────────────\n\n🏆 *TOP 5 GAME:*\n\n';
    top5.forEach(function(g, i) { text += (i+1) + '. ' + g.name + '\n   RTP: ' + g.rtp + '% ' + getStatusEmoji(g.status) + ' ' + g.status.toUpperCase() + '\n\n'; });
    text += '────────────────────\n🚀 Scan PERCUMA di SQUEEN668!\n';
    if (method === 'whatsapp') window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    else if (method === 'telegram') window.open('https://t.me/share/url?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(text), '_blank');
    else navigator.clipboard.writeText(text).then(function() { var btn = document.querySelector('.share-btn-copy span'); if (btn) { btn.textContent = '✅'; setTimeout(function() { btn.textContent = '📋'; }, 2000); } });
}

window.startScan = startScan;
window.shareResults = shareResults;
console.log('%c SQUEEN668 RTP Scanner v4.2.1 ', 'background: #ff6b00; color: white; font-weight: bold; padding: 5px 10px; border-radius: 5px;');
