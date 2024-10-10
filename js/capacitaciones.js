// Variables globales
let isAuthenticated = false;
let userRole = null;
let currentEventoId = null;

const principalPanel = document.querySelector('.eventos-contenedor'); // Contenedor principal para los paneles

// Modal y elementos de edición de paneles
const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-modal');
const editForm = document.getElementById('editForm');
const editIdInput = document.getElementById('editId');
const editTitleInput = document.getElementById('editTitleInput');
const editUbiInput = document.getElementById('editUbiInput');
const editHorariosInput = document.getElementById('editHorariosInput');
const editDescriptionInput = document.getElementById('editDescriptionInput');

// Elementos del DOM para agregar nuevos paneles
const agregarEventoBtn = document.getElementById('addEventBtn');
const addModal = document.getElementById('addModal');
const closeAddModalBtn = document.querySelector('.close-add-modal');
const addForm = document.getElementById('addForm');
const addTitleInput = document.getElementById('addTitleInput');
const addUbiInput = document.getElementById('addUbiInput');
const addHorariosInput = document.getElementById('addHorariosInput');
const addDescriptionInput = document.getElementById('addDescriptionInput');

// Función de inicialización
async function initApp() {
    await checkAuth(); // Comprobar autenticación
    loadCapPanels(); // Cargar paneles de información
    attachAddPanelEvent(); // Asignar evento al botón de agregar panel
}

// -----------------------
// Gestión de eventos de Información
// -----------------------
// Función para cargar los paneles de información de la sección actual
async function loadCapPanels() {

    // Mostrar un mensaje de carga
    principalPanel.innerHTML = '<p>Cargando información...</p>';

    try {
        const response = await fetch('http://localhost:5000/api/capacitacion/', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const capacitacionesList  = await response.json();
            renderPanels(capacitacionesList );
        } else {
            const errorData = await response.json();
            principalPanel.innerHTML = `<p>Error: ${errorData.message}</p>`;
        }
    } catch (error) {
        console.error('Error al cargar los paneles de información:', error);
        principalPanel.innerHTML = `<p>Ocurrió un error al cargar la información.</p>`;
    }
}

// Función para renderizar los paneles de información en el DOM
function renderPanels(capacitacionesList) {
    if (capacitacionesList.length === 0) {
        principalPanel.innerHTML = '<p>No hay información para mostrar en esta sección.</p>';
        return;
    }

    // Limpiar el contenedor principal
    principalPanel.innerHTML = '';

    capacitacionesList.forEach(info => {
        const panel = document.createElement('div');
        panel.classList.add('evento-tarjeta');
        panel.setAttribute('data-info-id', info.id);

        panel.innerHTML = `
                <div class="evento-icono">
                        <i class="fas fa-calendar-check"></i>
                 </div>
                  <div class="iconos-subpanel">
                    <i class="fas fa-edit editar-subpanel" title="Editar"></i>
                    <i class="fas fa-trash-alt eliminar-subpanel" title="Eliminar"></i>
                </div>
                <div class="evento-info">
                        <h3>${info.title}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${info.ubicacion}</p>
                        <p><i class="fas fa-calendar-alt"></i> ${info.horarios}<//p>
                        <br/><br/>
                        <p> ${info.description}</p>
                    </div>
        `;

        // Agregar eventos para los iconos de editar y eliminar
        const editIcon = panel.querySelector('.editar-subpanel');
        const deleteIcon = panel.querySelector('.eliminar-subpanel');

        // Solo mostrar los iconos si el usuario es admin
        if (userRole === 'admin') {
            editIcon.style.display = 'inline-block';
            deleteIcon.style.display = 'inline-block';

            editIcon.addEventListener('click', () => openEditModal(info));
            deleteIcon.addEventListener('click', () => confirmDeletePanel(info.id));
        } else {
            editIcon.style.display = 'none';
            deleteIcon.style.display = 'none';
        }

        principalPanel.appendChild(panel);
    });
}


// Función para abrir el modal de edición de paneles
function openEditModal(info) {
    editIdInput.value = info.id;
    editTitleInput.value = info.title;
    editUbiInput.value = info.ubicacion;
    editHorariosInput.value = info.horarios;
    editDescriptionInput.value = info.description;
    editModal.style.display = 'block';
}

// Cerrar el modal de edición al hacer clic en la 'x'
closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});


// Manejar el envío del formulario de edición de paneles
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editIdInput.value;
    const title = editTitleInput.value.trim();
    const ubicacion = editUbiInput.value.trim();
    const horarios = editHorariosInput.value.trim(); 
    const description = editDescriptionInput.value.trim();

    if (!title || !description) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'El título y la descripción son obligatorios.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/capacitacion/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, ubicacion, horarios, description }),
            credentials: 'include',
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Información actualizada correctamente.',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                editModal.style.display = 'none';
                // Recargar los paneles de información para reflejar los cambios
                loadCapPanels();
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error: ${errorData.message}`,
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al actualizar la información:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar la información.',
            confirmButtonText: 'Aceptar'
        });
    }
});

// Función para confirmar la eliminación de un panel
function confirmDeletePanel(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¿Deseas eliminar este panel?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            deletePanel(id);
        }
    });
}


// Función para eliminar un panel de información
async function deletePanel(id) {
    try {
        const response = await fetch(`http://localhost:5000/api/capacitacion/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Panel eliminado correctamente.',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                // Recargar los paneles de información para reflejar los cambios
                loadCapPanels();
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error: ${errorData.message}`,
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al eliminar el panel:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar el panel.',
            confirmButtonText: 'Aceptar'
        });
    }
}


// Agregar Nuevos Paneles de Información

// Asignar evento al botón de agregar panel
function attachAddPanelEvent() {
    if (agregarEventoBtn && userRole === 'admin') {
        agregarEventoBtn.addEventListener('click', openAddModal);
    }
}

// Función para abrir el modal de agregar panel
function openAddModal() {
    addTitleInput.value = '';
    addUbiInput.value = '';
    addHorariosInput.value = '';
    addTitleInput.value = '';
    addDescriptionInput.value = '';
    addModal.style.display = 'block';
}

// Cerrar el modal de agregar panel al hacer clic en la 'x'
closeAddModalBtn.addEventListener('click', () => {
    addModal.style.display = 'none';
});


// Manejar el envío del formulario de agregar panel
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = addTitleInput.value.trim();
    const ubicacion = addUbiInput.value.trim();
    const horarios = addHorariosInput.value.trim();
    const description = addDescriptionInput.value.trim();

    if (!title || !description) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'El título y la descripción son obligatorios.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/capacitacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, ubicacion, horarios,description  }),
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Panel agregado correctamente.',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                addModal.style.display = 'none';
                // Recargar los paneles de información para incluir el nuevo panel
                loadCapPanels();
            });
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error: ${errorData.message}`,
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al agregar el panel:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al agregar el panel.',
            confirmButtonText: 'Aceptar'
        });
    }
});


// Función para comprobar si la sesión está activa y obtener el rol
async function checkAuth() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
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
        handleUnauthenticated();
    }
}

// Función para manejar usuarios autenticados
function handleAuthenticated(role) {
    isAuthenticated = true;
    userRole = role;

    // Agregar clase 'admin' al body si el usuario es admin
    if (userRole === 'admin') {
        document.body.classList.add('admin');
    }

    // Mostrar el botón de agregar panel si es admin
      // Mostrar el botón de agregar panel si es admin
      if (agregarEventoBtn) {
        if (userRole === 'admin') {
            agregarEventoBtn.style.display = 'inline-block'; // Mostrar solo si es admin
        } else {
            agregarEventoBtn.style.display = 'none'; // Ocultar si no es admin
        }
    }

    // Asignar evento al botón de agregar panel
    attachAddPanelEvent();
}

// Función para manejar usuarios no autenticados
function handleUnauthenticated() {
    isAuthenticated = false;
    userRole = null;


    // Mostrar solo la sección de archivos subidos
    if (fileList) {
        document.getElementById('archivos-subidos').style.display = 'block';
    }

    // Asegurarse de que los botones de eliminar estén ocultos
    document.querySelectorAll('.delete-button').forEach(button => {
        button.style.display = 'none';
    });

    // Remover clase 'admin' del body si existía
    document.body.classList.remove('admin');

    // Ocultar el botón de agregar panel
    if (agregarPanelBtn) {
        agregarPanelBtn.style.display = 'none';
    }
}
document.addEventListener('DOMContentLoaded', initApp);