/**
 * Plan de Cuentas - CRUD de cuentas contables
 */
const TIPOS_CUENTA = {
    1: 'Activo',
    2: 'Pasivo',
    3: 'Patrimonio',
    4: 'Ingreso',
    5: 'Gasto'
};

let cuentaEditando = null;
let cuentaEliminar = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarCuentas();
    document.getElementById('formCuenta').addEventListener('submit', guardarCuenta);
    document.getElementById('btnNuevaCuenta').addEventListener('click', abrirModalNueva);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);

    document.getElementById('modalCuenta').addEventListener('hidden.bs.modal', () => {
        cuentaEditando = null;
        document.getElementById('modalCuentaTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nueva cuenta contable';
    });
});

document.getElementById('tabla-cuentas').addEventListener('click', (e) => {
    const btnEditar = e.target.closest('.btn-editar');
    const btnEliminar = e.target.closest('.btn-eliminar');
    if (btnEditar) {
        e.preventDefault();
        editarCuenta(parseInt(btnEditar.dataset.id, 10));
    }
    if (btnEliminar) {
        e.preventDefault();
        solicitarEliminar(parseInt(btnEliminar.dataset.id, 10), btnEliminar.dataset.nombre);
    }
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
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-id="${c.id}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${c.id}" data-nombre="${escapeHtml(c.codigo + ' - ' + c.nombre)}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
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

function abrirModalNueva() {
    cuentaEditando = null;
    document.getElementById('modalCuentaTitulo').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nueva cuenta contable';
    document.getElementById('formCuenta').reset();
    document.getElementById('formCuenta').activa.checked = true;
    document.getElementById('error-formulario').classList.add('d-none');
}

async function editarCuenta(id) {
    try {
        const cuenta = await api.get(`/cuentascontables/${id}`);
        cuentaEditando = cuenta;
        document.getElementById('modalCuentaTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar cuenta contable';
        document.getElementById('formCuenta').codigo.value = cuenta.codigo;
        document.getElementById('formCuenta').nombre.value = cuenta.nombre;
        document.getElementById('formCuenta').tipo.value = cuenta.tipo;
        document.getElementById('formCuenta').descripcion.value = cuenta.descripcion || '';
        document.getElementById('formCuenta').activa.checked = cuenta.activa;
        document.getElementById('error-formulario').classList.add('d-none');
        new bootstrap.Modal(document.getElementById('modalCuenta')).show();
    } catch (error) {
        mostrarAlerta('danger', `Error al cargar la cuenta: ${error.message}`);
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
        if (cuentaEditando) {
            cuenta.id = cuentaEditando.id;
            await api.put(`/cuentascontables/${cuentaEditando.id}`, cuenta);
            mostrarAlerta('success', 'Cuenta actualizada correctamente.');
        } else {
            await api.post('/cuentascontables', cuenta);
            mostrarAlerta('success', 'Cuenta creada correctamente.');
        }
        bootstrap.Modal.getInstance(document.getElementById('modalCuenta')).hide();
        form.reset();
        form.activa.checked = true;
        cargarCuentas();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('d-none');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.querySelector('.btn-text').textContent = 'Guardar';
    }
}

function solicitarEliminar(id, nombre) {
    cuentaEliminar = id;
    document.getElementById('eliminarCuentaNombre').textContent = nombre;
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

async function confirmarEliminar() {
    if (!cuentaEliminar) return;

    const btnEliminar = document.getElementById('btnConfirmarEliminar');
    btnEliminar.disabled = true;

    try {
        await api.delete(`/cuentascontables/${cuentaEliminar}`);
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
        mostrarAlerta('success', 'Cuenta eliminada correctamente.');
        cargarCuentas();
    } catch (error) {
        mostrarAlerta('danger', `Error al eliminar: ${error.message}`);
    } finally {
        btnEliminar.disabled = false;
        cuentaEliminar = null;
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
