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

/* ── 3D Ring Carousel ───────────────────────────── */
(function initRing() {
  const ring      = document.getElementById('photoRing');
  const stage     = document.getElementById('ringStage');
  const hint      = document.getElementById('ringHint');
  const prevBtn   = document.getElementById('ringPrev');
  const nextBtn   = document.getElementById('ringNext');
  if (!ring || !stage) return;

  const slides    = Array.from(ring.querySelectorAll('.ring-slide'));
  const N         = slides.length;             // 15
  const angleStep = 360 / N;                   // 24°

  // Dynamic radius based on actual rendered slide width (responsive)
  function getRadius() {
    const w = ring.querySelector('.ring-slide')?.offsetWidth || 220;
    return Math.round((w / 2) / Math.tan(Math.PI / N)) + Math.round(w * 0.45);
  }
  let radius = getRadius();

  // Position each panel around the ring
  function positionSlides() {
    radius = getRadius();
    slides.forEach((slide, i) => {
      const angle = angleStep * i;
      slide.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    });
  }
  positionSlides();

  // Reposition on resize (handles orientation change)
  window.addEventListener('resize', () => {
    positionSlides();
  });

  slides.forEach((slide, i) => {
    const angle = angleStep * i;
    slide.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;

    // Set background image
    const imgSrc = slide.dataset.img;
    slide.querySelector('.slide-bg').style.backgroundImage = `url('${imgSrc}')`;

    // Mark missing images as no-img
    const tester = new Image();
    tester.onerror = () => slide.classList.add('no-img');
    tester.src = imgSrc;
  });

  let currentAngle  = 0;    // current rotationY of ring
  let targetAngle   = 0;    // where we're tweening to
  let animId        = null;
  let isDragging    = false;
  let startX        = 0;
  let startAngle    = 0;
  let velocity      = 0;
  let lastX         = 0;
  let lastTime      = 0;

  // Auto-rotate
  let autoRotate = true;
  let autoTimer  = null;

  function scheduleAuto() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(() => { autoRotate = true; }, 3000);
  }

  function setAngle(angle) {
    targetAngle = angle;
    currentAngle = angle;
    ring.style.transform = `rotateY(${angle}deg)`;
    updateParallax(angle);
  }

  function updateParallax(angle) {
    slides.forEach((slide, i) => {
      const bg = slide.querySelector('.slide-bg');
      const panelAngle = angleStep * i;
      const diff = ((angle + panelAngle) % 360 + 360) % 360;
      const offset = (diff / 360) * 60 - 30; // ±30px parallax
      bg.style.transform = `translateX(${offset}px)`;
    });
  }

  // Smooth lerp animation
  function animate() {
    if (autoRotate && !isDragging) {
      targetAngle -= 0.12; // slow auto-spin
    }

    currentAngle += (targetAngle - currentAngle) * 0.06;
    ring.style.transform = `rotateY(${currentAngle}deg)`;
    updateParallax(currentAngle);
    animId = requestAnimationFrame(animate);
  }
  animate();

  // ── Drag (mouse + touch) ──
  function dragStart(e) {
    isDragging   = true;
    autoRotate   = false;
    startX       = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    startAngle   = targetAngle;
    lastX        = startX;
    lastTime     = Date.now();
    velocity     = 0;

    // Hide hint on first drag
    if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; }

    ring.style.cursor = 'grabbing';
    stage.style.cursor = 'grabbing';
  }

  function dragMove(e) {
    if (!isDragging) return;
    const x    = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const now  = Date.now();
    const dt   = now - lastTime || 1;
    velocity   = (x - lastX) / dt * 16;
    lastX      = x;
    lastTime   = now;

    const diff = x - startX;
    targetAngle = startAngle + diff * 0.45;
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    targetAngle += velocity * 8; // momentum flick
    ring.style.cursor = 'grab';
    stage.style.cursor = 'grab';
    scheduleAuto();
  }

  // Drag works anywhere on the page when initiated from gallery section
  const gallerySection = document.getElementById('gallery');

  function isInGallery(e) {
    return gallerySection && gallerySection.contains(e.target);
  }

  // Start drag anywhere inside gallery section
  gallerySection && gallerySection.addEventListener('mousedown', dragStart);
  window.addEventListener('mousemove', dragMove);
  window.addEventListener('mouseup',   dragEnd);

  // Touch — start from anywhere in gallery
  gallerySection && gallerySection.addEventListener('touchstart', dragStart, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (isDragging) e.preventDefault();
    dragMove(e);
  }, { passive: false });
  window.addEventListener('touchend', dragEnd);

  // Also keep stage draggable (fallback)
  stage.addEventListener('mousedown', dragStart);
  stage.addEventListener('touchstart', dragStart, { passive: true });

  // ── Arrow buttons ──
  if (prevBtn) prevBtn.addEventListener('click', () => {
    autoRotate = false;
    targetAngle += angleStep;
    scheduleAuto();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    autoRotate = false;
    targetAngle -= angleStep;
    scheduleAuto();
  });

  // ── Click to open lightbox ──
  slides.forEach(slide => {
    slide.addEventListener('click', (e) => {
      if (Math.abs(slide._dragDelta || 0) > 6) return; // was a drag, not a click
      const img   = slide.dataset.img;
      const title = slide.dataset.title || '';
      if (slide.classList.contains('no-img')) return;
      openLightbox(img, title);
    });
  });

  // Track drag delta on slide to distinguish click vs drag
  slides.forEach(slide => {
    let sx = 0;
    slide.addEventListener('mousedown',  e => { sx = e.clientX; slide._dragDelta = 0; });
    slide.addEventListener('mouseup',    e => { slide._dragDelta = Math.abs(e.clientX - sx); });
    slide.addEventListener('touchstart', e => { sx = e.touches[0].clientX; slide._dragDelta = 0; }, { passive: true });
    slide.addEventListener('touchend',   e => { slide._dragDelta = Math.abs((e.changedTouches[0]?.clientX || sx) - sx); });
  });

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
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
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
}, { threshold: 0.4 });
sections.forEach(s => linkObserver.observe(s));

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
