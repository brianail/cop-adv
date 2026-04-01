// Inicializar os ícones da biblioteca Lucide
lucide.createIcons();

// Variáveis de estado
let isMenuOpen = false;

// Elementos do DOM
const navbar = document.getElementById('navbar');
const logoMain = document.getElementById('logo-main');
const logoSub = document.getElementById('logo-sub');
const navLinks = document.querySelectorAll('.nav-link');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const iconMenu = document.getElementById('icon-menu');
const iconX = document.getElementById('icon-x');
const mobileMenu = document.getElementById('mobile-menu');
const backToTopBtn = document.getElementById('back-to-top');
const cookieBanner = document.getElementById('cookie-banner');

const transition = document.getElementById("page-transition");

document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", function (e) {

    // Só aplica para links internos
    if (this.hostname === window.location.hostname) {
      e.preventDefault();

      transition.classList.remove("scale-y-0");

      setTimeout(() => {
        window.location.href = this.href;
      }, 700);
    }
  });
});

// Adicionar ano dinâmico no Footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// 1. Lógica do Cookie Banner
document.addEventListener("DOMContentLoaded", () => {
  const cookieConsent = localStorage.getItem('cop_advogados_cookie_consent');
  if (!cookieConsent) {
    setTimeout(() => {
      cookieBanner.classList.remove('translate-y-full');
    }, 1000);
  }
});

function acceptCookies(type) {
  localStorage.setItem('cop_advogados_cookie_consent', type);
  cookieBanner.classList.add('translate-y-full');
}

const logo = document.getElementById("site-logo");

function syncNavLogo() {
  if (!logo) return;
  logo.src = window.scrollY > 50 ? "/assets/logos/logovermelho.png" : "/assets/logos/logo.png";
}

document.addEventListener("DOMContentLoaded", syncNavLogo);
window.addEventListener("scroll", syncNavLogo);

// 2. Eventos de Scroll: Navegação e Botão "Voltar ao Topo"
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY;

  // Lógica da NavBar
  if (scrollPos > 50) {
    navbar.classList.add('bg-white', 'shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]', 'py-4');
    navbar.classList.remove('bg-transparent', 'py-6');
    navbar.classList.add('sm:top-0');

    logoMain.classList.add('text-[#1A1A1A]');
    logoMain.classList.remove('text-white');
    logoSub.classList.add('text-[#666666]');
    logoSub.classList.remove('text-gray-300');

    menuToggleBtn.classList.add('text-[#2C2C2C]');
    menuToggleBtn.classList.remove('text-white');

    navLinks.forEach(link => {
      link.classList.add('text-[#2C2C2C]', 'hover:text-[#C8102E]');
      link.classList.remove('text-gray-200', 'hover:text-white');
    });
  } else {
    navbar.classList.remove('bg-white', 'shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]', 'py-4', 'sm:top-0');
    navbar.classList.add('bg-transparent', 'py-6');

    logoMain.classList.remove('text-[#1A1A1A]');
    logoMain.classList.add('text-white');
    logoSub.classList.remove('text-[#666666]');
    logoSub.classList.add('text-gray-300');

    menuToggleBtn.classList.remove('text-[#2C2C2C]');
    menuToggleBtn.classList.add('text-white');

    navLinks.forEach(link => {
      link.classList.remove('text-[#2C2C2C]', 'hover:text-[#C8102E]');
      link.classList.add('text-gray-200', 'hover:text-white');
    });
  }

  // Lógica do Botão "Voltar ao Topo"
  if (scrollPos > 400) {
    backToTopBtn.classList.remove('scale-0', 'opacity-0', 'pointer-events-none');
    backToTopBtn.classList.add('scale-100', 'opacity-100', 'pointer-events-auto');
  } else {
    backToTopBtn.classList.add('scale-0', 'opacity-0', 'pointer-events-none');
    backToTopBtn.classList.remove('scale-100', 'opacity-100', 'pointer-events-auto');
  }
});

// 3. Controlar o Menu Mobile
menuToggleBtn.addEventListener('click', () => {
  isMenuOpen = !isMenuOpen;

  if (isMenuOpen) {
    mobileMenu.classList.remove('hidden');
    iconMenu.classList.add('hidden');
    iconX.classList.remove('hidden');
  } else {
    mobileMenu.classList.add('hidden');
    iconMenu.classList.remove('hidden');
    iconX.classList.add('hidden');
  }
});

// 4. Scroll Suave para Secções
function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    // Fechar menu mobile se estiver aberto
    if (isMenuOpen) {
      isMenuOpen = false;
      mobileMenu.classList.add('hidden');
      iconMenu.classList.remove('hidden');
      iconX.classList.add('hidden');
    }
  }
}

// 5. Lógica do Accordion (FAQ)
const faqButtons = document.querySelectorAll('.faq-button');
faqButtons.forEach(button => {
  button.addEventListener('click', () => {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');

    // Fecha as outras abertas para manter o layout limpo
    document.querySelectorAll('.faq-content').forEach(otherContent => {
      if (otherContent !== content) {
        otherContent.style.maxHeight = null;
        const otherIcon = otherContent.previousElementSibling.querySelector('.faq-icon');
        if (otherIcon) otherIcon.classList.remove('rotate-180');
      }
    });

    // Abre ou fecha a clicada
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
      icon.classList.remove('rotate-180');
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
      icon.classList.add('rotate-180');
    }
  });
});
(function () {

  const CAT_LABELS = {
    trabalhista: 'Trabalhista',
    previdenciario: 'Previdenciário',
    administrativo: 'Administrativo',
    sindical: 'Sindical',
    civel: 'Cível',
    institucional: 'Institucional'
  };

  function escHtml(raw) {
    return String(raw || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function closeHomePostModal(ev) {
    if (ev && ev.currentTarget && ev.currentTarget.id === 'home-post-modal-overlay' && ev.target !== ev.currentTarget) {
      return;
    }
    const ov = document.getElementById('home-post-modal-overlay');
    if (!ov) return;
    ov.classList.add('hidden');
    ov.classList.remove('flex');
    document.body.style.overflow = '';
  }

  async function openHomePostModal(id) {
    try {
      const r = await fetch(`/api/posts/${id}`);
      if (!r.ok) throw new Error();
      const p = await r.json();

      const media = document.getElementById('home-post-modal-media');
      const title = document.getElementById('home-post-modal-title');
      const cat = document.getElementById('home-post-modal-cat');
      const date = document.getElementById('home-post-modal-date');
      const read = document.getElementById('home-post-modal-read');
      const body = document.getElementById('home-post-modal-body');
      const link = document.getElementById('home-post-modal-link');
      const sc = document.getElementById('home-post-modal-scroll');

      if (!media || !title || !cat || !date || !read || !body || !link) return;

      const thumb = p.yt_id
        ? `https://img.youtube.com/vi/${p.yt_id}/hqdefault.jpg`
        : (p.img || 'https://via.placeholder.com/1200x630?text=Publicação');
      const alt = escHtml(p.img_alt || p.title || 'Imagem da publicação');
      media.innerHTML = `<img src="${thumb}" alt="${alt}" class="max-w-full max-h-[min(65vh,460px)] w-auto h-auto object-contain" loading="lazy" decoding="async">`;

      title.textContent = p.title || 'Publicação';
      cat.textContent = CAT_LABELS[p.cat] || p.cat || 'Notícia';
      date.textContent = p.date || '';
      read.textContent = p.read_time || 'Leitura rápida';
      body.innerHTML = p.body || '<p>Sem conteúdo.</p>';
      link.href = `blog.html?post=${encodeURIComponent(String(p.id || id))}`;

      if (sc) sc.scrollTop = 0;
      const ov = document.getElementById('home-post-modal-overlay');
      if (!ov) return;
      ov.classList.remove('hidden');
      ov.classList.add('flex');
      document.body.style.overflow = 'hidden';
      lucide.createIcons();
    } catch {
      // silêncio para não quebrar home
    }
  }

  async function loadHomePosts() {

    const grid = document.getElementById('home-posts-grid');
    const empty = document.getElementById('home-posts-empty');

    if (!grid) return;

    try {

      const r = await fetch('/api/posts');
      if (!r.ok) throw new Error();

      const posts = await r.json();

      // pega os 3 mais recentes
      const recent = posts.slice(0, 3);

      grid.innerHTML = '';

      if (!recent.length) {
        grid.style.display = 'none';
        empty.classList.remove('hidden');
        return;
      }

      recent.forEach((p, i) => {

        const excerpt = p.body.replace(/<[^>]+>/g, '').slice(0, 110) + '…';

        // thumbnail automática
        const thumb = p.yt_id
          ? `https://img.youtube.com/vi/${p.yt_id}/hqdefault.jpg`
          : (p.img || '');

        const art = document.createElement('article');

        art.className = 'bg-white group cursor-pointer flex flex-col';
        art.style.animationDelay = (i * 80) + 'ms';

        art.innerHTML = `

          <button type="button" class="block text-left w-full" aria-label="Abrir prévia da publicação: ${escHtml(p.title)}">

            <div class="overflow-hidden relative h-52 flex-shrink-0">

              <img
                src="${thumb}"
                alt="${p.title}"
                class="w-full h-full object-cover transition-transform duration-[1200ms] cubic-bezier(.2,.8,.2,1) group-hover:scale-105"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 600 400%22><rect width=%22600%22 height=%22400%22 fill=%22%23f3f4f6%22/></svg>'">

              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

              ${p.yt_id
            ? `
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="bg-black/60 rounded-full p-3 text-white text-lg">
                    ▶
                  </div>
                </div>
                `
            : ``
          }

              <div class="absolute top-4 left-4">
                <span class="bg-[#C8102E] text-white text-[9px] font-bold tracking-[.2em] uppercase px-2.5 py-1">
                  ${CAT_LABELS[p.cat] || p.cat}
                </span>
              </div>

            </div>

            <div class="p-8 flex flex-col flex-1 border border-t-0 border-gray-100 group-hover:border-[#C8102E] transition-colors duration-300">

              <p class="text-[10px] font-medium tracking-[.18em] uppercase text-gray-400 mb-3">
                ${p.date} · ${p.read_time}
              </p>

              <h3 class="font-serif text-lg text-[#1A1A1A] leading-snug mb-3 group-hover:text-[#C8102E] transition-colors duration-300 flex-1">
                ${p.title}
              </h3>

              <p class="text-sm text-[#888] font-light leading-relaxed mb-5">
                ${excerpt}
              </p>

              <div class="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">

                <span class="text-xs text-gray-400">
                  ${CAT_LABELS[p.cat] || p.cat}
                </span>

                <span class="text-[#C8102E] text-xs font-bold tracking-[.15em] uppercase flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Ler
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </span>

              </div>

            </div>

          </button>

        `;
        const trigger = art.querySelector('button');
        if (trigger) {
          trigger.addEventListener('click', () => openHomePostModal(p.id));
        }

        grid.appendChild(art);

      });

      lucide.createIcons();

    } catch (e) {

      // falha silenciosa — não quebra a home
      grid.style.display = 'none';
      empty.classList.remove('hidden');

    }

  }

  function fmtEventDate(iso) {
    if (!iso) return 'Data não definida';
    try {
      return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  function closeEventModal(ev) {
    if (ev && ev.currentTarget && ev.currentTarget.id === 'event-modal-overlay' && ev.target !== ev.currentTarget) {
      return;
    }
    const ov = document.getElementById('event-modal-overlay');
    if (!ov) return;
    ov.classList.add('hidden');
    ov.classList.remove('flex');
    document.body.style.overflow = '';
  }

  async function openEventModalById(id) {
    try {
      const r = await fetch(`/api/events/${id}`);
      if (!r.ok) throw new Error();
      const ev = await r.json();
      const media = document.getElementById('event-modal-media');
      const img = ev.img || 'https://via.placeholder.com/1200x630?text=Evento';
      const alt = (ev.img_alt || ev.title || 'Imagem do evento').replace(/"/g, '&quot;');
      media.innerHTML = `<img src="${img}" alt="${alt}" class="max-w-full max-h-[min(62vh,430px)] w-auto h-auto object-contain">`;
      document.getElementById('event-modal-date').textContent = fmtEventDate(ev.event_date);
      document.getElementById('event-modal-time').textContent = ev.event_time || 'Sem horário definido';
      document.getElementById('event-modal-title').textContent = ev.title || 'Evento';
      document.getElementById('event-modal-location').textContent = ev.location || 'Local a confirmar';
      document.getElementById('event-modal-body').textContent = ev.description || 'Sem descrição.';
      const sc = document.getElementById('event-modal-scroll');
      if (sc) sc.scrollTop = 0;
      const ov = document.getElementById('event-modal-overlay');
      ov.classList.remove('hidden');
      ov.classList.add('flex');
      document.body.style.overflow = 'hidden';
      lucide.createIcons();
    } catch {
      // silêncio para não quebrar home
    }
  }

  async function loadHomeEvents() {
    const grid = document.getElementById('home-events-grid');
    const empty = document.getElementById('home-events-empty');
    if (!grid) return;
    try {
      const r = await fetch('/api/events?upcoming=1&limit=3');
      if (!r.ok) throw new Error();
      const events = await r.json();
      grid.innerHTML = '';
      if (!Array.isArray(events) || !events.length) {
        grid.style.display = 'none';
        if (empty) empty.classList.remove('hidden');
        return;
      }
      if (empty) empty.classList.add('hidden');
      grid.style.display = '';
      events.forEach((ev) => {
        const card = document.createElement('article');
        card.className = 'bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer';
        const img = ev.img || 'https://via.placeholder.com/1200x630?text=Evento';
        const alt = (ev.img_alt || ev.title || '').replace(/"/g, '&quot;');
        const text = (ev.description || '').replace(/<[^>]+>/g, '').slice(0, 110);
        card.innerHTML = `
          <div class="h-52 bg-gray-100 overflow-hidden"><img src="${img}" alt="${alt}" class="w-full h-full object-cover"></div>
          <div class="p-7">
            <p class="text-[11px] tracking-[.15em] uppercase text-gray-500 mb-3">${fmtEventDate(ev.event_date)}${ev.event_time ? ' · ' + ev.event_time : ''}</p>
            <h4 class="font-serif text-2xl text-[#1A1A1A] mb-2">${ev.title || ''}</h4>
            <p class="text-sm text-[#C8102E] font-semibold mb-3">${ev.location || 'Local a confirmar'}</p>
            <p class="text-sm text-gray-600 font-light leading-relaxed">${text}${text.length >= 110 ? '…' : ''}</p>
          </div>`;
        card.addEventListener('click', () => openEventModalById(ev.id));
        grid.appendChild(card);
      });
    } catch {
      grid.style.display = 'none';
      if (empty) empty.classList.remove('hidden');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadHomePosts();
      loadHomeEvents();
    });
  } else {
    loadHomePosts();
    loadHomeEvents();
  }

  window.closeEventModal = closeEventModal;
  window.closeHomePostModal = closeHomePostModal;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const pov = document.getElementById('home-post-modal-overlay');
      if (pov && !pov.classList.contains('hidden')) {
        closeHomePostModal();
        return;
      }
      const ov = document.getElementById('event-modal-overlay');
      if (ov && !ov.classList.contains('hidden')) closeEventModal();
    }
  });

  let currentSlide = 0;

  function goSlide(index) {
    const track = document.getElementById("pilares-track");
    const dots = document.querySelectorAll(".dot");

    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach(dot => dot.classList.remove("bg-[#C8102E]"));
    dots.forEach(dot => dot.classList.add("bg-gray-300"));

    dots[index].classList.remove("bg-gray-300");
    dots[index].classList.add("bg-[#C8102E]");
  }

  // AUTO (opcional)
  setInterval(() => {
    currentSlide = (currentSlide + 1) % 3;
    goSlide(currentSlide);
  }, 6000);

})();