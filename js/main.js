// Constantes y variables globales
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';
let isAuthenticated = false;
let userRole = null;

// Referencias a elementos del DOM
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");
const menuIcon = document.getElementById("menuIcon");
const closeIcon = document.getElementById("closeIcon");
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');

// Manejo de la barra de navegación (abrir/cerrar)
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

// Eventos de la barra de navegación
navIcon.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleNav();
});

document.addEventListener("click", closeNavOnOutsideClick);

// Mostrar/ocultar loader
function showLoader() {
  document.body.classList.add('loading');
}

function hideLoader() {
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
}

// Cerrar modales al recargar página
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

// Verificar autenticación y manejar elementos visibles
async function checkAuth() {
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
    showAlert('error', 'Error', 'No se pudo verificar la autenticación. Por favor, inténtalo de nuevo más tarde.');
  } finally {
    hideLoader(); // Aseguramos que el loader se oculte una vez hecha la verificación
  }
}

function handleAuthenticatedUser(role) {
  document.querySelector('.btn-signin').style.display = 'none';

  document.querySelectorAll('.authenticated').forEach(el => {
    el.style.display = 'block';
  });

  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = role === 'admin' ? 'block' : 'none';
  });

  attachClickHandlers();
}

function handleUnauthenticated() {
  isAuthenticated = false;
  userRole = null;

  document.querySelector('.btn-signin').style.display = 'block';
  document.querySelectorAll('.authenticated, .admin-only').forEach(el => {
    el.style.display = 'none';
  });
}

// Manejadores de botones y eventos
async function handleButtonClick(event) {
  event.preventDefault();
  const targetPage = event.currentTarget.dataset.page;

  // Mostrar loader siempre que se hace clic en una tarjeta
  showLoader();

  // Esperar a que se verifique la autenticación
  await checkAuth();

  if (!isAuthenticated) {
    hideLoader();  // Ocultar loader si no está autenticado
    openLoginModal();  // Mostrar modal de login si no está autenticado
  } else {
    // Redirigir si está autenticado
    redirectToPage(targetPage);
  }
}

function attachClickHandlers() {
  document.querySelectorAll('.btn, .tarjeta .boton').forEach(button => {
    button.removeEventListener('click', handleButtonClick);  // Remover cualquier evento anterior
    button.addEventListener('click', handleButtonClick);
  });
}

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

// Función para mostrar alertas
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
    showAlert('error', 'Error', 'Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
  }
});

// Inicializar la verificación de autenticación
checkAuth();
