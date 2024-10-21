// URLs de la API
const apiUrlInfo = 'https://api.secretariaarticulacionterritorial.com/api/info';
const apiUrlFile = 'https://api.secretariaarticulacionterritorial.com/api/files';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Variables globales
let isAuthenticated = false;
let userRole = null;
let currentInfoId = null;
let currentInfoType = null;

// Elementos del DOM para la gestión de archivos
const uploadForm = document.getElementById('uploadForm');
const fileList = document.getElementById('fileList');
const fileInput = document.getElementById('fileInput');
const fileNameSpan = document.getElementById('file-name');
const uploadSection = document.querySelector('.upload-section');
const section = uploadForm.getAttribute('data-section');

// Elementos del DOM para la gestión de paneles de información
const principalPanel = document.querySelector('.principal-panel'); // Contenedor principal para los paneles

// Modal y elementos de edición de paneles
const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-modal');
const editForm = document.getElementById('editForm');
const editIdInput = document.getElementById('editId');
const editTypeInput = document.getElementById('editType');
const editTitleInput = document.getElementById('editTitleInput');
const editDescriptionInput = document.getElementById('editDescriptionInput');

// Elementos del DOM para agregar nuevos paneles
const agregarPanelBtn = document.getElementById('agregar-panel');
const addModal = document.getElementById('addModal');
const closeAddModalBtn = document.querySelector('.close-add-modal');
const addForm = document.getElementById('addForm');
const addTitleInput = document.getElementById('addTitleInput');
const addDescriptionInput = document.getElementById('addDescriptionInput');
const addTypeInput = document.getElementById('addType'); // Valor predeterminado en HTML

// Función de inicialización
async function initApp() {
    await checkAuth();
    loadFiles();
    loadInfoPanels();
    attachAddPanelEvent();
}

// Gestión de Archivos
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        fileNameSpan.textContent = fileInput.files[0].name;
    } else {
        fileNameSpan.textContent = 'Ningún archivo seleccionado';
    }
});

// Manejar la subida de archivos
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];

    if (!file) {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: 'Por favor, selecciona un archivo para subir.',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', section); // Enviar la sección al backend

    try {
        const response = await fetch(`${apiUrlFile}/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Archivo subido correctamente',
                confirmButtonText: 'Aceptar'
            });
            uploadForm.reset();
            fileNameSpan.textContent = 'Ningún archivo seleccionado';
            loadFiles();
        } else {
            const errorData = await response.json();
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error: ${errorData.message}`,
                confirmButtonText: 'Aceptar'
            });
        }
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al subir el archivo.',
            confirmButtonText: 'Aceptar'
        });
    }
});

// Función para cargar y mostrar los archivos subidos
async function loadFiles() {
    try {
        const response = await fetch(`${apiUrlFile}/${section}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const files = await response.json();
            fileList.innerHTML = '';

            if (files.length === 0) {
                fileList.innerHTML = '<li>No hay archivos subidos.</li>';
                return;
            }

            files.forEach(file => {
                const li = document.createElement('li');

                const link = document.createElement('a');
                link.href = `https://api.secretariaarticulacionterritorial.com${file.fileUrl}`;
                link.target = '_blank';
                link.textContent = file.filename;

                // Crear un botón de eliminar
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
                deleteButton.classList.add('delete-button');
                deleteButton.onclick = () => {
                    Swal.fire({
                        title: '¿Estás seguro?',
                        text: "¿Deseas eliminar este archivo?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#d33',
                        cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Sí, eliminar',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            deleteFile(file.id);
                        }
                    });
                };

                li.appendChild(link);
                if (userRole === 'admin') {
                    li.appendChild(deleteButton);
                }
                fileList.appendChild(li);
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
        console.error('Error al cargar los archivos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al cargar los archivos.',
            confirmButtonText: 'Aceptar'
        });
    }
    // Después de cargar los archivos, configurar los botones de eliminar según el rol
    adjustDeleteButtonsVisibility();
}

// Función para ajustar la visibilidad de los botones de eliminar según el rol
function adjustDeleteButtonsVisibility() {
    if (userRole !== 'admin') {
        document.querySelectorAll('.delete-button').forEach(button => {
            button.style.display = 'none';
        });
    } else {
        document.querySelectorAll('.delete-button').forEach(button => {
            button.style.display = 'inline-block';
        });
    }
}

// Función para eliminar un archivo
async function deleteFile(id) {
    try {
        const response = await fetch(`${apiUrlFile}/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            // Muestra la alerta de éxito antes de cargar los archivos
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Archivo eliminado correctamente',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                loadFiles(); // Solo cargar archivos después de que se confirme la alerta
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
        console.error('Error al eliminar el archivo:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al eliminar el archivo.',
            confirmButtonText: 'Aceptar'
        });
    }
}

// Gestión de Paneles de Información
async function loadInfoPanels() {
    const section = uploadForm.getAttribute('data-section');

    // Mostrar un mensaje de carga
    principalPanel.innerHTML = '<p>Cargando información...</p>';

    try {
        const response = await fetch(`${apiUrlInfo}/${section}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const infoList = await response.json();
            renderInfoPanels(infoList);
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
function renderInfoPanels(infoList) {
    if (infoList.length === 0) {
        principalPanel.innerHTML = '<p>No hay información para mostrar en esta sección.</p>';
        return;
    }

    // Limpiar el contenedor principal
    principalPanel.innerHTML = '';

    infoList.forEach(info => {
        const panel = document.createElement('div');
        panel.classList.add('subpanel');
        panel.setAttribute('data-info-type', info.section);
        panel.setAttribute('data-info-id', info.id);

        panel.innerHTML = `
            <div class="subpanel-header">
                <h2 class="subpanel-title">${info.title}</h2>
                <div class="iconos-subpanel">
                    <i class="fas fa-edit editar-subpanel" title="Editar"></i>
                    <i class="fas fa-trash-alt eliminar-subpanel" title="Eliminar"></i>
                </div>
            </div>
            <div class="subpanel-content">
                <p class="info-text">${info.description}</p>
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
    editTypeInput.value = info.section;
    editTitleInput.value = info.title;
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
    const section = editTypeInput.value;
    const title = editTitleInput.value.trim();
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
        const response = await fetch(`${apiUrlInfo}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
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
                loadInfoPanels();
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
            deleteInfoPanel(id);
        }
    });
}

// Función para eliminar un panel de información
async function deleteInfoPanel(id) {
    try {
        const response = await fetch(`${apiUrlInfo}/${id}`, {
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
                loadInfoPanels();
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
    if (agregarPanelBtn && userRole === 'admin') {
        agregarPanelBtn.addEventListener('click', openAddModal);
    }
}

// Función para abrir el modal de agregar panel
function openAddModal() {
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
    const section = addTypeInput.value; // 'microcreditos'
    const title = addTitleInput.value.trim();
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
        const response = await fetch(`${apiUrlInfo}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, section }),
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
                loadInfoPanels();
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

// Loader
function showLoader() {
    document.body.classList.add('loading');
}

function hideLoader() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// Función para comprobar si la sesión está activa y obtener el rol
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
        console.error('Error al verificar autenticación:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo verificar la autenticación. Por favor, inténtalo de nuevo más tarde.',
        });
        handleUnauthenticated();
    } finally {
        hideLoader();
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

    // Mostrar el formulario de subida de archivos si es admin
    if (uploadForm) {
        if (userRole === 'admin') {
            uploadForm.style.display = 'block';
        } else {
            uploadForm.style.display = 'none';
        }
    }

    // Mostrar la sección de archivos subidos
    if (fileList) {
        document.getElementById('archivos-subidos').style.display = 'block';
    }
    // Ajustar la visibilidad de los botones de eliminar
    adjustDeleteButtonsVisibility();

    if (agregarPanelBtn) {
        if (userRole === 'admin') {
            agregarPanelBtn.style.display = 'inline-block'; // Mostrar solo si es admin
        } else {
            agregarPanelBtn.style.display = 'none'; // Ocultar si no es admin
        }
    }

    // Asignar evento al botón de agregar panel
    attachAddPanelEvent();
}

// Función para manejar usuarios no autenticados
function handleUnauthenticated() {
    isAuthenticated = false;
    userRole = null;

    // Ocultar el formulario de subida de archivos
    if (uploadForm) {
        uploadForm.style.display = 'none';
    }

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

// Inicializar la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', initApp);
