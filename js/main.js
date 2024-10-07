// barra de navegacion
let dropdowns = document.querySelectorAll('.navbar .dropdown-toggler');
let dropdownIsOpen = false;

if (dropdowns.length) {
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener('click', (event) => {
      let target = document.querySelector(`#${dropdown.dataset.dropdown}`);

      if (target) {
        if (target.classList.contains('show')) {
          target.classList.remove('show');
          dropdownIsOpen = false;
        } else {
          target.classList.add('show');
          dropdownIsOpen = true;
        }
      }
    });
  });
}

window.addEventListener('mouseup', (event) => {
  if (dropdownIsOpen) {
    dropdowns.forEach((dropdownButton) => {
      let dropdown = document.querySelector(`#${dropdownButton.dataset.dropdown}`);
      let targetIsDropdown = dropdown.contains(event.target);

      if (dropdownButton.contains(event.target)) {
        return;
      }

      if (!targetIsDropdown) {
        dropdown.classList.remove('show');
        dropdownIsOpen = false;
      }
    });
  }
});

function handleSmallScreens() {
  const toggler = document.querySelector('.navbar-toggler');
  if (toggler) {
    toggler.addEventListener('click', () => {
      let navbarMenu = document.querySelector('.navbar-menu');

      if (!navbarMenu.classList.contains('active')) {
        navbarMenu.classList.add('active');
      } else {
        navbarMenu.classList.remove('active');
      }
    });
  }
}

// Variables globales para almacenar el estado de autenticación y el rol del usuario
let isAuthenticated = false;
let userRole = null;

// Función para comprobar si la sesión está activa y manejar la visibilidad de los elementos
async function checkAuth() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/check', {
      method: 'GET',
      credentials: 'include' // Asegura que las cookies se envíen con la solicitud
    });

    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        // El usuario está autenticado
        isAuthenticated = true;
        userRole = data.user.role; // Obtener el rol del usuario

        // Ocultar el botón de iniciar sesión
        document.querySelector('.btn-signin').style.display = 'none';

        // Mostrar todos los elementos con la clase 'authenticated'
        document.querySelectorAll('.authenticated').forEach(el => {
          el.style.display = 'block';
        });

        // Manejar visibilidad según el rol
                if (userRole === 'admin') {
          // Mostrar elementos exclusivos para admin
          document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
          });
        } else if (userRole === 'user') {
          // Ocultar elementos exclusivos para admin
          document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
          });
        }

      } else {
        // El usuario no está autenticado
        handleUnauthenticated();
      }
    } else {
      // Respuesta no OK, tratar como no autenticado
      handleUnauthenticated();
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    // Mostrar error con SweetAlert2
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

  // Mostrar el botón de iniciar sesión
  document.querySelector('.btn-signin').style.display = 'block';

  // Ocultar todos los elementos con la clase 'authenticated'
  document.querySelectorAll('.authenticated').forEach(el => {
    el.style.display = 'none';
  });

  // Asegurarse de que los elementos 'admin-only' estén ocultos
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
        window.location.href = './pages/eventos.html';
        break;
      case 'bibliografia':
        window.location.href = './pages/bibliografia.html';
        break;
      case 'protocolos-intervencion':
        window.location.href = 'pages/protocolos-intervencion.html';
        break;
      case 'informacion-general':
        window.location.href = './pages/informacion.html';
        break;
      case 'oferta-ministerial':
        window.location.href = './pages/oferta.html';
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

// Añadir eventos a los botones
const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => {
  button.addEventListener('click', handleButtonClick);
});

// También agregar eventos a las tarjetas
const botonesTarjetas = document.querySelectorAll('.tarjeta .boton');
botonesTarjetas.forEach(boton => {
  boton.addEventListener('click', handleButtonClick);
});

// Función para cerrar modales al hacer clic en el botón de cerrar
function setupModalClose() {
  const closeButtons = document.querySelectorAll('.modal .close');
  closeButtons.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('.modal');
      modal.style.display = 'none';
    });
  });

  // Cerrar modal al hacer clic fuera del contenido del modal
  window.addEventListener('click', (event) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    });
  });
}

// Inicializar funciones
setupModalClose();
checkAuth();
handleSmallScreens();
