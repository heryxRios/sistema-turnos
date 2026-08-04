// src/public/js/auth-guard.js

(function () {
    // 1. Duración del temporizador de inactividad (60 minutos en milisegundos)
    const TIEMPO_INACTIVIDAD_MS = 40 * 60 * 1000; 
    let temporizadorInactividad = null;

    // 2. VERIFICACIÓN INMEDIATA DE SESIÓN (Protección de Rutas)
    const token = localStorage.getItem('token');
    
    // Si no hay token guardado, redirigir inmediatamente al login
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // 3. FUNCIÓN DE CIERRE DE SESIÓN POR INACTIVIDAD
    function expirarSesion() {
        localStorage.clear();
        alert("⏱️ Su sesión ha expirado por 40 minutos de inactividad. Por favor, inicie sesión nuevamente.");
        window.location.href = '/login.html';
    }

    // 4. REINICIAR EL TEMPORIZADOR DE 40 MINUTOS
    function reiniciarTemporizador() {
        if (temporizadorInactividad) {
            clearTimeout(temporizadorInactividad);
        }
        temporizadorInactividad = setTimeout(expirarSesion, TIEMPO_INACTIVIDAD_MS);
    }

    // 5. DETECCIÓN DE ACTIVIDAD DEL USUARIO
    // Escuchar eventos clave en la pantalla para saber que el usuario está activo
    const eventosActividad = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    
    eventosActividad.forEach(evento => {
        window.addEventListener(evento, reiniciarTemporizador, { passive: true });
    });

    // Iniciar el contador al cargar la página
    reiniciarTemporizador();
})();
