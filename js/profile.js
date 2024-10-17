// Configuración de URLs de la API
const apiUrlUsers = 'https://api.secretariaarticulacionterritorial.com/api/users';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Variables de estado de autenticación
let isAuthenticated = false;
let userRole = null;

// Referencias al DOM para la navegación
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");
const logoutBtn = document.getElementById('logoutBtn');
const btnSignin = document.querySelector('.btn-signin');
const authenticatedElements = document.querySelectorAll('.authenticated');
const adminOnlyElements = document.querySelectorAll('.admin-only');

// Función de inicialización
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  fetchUserProfile();
  enableProfileEdit();
  setupNavigationEvents();
});

// Configurar eventos de navegación
function setupNavigationEvents() {
  navIcon.addEventListener("click", toggleNavigationMenu);
  document.addEventListener("click", closeNavigationMenuOnOutsideClick);
  logoutBtn.addEventListener('click', confirmLogout);
}

// Mostrar/ocultar el menú de navegación
function toggleNavigationMenu(event) {
  event.stopPropagation();
  menuResponsive.classList.toggle("ullistshow");
  navIcon.classList.toggle("open");
}

// Cerrar el menú de navegación si se hace clic fuera del área
function closeNavigationMenuOnOutsideClick(event) {
  if (!nav.contains(event.target)) {
    menuResponsive.classList.remove("ullistshow");
    navIcon.classList.remove("open");
  }
}

// Mostrar el loader cuando la página está cargando
function showLoader() {
  document.body.classList.add('loading');
}

// Ocultar el loader cuando se completa la autenticación
function hideLoader() {
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
}

// Verificar la autenticación del usuario
async function checkAuth() {
  showLoader();
  try {
    const response = await fetch(`${apiUrlAuth}/check`, {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        handleAuthenticated(data.user.role);
      } else {
        handleUnauthenticated();
      }
    } else {
      handleUnauthenticated();
    }
  } catch (error) {
    handleAuthError(error);
  } finally {
    hideLoader();
  }
}

// Manejar la autenticación exitosa
function handleAuthenticated(role) {
  isAuthenticated = true;
  userRole = role;

  btnSignin.style.display = 'none'; // Ocultar botón de inicio de sesión
  toggleVisibility(authenticatedElements, true);

  if (role === 'admin') {
    toggleVisibility(adminOnlyElements, true);
  } else {
    toggleVisibility(adminOnlyElements, false);
  }
}

// Manejar la autenticación fallida
function handleUnauthenticated() {
  isAuthenticated = false;
  userRole = null;

  btnSignin.style.display = 'block'; // Mostrar botón de inicio de sesión
  toggleVisibility(authenticatedElements, false);
  toggleVisibility(adminOnlyElements, false);

  window.location.href = '../index.html'; // Redirigir a la página de inicio
}

// Mostrar u ocultar elementos basados en la autenticación
function toggleVisibility(elements, isVisible) {
  elements.forEach(el => el.style.display = isVisible ? 'block' : 'none');
}

// Manejar errores de autenticación
function handleAuthError(error) {
  console.error('Error al verificar autenticación:', error);
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'No se pudo verificar la autenticación. Inténtalo más tarde.',
  });
}

// Confirmar cierre de sesión
async function confirmLogout() {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Estás a punto de cerrar sesión.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    logout();
  }
}

// Cerrar sesión
async function logout() {
  try {
    const response = await fetch(`${apiUrlAuth}/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      Swal.fire('Cerraste sesión correctamente', '', 'success').then(() => {
        checkAuth(); // Verificar estado después del logout
      });
    } else {
      handleLogoutError(response);
    }
  } catch (error) {
    handleLogoutError(error);
  }
}

// Manejar errores de cierre de sesión
async function handleLogoutError(error) {
  const errorMessage = error.message || 'No se pudo cerrar sesión.';
  console.error('Error al cerrar sesión:', errorMessage);
  Swal.fire('Error', errorMessage, 'error');
}

// Obtener el perfil del usuario
async function fetchUserProfile() {
  try {
    const response = await fetch(`${apiUrlUsers}/profile`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const user = await response.json();
      populateUserProfile(user);
    } else {
      throw new Error('Error al obtener el perfil');
    }
  } catch (error) {
    handleProfileError(error);
  }
}

// Llenar los campos del perfil del usuario
function populateUserProfile(user) {
  document.getElementById('username').value = user.username;
  document.getElementById('email').value = user.email;
  document.getElementById('first_name').value = user.first_name;
  document.getElementById('last_name').value = user.last_name;
  document.getElementById('phone').value = user.phone;
  document.getElementById('address').value = user.address;
}

// Manejar errores al obtener el perfil
function handleProfileError(error) {
  console.error('Error al cargar el perfil:', error);
  Swal.fire('Error', 'No se pudo cargar el perfil. Inténtalo de nuevo.', 'error');
}

// Habilitar la edición de campos del perfil
function enableProfileEdit() {
  document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', handleProfileEditClick);
  });
}

// Manejar el clic para editar el perfil
function handleProfileEditClick(event) {
  const targetId = event.target.getAttribute('data-target');
  const inputField = document.getElementById(targetId);

  if (inputField.disabled) {
    inputField.disabled = false;
    inputField.focus();

    inputField.addEventListener('blur', () => {
      inputField.disabled = true;
      updateUserProfile(targetId);
    }, { once: true });
  }
}

// Actualizar el perfil del usuario
async function updateUserProfile(field) {
  const updatedData = {
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    first_name: document.getElementById('first_name').value,
    last_name: document.getElementById('last_name').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value
  };

  try {
    const response = await fetch(`${apiUrlUsers}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      Swal.fire('¡Perfil actualizado!', '', 'success');
    } else {
      throw new Error('Error al actualizar el perfil');
    }
  } catch (error) {
    handleProfileUpdateError(error);
  }
}

// Manejar errores al actualizar el perfil
function handleProfileUpdateError(error) {
  console.error('Error al actualizar el perfil:', error);
  Swal.fire('Error', 'Hubo un problema al actualizar el perfil. Inténtalo de nuevo.', 'error');
}
