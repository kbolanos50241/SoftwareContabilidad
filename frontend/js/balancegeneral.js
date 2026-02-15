/**
 * Balance General - Estado de Situación Financiera
 */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fechaCorte').value = new Date().toISOString().slice(0, 10);
    document.getElementById('btnConsultar').addEventListener('click', consultarBalance);
    consultarBalance();
});

async function consultarBalance() {
    const fecha = document.getElementById('fechaCorte').value;
    const url = fecha ? `/reportes/balancegeneral?fechaCorte=${fecha}` : '/reportes/balancegeneral';

    document.getElementById('cargando').classList.remove('d-none');
    document.getElementById('resultado-contenedor').classList.add('d-none');
    document.getElementById('alerta').classList.add('d-none');

    try {
        const data = await api.get(url);
        renderizarBalance(data);
        document.getElementById('cargando').classList.add('d-none');
        document.getElementById('resultado-contenedor').classList.remove('d-none');
    } catch (error) {
        document.getElementById('cargando').classList.add('d-none');
        mostrarAlerta('danger', `Error: ${error.message}`);
    }
}

function renderizarBalance(data) {
    const fechaCorte = new Date(data.fechaCorte).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('fechaCorteTexto').textContent = fechaCorte;

    const badge = document.getElementById('badgeEquilibrado');
    badge.textContent = data.equilibrado ? 'Equilibrado' : 'Desbalanceado';
    badge.className = 'badge ' + (data.equilibrado ? 'bg-success' : 'bg-danger');

    renderizarSeccion('tabla-activos', data.activos || [], 'total-activos', data.totalActivos || 0);
    renderizarSeccion('tabla-pasivos', data.pasivos || [], 'total-pasivos', data.totalPasivos || 0);
    renderizarSeccion('tabla-patrimonio', data.patrimonio || [], 'total-patrimonio', data.totalPatrimonio || 0);

    const totalPasivosPatrimonio = (data.totalPasivos || 0) + (data.totalPatrimonio || 0);
    const totalActivos = data.totalActivos || 0;
    const diff = Math.abs(totalActivos - totalPasivosPatrimonio);
    const ecuacion = document.getElementById('ecuacion-resultado');
    if (data.equilibrado) {
        ecuacion.innerHTML = ' <span class="text-success">✓</span>';
    } else {
        ecuacion.innerHTML = ` <span class="text-danger">(Diferencia: ${formatNumber(diff)})</span>`;
    }
}

function renderizarSeccion(tbodyId, items, totalId, total) {
    const tbody = document.getElementById(tbodyId);
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-muted small">Sin movimientos</td></tr>';
    } else {
        tbody.innerHTML = items.map(item =>
            `<tr>
                <td>${escapeHtml(item.codigo)} - ${escapeHtml(item.nombre)}</td>
                <td class="text-end">${formatNumber(item.saldo)}</td>
            </tr>`
        ).join('');
    }
    document.getElementById(totalId).textContent = formatNumber(total);
}

function formatNumber(n) {
    return new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function mostrarAlerta(tipo, mensaje) {
    const alerta = document.getElementById('alerta');
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
    alerta.classList.remove('d-none');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
