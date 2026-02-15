/**
 * Libro Diario - Registro de asientos contables
 */
let cuentas = [];
let asientoEliminar = null;

document.addEventListener('DOMContentLoaded', async () => {
    await cargarCuentas();
    poblarFiltroCuentas();
    cargarAsientos();
    document.getElementById('formAsiento').addEventListener('submit', guardarAsiento);
    document.getElementById('btnNuevoAsiento').addEventListener('click', abrirModalNuevo);
    document.getElementById('btnAgregarMovimiento').addEventListener('click', agregarMovimiento);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);
    document.getElementById('btnFiltrar').addEventListener('click', () => cargarAsientos());
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);

    document.getElementById('modalAsiento').addEventListener('shown.bs.modal', () => {
        if (document.getElementById('movimientos-container').children.length === 0) {
            agregarMovimiento();
            agregarMovimiento();
        }
    });

    document.getElementById('modalAsiento').addEventListener('hidden.bs.modal', () => {
        document.getElementById('movimientos-container').innerHTML = '';
        document.getElementById('formAsiento').reset();
        document.getElementById('formAsiento').fecha.value = new Date().toISOString().slice(0, 10);
    });
});

document.getElementById('movimientos-container').addEventListener('input', actualizarTotales);
document.getElementById('movimientos-container').addEventListener('change', actualizarTotales);

document.getElementById('tabla-asientos').addEventListener('click', (e) => {
    const btnVer = e.target.closest('.btn-ver');
    const btnEliminar = e.target.closest('.btn-eliminar');
    if (btnVer) {
        e.preventDefault();
        verAsiento(parseInt(btnVer.dataset.id, 10));
    }
    if (btnEliminar) {
        e.preventDefault();
        solicitarEliminar(parseInt(btnEliminar.dataset.id, 10));
    }
});

async function cargarCuentas() {
    try {
        cuentas = await api.get('/cuentascontables');
        cuentas = cuentas.filter(c => c.activa);
    } catch (error) {
        cuentas = [];
    }
}

function poblarFiltroCuentas() {
    const select = document.getElementById('filtroCuenta');
    const actual = select.value;
    select.innerHTML = '<option value="">Todas las cuentas</option>' +
        cuentas.map(c => `<option value="${c.id}">${escapeHtml(c.codigo)} - ${escapeHtml(c.nombre)}</option>`).join('');
    select.value = actual || '';
}

function getUrlFiltros() {
    const params = new URLSearchParams();
    const fechaDesde = document.getElementById('filtroFechaDesde').value;
    const fechaHasta = document.getElementById('filtroFechaHasta').value;
    const cuentaId = document.getElementById('filtroCuenta').value;
    if (fechaDesde) params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params.set('fechaHasta', fechaHasta);
    if (cuentaId) params.set('cuentaContableId', cuentaId);
    const qs = params.toString();
    return qs ? '/asientoscontables?' + qs : '/asientoscontables';
}

function limpiarFiltros() {
    document.getElementById('filtroFechaDesde').value = '';
    document.getElementById('filtroFechaHasta').value = '';
    document.getElementById('filtroCuenta').value = '';
    cargarAsientos();
}

async function cargarAsientos() {
    const cargando = document.getElementById('cargando');
    const contenedor = document.getElementById('tabla-contenedor');
    const tabla = document.getElementById('tabla-asientos');
    const sinAsientos = document.getElementById('sin-asientos');

    try {
        const asientos = await api.get(getUrlFiltros());
        cargando.classList.add('d-none');
        contenedor.classList.remove('d-none');

        if (asientos.length === 0) {
            tabla.closest('.table-responsive').classList.add('d-none');
            sinAsientos.classList.remove('d-none');
        } else {
            tabla.closest('.table-responsive').classList.remove('d-none');
            sinAsientos.classList.add('d-none');
            tabla.innerHTML = asientos.map(a => {
                const total = a.totalDebe || a.movimientos?.reduce((s, m) => s + (m.debe || 0), 0) || 0;
                const fecha = a.fecha ? new Date(a.fecha).toLocaleDateString('es') : '-';
                return `<tr>
                    <td>${fecha}</td>
                    <td>${escapeHtml(a.descripcion || '')}</td>
                    <td class="text-end">${formatNumber(total)}</td>
                    <td class="text-end">${formatNumber(total)}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary btn-ver" data-id="${a.id}" title="Ver detalle">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${a.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>`;
            }).join('');
        }
    } catch (error) {
        cargando.classList.add('d-none');
        contenedor.classList.remove('d-none');
        mostrarAlerta('danger', `Error al cargar asientos: ${error.message}`);
    }
}

function abrirModalNuevo() {
    document.getElementById('formAsiento').reset();
    document.getElementById('formAsiento').fecha.value = new Date().toISOString().slice(0, 10);
    document.getElementById('error-formulario').classList.add('d-none');
    document.getElementById('movimientos-container').innerHTML = '';
    agregarMovimiento();
    agregarMovimiento();
    actualizarTotales();
}

function agregarMovimiento() {
    const container = document.getElementById('movimientos-container');
    const row = document.createElement('tr');
    row.className = 'fila-movimiento';
    const options = cuentas.map(c => `<option value="${c.id}">${escapeHtml(c.codigo)} - ${escapeHtml(c.nombre)}</option>`).join('');
    row.innerHTML = `
        <td>
            <select class="form-select form-select-sm select-cuenta" required>
                <option value="">Seleccionar cuenta</option>
                ${options}
            </select>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm text-end input-debe" min="0" step="0.01" value="0" placeholder="0.00">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm text-end input-haber" min="0" step="0.01" value="0" placeholder="0.00">
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger btn-quitar" title="Quitar línea">
                <i class="bi bi-dash-lg"></i>
            </button>
        </td>
    `;
    row.querySelector('.btn-quitar').addEventListener('click', () => {
        if (container.children.length > 2) row.remove();
        else mostrarAlerta('warning', 'El asiento debe tener al menos 2 movimientos.');
        actualizarTotales();
    });
    container.appendChild(row);
    actualizarTotales();
}

function actualizarTotales() {
    const filas = document.querySelectorAll('.fila-movimiento');
    let totalDebe = 0;
    let totalHaber = 0;

    filas.forEach(fila => {
        const debe = parseFloat(fila.querySelector('.input-debe').value) || 0;
        const haber = parseFloat(fila.querySelector('.input-haber').value) || 0;
        totalDebe += debe;
        totalHaber += haber;
    });

    document.getElementById('total-debe').textContent = formatNumber(totalDebe);
    document.getElementById('total-haber').textContent = formatNumber(totalHaber);

    const balanceado = totalDebe === totalHaber && totalDebe > 0 && filas.length >= 2;
    document.getElementById('fila-balance').classList.toggle('d-none', !balanceado);
    document.getElementById('fila-desbalance').classList.toggle('d-none', balanceado || totalDebe === 0);
    document.getElementById('btnGuardar').disabled = !balanceado;
}

async function guardarAsiento(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('error-formulario');
    const btnGuardar = document.getElementById('btnGuardar');

    const movimientos = [];
    document.querySelectorAll('.fila-movimiento').forEach(fila => {
        const cuentaId = parseInt(fila.querySelector('.select-cuenta').value, 10);
        const debe = parseFloat(fila.querySelector('.input-debe').value) || 0;
        const haber = parseFloat(fila.querySelector('.input-haber').value) || 0;
        if (cuentaId && (debe > 0 || haber > 0)) {
            movimientos.push({ cuentaContableId: cuentaId, debe, haber });
        }
    });

    if (movimientos.length < 2) {
        errorEl.textContent = 'El asiento debe tener al menos 2 movimientos con montos.';
        errorEl.classList.remove('d-none');
        return;
    }

    const totalDebe = movimientos.reduce((s, m) => s + m.debe, 0);
    const totalHaber = movimientos.reduce((s, m) => s + m.haber, 0);
    if (totalDebe !== totalHaber) {
        errorEl.textContent = 'La suma del debe debe ser igual a la suma del haber.';
        errorEl.classList.remove('d-none');
        return;
    }

    errorEl.classList.add('d-none');
    btnGuardar.disabled = true;
    btnGuardar.querySelector('.btn-text').textContent = 'Guardando...';

    try {
        await api.post('/asientoscontables', {
            fecha: form.fecha.value,
            descripcion: form.descripcion.value.trim(),
            movimientos
        });
        bootstrap.Modal.getInstance(document.getElementById('modalAsiento')).hide();
        cargarAsientos();
        mostrarAlerta('success', 'Asiento registrado correctamente.');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('d-none');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.querySelector('.btn-text').textContent = 'Guardar asiento';
    }
}

async function verAsiento(id) {
    try {
        const asiento = await api.get(`/asientoscontables/${id}`);
        document.getElementById('verAsientoId').textContent = asiento.id;
        document.getElementById('verAsientoFecha').textContent = new Date(asiento.fecha).toLocaleDateString('es');
        document.getElementById('verAsientoDescripcion').textContent = escapeHtml(asiento.descripcion || '');

        const tbody = document.getElementById('verAsientoMovimientos');
        tbody.innerHTML = (asiento.movimientos || []).map(m =>
            `<tr>
                <td>${escapeHtml(m.cuentaCodigo || '')} - ${escapeHtml(m.cuentaNombre || '')}</td>
                <td class="text-end">${formatNumber(m.debe || 0)}</td>
                <td class="text-end">${formatNumber(m.haber || 0)}</td>
            </tr>`
        ).join('');

        document.getElementById('verTotalDebe').textContent = formatNumber(asiento.totalDebe || 0);
        document.getElementById('verTotalHaber').textContent = formatNumber(asiento.totalHaber || 0);
        new bootstrap.Modal(document.getElementById('modalVerAsiento')).show();
    } catch (error) {
        mostrarAlerta('danger', `Error: ${error.message}`);
    }
}

function solicitarEliminar(id) {
    asientoEliminar = id;
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

async function confirmarEliminar() {
    if (!asientoEliminar) return;

    const btnEliminar = document.getElementById('btnConfirmarEliminar');
    btnEliminar.disabled = true;

    try {
        await api.delete(`/asientoscontables/${asientoEliminar}`);
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
        mostrarAlerta('success', 'Asiento eliminado.');
        cargarAsientos();
    } catch (error) {
        mostrarAlerta('danger', `Error: ${error.message}`);
    } finally {
        btnEliminar.disabled = false;
        asientoEliminar = null;
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
