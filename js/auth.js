// URLs de la API
const apiUrlUsers = 'https://backend-desarrollosocial-production-4486.up.railway.app/api/users';

// Elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeModalButtons = document.querySelectorAll('.modal .close');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const mainButtons = document.querySelectorAll('.btn, .tarjeta .boton'); // Botones en la página principal

// Función para abrir un modal
function openModal(modal) {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

// Función para cerrar un modal
function closeModalFunction(modal) {
  modal.classList.remove('show');
  document.body.style.overflow = 'auto'; // Permitir scroll del body
}

// Mostrar el modal de inicio de sesión al hacer clic en "Iniciar sesión"
loginBtn.addEventListener('click', () => {
  openModal(loginModal);
});

// Cerrar modales al hacer clic en los botones de cerrar ("×")
closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    closeModalFunction(loginModal);
    closeModalFunction(registerModal);
  });
});

// Cerrar modales al hacer clic fuera del contenido del modal
window.addEventListener('click', (event) => {
  if (event.target === loginModal) {
    closeModalFunction(loginModal);
  } else if (event.target === registerModal) {
    closeModalFunction(registerModal);
  }
});

// Alternar entre modales de login y registro
showRegister.addEventListener('click', (e) => {
  e.preventDefault();
  closeModalFunction(loginModal);
  openModal(registerModal);
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  closeModalFunction(registerModal);
  openModal(loginModal);
});

// Añadir eventos a los botones de la página principal para abrir el modal de login
mainButtons.forEach(button => {
  button.addEventListener('click', () => {
    openModal(loginModal);
  });
});

// Función para mostrar/ocultar la contraseña
function togglePasswordVisibility(toggleBtnId, passwordFieldId) {
  const toggleBtn = document.getElementById(toggleBtnId);
  const passwordField = document.getElementById(passwordFieldId);

  if (toggleBtn && passwordField) {
    toggleBtn.addEventListener('click', function () {
      const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordField.setAttribute('type', type);
      this.textContent = type === 'password' ? 'Ver contraseña' : 'Ocultar';
    });
  }
}

// Mostrar/ocultar contraseña en el login
togglePasswordVisibility('toggle-password', 'login-password');

// Mostrar/ocultar contraseña en el registro
togglePasswordVisibility('toggle-register-password', 'register-password');

// Función para manejar el inicio de sesión
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorMessage = document.getElementById('error-message');

  // Agrega un alert para verificar los datos que estás enviando
  alert(`Email: ${email}, Password: ${password}`);

  try {
    const response = await fetch(`${apiUrlAuth}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    // Agrega un alert para mostrar el estado de la respuesta
    alert(`Response Status: ${response.status}, Data: ${JSON.stringify(data)}`);

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Inicio de sesión exitoso.',
        timer: 2000,
        showConfirmButton: true
      }).then(() => {
        window.location.href = '/';
      });
    } else {
      errorMessage.textContent = data.message || 'Error en el inicio de sesión.';
      // Agrega un alert para ver el mensaje de error
      alert(`Error: ${data.message || 'Error en el inicio de sesión.'}`);
    }
  } catch (error) {
    errorMessage.textContent = 'Error en el inicio de sesión.';
    // Agrega un alert para ver el error en el catch
    alert(`Error catch: ${error.message}`);
    console.error('Error en el inicio de sesión:', error);
  }
}

// Función para manejar el registro de usuario
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const first_name = document.getElementById('register-first-name').value.trim();
  const last_name = document.getElementById('register-last-name').value.trim();
  const phone = document.getElementById('register-phone').value.trim();
  const address = document.getElementById('register-address').value.trim();
  const errorMessage = document.getElementById('error-message-register');

  try {
    const response = await fetch(`${apiUrlAuth}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        email,
        password,
        first_name,
        last_name,
        phone,
        address
      }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Registrado',
        text: 'Registro exitoso. Puedes iniciar sesión ahora.',
        timer: 2000,
        showConfirmButton: true
      }).then(() => {
        closeModalFunction(registerModal);
        openModal(loginModal);
      });
    } else {
      errorMessage.textContent = data.message || 'Error en el registro.';
    }
  } catch (error) {
    errorMessage.textContent = 'Error en el registro.';
    console.error('Error en el registro:', error);
  }
}

// Añadir eventos a los formularios
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);

// Cerrar modales al presionar la tecla 'Esc'
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModalFunction(loginModal);
    closeModalFunction(registerModal);
  }
});
