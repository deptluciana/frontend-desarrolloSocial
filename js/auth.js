// Elementos del DOM
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeModalButtons = document.querySelectorAll('.close');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');

// Mostrar el modal de inicio de sesión
loginBtn.onclick = function () {
  loginModal.style.display = 'flex';
}

// Cerrar modales
closeModalButtons.forEach(button => {
  button.onclick = function () {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
  };
});

// Cerrar modal al hacer clic fuera del contenido
window.onclick = function (event) {
  if (event.target === loginModal || event.target === registerModal) {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
  }
};

// Alternar entre modales
showRegister.onclick = function (e) {
  e.preventDefault();
  loginModal.style.display = 'none';
  registerModal.style.display = 'flex';
}

showLogin.onclick = function (e) {
  e.preventDefault();
  registerModal.style.display = 'none';
  loginModal.style.display = 'flex';
}

// Mostrar/ocultar contraseña en el login
document.getElementById('toggle-password').addEventListener('click', function () {
  const passwordField = document.getElementById('login-password');
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  this.textContent = type === 'password' ? 'Ver contraseña' : 'Ocultar';
});

// Lógica para el inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorMessage = document.getElementById('error-message');

  try {

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Inicio de sesión exitoso.',
        timer: 2000,
        showConfirmButton: true
      }).then(() => {
        window.location.href = '/frontend/index.html';
      });
    } else {
      errorMessage.textContent = data.message;
    }
  } catch (error) {
    errorMessage.textContent = 'Error en el inicio de sesión.';
  }
});

// Mostrar/ocultar contraseña en el registro
document.getElementById('toggle-register-password').addEventListener('click', function () {
  const passwordField = document.getElementById('register-password');
  const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordField.setAttribute('type', type);
  this.textContent = type === 'password' ? 'Ver contraseña' : 'Ocultar';
});

// Lógica para el registro de usuario
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const first_name = document.getElementById('register-first-name').value; // Nombre
  const last_name = document.getElementById('register-last-name').value; // Apellido
  const phone = document.getElementById('register-phone').value;
  const address = document.getElementById('register-address').value;
  const errorMessage = document.getElementById('error-message-register');

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
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
        // Opcional: cerrar el modal de registro y abrir el de login
        registerModal.style.display = 'none';
        loginModal.style.display = 'flex';
      });
    } else {
      errorMessage.textContent = data.message;
    }
  } catch (error) {
    errorMessage.textContent = 'Error en el registro.';
  }
});

