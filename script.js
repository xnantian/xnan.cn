const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const siteHeader = document.querySelector('[data-header]');
const hero = document.querySelector('.hero');
const heroImage = document.querySelector('[data-hero-image]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setNavigation(open) {
  if (!navToggle || !mobileNav) return;

  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  mobileNav.hidden = !open;
  document.body.classList.toggle('nav-open', open);
}

navToggle?.addEventListener('click', () => {
  setNavigation(navToggle.getAttribute('aria-expanded') !== 'true');
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setNavigation(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setNavigation(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) setNavigation(false);
});

function updateHeader() {
  siteHeader?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

let parallaxFrame;

function setHeroParallax(event) {
  if (!heroImage || reduceMotion.matches || window.innerWidth < 901) return;

  const bounds = hero.getBoundingClientRect();
  const xRatio = (event.clientX - bounds.left) / bounds.width - 0.5;
  const yRatio = (event.clientY - bounds.top) / bounds.height - 0.5;

  window.cancelAnimationFrame(parallaxFrame);
  parallaxFrame = window.requestAnimationFrame(() => {
    heroImage.style.setProperty('--hero-x', `${xRatio * -12}px`);
    heroImage.style.setProperty('--hero-y', `${yRatio * -8}px`);
  });
}

function resetHeroParallax() {
  if (!heroImage) return;
  heroImage.style.setProperty('--hero-x', '0px');
  heroImage.style.setProperty('--hero-y', '0px');
}

hero?.addEventListener('pointermove', setHeroParallax, { passive: true });
hero?.addEventListener('pointerleave', resetHeroParallax);
reduceMotion.addEventListener?.('change', resetHeroParallax);

const copyStatus = document.querySelector('[data-copy-status]');
const toast = document.createElement('div');
toast.className = 'toast';
toast.setAttribute('role', 'status');
toast.setAttribute('aria-live', 'polite');
document.body.appendChild(toast);

let toastTimer;

function showCopyFeedback(message) {
  if (copyStatus) copyStatus.textContent = message;
  toast.textContent = message;
  toast.classList.add('toast-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('toast-visible');
    if (copyStatus) copyStatus.textContent = '';
  }, 2400);
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = value;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand('copy');
  helper.remove();

  if (!copied) throw new Error('Copy failed');
}

document.querySelectorAll('[data-copy-wechat]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await copyText(button.dataset.copyWechat);
      showCopyFeedback(`微信号 ${button.dataset.copyWechat} 已复制`);
    } catch {
      showCopyFeedback(`请手动添加微信：${button.dataset.copyWechat}`);
    }
  });
});
