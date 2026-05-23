/* =========================================================
   Portfolio Script — Tejas Shiva Kumar
   ========================================================= */

/* ── Theme toggle ────────────────────────────────────────── */
const root        = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const iconLight   = document.getElementById('icon-light');
const iconDark    = document.getElementById('icon-dark');

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('tsk-theme', theme);
  if (theme === 'dark') {
    iconLight.style.display = 'none';
    iconDark.style.display  = '';
  } else {
    iconLight.style.display = '';
    iconDark.style.display  = 'none';
  }
}

const savedTheme = localStorage.getItem('tsk-theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
  reinitCanvas();
});

/* ── Hero canvas (particle network) ─────────────────────── */
const canvas = document.getElementById('hero-canvas');
const ctx    = canvas.getContext('2d');
let W, H, pts = [];
let animId;

function resizeCanvas() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}

function makePoint() {
  return {
    x:  Math.random() * W,
    y:  Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r:  Math.random() * 1.8 + 0.6,
  };
}

function initPoints() {
  pts = Array.from({ length: 70 }, makePoint);
}

function getColors() {
  const dark = root.getAttribute('data-theme') === 'dark';
  return {
    dot:  dark ? 'rgba(124,106,245,0.55)' : 'rgba(85,72,224,0.3)',
    line: dark ? 'rgba(124,106,245,0.12)' : 'rgba(85,72,224,0.08)',
  };
}

function drawCanvas() {
  ctx.clearRect(0, 0, W, H);
  const { dot, line } = getColors();
  const CONNECT = 130;

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = dot;
    ctx.fill();

    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECT) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = line;
        ctx.lineWidth   = 1;
        ctx.globalAlpha = 1 - dist / CONNECT;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  animId = requestAnimationFrame(drawCanvas);
}

function reinitCanvas() {
  cancelAnimationFrame(animId);
  drawCanvas();
}

window.addEventListener('resize', () => { resizeCanvas(); });
resizeCanvas();
initPoints();
drawCanvas();

/* ── Nav: scroll & hamburger ─────────────────────────────── */
const header    = document.getElementById('header');
const navMenu   = document.getElementById('nav-menu');
const hamburger = document.getElementById('nav-hamburger');
const navLinks  = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  hamburger.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

/* ── Active section highlight & sticky header ───────────── */
const sections = document.querySelectorAll('section[id]');
const backTop  = document.getElementById('back-top');

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  header.classList.toggle('scrolled', y > 60);
  backTop.classList.toggle('show', y > 400);

  sections.forEach(sec => {
    const top    = sec.offsetTop - 120;
    const bottom = top + sec.offsetHeight;
    const id     = sec.id;
    const link   = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', y >= top && y < bottom);
  });
});

/* ── Intersection observer (reveal animations) ───────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, ' +
  '.tl-item, .skill-cat, .proj-card, .hack-card, .cert-card'
).forEach(el => observer.observe(el));

/* ── Typewriter ──────────────────────────────────────────── */
function typewriter(el, words) {
  if (!el || !words?.length) return;
  let wi = 0, ci = 0, del = false;
  const TYPE = 90, DEL = 45, PAUSE = 2000;

  (function tick() {
    const word = words[wi];
    if (!del) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { del = true; return setTimeout(tick, PAUSE); }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { del = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(tick, del ? DEL : TYPE);
  })();
}

/* ── Social icons helper ─────────────────────────────────── */
const SOCIAL_DEFS = {
  github:   { icon: 'fa-brands fa-github',  label: 'GitHub'   },
  linkedin: { icon: 'fa-brands fa-linkedin', label: 'LinkedIn' },
  leetcode: { icon: 'fa-solid fa-code',      label: 'LeetCode' },
  gfg:      { icon: 'fa-solid fa-leaf',      label: 'GeeksforGeeks' },
};

function buildSocials(container, links, extraClass) {
  Object.entries(links).forEach(([key, url]) => {
    if (!url) return;
    const def = SOCIAL_DEFS[key];
    if (!def) return;
    const a = document.createElement('a');
    a.href    = url;
    a.target  = '_blank';
    a.rel     = 'noopener noreferrer';
    a.title   = def.label;
    a.setAttribute('aria-label', def.label);
    a.className = extraClass || 'social-link';
    a.innerHTML = `<i class="${def.icon}"></i>`;
    container.appendChild(a);
  });
}

/* ── Resume download ─────────────────────────────────────── */
function setupResume(path) {
  const btn = document.getElementById('resume-btn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault();
    const a = document.createElement('a');
    a.href     = path;
    a.download = 'Tejas_Shiva_Kumar_Resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

/* ── Contact form (demo) ─────────────────────────────────── */
function setupForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    success.classList.add('show');
    form.reset();
    setTimeout(() => success.classList.remove('show'), 5000);
  });
}

/* ── Populate from config ────────────────────────────────── */
function populate() {
  const c = config;

  /* Hero */
  document.getElementById('hero-bio').textContent = c.bio;
  typewriter(document.getElementById('typewriter'), c.taglines);
  buildSocials(document.getElementById('hero-socials'), c.social);
  setupResume(c.resume);

  /* About */
  document.getElementById('about-bio').textContent = c.bio;
  const statsEl = document.getElementById('about-stats');
  c.aboutStats.forEach(s => {
    const d = document.createElement('div');
    d.className = 'stat-card';
    d.innerHTML = `<div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div>`;
    statsEl.appendChild(d);
  });

  /* Experience / timeline */
  const tl = document.getElementById('timeline');
  c.experience.forEach((item, i) => {
    const typeMap  = { education: 'edu', work: 'work', internship: 'intern' };
    const labelMap = { education: 'Education', work: 'Work Experience', internship: 'Internship' };
    const iconMap  = { education: 'fa-graduation-cap', work: 'fa-briefcase', internship: 'fa-flask' };
    const cls      = typeMap[item.type] || 'work';
    const lbl      = labelMap[item.type] || 'Experience';
    const ico      = iconMap[item.type] || 'fa-briefcase';

    const div = document.createElement('div');
    div.className = `tl-item ${cls}`;
    div.style.transitionDelay = `${i * 0.1}s`;
    div.innerHTML = `
      <div class="tl-dot ${cls}"><i class="fa-solid ${ico}"></i></div>
      <div class="tl-card">
        <p class="tl-type">${lbl}</p>
        <h3 class="tl-role">${item.role}</h3>
        <p class="tl-org">${item.org}</p>
        <div class="tl-meta">
          <span class="tl-period"><i class="fa-regular fa-calendar"></i> ${item.period}</span>
          <span class="tl-location"><i class="fa-solid fa-location-dot"></i> ${item.location}</span>
          ${item.current ? '<span class="tl-current"><span class="badge-dot"></span> Current</span>' : ''}
        </div>
        <p class="tl-desc">${item.desc}</p>
        <div class="tl-tags">${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      </div>
    `;
    tl.appendChild(div);
    observer.observe(div);
  });

  /* Skills */
  const skillsGrid = document.getElementById('skills-grid');
  c.skillCategories.forEach((cat, i) => {
    const div = document.createElement('div');
    div.className = 'skill-cat';
    div.style.transitionDelay = `${i * 0.08}s`;
    div.innerHTML = `
      <div class="skill-cat-header">
        <div class="skill-cat-icon"><i class="fa-solid ${cat.icon}"></i></div>
        <span class="skill-cat-name">${cat.category}</span>
      </div>
      <div class="skill-pills">${cat.skills.map(s => `<span class="tag">${s}</span>`).join('')}</div>
    `;
    skillsGrid.appendChild(div);
    observer.observe(div);
  });

  /* Projects */
  const projList = document.getElementById('projects-list');
  c.projects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'proj-card';
    card.style.transitionDelay = `${i * 0.12}s`;
    const isActive = p.status === 'In Progress';
    const githubLink = p.github
      ? `<a href="${p.github}" target="_blank" rel="noopener" class="proj-link">
           <i class="fa-brands fa-github"></i> GitHub
         </a>`
      : '';
    card.innerHTML = `
      <div class="proj-visual" style="background: linear-gradient(${p.gradient})">
        <div class="proj-visual-inner">
          <span class="proj-emoji">💻</span>
          <p class="proj-visual-label">${p.subtitle}</p>
        </div>
      </div>
      <div class="proj-body">
        <div class="proj-header">
          <div>
            <p class="proj-subtitle">${p.period}</p>
            <h3 class="proj-title">${p.title}</h3>
          </div>
          <span class="proj-status ${isActive ? 'active' : 'done'}">${p.status}</span>
        </div>
        <p class="proj-desc">${p.desc}</p>
        <div class="proj-tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="proj-links">${githubLink}</div>
      </div>
    `;
    projList.appendChild(card);
    observer.observe(card);
  });

  /* Hackathons */
  const hackList = document.getElementById('hackathons-list');
  c.hackathons.forEach((h, i) => {
    const card = document.createElement('div');
    card.className = `hack-card ${h.result}`;
    card.style.transitionDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <div class="hack-top">
        <span class="hack-badge ${h.result}">${h.result === 'winner' ? '🏆 Winner' : '🎖️ Top 15 Finalist'}</span>
        <span class="hack-year">${h.year}</span>
      </div>
      <h3 class="hack-title">${h.title}</h3>
      <p class="hack-org">${h.org}</p>
      <p class="hack-desc">${h.desc}</p>
    `;
    hackList.appendChild(card);
    observer.observe(card);
  });

  /* Certifications */
  const certList = document.getElementById('certs-list');
  c.certifications.forEach((cert, i) => {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.style.transitionDelay = `${i * 0.1}s`;
    const linkHtml = cert.link
      ? `<a href="${cert.link}" target="_blank" rel="noopener" class="cert-link">
           View <i class="fa-solid fa-arrow-up-right-from-square"></i>
         </a>`
      : '';
    card.innerHTML = `
      <div class="cert-icon"><i class="fa-solid fa-certificate"></i></div>
      <div class="cert-body">
        <p class="cert-org">${cert.org}</p>
        <p class="cert-title">${cert.title}</p>
        <div class="cert-foot">
          <span class="cert-year">${cert.year}</span>
          ${linkHtml}
        </div>
      </div>
    `;
    certList.appendChild(card);
    observer.observe(card);
  });

  /* Contact links */
  const contactLinks = document.getElementById('contact-links');
  const clData = [
    { icon: 'fa-solid fa-envelope', text: c.email,   href: `mailto:${c.email}` },
    { icon: 'fa-solid fa-phone',    text: c.phone,   href: `tel:${c.phone}` },
    { icon: 'fa-brands fa-github',  text: 'github.com/Tejasshivakumar', href: c.social.github },
    { icon: 'fa-brands fa-linkedin', text: 'LinkedIn', href: c.social.linkedin },
  ];
  clData.forEach(cl => {
    const a = document.createElement('a');
    a.href   = cl.href;
    a.target = cl.href.startsWith('http') ? '_blank' : '';
    a.rel    = cl.href.startsWith('http') ? 'noopener noreferrer' : '';
    a.className = 'contact-link-item';
    a.innerHTML = `<i class="${cl.icon}"></i><span>${cl.text}</span>`;
    contactLinks.appendChild(a);
  });

  /* Footer */
  document.getElementById('footer-copy').textContent =
    `© ${new Date().getFullYear()} Tejas Shiva Kumar. All rights reserved.`;
  buildSocials(document.getElementById('footer-socials'), c.social);

  setupForm();
}

document.addEventListener('DOMContentLoaded', populate);
