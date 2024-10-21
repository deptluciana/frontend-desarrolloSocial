// Configuración de la API
const apiUrlInfo = 'https://api.secretariaarticulacionterritorial.com/api/info';
const apiUrlFile = 'https://api.secretariaarticulacionterritorial.com/api/files';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Variables globales
let isAuthenticated = false;
let userRole = null;
let currentInfoId = null;
let currentInfoType = null;

// Elementos del DOM
// Gestión de archivos
const uploadForm = document.getElementById('uploadForm');
const fileList = document.getElementById('fileList');
const fileInput = document.getElementById('fileInput');
const fileNameSpan = document.getElementById('file-name');
const uploadSection = document.querySelector('.upload-section');
const section = uploadForm.getAttribute('data-section');

// Gestión de paneles de información
const principalPanel = document.querySelector('.principal-panel');

// Modal y elementos de edición de paneles
const editModal = document.getElementById('editModal');
const closeModalBtn = document.querySelector('.close-modal');
const editForm = document.getElementById('editForm');
const editIdInput = document.getElementById('editId');
const editTypeInput = document.getElementById('editType');
const editTitleInput = document.getElementById('editTitleInput');
const editDescriptionInput = document.getElementById('editDescriptionInput');

// Agregar nuevos paneles
const agregarPanelBtn = document.getElementById('agregar-panel');
const addModal = document.getElementById('addModal');
const closeAddModalBtn = document.querySelector('.close-add-modal');
const addForm = document.getElementById('addForm');
const addTitleInput = document.getElementById('addTitleInput');
const addDescriptionInput = document.getElementById('addDescriptionInput');
const addTypeInput = document.getElementById('addType');

// Función de inicialización
async function initApp() {
    await checkAuth();
    await Promise.all([loadFiles(), loadInfoPanels()]); // Cargar archivos y paneles al mismo tiempo
    attachAddPanelEvent();
    hideLoader(); // Ocultar el loader una vez que todo esté cargado
}

// Función para ocultar el loader
function hideLoader() {
    document.body.classList.add('loaded');
}

// Mostrar el loader cuando la página empieza a cargarse
document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.remove('loaded');
});

// Gestión de archivos

// Evento para mostrar el nombre del archivo seleccionado
fileInput.addEventListener('change', () => {
    fileNameSpan.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'Ningún archivo seleccionado';
});

// Manejar la subida de archivos
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];

    if (!file) {
        return showAlert('warning', 'Atención', 'Por favor, selecciona un archivo para subir.');
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
            showAlert('success', '¡Éxito!', 'Archivo subido correctamente');
            uploadForm.reset();
            fileNameSpan.textContent = 'Ningún archivo seleccionado';
            loadFiles();
        } else {
            const errorData = await response.json();
            showAlert('error', 'Error', `Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        showAlert('error', 'Error', 'Ocurrió un error al subir el archivo.');
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
            renderFileList(files);
        } else {
            const errorData = await response.json();
            showAlert('error', 'Error', `Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al cargar los archivos:', error);
        showAlert('error', 'Error', 'Ocurrió un error al cargar los archivos.');
    }
    adjustDeleteButtonsVisibility();
}

// Renderizar la lista de archivos
function renderFileList(files) {
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

        if (userRole === 'admin') {
            const deleteButton = createDeleteButton(() => deleteFile(file.id));
            li.appendChild(deleteButton);
        }

        li.appendChild(link);
        fileList.appendChild(li);
    });
}

// Crear botón de eliminar
function createDeleteButton(deleteAction) {
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
            if (result.isConfirmed) deleteAction();
        });
    };
    return deleteButton;
}

// Ajustar visibilidad de los botones de eliminar según el rol
function adjustDeleteButtonsVisibility() {
    const displayStyle = userRole === 'admin' ? 'inline-block' : 'none';
    document.querySelectorAll('.delete-button').forEach(button => {
        button.style.display = displayStyle;
    });
}

// Eliminar archivo
async function deleteFile(id) {
    try {
        const response = await fetch(`${apiUrlFile}/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            showAlert('success', '¡Éxito!', 'Archivo eliminado correctamente');
            loadFiles();
        } else {
            const errorData = await response.json();
            showAlert('error', 'Error', `Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        showAlert('error', 'Error', 'Ocurrió un error al eliminar el archivo.');
    }
}


// Gestión de paneles de información

// Cargar y mostrar paneles de información
async function loadInfoPanels() {
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
        principalPanel.innerHTML = '<p>Ocurrió un error al cargar la información.</p>';
    }
}

// Renderizar los paneles de información
function renderInfoPanels(infoList) {
    principalPanel.innerHTML = infoList.length === 0 ? '<p>No hay información para mostrar.</p>' : '';

    infoList.forEach(info => {
        const panel = createInfoPanel(info);
        principalPanel.appendChild(panel);
    });
}

// Crear panel de información
function createInfoPanel(info) {
    const panel = document.createElement('div');
    panel.classList.add('subpanel');
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

    if (userRole === 'admin') {
        const editIcon = panel.querySelector('.editar-subpanel');
        const deleteIcon = panel.querySelector('.eliminar-subpanel');

        editIcon.addEventListener('click', () => openEditModal(info));
        deleteIcon.addEventListener('click', () => confirmDeletePanel(info.id));
    } else {
        panel.querySelector('.iconos-subpanel').style.display = 'none';
    }

    return panel;
}

// Abrir modal de edición de panel
function openEditModal(info) {
    editIdInput.value = info.id;
    editTypeInput.value = info.section;
    editTitleInput.value = info.title;
    editDescriptionInput.value = info.description;
    editModal.style.display = 'block';
}

// Confirmar eliminación de panel
function confirmDeletePanel(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: '¿Deseas eliminar este panel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
    }).then((result) => {
        if (result.isConfirmed) deletePanel(id);
    });
}

// Función para eliminar un panel
async function deletePanel(id) {
    try {
        const response = await fetch(`${apiUrlInfo}/delete/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            showAlert('success', '¡Éxito!', 'Panel eliminado correctamente');
            loadInfoPanels();
        } else {
            const errorData = await response.json();
            showAlert('error', 'Error', `Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar el panel:', error);
        showAlert('error', 'Error', 'Ocurrió un error al eliminar el panel.');
    }
}

// Función de alerta
function showAlert(icon, title, text) {
    Swal.fire({ icon, title, text });
}

// Iniciar la aplicación
initApp();
