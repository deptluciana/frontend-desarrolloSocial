const apiUrlAuth = 'https://backend-desarrollosocial-production-4486.up.railway.app/api/auth';

// barra de navegacion
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");
const menuIcon = document.getElementById("menuIcon");
const closeIcon = document.getElementById("closeIcon");

navIcon.addEventListener("click", function (event) {
  event.stopPropagation();
  menuResponsive.classList.toggle("ullistshow");
  navIcon.classList.toggle("open");
});

document.addEventListener("click", function (event) {
  const target = event.target;

  if (!nav.contains(target)) {
    menuResponsive.classList.remove("ullistshow");
    navIcon.classList.remove("open");
  }
});

// Variables globales para almacenar el estado de autenticación y el rol del usuario
let isAuthenticated = false;
let userRole = null;

// Función para comprobar si la sesión está activa y manejar la visibilidad de los elementos
async function checkAuth() {
  try {
    const response = await fetch(`${apiUrlAuth}/check`, {
      method: 'GET',
      credentials: 'include'
    });

    // Alert para verificar el estado de la respuesta
    alert(`Response Status: ${response.status}`);

    if (response.ok) {
      const data = await response.json();
      
      // Alert para mostrar los datos recibidos
      alert(`Response Data: ${JSON.stringify(data)}`);

      if (data.authenticated) {
        // El usuario está autenticado
        isAuthenticated = true;
        userRole = data.user.role;

        // Alert para indicar que la autenticación fue exitosa y el rol del usuario
        alert(`Authenticated: true, User Role: ${userRole}`);

        document.querySelector('.btn-signin').style.display = 'none';

        document.querySelectorAll('.authenticated').forEach(el => {
          el.style.display = 'block';
        });

        if (userRole === 'admin') {
          document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
          });
        } else if (userRole === 'user') {
          // Ocultar elementos exclusivos para admin
          document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
          });
        }

        // Aquí, aseguramos que se añadan los event listeners después de iniciar sesión
        attachClickHandlers();

      } else {
        // El usuario no está autenticado
        alert('Authenticated: false');
        handleUnauthenticated();
      }
    } else {
      alert('Response not OK');
      handleUnauthenticated();
    }
  } catch (error) {
    // Alert para mostrar el error si ocurre en el try-catch
    alert(`Error catch: ${error.message}`);
    console.error('Error al verificar autenticación:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo verificar la autenticación. Por favor, inténtalo de nuevo más tarde.',
    });
  }
}

// Función para manejar el estado no autenticado
function handleUnauthenticated() {
  isAuthenticated = false;
  userRole = null;

  document.querySelector('.btn-signin').style.display = 'block';

  document.querySelectorAll('.authenticated').forEach(el => {
    el.style.display = 'none';
  });

  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = 'none';
  });
  
}

// Función para abrir el modal de inicio de sesión
function openLoginModal() {
  const modal = document.getElementById('loginModal');
  modal.style.display = 'block'; // Mostrar el modal
}

// Función para manejar el clic en los botones y tarjetas
function handleButtonClick(event) {
  event.preventDefault(); // Evitar la acción predeterminada del enlace

  const targetElement = event.currentTarget; // Elemento que tiene el listener
  const targetPage = targetElement.dataset.page; // Obtener el valor de data-page

  if (!isAuthenticated) {
    Swal.fire({
      icon: 'warning',
      title: 'No estás autenticado',
      text: 'Debes iniciar sesión para acceder a esta información.',
      showCancelButton: true,
      confirmButtonText: 'Iniciar Sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        openLoginModal();
      }
    });
  } else {
    // Redirigir a la página correspondiente
    switch (targetPage) {
      case 'capacitaciones':
        window.location.href = 'pages/capacitaciones.html';
        break;
      case 'eventos':
        window.location.href = 'pages/eventos.html';
        break;
      case 'bibliografia':
        window.location.href = 'pages/bibliografia.html';
        break;
      case 'protocolos-intervencion':
        window.location.href = 'pages/protocolos-intervencion.html';
        break;
      case 'informacion-general':
        window.location.href = 'pages/informacion-general.html';
        break;
      case 'oferta-ministerial':
        window.location.href = 'pages/oferta-ministerial.html';
        break;
      case 'politicas-alimentarias':
        window.location.href = 'pages/politicas-alimentarias.html';
        break;
      case 'economia-social':
        window.location.href = 'pages/economia-social.html';
        break;
      case 'subdireccion-microcreditos':
        window.location.href = 'pages/subdireccion-microcreditos.html';
        break;
      case 'articulacion-territorial':
        window.location.href = 'pages/articulacion-territorial.html';
        break;
      case 'gestion-documentos':
        window.location.href = 'pages/gestion-documentos.html';
        break;
      default:
        Swal.fire({
          icon: 'error',
          title: 'Página no encontrada',
          text: 'La página que intentas acceder no existe.',
        });
        break;
    }
  }
}

// Función para adjuntar los manejadores de clics a botones y tarjetas
function attachClickHandlers() {
  // Seleccionar todos los botones y tarjetas
  const buttons = document.querySelectorAll('.btn, .tarjeta .boton');

  // Añadir el evento de clic a cada botón y tarjeta
  buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
  });
}

// Manejar el envío del formulario de inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Evitar el comportamiento de envío por defecto

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${apiUrlAuth}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      // Cerrar el modal después de un inicio de sesión exitoso
      const modal = document.getElementById('loginModal');
      modal.style.display = 'none';

      // Reiniciar el estado de autenticación
      await checkAuth(); // Verificar la autenticación nuevamente
    } else {
      const errorData = await response.json();
      document.getElementById('error-message').textContent = errorData.message;
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo más tarde.',
    });
  }
});

// Inicializar la verificación de autenticación al cargar la página
checkAuth();
