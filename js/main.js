/* ═══════════════════════════════════════════════════
   GLORYBAGH VILLA — main.js
   Skeleton loader · Nav · Particles · Reveal ·
   Holographic tilt · Lightbox · Burger · Form
═══════════════════════════════════════════════════ */

/* ── Skeleton Loader ─────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('skeletonLoader');
    const main   = document.getElementById('mainContent');
    if (!loader || !main) return;

    loader.classList.add('fade-out');
    main.classList.remove('hidden');

    // Trigger hero reveal after content is shown
    setTimeout(() => {
      loader.style.display = 'none';
      triggerHeroReveal();
    }, 850);
  }, 1200); // min skeleton display time
});

/* ── Hero Reveal ─────────────────────────────────── */
function triggerHeroReveal() {
  const items = document.querySelectorAll('#hero .reveal-up');
  items.forEach(el => el.classList.add('visible'));
}

/* ── Scroll-triggered Reveal ─────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

/* ── Navbar Scroll ───────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ── Burger / Mobile Drawer ──────────────────────── */
const burgerBtn    = document.getElementById('burgerBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerOverlay= document.getElementById('drawerOverlay');
const drawerClose  = document.getElementById('drawerClose');

function openDrawer() {
  mobileDrawer.classList.add('open');
  drawerOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  mobileDrawer.classList.remove('open');
  drawerOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

if (burgerBtn) burgerBtn.addEventListener('click', openDrawer);
if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

/* ── Floating Particles ──────────────────────────── */
function createParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 4 + 1;
    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${Math.random()*100}%;
      animation-duration:${Math.random()*14+10}s;
      animation-delay:${Math.random()*-12}s;
      opacity:0;
    `;
    container.appendChild(p);
  }
}
createParticles();

/* ── Thumbnail Carousel ─────────────────────────── */
(function initCarousel() {
  const track    = document.getElementById('tcTrack');
  const thumbsEl = document.getElementById('tcThumbs');
  const caption  = document.getElementById('tcCaption');
  const counter  = document.getElementById('tcCounter');
  const prevBtn  = document.getElementById('tcPrev');
  const nextBtn  = document.getElementById('tcNext');
  const mainEl   = document.getElementById('tcMain');
  if (!track || !thumbsEl) return;

  const slides = Array.from(track.querySelectorAll('.tc-slide'));
  const total  = slides.length;
  let current  = 0;
  let autoId   = null;

  // ── Build thumbnails ──
  slides.forEach((slide, i) => {
    const img   = slide.querySelector('img');
    const src   = img ? img.src : '';
    const title = slide.dataset.title || '';

    const thumb = document.createElement('button');
    thumb.className = 'tc-thumb' + (i === 0 ? ' active' : '');
    thumb.setAttribute('aria-label', title || `Photo ${i + 1}`);
    thumb.innerHTML = `<img src="${src}" alt="${title}" loading="lazy" />`;
    thumb.addEventListener('click', () => goTo(i));
    thumbsEl.appendChild(thumb);
  });

  const thumbButtons = Array.from(thumbsEl.querySelectorAll('.tc-thumb'));

  // ── Go to slide ──
  function goTo(idx) {
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    current = idx;

    track.style.transform = `translateX(-${current * 100}%)`;

    // Update caption & counter
    caption.textContent  = slides[current].dataset.title || '';
    counter.textContent  = `${current + 1} / ${total}`;

    // Update thumb active state + scroll into view
    thumbButtons.forEach((t, i) => t.classList.toggle('active', i === current));
    // Scroll thumbnail into view within the strip only (not the page)
    const thumbStrip = document.getElementById('tcThumbs');
    if (thumbStrip) {
      const btn = thumbButtons[current];
      const stripRect = thumbStrip.getBoundingClientRect();
      const btnRect   = btn.getBoundingClientRect();
      const offset    = btn.offsetLeft - thumbStrip.offsetLeft - (thumbStrip.offsetWidth / 2) + (btn.offsetWidth / 2);
      thumbStrip.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }

  // ── Arrow buttons ──
  prevBtn && prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(current - 1); resetAuto(); });
  nextBtn && nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(current + 1); resetAuto(); });

  // ── Click main image = open lightbox ──
  mainEl && mainEl.addEventListener('click', (e) => {
    if (e.target.closest('.tc-arrow')) return;
    const img   = slides[current].querySelector('img');
    const title = slides[current].dataset.title || '';
    if (img) openLightbox(img.src, title);
  });

  // ── Keyboard nav ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // ── Touch swipe ──
  let touchStartX = 0;
  mainEl && mainEl.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  mainEl && mainEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
      resetAuto();
    }
  }, { passive: true });

  // ── Auto-advance ──
  function startAuto() {
    autoId = setInterval(() => goTo(current + 1), 4500);
  }
  function resetAuto() {
    clearInterval(autoId);
    startAuto();
  }

  // Init
  goTo(0);
  startAuto();
})();

/* ── Lightbox ────────────────────────────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');

function openLightbox(src, title) {
  lightboxImg.src     = src;
  lightboxImg.alt     = title;
  lightboxCaption.textContent = title;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* ═══════════════════════════════════════════════════
   INQUIRY FORM — EmailJS
   ─────────────────────────────────────────────────
   REPLACE the 3 values below after EmailJS setup.
   Full guide: EMAIL_SETUP.txt
   ═══════════════════════════════════════════════════ */

const EMAILJS_SERVICE_ID  = 'service_p2wf2xh';
const EMAILJS_TEMPLATE_ID = 'template_3j8zzjs';
const EMAILJS_PUBLIC_KEY  = 'tWcf4EgTp_kuJIPi2';

/* ── Inquiry Form ────────────────────────────────── */
const inquiryForm = document.getElementById('inquiryForm');
const formMsg     = document.getElementById('formMsg');
const formSubmit  = document.getElementById('formSubmit');

if (inquiryForm) {
  inquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.className = 'form-msg';

    // ── Validation ──
    const firstName = inquiryForm.firstName.value.trim();
    const lastName  = inquiryForm.lastName.value.trim();
    const email     = inquiryForm.email.value.trim();
    const phone     = inquiryForm.phone.value.trim();
    const guests    = inquiryForm.guests.value;
    const occasion  = inquiryForm.occasion.value;
    const message   = inquiryForm.message.value.trim();

    if (!firstName) {
      showMsg('error', 'Please enter your first name.');
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showMsg('error', 'Please enter a valid email address.');
      return;
    }

    formSubmit.disabled     = true;
    formSubmit.textContent  = 'Sending…';

    // ── EmailJS template variables ──
    const templateParams = {
      from_name  : `${firstName} ${lastName}`.trim(),
      from_email : email,
      phone      : phone    || 'Not provided',
      guests     : guests   || 'Not specified',
      occasion   : occasion || 'Not specified',
      message    : message  || 'No special requests.',
      reply_to   : email,
    };

    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      showMsg('success', '✦ Thank you! We have received your inquiry and will contact you within a few hours.');
      inquiryForm.reset();

    } catch (err) {
      console.error('EmailJS error:', err);
      if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
        showMsg('error', 'Email not configured yet. Please contact us on WhatsApp or call directly.');
      } else {
        showMsg('error', 'Something went wrong. Please try again or contact us on WhatsApp.');
      }

    } finally {
      formSubmit.disabled    = false;
      formSubmit.textContent = 'Send Inquiry';
    }
  });
}

function showMsg(type, text) {
  formMsg.className   = 'form-msg ' + type;
  formMsg.textContent = text;
  formMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Smooth anchor scroll for all nav links ──────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navH   = document.getElementById('navbar')?.offsetHeight || 76;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Active nav link highlight ───────────────────── */
const sections  = document.querySelectorAll('section[id], footer[id]');
const navLinks  = document.querySelectorAll('.nav-link');
const linkObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active',
          link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { threshold: 0.1, rootMargin: '-10% 0px -80% 0px' });
sections.forEach(s => linkObserver.observe(s));

/* ── Amenity Strip — JS scroll + drag ───────────── */
(function initAmStrip() {
  const outer = document.querySelector('.am-scroll-outer');
  const inner = document.querySelector('.am-scroll-inner');
  if (!outer || !inner) return;

  let x          = 0;
  let speed      = 0.7;
  let isDragging = false;
  let startX     = 0;
  let startPos   = 0;
  let lastX      = 0;
  let velocity   = 0;
  let lastTime   = 0;

  function getHalfWidth() {
    return inner.scrollWidth / 2;
  }

  // ── RAF loop ──
  function tick() {
    if (!isDragging) {
      // momentum decay
      if (Math.abs(velocity) > 0.1) {
        x += velocity;
        velocity *= 0.95;
      } else {
        velocity = 0;
        x -= speed;
      }
      // seamless reset
      const half = getHalfWidth();
      if (x <= -half) x += half;
      if (x > 0)      x -= half;
    }
    inner.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(tick);
  }
  tick();

  // ── Get clientX from mouse or touch ──
  function getX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onDragStart(e) {
    isDragging = true;
    startX     = getX(e);
    startPos   = x;
    lastX      = startX;
    lastTime   = Date.now();
    velocity   = 0;
    outer.style.cursor = 'grabbing';
  }

  function onDragMove(e) {
    if (!isDragging) return;
    const cx  = getX(e);
    const now = Date.now();
    const dt  = now - lastTime || 1;
    velocity  = (cx - lastX) / dt * 12;
    lastX     = cx;
    lastTime  = now;
    x = startPos + (cx - startX);
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    outer.style.cursor = 'grab';
  }

  // Mouse
  outer.addEventListener('mousedown',  onDragStart);
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup',   onDragEnd);

  // Touch
  outer.addEventListener('touchstart', onDragStart, { passive: true });
  outer.addEventListener('touchmove',  onDragMove,  { passive: true });
  outer.addEventListener('touchend',   onDragEnd);
})();

/* ── Floating Contact Button ─────────────────────── */
const floatContact = document.getElementById('floatContact');
const floatToggle  = document.getElementById('floatToggle');

if (floatToggle && floatContact) {
  floatToggle.addEventListener('click', () => {
    floatContact.classList.toggle('open');
  });

  // Close when clicking anywhere else on the page
  document.addEventListener('click', (e) => {
    if (!floatContact.contains(e.target)) {
      floatContact.classList.remove('open');
    }
  });
}
