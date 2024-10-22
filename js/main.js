// API y estado de autenticación
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';
let isAuthenticated = false;
let userRole = null;
let authChecked = false; 

// Referencias al DOM
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');

// Loader
function showLoader() {
  document.body.classList.add('loading');
}

function hideLoader() {
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
}

// Inicializar la aplicación
async function initApp() {
  showLoader();

  try {
    await checkAuth();  // Verificar autenticación al iniciar la app

    hideLoader();
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al cargar la aplicación. Por favor, intenta de nuevo más tarde.',
      confirmButtonText: 'Aceptar'
    });
    hideLoader();
  }

  attachClickHandlers();  // Asociar eventos de clic después de inicializar
}

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

// Cerrar modales en recarga de página
function closeModalFunction(modal) {
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
}

window.addEventListener('pageshow', () => {
  closeModalFunction(loginModal);
  closeModalFunction(registerModal);
});

// Verificar autenticación
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
    showAlert('error', 'Error', 'No se pudo verificar la autenticación. Inténtalo de nuevo más tarde.');
  } finally {
    authChecked = true; 
    // Aquí habilitamos las tarjetas solo después de verificar la autenticación
    document.querySelectorAll('.btn, .tarjeta .boton').forEach(button => {
      button.classList.remove('disabled'); // Quitar la clase 'disabled' cuando esté listo
    });
  }
}

// Manejo de autenticación
function handleAuthenticatedUser(role) {
  document.querySelector('.btn-signin').style.display = 'none';
  document.querySelectorAll('.authenticated').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = (role === 'admin') ? 'block' : 'none');

  // Cerrar modal de login si está abierto
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

  if (!authChecked) {
    // Si la autenticación no ha sido comprobada, no permitir abrir el modal ni redirigir
    showAlert('info', 'Por favor espera', 'Estamos verificando tu autenticación.');
    return;
  }

  if (!isAuthenticated) {
    // Mostrar el modal solo si el usuario NO está autenticado
    openLoginModal();
  } else {
    // Si está autenticado, redirigir directamente a la página sin mostrar el modal
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

// Llamar a initApp al cargar el documento
document.addEventListener('DOMContentLoaded', initApp);
