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

window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
        logo.src = "/assets/logos/logovermelho.png";
    } else {
        logo.src = "/assets/logos/logo.png";
    }
});

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
