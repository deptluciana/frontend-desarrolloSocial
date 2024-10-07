const apiUrlUsers = 'http://localhost:5000/api/users';
const apiUrlAuth = 'http://localhost:5000/api/auth';

// Barra de navegación
let dropdowns = document.querySelectorAll('.navbar .dropdown-toggler');
let dropdownIsOpen = false;

if (dropdowns.length) {
    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener('click', (event) => {
            let target = document.querySelector(`#${event.target.dataset.dropdown}`);
            if (target) {
                target.classList.toggle('show');
                dropdownIsOpen = target.classList.contains('show');
            }
        });
    });
}

window.addEventListener('mouseup', (event) => {
    if (dropdownIsOpen) {
        dropdowns.forEach((dropdownButton) => {
            let dropdown = document.querySelector(`#${dropdownButton.dataset.dropdown}`);
            let targetIsDropdown = dropdown === event.target;

            if (dropdownButton !== event.target && !targetIsDropdown && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});

function handleSmallScreens() {
    document.querySelector('.navbar-toggler')
        .addEventListener('click', () => {
            let navbarMenu = document.querySelector('.navbar-menu');

            if (!navbarMenu.classList.contains('active')) {
                navbarMenu.classList.add('active');
            } else {
                navbarMenu.classList.remove('active');
            }
        });
}

// Mostrar/ocultar contraseña en el registro
document.getElementById('toggle-password').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Ver contraseña' : 'Ocultar';
});


// Modal y Overlay
const addUserBtn = document.getElementById('addUserBtn');
const addUserModal = document.getElementById('addUserModal');
const closeAddUserModal = document.getElementById('closeAddUserModal');
const editUserModal = document.getElementById('editUserModal');
const closeEditUserModal = document.getElementById('closeEditUserModal');
const overlay = document.getElementById('overlay');

// Mostrar modal para agregar usuario
addUserBtn.addEventListener('click', () => {
    addUserModal.style.display = 'block';
    overlay.style.display = 'block';
    document.getElementById('addUserForm').reset(); // Limpiar el formulario
});

// Cerrar modal de agregar
closeAddUserModal.addEventListener('click', () => {
    addUserModal.style.display = 'none';
    overlay.style.display = 'none';
});

// Cerrar modal de editar
closeEditUserModal.addEventListener('click', () => {
    editUserModal.style.display = 'none';
    overlay.style.display = 'none';
});

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
        userRole = data.user.role; 

        document.querySelector('.btn-signin').style.display = 'none';

        document.querySelectorAll('.authenticated').forEach(el => {
          el.style.display = 'block';
        });

        if (userRole === 'admin') {
          document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'block';
          });
        } else if (userRole === 'user') {
          document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
          });
        }

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
  
  window.location.href = '../index.html';
}

// Obtener todos los usuarios y mostrarlos en la tabla
async function fetchUsers() {
    try {
        const response = await fetch(apiUrlUsers, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Error al obtener los usuarios:', response.status, response.statusText);
            return;
        }

        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    }
}

// Función para renderizar los usuarios en la tabla
function renderUsers(users) {
    const usersBody = document.getElementById('usersBody');
    usersBody.innerHTML = '';

    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="9">No se encontraron usuarios.</td>`;
        usersBody.appendChild(row);
    } else {
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.first_name}</td>
                <td>${user.last_name}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.address || 'N/A'}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn-secondary editUserBtn" data-id="${user.id}">Editar</button>
                    <button class="btn-danger deleteUserBtn" data-id="${user.id}">Eliminar</button>
                </td>
            `;
            usersBody.appendChild(row);
        });
    }
}

// Agregar un nuevo usuario
async function addUser(userData) {
    try {
        const response = await fetch(`${apiUrlUsers}/create`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire('Éxito', 'Usuario agregado exitosamente.', 'success');
            fetchUsers();
            addUserModal.style.display = 'none';
            overlay.style.display = 'none';
        } else {
            Swal.fire('Error', result.message || 'Error al agregar el usuario', 'error');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        Swal.fire('Error', 'Error al agregar el usuario: ' + error.message, 'error');
    }
}

// Editar un usuario
async function editUser(userData) {
    try {
        const response = await fetch(`${apiUrlUsers}/${userData.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire('Éxito', 'Usuario editado exitosamente.', 'success');
            fetchUsers();
            editUserModal.style.display = 'none';
            overlay.style.display = 'none';
        } else {
            const errorMessage = result.errors ? result.errors.join(', ') : result.message || 'Error al editar el usuario';
            Swal.fire('Error', errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error editing user:', error);
        Swal.fire('Error', 'Error al editar el usuario: ' + error.message, 'error');
    }
}

// Agregar usuario
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newUser = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        role: document.getElementById('role').value,
    };
    addUser(newUser);
});

// Editar usuario
document.getElementById('usersBody').addEventListener('click', (event) => {
    if (event.target.classList.contains('editUserBtn')) {
        const userId = event.target.dataset.id;
        const userRow = event.target.closest('tr');
        const userData = {
            id: userId,
            username: userRow.cells[1].textContent,
            email: userRow.cells[2].textContent,
            first_name: userRow.cells[3].textContent,
            last_name: userRow.cells[4].textContent,
            phone: userRow.cells[5].textContent,
            address: userRow.cells[6].textContent,
            role: userRow.cells[7].textContent,
        };

        // Rellenar el formulario de edición
        document.getElementById('editUserId').value = userData.id;
        document.getElementById('editUsername').value = userData.username;
        document.getElementById('editEmail').value = userData.email;
        document.getElementById('editFirstName').value = userData.first_name;
        document.getElementById('editLastName').value = userData.last_name;
        document.getElementById('editPhone').value = userData.phone;
        document.getElementById('editAddress').value = userData.address;
        document.getElementById('editRole').value = userData.role;

        editUserModal.style.display = 'block';
        overlay.style.display = 'block';
    } else if (event.target.classList.contains('deleteUserBtn')) {
        const userId = event.target.dataset.id;

        Swal.fire({
            title: '¿Está seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUser(userId);
            }
        });
    }
});

// Manejar el envío del formulario de editar usuario
document.getElementById('editUserForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const editedUser = {
        id: document.getElementById('editUserId').value,
        username: document.getElementById('editUsername').value,
        email: document.getElementById('editEmail').value,
        first_name: document.getElementById('editFirstName').value,
        last_name: document.getElementById('editLastName').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        role: document.getElementById('editRole').value,
    };

    editUser(editedUser);
});

// Eliminar un usuario
async function deleteUser(userId) {
    try {
        const response = await fetch(`${apiUrlUsers}/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            Swal.fire('Éxito', 'Usuario eliminado exitosamente.', 'success');
            fetchUsers(); // Actualizar la tabla de usuarios después de la eliminación
        } else {
            Swal.fire('Error', 'Error al eliminar el usuario.', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        Swal.fire('Error', 'Error al eliminar el usuario: ' + error.message, 'error');
    }
}

// Filtro de búsqueda dinámico
document.getElementById('searchInput').addEventListener('input', filterUsers);

function filterUsers() {
    const searchType = document.getElementById('searchType').value;
    const searchValue = document.getElementById('searchInput').value.toLowerCase();

    const rows = document.querySelectorAll('#usersBody tr');
    let found = false;

    rows.forEach(row => {
        const username = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();

        if (searchType === 'username' && username.includes(searchValue)) {
            row.style.display = '';
            found = true;
        } else if (searchType === 'email' && email.includes(searchValue)) {
            row.style.display = '';
            found = true;
        } else {
            row.style.display = 'none';
        }
    });

    const noResultsMessage = document.getElementById('noResultsMessage');
    if (!found) {
        if (!noResultsMessage) {
            const message = document.createElement('p');
            message.id = 'noResultsMessage';
            message.textContent = 'No se encontraron usuarios.';
            document.getElementById('usersTableContainer').appendChild(message);
        }
    } else {
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

// Inicializar
checkAuth();
fetchUsers();
handleSmallScreens();
