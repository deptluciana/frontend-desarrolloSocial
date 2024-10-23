// Obtener el token de la URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const responseMessage = document.getElementById('response-message');

  // Verificar si las contraseñas coinciden
  if (newPassword !== confirmPassword) {
    responseMessage.style.color = 'red';
    responseMessage.textContent = 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.';
    return;
  }

  try {
    responseMessage.innerHTML = '<div class="loader"></div>'; // Mostrar loader mientras se procesa

    const response = await fetch(`https://api.secretariaarticulacionterritorial.com/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      responseMessage.style.color = 'green';
      responseMessage.textContent = 'Contraseña restablecida con éxito.';
      // Redirigir al login después de unos segundos
      setTimeout(() => {
        window.location.href = 'https://www.secretariaarticulacionterritorial.com/';
      }, 2000);
    } else {
      responseMessage.style.color = 'red';
      responseMessage.textContent = data.message || 'Hubo un error al restablecer la contraseña.';
    }
  } catch (error) {
    responseMessage.style.color = 'red';
    responseMessage.textContent = 'Error al conectar con el servidor. Inténtalo nuevamente.';
  }
});
