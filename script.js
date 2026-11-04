const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const scrollProgress = document.querySelector('.scroll-progress span');
const cursorGlow = document.querySelector('.cursor-glow');
const hero = document.querySelector('.hero');
const heroReel = document.querySelector('.hero-reel');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');
const lightboxCount = lightbox.querySelector('.lightbox-count');
// 图片缺失时显示渐变占位卡片
document.querySelectorAll('.cover-slot img').forEach((img) => {
  const markMissing = () => img.closest('.cover-slot').classList.add('is-missing');
  if (img.complete && img.naturalWidth === 0) markMissing();
  img.addEventListener('error', markMissing);
});

const getTriggers = () => [...document.querySelectorAll('.image-trigger')]
  .filter((el) => !el.classList.contains('is-missing') && el.querySelector('img'));
let imageTriggers = getTriggers();

const setHeaderState = () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
};

setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });
window.addEventListener('resize', setHeaderState, { passive: true });

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-delay]').forEach((element) => {
  element.style.setProperty('--delay', `${element.dataset.delay}ms`);
});

const revealAll = () => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
window.addEventListener('beforeprint', revealAll);

const revealObserver = !('IntersectionObserver' in window) ? null : new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

if (revealObserver) document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
else revealAll();

let activeImageIndex = 0;
let lastFocusedElement = null;

const showLightboxImage = () => {
  const trigger = imageTriggers[activeImageIndex];
  const image = trigger.querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCount.textContent = `${activeImageIndex + 1} / ${imageTriggers.length}`;
};

const openLightbox = (trigger) => {
  imageTriggers = getTriggers();
  if (!imageTriggers.includes(trigger)) return;
  activeImageIndex = imageTriggers.indexOf(trigger);
  lastFocusedElement = trigger;
  showLightboxImage();
  lightbox.hidden = false;
  document.body.classList.add('no-scroll');
  lightboxClose.focus();
};

const moveLightbox = (direction) => {
  activeImageIndex = (activeImageIndex + direction + imageTriggers.length) % imageTriggers.length;
  showLightboxImage();
};

const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.src = '';
  document.body.classList.remove('no-scroll');
  if (lastFocusedElement) lastFocusedElement.focus();
};

document.querySelectorAll('.image-trigger').forEach((trigger) => {
  trigger.addEventListener('click', () => openLightbox(trigger));
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(trigger);
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => moveLightbox(-1));
lightboxNext.addEventListener('click', () => moveLightbox(1));
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});

const methodButtons = [...document.querySelectorAll('.method-step')];
const methodNumber = document.querySelector('[data-method-number]');
const methodTitle = document.querySelector('[data-method-title]');
const methodSummary = document.querySelector('[data-method-summary]');

const selectMethod = (button) => {
  methodButtons.forEach((item) => {
    const selected = item === button;
    item.setAttribute('aria-selected', String(selected));
    item.closest('li').classList.toggle('is-active', selected);
  });
  methodNumber.textContent = button.dataset.step;
  methodTitle.textContent = button.dataset.title;
  methodSummary.textContent = button.dataset.summary;
};

methodButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectMethod(button));
  button.addEventListener('keydown', (event) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1;
    const nextIndex = (index + direction + methodButtons.length) % methodButtons.length;
    methodButtons[nextIndex].focus();
    selectMethod(methodButtons[nextIndex]);
  });
});

const finePointer = window.matchMedia('(pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (finePointer) {
  let cursorFrame;
  let cursorX = 0;
  let cursorY = 0;
  window.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    if (cursorFrame) return;
    cursorFrame = requestAnimationFrame(() => {
      cursorGlow.style.left = `${cursorX}px`;
      cursorGlow.style.top = `${cursorY}px`;
      cursorGlow.classList.add('is-active');
      cursorFrame = null;
    });
  }, { passive: true });
  document.addEventListener('mouseleave', () => cursorGlow.classList.remove('is-active'));
}

if (finePointer && !reduceMotion && hero && heroReel) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroReel.style.transform = `translate3d(${x * 12}px, ${y * 12}px, 0)`;
  }, { passive: true });

  hero.addEventListener('pointerleave', () => {
    heroReel.style.transform = '';
  });
}
