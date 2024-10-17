const apiUrlUsers = 'https://api.secretariaarticulacionterritorial.com/api/users';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Estado de la aplicación
let isAuthenticated = false;
let userRole = null;

// Barra de navegación
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");
const menuIcon = document.getElementById("menuIcon");
const closeIcon = document.getElementById("closeIcon");

// Modal y Overlay
const addUserBtn = document.getElementById('addUserBtn');
const addUserModal = document.getElementById('addUserModal');
const closeAddUserModal = document.getElementById('closeAddUserModal');
const editUserModal = document.getElementById('editUserModal');
const closeEditUserModal = document.getElementById('closeEditUserModal');
const overlay = document.getElementById('overlay');


// Eventos para la barra de navegación
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

// Mostrar/ocultar contraseña en el registro
document.getElementById('toggle-password').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordField.setAttribute('type', type);
    this.textContent = type === 'password' ? 'Ver contraseña' : 'Ocultar';
});

// Funciones para abrir y cerrar modales
function openModal(modal) {
    modal.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Mostrar modal para agregar usuario
addUserBtn.addEventListener('click', () => {
    openModal(addUserModal);
    document.getElementById('addUserForm').reset(); // Limpiar el formulario
});

// Cerrar modal de agregar
closeAddUserModal.addEventListener('click', () => {
    closeModal(addUserModal);
});

// Cerrar modal de editar
closeEditUserModal.addEventListener('click', () => {
    closeModal(editUserModal);
});

// Cerrar modales al hacer clic en el overlay
overlay.addEventListener('click', () => {
    closeModal(addUserModal);
    closeModal(editUserModal);
});

// Cerrar modales al presionar la tecla 'Esc'
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal(addUserModal);
        closeModal(editUserModal);
    }
});

// Mostrar/ocultar loader
function showLoader() {
    document.body.classList.add('loading');
}

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
            closeModal(addUserModal);
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
            closeModal(editUserModal);
        } else {
            const errorMessage = result.errors ? result.errors.join(', ') : result.message || 'Error al editar el usuario';
            Swal.fire('Error', errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error editing user:', error);
        Swal.fire('Error', 'Error al editar el usuario: ' + error.message, 'error');
    }
}

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

// Manejar el envío del formulario de agregar usuario
document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newUser = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        role: document.getElementById('role').value
    };
    addUser(newUser);
});

// Manejar el envío del formulario de editar usuario
document.getElementById('editUserForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

    const editedUser = {
        id: document.getElementById('editUserId').value,
        username: document.getElementById('editUsername').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        first_name: document.getElementById('editFirstName').value.trim(),
        last_name: document.getElementById('editLastName').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        address: document.getElementById('editAddress').value.trim(),
        role: document.getElementById('editRole').value
    };

    editUser(editedUser);
});

// Manejar eventos de editar y eliminar usuarios
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
        document.getElementById('editPhone').value = userData.phone === 'N/A' ? '' : userData.phone;
        document.getElementById('editAddress').value = userData.address === 'N/A' ? '' : userData.address;
        document.getElementById('editRole').value = userData.role;

        openModal(editUserModal);
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
            message.style.textAlign = 'center';
            message.style.marginTop = '20px';
            document.getElementById('usersTableContainer').appendChild(message);
        }
    } else {
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchUsers();
});
