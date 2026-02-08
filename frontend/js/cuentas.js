/**
 * Plan de Cuentas - Listar y crear cuentas contables
 */
const TIPOS_CUENTA = {
    1: 'Activo',
    2: 'Pasivo',
    3: 'Patrimonio',
    4: 'Ingreso',
    5: 'Gasto'
};

document.addEventListener('DOMContentLoaded', () => {
    cargarCuentas();
    document.getElementById('formNuevaCuenta').addEventListener('submit', guardarCuenta);
});

async function cargarCuentas() {
    const cargando = document.getElementById('cargando');
    const contenedor = document.getElementById('tabla-contenedor');
    const tabla = document.getElementById('tabla-cuentas');
    const sinCuentas = document.getElementById('sin-cuentas');

    try {
        const cuentas = await api.get('/cuentascontables');
        cargando.classList.add('d-none');
        contenedor.classList.remove('d-none');

        if (cuentas.length === 0) {
            tabla.closest('.table-responsive').classList.add('d-none');
            sinCuentas.classList.remove('d-none');
        } else {
            tabla.closest('.table-responsive').classList.remove('d-none');
            sinCuentas.classList.add('d-none');
            tabla.innerHTML = cuentas.map(c =>
                `<tr>
                    <td><code>${escapeHtml(c.codigo)}</code></td>
                    <td>${escapeHtml(c.nombre)}</td>
                    <td><span class="badge bg-secondary">${TIPOS_CUENTA[c.tipo] || c.tipo}</span></td>
                    <td class="text-muted small">${escapeHtml(c.descripcion || '-')}</td>
                    <td>${c.activa ? '<span class="badge bg-success">Activa</span>' : '<span class="badge bg-secondary">Inactiva</span>'}</td>
                </tr>`
            ).join('');
        }
    } catch (error) {
        cargando.classList.add('d-none');
        contenedor.classList.remove('d-none');
        mostrarAlerta('danger', `Error al cargar cuentas: ${error.message}`);
        tabla.closest('.table-responsive').classList.add('d-none');
        sinCuentas.classList.remove('d-none');
    }
}

async function guardarCuenta(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('error-formulario');
    const btnGuardar = document.getElementById('btnGuardar');

    errorEl.classList.add('d-none');
    btnGuardar.disabled = true;
    btnGuardar.querySelector('.btn-text').textContent = 'Guardando...';

    const cuenta = {
        codigo: form.codigo.value.trim(),
        nombre: form.nombre.value.trim(),
        tipo: parseInt(form.tipo.value, 10),
        descripcion: form.descripcion.value.trim() || null,
        activa: form.activa.checked
    };

    try {
        await api.post('/cuentascontables', cuenta);
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevaCuenta'));
        modal.hide();
        form.reset();
        form.activa.checked = true;
        cargarCuentas();
        mostrarAlerta('success', 'Cuenta creada correctamente.');
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('d-none');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.querySelector('.btn-text').textContent = 'Guardar';
    }
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
