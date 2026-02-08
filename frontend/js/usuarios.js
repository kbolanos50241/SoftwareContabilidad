/**
 * Gestión de usuarios del sistema
 */
const ROLES = { 1: 'Admin', 2: 'Usuario' };
const ESTADOS = { 1: 'Activo', 2: 'Inactivo' };

let usuarioEditando = null;
let usuarioEliminar = null;

document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    document.getElementById('formUsuario').addEventListener('submit', guardarUsuario);
    document.getElementById('btnNuevoUsuario').addEventListener('click', abrirModalNuevo);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);

    document.getElementById('modalUsuario').addEventListener('hidden.bs.modal', () => {
        usuarioEditando = null;
        document.getElementById('modalUsuarioTitulo').innerHTML = '<i class="bi bi-person-plus me-2"></i>Nuevo usuario';
        document.getElementById('labelPassword').textContent = 'Contraseña *';
        document.getElementById('ayudaPassword').textContent = 'Requerida para nuevo usuario';
        document.getElementById('formUsuario').password.required = false;
    });
});

document.getElementById('tabla-usuarios').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    e.preventDefault();
    const id = parseInt(btn.dataset.id, 10);
    if (btn.dataset.action === 'editar') editarUsuario(id);
    else if (btn.dataset.action === 'eliminar') solicitarEliminar(id, btn.dataset.nombre);
    else if (btn.dataset.action === 'activar') cambiarEstado(id, true);
    else if (btn.dataset.action === 'desactivar') cambiarEstado(id, false);
});

async function cargarUsuarios() {
    const cargando = document.getElementById('cargando');
    const contenedor = document.getElementById('tabla-contenedor');
    const tabla = document.getElementById('tabla-usuarios');
    const sinUsuarios = document.getElementById('sin-usuarios');

    try {
        const usuarios = await api.get('/usuarios');
        cargando.classList.add('d-none');
        contenedor.classList.remove('d-none');

        if (usuarios.length === 0) {
            tabla.closest('.table-responsive').classList.add('d-none');
            sinUsuarios.classList.remove('d-none');
        } else {
            tabla.closest('.table-responsive').classList.remove('d-none');
            sinUsuarios.classList.add('d-none');
            tabla.innerHTML = usuarios.map(u => {
                const esActivo = u.estado === 1;
                const btnEstado = esActivo
                    ? `<button class="btn btn-sm btn-outline-warning" data-action="desactivar" data-id="${u.id}" title="Desactivar"><i class="bi bi-toggle-on"></i></button>`
                    : `<button class="btn btn-sm btn-outline-success" data-action="activar" data-id="${u.id}" title="Activar"><i class="bi bi-toggle-off"></i></button>`;
                return `<tr>
                    <td>${escapeHtml(u.nombreCompleto)}</td>
                    <td><code>${escapeHtml(u.nombreUsuario)}</code></td>
                    <td><span class="badge bg-primary">${ROLES[u.rol] || u.rol}</span></td>
                    <td>${esActivo ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>'}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary" data-action="editar" data-id="${u.id}" title="Editar"><i class="bi bi-pencil"></i></button>
                        ${btnEstado}
                        <button class="btn btn-sm btn-outline-danger" data-action="eliminar" data-id="${u.id}" data-nombre="${escapeHtml(u.nombreUsuario)}" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>`;
            }).join('');
        }
    } catch (error) {
        cargando.classList.add('d-none');
        contenedor.classList.remove('d-none');
        mostrarAlerta('danger', `Error al cargar usuarios: ${error.message}`);
    }
}

function abrirModalNuevo() {
    usuarioEditando = null;
    document.getElementById('modalUsuarioTitulo').innerHTML = '<i class="bi bi-person-plus me-2"></i>Nuevo usuario';
    document.getElementById('formUsuario').reset();
    document.getElementById('formUsuario').estadoActivo.checked = true;
    document.getElementById('labelPassword').textContent = 'Contraseña *';
    document.getElementById('ayudaPassword').textContent = 'Requerida para nuevo usuario';
    document.getElementById('formUsuario').password.required = true;
    document.getElementById('contenedor-estado').classList.add('d-none');
    document.getElementById('error-formulario').classList.add('d-none');
}

async function editarUsuario(id) {
    try {
        const usuario = await api.get(`/usuarios/${id}`);
        usuarioEditando = usuario;
        document.getElementById('modalUsuarioTitulo').innerHTML = '<i class="bi bi-pencil me-2"></i>Editar usuario';
        document.getElementById('formUsuario').nombreCompleto.value = usuario.nombreCompleto;
        document.getElementById('formUsuario').nombreUsuario.value = usuario.nombreUsuario;
        document.getElementById('formUsuario').rol.value = usuario.rol;
        document.getElementById('formUsuario').estadoActivo.checked = usuario.estado === 1;
        document.getElementById('formUsuario').password.value = '';
        document.getElementById('labelPassword').textContent = 'Nueva contraseña';
        document.getElementById('ayudaPassword').textContent = 'Dejar vacío para mantener la actual';
        document.getElementById('formUsuario').password.required = false;
        document.getElementById('contenedor-estado').classList.remove('d-none');
        document.getElementById('error-formulario').classList.add('d-none');
        new bootstrap.Modal(document.getElementById('modalUsuario')).show();
    } catch (error) {
        mostrarAlerta('danger', `Error: ${error.message}`);
    }
}

async function guardarUsuario(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('error-formulario');
    const btnGuardar = document.getElementById('btnGuardar');

    errorEl.classList.add('d-none');
    btnGuardar.disabled = true;
    btnGuardar.querySelector('.btn-text').textContent = 'Guardando...';

    const esNuevo = !usuarioEditando;
    const password = form.password.value.trim();

    if (esNuevo && !password) {
        errorEl.textContent = 'La contraseña es requerida.';
        errorEl.classList.remove('d-none');
        btnGuardar.disabled = false;
        btnGuardar.querySelector('.btn-text').textContent = 'Guardar';
        return;
    }

    try {
        if (usuarioEditando) {
            const payload = {
                nombreCompleto: form.nombreCompleto.value.trim(),
                nombreUsuario: form.nombreUsuario.value.trim(),
                rol: parseInt(form.rol.value, 10),
                estado: form.estadoActivo.checked ? 1 : 2
            };
            if (password) payload.password = password;
            await api.put(`/usuarios/${usuarioEditando.id}`, payload);
            mostrarAlerta('success', 'Usuario actualizado.');
        } else {
            await api.post('/usuarios', {
                nombreCompleto: form.nombreCompleto.value.trim(),
                nombreUsuario: form.nombreUsuario.value.trim(),
                password,
                rol: parseInt(form.rol.value, 10)
            });
            mostrarAlerta('success', 'Usuario creado.');
        }
        bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
        cargarUsuarios();
    } catch (error) {
        errorEl.textContent = error.message;
        errorEl.classList.remove('d-none');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.querySelector('.btn-text').textContent = 'Guardar';
    }
}

async function cambiarEstado(id, activar) {
    try {
        await api.patch(`/usuarios/${id}/${activar ? 'activar' : 'desactivar'}`);
        mostrarAlerta('success', activar ? 'Usuario activado.' : 'Usuario desactivado.');
        cargarUsuarios();
    } catch (error) {
        mostrarAlerta('danger', `Error: ${error.message}`);
    }
}

function solicitarEliminar(id, nombre) {
    usuarioEliminar = id;
    document.getElementById('eliminarUsuarioNombre').textContent = nombre;
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

async function confirmarEliminar() {
    if (!usuarioEliminar) return;

    const btnEliminar = document.getElementById('btnConfirmarEliminar');
    btnEliminar.disabled = true;

    try {
        await api.delete(`/usuarios/${usuarioEliminar}`);
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
        mostrarAlerta('success', 'Usuario eliminado.');
        cargarUsuarios();
    } catch (error) {
        mostrarAlerta('danger', `Error: ${error.message}`);
    } finally {
        btnEliminar.disabled = false;
        usuarioEliminar = null;
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
