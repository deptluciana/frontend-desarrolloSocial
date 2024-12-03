const apiUrlSolicitudes = 'https://api.secretariaarticulacionterritorial.com/api/auth/solicitudes';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Estado de la aplicación
let isAuthenticated = false;

// Barra de navegación
const navIcon = document.getElementById("menubar");
const menuResponsive = document.getElementById("menulist");
const nav = document.getElementById("navID");

// Modal y Overlay
const overlay = document.getElementById('overlay');

// Mostrar/ocultar loader
function showLoader() {
    document.body.classList.add('loading');
}

function hideLoader() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// Verificar autenticación
async function checkAuth() {
    showLoader();
    try {
        const response = await fetch(`${apiUrlAuth}/check`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
                isAuthenticated = true;
            } else {
                handleUnauthenticated();
            }
        } else {
            handleUnauthenticated();
        }
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        handleUnauthenticated();
    } finally {
        hideLoader();
    }
}

// Manejar autenticación fallida
function handleUnauthenticated() {
    isAuthenticated = false;
    window.location.href = '../index.html'; // Redirigir a la página de inicio
}

// Obtener y mostrar solicitudes
async function fetchSolicitudes() {
    showLoader();
    try {
        const response = await fetch(apiUrlSolicitudes, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            console.error('Error al obtener las solicitudes:', response.status, response.statusText);
            return;
        }

        const solicitudes = await response.json();
        renderSolicitudes(solicitudes);
    } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
    } finally {
        hideLoader();
    }
}

// Renderizar solicitudes en la tabla
function renderSolicitudes(solicitudes) {
    const solicitudesBody = document.getElementById('solicitudesBody');
    solicitudesBody.innerHTML = '';

    if (solicitudes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5">No se encontraron solicitudes.</td>`;
        solicitudesBody.appendChild(row);
    } else {
        solicitudes.forEach(solicitud => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${solicitud.username}</td>
                <td>${solicitud.email}</td>
                <td>${solicitud.first_name}</td>
                <td>${solicitud.last_name}</td>
                <td>${solicitud.phone || 'N/A'}</td>
                <td>${solicitud.address || 'N/A'}</td>
                <td>
                    <button class="btn-success acceptSolicitudBtn" data-id="${solicitud.id}">Aceptar</button>
                    <button class="btn-danger rejectSolicitudBtn" data-id="${solicitud.id}">Rechazar</button>
                </td>
            `;
            solicitudesBody.appendChild(row);
        });
    }
}

// Aceptar solicitud
async function acceptSolicitud(solicitudId) {
    showLoader();
    try {
        const response = await fetch(`${apiUrlSolicitudes}/${solicitudId}/accept`, {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            Swal.fire('Éxito', 'Solicitud aceptada.', 'success');
            fetchSolicitudes(); // Actualizar la tabla después de aceptar
        } else {
            Swal.fire('Error', 'No se pudo aceptar la solicitud.', 'error');
        }
    } catch (error) {
        console.error('Error al aceptar la solicitud:', error);
        Swal.fire('Error', 'Error al aceptar la solicitud.', 'error');
    } finally {
        hideLoader();
    }
}

// Rechazar solicitud
async function rejectSolicitud(solicitudId) {
    showLoader();
    try {
        const response = await fetch(`${apiUrlSolicitudes}/${solicitudId}/reject`, {
            method: 'POST',
            credentials: 'include',
        });

        if (response.ok) {
            Swal.fire('Éxito', 'Solicitud rechazada.', 'success');
            fetchSolicitudes(); // Actualizar la tabla después de rechazar
        } else {
            Swal.fire('Error', 'No se pudo rechazar la solicitud.', 'error');
        }
    } catch (error) {
        console.error('Error al rechazar la solicitud:', error);
        Swal.fire('Error', 'Error al rechazar la solicitud.', 'error');
    } finally {
        hideLoader();
    }
}

// Manejar eventos de aceptar y rechazar solicitudes
document.getElementById('solicitudesBody').addEventListener('click', (event) => {
    if (event.target.classList.contains('acceptSolicitudBtn')) {
        const solicitudId = event.target.dataset.id;
        Swal.fire({
            title: '¿Está seguro?',
            text: '¿Desea aceptar esta solicitud?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, aceptar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                acceptSolicitud(solicitudId);
            }
        });
    } else if (event.target.classList.contains('rejectSolicitudBtn')) {
        const solicitudId = event.target.dataset.id;
        Swal.fire({
            title: '¿Está seguro?',
            text: '¿Desea rechazar esta solicitud?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                rejectSolicitud(solicitudId);
            }
        });
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchSolicitudes();
});
