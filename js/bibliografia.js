const apiUrlFile = 'https://api.secretariaarticulacionterritorial.com/api/files';
const apiUrlAuth = 'https://api.secretariaarticulacionterritorial.com/api/auth';

// Variables globales
let isAuthenticated = false;
let userRole = null;

const uploadForm = document.getElementById('uploadForm');
const fileList = document.getElementById('fileList');
const fileInput = document.getElementById('fileInput');
const fileNameSpan = document.getElementById('file-name');
const uploadSection = document.querySelector('.upload-section');
const section = uploadForm.getAttribute('data-section');

// Loader
function showLoader() {
    document.body.classList.add('loading');
}

function hideLoader() {
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
}

async function initApp() {
    showLoader();
    try {
        await checkAuth();
        await Promise.all([loadFiles()]);
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

// Actualizar el nombre del archivo seleccionado
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
                li.appendChild(deleteButton);
                fileList.appendChild(li);
            });

            adjustDeleteButtonsVisibility();
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

// Función para manejar el estado no autenticado
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
}

// Función para manejar el estado autenticado
function handleAuthenticated(role) {
    isAuthenticated = true;
    userRole = role;

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
}

// Función para comprobar si la sesión está activa y obtener el rol
async function checkAuth() {
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
    }
}

initApp();
