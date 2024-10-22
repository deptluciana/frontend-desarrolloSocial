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

// Loader
function showLoader() {
    document.body.classList.add('loading');
}

function hideLoader() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

// Función de inicialización
async function initApp() {
    showLoader();
    try {
        await checkAuth();
        await Promise.all([loadFiles(), loadInfoPanels()]);

        hideLoader();
    } catch (error) {
        console.error('Error durante la inicialización:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al cargar la aplicación. Por favor, intenta de nuevo más tarde.',
            confirmButtonText: 'Aceptar'
        });
        hideLoader();
    }
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
    showLoader();
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
    formData.append('section', section);

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
    } finally {
        hideLoader();  // Ocultar el loader al finalizar
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
    showLoader();
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
    } finally {
        hideLoader();  // Ocultar el loader al finalizar
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

// Función para renderizar los paneles de información
function renderInfoPanels(infoList) {
    principalPanel.innerHTML = '';

    if (infoList.length === 0) {
        principalPanel.innerHTML = '<p>No hay información disponible.</p>';
        return;
    }

    infoList.forEach(info => {
        const panel = document.createElement('div');
        panel.classList.add('panel');

        const title = document.createElement('h3');
        title.textContent = info.title;

        const description = document.createElement('p');
        description.textContent = info.description;

        // Solo los administradores pueden ver los botones de editar y eliminar
        if (userRole === 'admin') {
            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
            editButton.classList.add('edit-button');
            editButton.onclick = () => openEditModal(info);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
            deleteButton.classList.add('delete-button');
            deleteButton.onclick = () => {
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: "¿Deseas eliminar este panel de información?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteInfo(info.id);
                    }
                });
            };

            panel.appendChild(editButton);
            panel.appendChild(deleteButton);
        }

        panel.appendChild(title);
        panel.appendChild(description);
        principalPanel.appendChild(panel);
    });
}

// Función para abrir el modal de edición
function openEditModal(info) {
    currentInfoId = info.id;
    currentInfoType = info.section;

    editIdInput.value = info.id;
    editTypeInput.value = info.section;
    editTitleInput.value = info.title;
    editDescriptionInput.value = info.description;

    editModal.style.display = 'block';
}

// Función para cerrar el modal de edición
closeModalBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
});

// Función para enviar la edición del panel de información
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();

    const infoId = editIdInput.value;
    const infoType = editTypeInput.value;
    const title = editTitleInput.value;
    const description = editDescriptionInput.value;

    try {
        const response = await fetch(`${apiUrlInfo}/update/${infoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                title,
                description,
                section: infoType
            })
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Panel actualizado correctamente',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                loadInfoPanels();
                editModal.style.display = 'none';
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
        console.error('Error al actualizar el panel:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar el panel.',
            confirmButtonText: 'Aceptar'
        });
    } finally {
        hideLoader();  // Ocultar el loader al finalizar
    }
});

// Función para eliminar un panel de información
async function deleteInfo(id) {
    showLoader();
    try {
        const response = await fetch(`${apiUrlInfo}/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Panel eliminado correctamente',
                confirmButtonText: 'Aceptar'
            }).then(() => {
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
    } finally {
        hideLoader();  // Ocultar el loader al finalizar
    }
}

// Función para abrir el modal de agregar nuevo panel
agregarPanelBtn.addEventListener('click', () => {
    addModal.style.display = 'block';
});

// Función para cerrar el modal de agregar
closeAddModalBtn.addEventListener('click', () => {
    addModal.style.display = 'none';
});

// Función para agregar un nuevo panel de información
addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader();

    const title = addTitleInput.value;
    const description = addDescriptionInput.value;
    const section = addTypeInput.value; // Obtener el valor seleccionado en el modal

    try {
        const response = await fetch(`${apiUrlInfo}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                title,
                description,
                section
            })
        });

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Panel agregado correctamente',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                loadInfoPanels();
                addModal.style.display = 'none';
                addForm.reset();
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
    } finally {
        hideLoader();  // Ocultar el loader al finalizar
    }
});

// Función para verificar autenticación
async function checkAuth() {
    try {
        const response = await fetch(apiUrlAuth, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const authData = await response.json();
            isAuthenticated = authData.isAuthenticated;
            userRole = authData.role;
        } else {
            throw new Error('No autenticado');
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        window.location.href = '/login'; // Redirigir al login si no está autenticado
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', initApp);
