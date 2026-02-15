/**
 * Libro Mayor - Consulta de movimientos y saldo por cuenta
 */
let cuentas = [];

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCuentas();
    document.getElementById('btnConsultar').addEventListener('click', consultarLibroMayor);
});

async function cargarCuentas() {
    try {
        cuentas = await api.get('/cuentascontables');
        cuentas = cuentas.filter(c => c.activa).sort((a, b) => a.codigo.localeCompare(b.codigo));
        const select = document.getElementById('selectCuenta');
        select.innerHTML = '<option value="">Seleccionar cuenta</option>' +
            cuentas.map(c => `<option value="${c.id}">${escapeHtml(c.codigo)} - ${escapeHtml(c.nombre)}</option>`).join('');
    } catch (error) {
        mostrarAlerta('danger', `Error al cargar cuentas: ${error.message}`);
    }
}

async function consultarLibroMayor() {
    const cuentaId = document.getElementById('selectCuenta').value;
    if (!cuentaId) {
        mostrarAlerta('warning', 'Seleccione una cuenta.');
        return;
    }

    const params = new URLSearchParams();
    const fechaDesde = document.getElementById('filtroFechaDesde').value;
    const fechaHasta = document.getElementById('filtroFechaHasta').value;
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);

    const url = `/cuentascontables/${cuentaId}/libromayor` + (params.toString() ? '?' + params.toString() : '');

    try {
        const data = await api.get(url);
        renderizarLibroMayor(data);
        document.getElementById('inicial-contenedor').classList.add('d-none');
        document.getElementById('resultado-contenedor').classList.remove('d-none');
    } catch (error) {
        mostrarAlerta('danger', `Error: ${error.message}`);
    }
}

function renderizarLibroMayor(data) {
    const c = data.cuenta;
    document.getElementById('cuentaTitulo').textContent = `${c.codigo} - ${c.nombre}`;
    document.getElementById('total-debe').textContent = formatNumber(data.totalDebe);
    document.getElementById('total-haber').textContent = formatNumber(data.totalHaber);
    document.getElementById('saldo-final').textContent = formatNumber(data.saldoFinal);
    document.getElementById('saldo-final').className = 'text-end fw-bold ' + (data.saldoFinal >= 0 ? 'text-primary' : 'text-secondary');

    const tbody = document.getElementById('tabla-movimientos');
    const sinMovimientos = document.getElementById('sin-movimientos');
    const tabla = tbody.closest('.table-responsive');

    if (!data.movimientos || data.movimientos.length === 0) {
        tabla.classList.add('d-none');
        sinMovimientos.classList.remove('d-none');
    } else {
        tabla.classList.remove('d-none');
        sinMovimientos.classList.add('d-none');
        tbody.innerHTML = data.movimientos.map(m => {
            const fecha = m.fecha ? new Date(m.fecha).toLocaleDateString('es') : '-';
            const saldoClass = m.saldoAcumulado >= 0 ? 'text-primary' : 'text-secondary';
            return `<tr>
                <td>${fecha}</td>
                <td>#${m.asientoId}</td>
                <td>${escapeHtml(m.descripcion || '')}</td>
                <td class="text-end">${m.debe > 0 ? formatNumber(m.debe) : ''}</td>
                <td class="text-end">${m.haber > 0 ? formatNumber(m.haber) : ''}</td>
                <td class="text-end ${saldoClass} fw-semibold">${formatNumber(m.saldoAcumulado)}</td>
            </tr>`;
        }).join('');
    }
}

function formatNumber(n) {
    return new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById('alerta');
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
    setTimeout(() => alerta.classList.add('d-none'), 5000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
