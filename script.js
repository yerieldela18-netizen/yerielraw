const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
const entryGate = document.querySelector('#entry-gate');
const enterWithMusic = document.querySelector('#enter-with-music');
const enterWithoutMusic = document.querySelector('#enter-without-music');
const siteAudio = document.querySelector('#site-audio');
const musicToggle = document.querySelector('#music-toggle');
const musicLabel = musicToggle?.querySelector('.music-label');
let hasStarted = false;
let musicPlaying = false;

const setMusicState = (playing) => {
  musicPlaying = playing;
  musicToggle?.setAttribute('aria-pressed', String(playing));
  musicToggle?.setAttribute('aria-label', playing ? 'Pausar música' : 'Activar música');
  if (musicLabel) musicLabel.textContent = playing ? 'Sonando' : 'Sonido';
};

const startMusic = async () => {
  if (!siteAudio) return;
  if (!hasStarted) siteAudio.currentTime = 39;
  siteAudio.volume = .55;
  try {
    await siteAudio.play();
    hasStarted = true;
    setMusicState(true);
  } catch {
    setMusicState(false);
    if (musicLabel) musicLabel.textContent = 'Tocar para sonar';
  }
};

const pauseMusic = () => {
  siteAudio?.pause();
  setMusicState(false);
};

siteAudio?.addEventListener('play', () => setMusicState(true));
siteAudio?.addEventListener('pause', () => setMusicState(false));
siteAudio?.addEventListener('ended', async () => {
  siteAudio.currentTime = 39;
  try {
    await siteAudio.play();
  } catch {
    setMusicState(false);
  }
});
siteAudio?.addEventListener('error', () => {
  musicToggle?.setAttribute('disabled', '');
  if (musicLabel) musicLabel.textContent = 'Sin sonido';
});

const closeEntry = () => {
  if (!entryGate) return;
  entryGate.classList.add('is-leaving');
  document.body.classList.remove('gate-open');
  window.setTimeout(() => {
    entryGate.hidden = true;
    entryGate.classList.remove('is-leaving');
  }, 420);
};

if (entryGate) {
  entryGate.hidden = false;
  document.body.classList.add('gate-open');
  window.requestAnimationFrame(() => enterWithoutMusic?.focus());
}

enterWithMusic?.addEventListener('click', async () => {
  await startMusic();
  closeEntry();
});

enterWithoutMusic?.addEventListener('click', () => {
  siteAudio?.pause();
  setMusicState(false);
  closeEntry();
});

musicToggle?.addEventListener('click', async () => {
  if (musicPlaying) pauseMusic();
  else await startMusic();
});

menuButton?.addEventListener('click', () => {
  const isOpen = nav?.classList.toggle('open') ?? false;
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('click', (event) => {
  if (!nav?.classList.contains('open')) return;
  if (nav.contains(event.target) || menuButton?.contains(event.target)) return;
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const photoGrid = document.querySelector('#photo-grid');
const photoViewer = document.querySelector('#photo-viewer');
const viewerImage = document.querySelector('#viewer-image');
const gallery = Array.isArray(window.YERIEL_DRIVE_GALLERY)
  ? window.YERIEL_DRIVE_GALLERY
  : window.YERIEL_GALLERY;

if (photoGrid && Array.isArray(gallery)) {
  gallery.forEach((photo) => {
    const figure = document.createElement('figure');
    figure.className = 'photo-item reveal';

    const button = document.createElement('button');
    button.className = 'photo-open';
    button.type = 'button';
    button.setAttribute('aria-label', `Ampliar ${photo.label}`);

    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.label;
    image.loading = 'lazy';
    image.decoding = 'async';

    button.append(image);
    figure.append(button);
    photoGrid.append(figure);

    button.addEventListener('click', () => {
      if (!photoViewer || !viewerImage) return;
      viewerImage.src = photo.src;
      viewerImage.alt = photo.label;
      photoViewer.showModal();
    });
  });
}

document.querySelector('[data-close-photo]')?.addEventListener('click', () => photoViewer?.close());

const contactDialog = document.querySelector('#contact-dialog');
const dialogPlan = document.querySelector('#dialog-plan');
const dialogEmail = document.querySelector('#dialog-email');

document.querySelectorAll('.plan-select').forEach((button) => {
  button.addEventListener('click', (event) => {
    if (!contactDialog?.showModal) return;
    event.preventDefault();
    const plan = button.dataset.plan || 'Tu proyecto';
    if (dialogPlan) dialogPlan.textContent = plan;
    if (dialogEmail) {
      const subject = encodeURIComponent(`Me interesa el plan ${plan}`);
      const body = encodeURIComponent('Hola Yeriel, quiero conocer más detalles y coordinar una propuesta.');
      dialogEmail.href = `mailto:yerieldela18@gmail.com?subject=${subject}&body=${body}`;
    }
    contactDialog.showModal();
  });
});

document.querySelector('[data-close-dialog]')?.addEventListener('click', () => contactDialog?.close());

[contactDialog, photoViewer].forEach((dialog) => {
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

const progress = document.querySelector('.scroll-progress span');
const updateProgress = () => {
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = height > 0 ? window.scrollY / height : 0;
  if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
};
updateProgress();
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('#site-nav a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .15, .4] });
  sections.forEach((section) => navObserver.observe(section));
}

const revealTargets = [...document.querySelectorAll('.section-heading, .category-card, .reel-card, .video-project, .service-row, .price-card, .contact-row, .photo-item')];
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('reveal-ready');
  revealTargets.forEach((target) => target.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8%', threshold: .08 });
  revealTargets.forEach((target) => revealObserver.observe(target));
}
