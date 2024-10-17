const apiUrlUsers = 'https://api.secretariaarticulacionterritorial.com/api/users';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';
let isAuthenticated = false;
let userRole = null;

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

// Mostrar el loader cuando la página está cargando
document.body.classList.add('loading');

// Ocultar el loader cuando la autenticación esté lista
function hideLoader() {
  document.body.classList.remove('loading');
  document.body.classList.add('loaded');
}

// Manejo de autenticación
async function checkAuth() {
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
    console.error('Error al verificar autenticación:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo verificar la autenticación. Por favor, inténtalo de nuevo más tarde.',
    });
  } finally {
    hideLoader(); // Ocultar el loader al terminar la verificación
  }
}

function handleAuthenticated(role) {
  isAuthenticated = true;
  userRole = role;

  document.querySelector('.btn-signin').style.display = 'none';

  document.querySelectorAll('.authenticated').forEach(el => el.style.display = 'block');

  if (role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
  } else {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  }
}

function handleUnauthenticated() {
  isAuthenticated = false;
  userRole = null;

  document.querySelector('.btn-signin').style.display = 'block';
  document.querySelectorAll('.authenticated').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');

  window.location.href = '../index.html';
}

// Editar campos de perfil
function enableProfileEdit() {
  document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', (event) => {
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
    });
  });
}

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
    console.error('Error al actualizar el perfil:', error);
    Swal.fire('Error', 'Hubo un problema al actualizar el perfil. Inténtalo de nuevo.', 'error');
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
        checkAuth(); // Verificar el estado de autenticación después del logout
      });
    } else {
      const errorData = await response.json();
      Swal.fire('Error', errorData.message || 'No se pudo cerrar sesión.', 'error');
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    Swal.fire('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.', 'error');
  }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
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

  if (result.isConfirmed) logout();
});

// Obtener perfil del usuario
async function fetchUserProfile() {
  try {
    const response = await fetch(`${apiUrlUsers}/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (response.ok) {
      const user = await response.json();
      document.getElementById('username').value = user.username;
      document.getElementById('email').value = user.email;
      document.getElementById('first_name').value = user.first_name;
      document.getElementById('last_name').value = user.last_name;
      document.getElementById('phone').value = user.phone;
      document.getElementById('address').value = user.address;
    } else {
      throw new Error('Error al obtener el perfil');
    }
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    Swal.fire('Error', 'No se pudo cargar el perfil. Por favor, intenta de nuevo.', 'error');
  }
}

// Inicialización
function init() {
  checkAuth();
  fetchUserProfile();
  enableProfileEdit();
}

document.addEventListener('DOMContentLoaded', init);
