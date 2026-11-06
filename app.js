(function () {
  'use strict';

  window.addEventListener('load', () => {
    setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
    }, 1200);
  });

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 40 });
  }

  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });
    (function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();
    document.querySelectorAll('a, button, input, textarea').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const menuToggle = document.getElementById('menu-toggle');
  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  };
  menuToggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('open');
  });
  overlay?.addEventListener('click', closeSidebar);

  function showView(name) {
    document.querySelectorAll('.view').forEach((view) => {
      view.classList.toggle('is-active', view.dataset.view === name);
    });
    document.querySelectorAll('[data-nav]').forEach((el) => {
      if (el.matches('.side-link, .top-link')) {
        el.classList.toggle('active', el.dataset.nav === name);
      }
    });
    const main = document.getElementById('workspace-main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
    closeSidebar();
    if (name === 'about' || name === 'home') animateVisibleStats();
  }

  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const name = el.dataset.nav;
      if (!name) return;
      if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('http')) return;
      e.preventDefault();
      showView(name);
    });
  });

  const themeToggle = document.getElementById('theme-toggle');
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const icon = themeToggle.querySelector('i');
    if (icon) icon.className = document.body.classList.contains('light') ? 'fas fa-sun' : 'fas fa-moon';
  });

  const workspace = document.getElementById('workspace-main');
  const scrollProgress = document.getElementById('scroll-progress');
  workspace?.addEventListener('scroll', () => {
    if (!scrollProgress) return;
    const total = workspace.scrollHeight - workspace.clientHeight;
    scrollProgress.style.width = total > 0 ? (workspace.scrollTop / total) * 100 + '%' : '0%';
  });

  const animatedStats = new Set();
  function animateCount(el) {
    if (animatedStats.has(el)) return;
    animatedStats.add(el);
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const start = performance.now();
    const duration = 1400;
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + (target >= 100 ? '+' : '');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + (target >= 100 ? '+' : '');
    }
    requestAnimationFrame(step);
  }
  function animateVisibleStats() {
    document.querySelectorAll('.view.is-active .stat-num').forEach(animateCount);
  }
  animateVisibleStats();

  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    const particles = [];
    const count = window.innerWidth < 768 ? 28 : 55;
    const colors = ['#38bdf8', '#22d3ee', '#818cf8'];
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.6 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.22;
        this.speedY = (Math.random() - 0.5) * 0.22;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.4 + 0.15;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    for (let i = 0; i < count; i++) particles.push(new Particle());
    (function loop() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    })();
  }

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: 'bUNkBkphOZV2X22wJ' });
  }
  const form = document.getElementById('contact-form');
  form?.addEventListener('submit', function (e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submit');
    const note = document.getElementById('form-note');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending...';
    }
    emailjs.sendForm('Krishal Poudel', 'template_x0ticsj', this)
      .then(() => {
        if (note) note.textContent = 'Message sent successfully!';
        form.reset();
      })
      .catch(() => {
        if (note) note.textContent = 'Failed to send message.';
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.querySelector('span').textContent = 'Send Message';
        }
      });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });
})();
