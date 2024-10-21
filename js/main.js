// API y estado de autenticación
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';
let isAuthenticated = false;
let userRole = null;

// Referencias al DOM
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');

// Manejo de la barra de navegación
function toggleNav() {
  navIcon.classList.toggle("open");
  menuResponsive.classList.toggle("ullistshow");
}

function closeNavOnOutsideClick(event) {
  if (!nav.contains(event.target)) {
    navIcon.classList.remove("open");
    menuResponsive.classList.remove("ullistshow");
  }
}

navIcon.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleNav();
});

document.addEventListener("click", closeNavOnOutsideClick);

// Loader
function showLoader() {
  document.body.classList.add('loading');
}

function hideLoader() {
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
}

// Cerrar modales en recarga de página
function closeModalFunction(modal) {
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

window.addEventListener('pageshow', () => {
  if (loginModal.classList.contains('show')) closeModalFunction(loginModal);
  if (registerModal.classList.contains('show')) closeModalFunction(registerModal);
});

// Verificar autenticación
async function checkAuth() {
  showLoader();
  try {
    const response = await fetch(`${apiUrlAuth}/check`, {
      method: 'GET',
      credentials: 'include'
    });
    const data = await response.json();

    if (response.ok && data.authenticated) {
      isAuthenticated = true;
      userRole = data.user.role;
      handleAuthenticatedUser(userRole);
    } else {
      handleUnauthenticated();
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    showAlert('error', 'Error', 'No se pudo verificar la autenticación. Inténtalo de nuevo más tarde.');
  } finally {
    hideLoader();
  }
}

// Manejo de autenticación
function handleAuthenticatedUser(role) {
  document.querySelector('.btn-signin').style.display = 'none';

  document.querySelectorAll('.authenticated').forEach(el => {
    el.style.display = 'block';
  });

  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = role === 'admin' ? 'block' : 'none';
  });

  closeModalFunction(loginModal);
  closeModalFunction(registerModal);
}

function handleUnauthenticated() {
  isAuthenticated = false;
  userRole = null;

  document.querySelector('.btn-signin').style.display = 'block';
  document.querySelectorAll('.authenticated, .admin-only').forEach(el => el.style.display = 'none');
}

// Manejadores de botones y eventos
function handleButtonClick(event) {
  event.preventDefault();
  const targetPage = event.currentTarget.dataset.page;

  if (!isAuthenticated) {
    openLoginModal();
  } else {
    redirectToPage(targetPage);
  }
}

function attachClickHandlers() {
  document.querySelectorAll('.btn, .tarjeta .boton').forEach(button => {
    button.addEventListener('click', handleButtonClick);
  });
}

// Redirección de páginas
function redirectToPage(page) {
  const pages = {
    'capacitaciones': 'pages/capacitaciones.html',
    'eventos': 'pages/eventos.html',
    'bibliografia': 'pages/bibliografia.html',
    'protocolos-intervencion': 'pages/protocolos-intervencion.html',
    'informacion-general': 'pages/informacion-general.html',
    'oferta-ministerial': 'pages/oferta-ministerial.html',
    'politicas-alimentarias': 'pages/politicas-alimentarias.html',
    'economia-social': 'pages/economia-social.html',
    'subdireccion-microcreditos': 'pages/subdireccion-microcreditos.html',
    'articulacion-territorial': 'pages/articulacion-territorial.html',
    'gestion-documentos': 'pages/gestion-documentos.html'
  };

  const url = pages[page];
  if (url) {
    window.location.href = url;
  } else {
    showAlert('error', 'Página no encontrada', 'La página que intentas acceder no existe.');
  }
}

// Alertas
function showAlert(icon, title, text) {
  Swal.fire({ icon, title, text });
}

// Manejo del formulario de inicio de sesión
loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorMessage = document.getElementById('error-message');

  try {
    const response = await fetch(`${apiUrlAuth}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      closeModalFunction(loginModal);
      await checkAuth();
    } else {
      const errorData = await response.json();
      errorMessage.textContent = errorData.message || 'Error en el inicio de sesión.';
    }
  } catch (error) {
    errorMessage.textContent = 'Error en el inicio de sesión.';
    console.error('Error al iniciar sesión:', error);
    showAlert('error', 'Error', 'Hubo un problema al iniciar sesión. Inténtalo de nuevo más tarde.');
  }
});

// Inicializar verificación de autenticación
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();  // Realizar la verificación de autenticación una sola vez al cargar
  attachClickHandlers();  // Adjuntar los manejadores de eventos después de la verificación
});