// ===== Hamburger menu =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('site-nav');

const toggleMenu = () => {
  const isOpen = hamburger.classList.toggle('open');
  nav.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  // Prevent body scroll when menu is open on mobile
  document.body.style.overflow = isOpen ? 'hidden' : '';
};

hamburger.addEventListener('click', toggleMenu);

// Close menu when clicking a nav link (mobile)
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 840px)').matches && nav.classList.contains('open')) {
      toggleMenu();
    }
  });
});

// ===== Smooth scroll with header offset (JS ensures consistent behavior) =====
const header = document.querySelector('.header');
function scrollToWithOffset(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const headerHeight = header.getBoundingClientRect().height;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - (headerHeight + 12);
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const hash = a.getAttribute('href');
    if (hash && hash.startsWith('#')) {
      e.preventDefault();
      scrollToWithOffset(hash);
    }
  });
});

// ===== Scroll Reveal with 0.3s stagger per section =====
const STAGGER_MS = 300;

const sectionGroups = Array.from(document.querySelectorAll('section')).map(sec => {
  const items = Array.from(sec.querySelectorAll('.sr'));
  return { sec, items, revealed: false };
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const group = sectionGroups.find(g => g.sec === entry.target);
    if (!group || group.revealed) return;

    group.items.forEach((el, i) => {
      setTimeout(() => el.classList.add('is-visible'), i * STAGGER_MS);
    });

    group.revealed = true; // animate once per section
    io.unobserve(entry.target);
  });
}, { threshold: 0.2 });

sectionGroups.forEach(g => io.observe(g.sec));

// Also reveal hero content immediately on load (in case above-the-fold)
window.addEventListener('load', () => {
  const heroItems = document.querySelectorAll('#home .sr');
  heroItems.forEach((el, i) => {
    setTimeout(() => el.classList.add('is-visible'), i * STAGGER_MS);
  });
});

// ===== Formspree AJAX Submit =====
// Replace the action URL in HTML with your real endpoint: https://formspree.io/f/XXXXYYYY
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('form-submit');

async function handleSubmit(e) {
  e.preventDefault();
  statusEl.textContent = '';
  submitBtn.disabled = true;

  const data = new FormData(form);
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    });

    if (res.ok) {
      form.reset();
      statusEl.textContent = 'Thanks! Your message has been sent.';
    } else {
      const json = await res.json().catch(() => null);
      statusEl.textContent = json && json.errors
        ? json.errors.map(e => e.message).join(', ')
        : 'Oops! There was a problem submitting your form.';
    }
  } catch (err) {
    statusEl.textContent = 'Network error — please try again.';
  } finally {
    submitBtn.disabled = false;
  }
}

if (form) form.addEventListener('submit', handleSubmit);
