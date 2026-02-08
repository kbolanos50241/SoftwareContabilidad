/**
 * Aplicación principal - Software Contabilidad
 */
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    const statusEl = document.getElementById('status-conexion');
    if (!statusEl) return;

    try {
        await api.get('/weatherforecast');
        statusEl.className = 'alert alert-success mb-0';
        statusEl.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Conectado al servidor. Sistema listo para usar.';
    } catch (error) {
        console.warn('Backend no disponible:', error.message);
        statusEl.className = 'alert alert-warning mb-0';
        statusEl.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>Servidor no disponible. Ejecuta <code>cd backend</code> y luego <code>dotnet run</code> en otra terminal.';
    }
}
