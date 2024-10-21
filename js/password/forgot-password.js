document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const responseMessage = document.getElementById('response-message');
    
    try {
      responseMessage.innerHTML = '<div class="loader"></div>'; // Mostrar loader mientras se procesa
  
      const response = await fetch('https://api.secretariaarticulacionterritorial.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        responseMessage.style.color = 'green';
        responseMessage.textContent = 'Correo enviado exitosamente. Verifica tu bandeja de entrada.';
      } else {
        responseMessage.style.color = 'red';
        responseMessage.textContent = data.message || 'Hubo un error al enviar el correo.';
      }
    } catch (error) {
      responseMessage.style.color = 'red';
      responseMessage.textContent = 'Error al conectar con el servidor. Inténtalo nuevamente.';
    }
  });
  