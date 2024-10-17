// API Endpoints
const apiUrlUsers = 'https://api.secretariaarticulacionterritorial.com/api/users';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Elementos de navegación
const navElements = {
    navIcon: document.getElementById("menubar"),
    menuResponsive: document.getElementById("menulist"),
    nav: document.getElementById("navID"),
    menuIcon: document.getElementById("menuIcon"),
    closeIcon: document.getElementById("closeIcon")
};

// Elementos del DOM
const domElements = {
    passwordField: document.getElementById('password'),
    togglePassword: document.getElementById('toggle-password'),
    addUserBtn: document.getElementById('addUserBtn'),
    addUserModal: document.getElementById('addUserModal'),
    closeAddUserModal: document.getElementById('closeAddUserModal'),
    editUserModal: document.getElementById('editUserModal'),
    closeEditUserModal: document.getElementById('closeEditUserModal'),
    overlay: document.getElementById('overlay'),
    usersBody: document.getElementById('usersBody'),
    addUserForm: document.getElementById('addUserForm'),
    editUserForm: document.getElementById('editUserForm'),
    searchInput: document.getElementById('searchInput'),
    searchType: document.getElementById('searchType'),
    noResultsMessage: document.getElementById('noResultsMessage'),
    usersTableContainer: document.getElementById('usersTableContainer')
};

// Estado de la aplicación
let isAuthenticated = false;
let userRole = null;

// Navegación: Mostrar/ocultar menú
function toggleNavMenu() {
    navElements.menuResponsive.classList.toggle("ullistshow");
    navElements.navIcon.classList.toggle("open");
}

navElements.navIcon.addEventListener("click", function (event) {
    event.stopPropagation();
    toggleNavMenu();
});

// Cerrar menú al hacer click fuera
document.addEventListener("click", function (event) {
    if (!navElements.nav.contains(event.target)) {
        navElements.menuResponsive.classList.remove("ullistshow");
        navElements.navIcon.classList.remove("open");
    }
});

// Mostrar/ocultar contraseña
domElements.togglePassword.addEventListener('click', function () {
    const isPassword = domElements.passwordField.getAttribute('type') === 'password';
    domElements.passwordField.setAttribute('type', isPassword ? 'text' : 'password');
    this.textContent = isPassword ? 'Ocultar' : 'Ver contraseña';
});

// Modales
function openModal(modal) {
    modal.classList.add('show');
    domElements.overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    domElements.overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

domElements.addUserBtn.addEventListener('click', () => {
    openModal(domElements.addUserModal);
    domElements.addUserForm.reset(); // Limpiar formulario
});

domElements.closeAddUserModal.addEventListener('click', () => closeModal(domElements.addUserModal));
domElements.closeEditUserModal.addEventListener('click', () => closeModal(domElements.editUserModal));

// Cerrar modal al hacer clic en el overlay o presionar 'Esc'
domElements.overlay.addEventListener('click', () => {
    closeModal(domElements.addUserModal);
    closeModal(domElements.editUserModal);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal(domElements.addUserModal);
        closeModal(domElements.editUserModal);
    }
});

// Loader
function showLoader() {
    document.body.classList.add('loading');
}

function hideLoader() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// Verificar autenticación del usuario
async function checkAuth() {
    showLoader();
    try {
        const response = await fetch(`${apiUrlAuth}/check`, { method: 'GET', credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            handleAuthState(data.authenticated, data.user.role);
        } else {
            handleUnauthenticated();
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        Swal.fire('Error', 'No se pudo verificar la autenticación.', 'error');
    } finally {
        hideLoader();
    }
}

function handleAuthState(authenticated, role) {
    isAuthenticated = authenticated;
    userRole = role;

    const signInButton = document.querySelector('.btn-signin');
    const authenticatedElements = document.querySelectorAll('.authenticated');
    const adminElements = document.querySelectorAll('.admin-only');

    signInButton.style.display = isAuthenticated ? 'none' : 'block';
    authenticatedElements.forEach(el => el.style.display = isAuthenticated ? 'block' : 'none');

    if (isAuthenticated) {
        adminElements.forEach(el => el.style.display = userRole === 'admin' ? 'block' : 'none');
    } else {
        handleUnauthenticated();
    }
}

function handleUnauthenticated() {
    isAuthenticated = false;
    userRole = null;
    document.querySelector('.btn-signin').style.display = 'block';
    document.querySelectorAll('.authenticated, .admin-only').forEach(el => el.style.display = 'none');
    window.location.href = '../index.html';
}

// CRUD: Obtener, agregar, editar y eliminar usuarios
async function fetchUsers() {
    try {
        const response = await fetch(apiUrlUsers, { method: 'GET', credentials: 'include' });
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

function renderUsers(users) {
    domElements.usersBody.innerHTML = users.length
        ? users.map(user => `
            <tr>
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
            </tr>`).join('')
        : '<tr><td colspan="9">No se encontraron usuarios.</td></tr>';
}

// Agregar un nuevo usuario
async function addUser(userData) {
    await handleUserRequest('create', 'POST', userData);
}

// Editar un usuario
async function editUser(userData) {
    await handleUserRequest(userData.id, 'PUT', userData);
}

// Manejar las solicitudes CRUD (crear, editar y eliminar)
async function handleUserRequest(endpoint, method, userData) {
    try {
        const response = await fetch(`${apiUrlUsers}/${endpoint}`, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const result = await response.json();

        if (response.ok) {
            Swal.fire('Éxito', 'Operación exitosa.', 'success');
            fetchUsers();
            closeModal(method === 'POST' ? domElements.addUserModal : domElements.editUserModal);
        } else {
            throw new Error(result.message || 'Error en la operación');
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Eliminar un usuario
async function deleteUser(userId) {
    await handleUserRequest(userId, 'DELETE');
}

// Formularios de agregar y editar
domElements.addUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUser = getUserFormData();
    addUser(newUser);
});

domElements.editUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const editedUser = getUserFormData(true);
    editUser(editedUser);
});

function getUserFormData(isEdit = false) {
    const formIdPrefix = isEdit ? 'edit' : '';
    return {
        id: document.getElementById(`${formIdPrefix}UserId`)?.value,
        username: document.getElementById(`${formIdPrefix}Username`).value.trim(),
        email: document.getElementById(`${formIdPrefix}Email`).value.trim(),
        first_name: document.getElementById(`${formIdPrefix}FirstName`).value.trim(),
        last_name: document.getElementById(`${formIdPrefix}LastName`).value.trim(),
        phone: document.getElementById(`${formIdPrefix}Phone`).value.trim(),
        address: document.getElementById(`${formIdPrefix}Address`).value.trim(),
        role: document.getElementById(`${formIdPrefix}Role`).value.trim()
    };
}

// Inicialización
checkAuth();
fetchUsers();
