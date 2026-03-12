// Este trecho substitui o bloco POSTS estático e as funções do blog.html
// Cole no lugar do objeto POSTS e das funções filterPosts/openPost no blog.html

const API = '/api';
let ALL_POSTS = [];

async function initBlog() {
  try {
    const r = await fetch(`${API}/posts`);
    ALL_POSTS = await r.json();
    renderFeatured();
    renderGrid(ALL_POSTS);
  } catch(e) {
    console.error('Erro ao carregar posts:', e);
  }
}

function renderFeatured() {
  const featured = ALL_POSTS.find(p => p.featured) || ALL_POSTS[0];
  if (!featured) return;
  const el = document.querySelector('.post-card[data-featured]');
  if (!el) return;
  el.dataset.cat = featured.cat;
  el.onclick = () => openPost(featured.id);
  el.querySelector('img').src = featured.img;
  el.querySelector('[data-cat-badge]').textContent = featured.cat;
  el.querySelector('[data-date]').textContent = `${featured.date} · ${featured.read_time}`;
  el.querySelector('[data-title]').textContent = featured.title;
  el.querySelector('[data-excerpt]').textContent = featured.body.replace(/<[^>]+>/g,'').slice(0,200) + '...';
}

function renderGrid(posts) {
  const grid = document.getElementById('posts-grid');
  const skip = ALL_POSTS.find(p => p.featured) ? (ALL_POSTS.find(p => p.featured).id) : null;
  const list = posts.filter(p => p.id !== skip);
  grid.innerHTML = '';
  list.forEach(p => {
    const a = document.createElement('article');
    a.className = 'post-card bg-white group cursor-pointer flex flex-col';
    a.dataset.cat = p.cat;
    a.onclick = () => openPost(p.id);
    a.innerHTML = `
      <div class="img-wrap overflow-hidden relative h-52 flex-shrink-0">
        <img class="img-zoom w-full h-full object-cover" src="${p.img}" alt="${p.title}">
        <div class="absolute top-4 left-4">
          <span class="bg-[#C8102E] text-white text-[9px] font-bold tracking-[.2em] uppercase px-2.5 py-1">${p.cat}</span>
        </div>
      </div>
      <div class="p-8 flex flex-col flex-1 border border-t-0 border-gray-100 group-hover:border-[#C8102E] transition-colors duration-300">
        <p class="text-[10px] font-medium tracking-[.18em] uppercase text-gray-400 mb-3">${p.date} · ${p.read_time}</p>
        <h3 class="font-serif text-lg text-[#1A1A1A] leading-snug mb-3 group-hover:text-[#C8102E] transition-colors duration-300 flex-1">${p.title}</h3>
        <p class="text-sm text-[#888] font-light leading-relaxed mb-5">${p.body.replace(/<[^>]+>/g,'').slice(0,120)}...</p>
        <div class="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
          <span class="text-xs text-gray-400">${p.cat}</span>
          <span class="text-[#C8102E] text-xs font-bold tracking-[.15em] uppercase flex items-center gap-1.5 group-hover:gap-3 transition-all">
            Ler <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </span>
        </div>
      </div>`;
    grid.appendChild(a);
  });
  lucide.createIcons();
}

function filterPosts(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === 'todos' ? ALL_POSTS : ALL_POSTS.filter(p => p.cat.toLowerCase() === cat);
  renderGrid(filtered);
  const empty = document.getElementById('empty-state');
  empty.classList.toggle('hidden', filtered.length > 0);
}

async function openPost(id) {
  const r = await fetch(`${API}/posts/${id}`);
  const p = await r.json();
  
  document.getElementById('m-cat').textContent = p.cat;
  document.getElementById('m-date').textContent = p.date;
  document.getElementById('m-read').textContent = p.read_time;
  document.getElementById('m-img').src = p.img;
  document.getElementById('m-img').alt = p.title;
  document.getElementById('m-title').textContent = p.title;
  document.getElementById('m-body').innerHTML = p.body;

  const rel = document.getElementById('m-related');
  rel.innerHTML = '';
  (p.related || []).slice(0,2).forEach(rp => {
    const d = document.createElement('div');
    d.className = 'border border-gray-100 p-4 cursor-pointer hover:border-[#C8102E] transition-colors group';
    d.onclick = () => openPost(rp.id);
    d.innerHTML = `
      <span class="text-[9px] font-bold tracking-[.2em] uppercase text-[#C8102E] mb-2 block">${rp.cat}</span>
      <p class="text-sm font-serif text-[#1A1A1A] leading-snug group-hover:text-[#C8102E] transition-colors line-clamp-2">${rp.title}</p>
      <span class="text-[10px] text-gray-400 mt-2 block">${rp.date}</span>`;
    rel.appendChild(d);
  });

  const sc = document.getElementById('modal-scroll');
  sc.scrollTop = 0;
  document.getElementById('modal-progress').style.width = '0%';
  const ov = document.getElementById('modal-overlay');
  ov.classList.remove('hidden');
  ov.classList.add('flex');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}

// Chama ao carregar a página
initBlog();
