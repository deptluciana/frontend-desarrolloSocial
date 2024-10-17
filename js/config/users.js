// Constantes globales
const apiUrlUsers = 'https://api.secretariaarticulacionterritorial.com/api/users';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Elementos DOM
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");
const menuIcon = document.getElementById("menuIcon");
const closeIcon = document.getElementById("closeIcon");

const addUserBtn = document.getElementById('addUserBtn');
const addUserModal = document.getElementById('addUserModal');
const closeAddUserModal = document.getElementById('closeAddUserModal');
const editUserModal = document.getElementById('editUserModal');
const closeEditUserModal = document.getElementById('closeEditUserModal');
const overlay = document.getElementById('overlay');
const loader = document.getElementById('loader'); // Asumiendo que hay un elemento loader en el HTML
const usersBody = document.getElementById('usersBody');

// Estado de autenticación
let isAuthenticated = false;
let userRole = null;

// Funciones comunes
const toggleLoader = (show) => {
    loader.style.display = show ? 'block' : 'none';
};

const openModal = (modal) => {
    modal.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
};

const closeModal = (modal) => {
    modal.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
};

// Navbar responsivo
navIcon.addEventListener("click", function (event) {
    event.stopPropagation();
    menuResponsive.classList.toggle("ullistshow");
    navIcon.classList.toggle("open");
});

document.addEventListener("click", function (event) {
    if (!nav.contains(event.target)) {
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

// Manejo de autenticación
const checkAuth = async () => {
    toggleLoader(true);
    try {
        const response = await fetch(`${apiUrlAuth}/check`, {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok && data.authenticated) {
            isAuthenticated = true;
            userRole = data.user.role;
            document.querySelector('.btn-signin').style.display = 'none';
            toggleAuthElements(true);
        } else {
            handleUnauthenticated();
        }
    } catch (error) {
        showError('No se pudo verificar la autenticación. Por favor, inténtalo de nuevo más tarde.');
    } finally {
        toggleLoader(false);
    }
};

const handleUnauthenticated = () => {
    isAuthenticated = false;
    userRole = null;
    document.querySelector('.btn-signin').style.display = 'block';
    toggleAuthElements(false);
    window.location.href = '../index.html';
};

const toggleAuthElements = (authenticated) => {
    const authElements = document.querySelectorAll('.authenticated');
    const adminElements = document.querySelectorAll('.admin-only');

    authElements.forEach(el => el.style.display = authenticated ? 'block' : 'none');
    adminElements.forEach(el => el.style.display = (authenticated && userRole === 'admin') ? 'block' : 'none');
};

// Funciones de usuarios
const fetchUsers = async () => {
    toggleLoader(true);
    try {
        const response = await fetch(apiUrlUsers, {
            method: 'GET',
            credentials: 'include'
        });
        const users = await response.json();
        response.ok ? renderUsers(users) : showError('Error al obtener los usuarios.');
    } catch (error) {
        showError('Error al obtener los usuarios.');
    } finally {
        toggleLoader(false);
    }
};

const renderUsers = (users) => {
    usersBody.innerHTML = '';
    if (users.length === 0) {
        usersBody.innerHTML = '<tr><td colspan="9">No se encontraron usuarios.</td></tr>';
    } else {
        users.forEach(user => {
            usersBody.insertAdjacentHTML('beforeend', `
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
                </tr>
            `);
        });
    }
};

const addUser = async (userData) => {
    toggleLoader(true);
    try {
        const response = await fetch(`${apiUrlUsers}/create`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();
        if (response.ok) {
            Swal.fire('Éxito', 'Usuario agregado exitosamente.', 'success');
            fetchUsers();
            closeModal(addUserModal);
        } else {
            showError(result.message || 'Error al agregar el usuario');
        }
    } catch (error) {
        showError('Error al agregar el usuario: ' + error.message);
    } finally {
        toggleLoader(false);
    }
};

// Función genérica para mostrar errores
const showError = (message) => {
    Swal.fire('Error', message, 'error');
};

// Inicializar eventos y cargar datos
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchUsers();
});


