// src/public/js/admin_dashboard.js

const token = localStorage.getItem('token');
if (!token || localStorage.getItem('rol') !== 'admin') {
    window.location.href = '/login.html';
}

const socket = io();
let chartInstance = null;

let usuarioEditId = null;
let usuarioResetId = null;

// 📊 1. Cargar Reportes & Inicializar Gráfico
async function cargarDashboardMetrics() {
    try {
        const res = await fetch('/api/admin/reportes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        document.getElementById('kpiTotal').innerText = data.totalTurnos || 0;
        document.getElementById('kpiAtendidos').innerText = data.turnosAtendidos || 0;
        document.getElementById('kpiEspera').innerText = data.turnosEspera || 0;
        document.getElementById('kpiPrioritarios').innerText = data.turnosPrioritario || 0;
        document.getElementById('kpiOperadores').innerText = data.totalUsuarios || 0;

        actualizarGrafico(data.turnosGeneral || 0, data.turnosPrioritario || 0);
        cargarVentanillas();
    } catch (err) {
        console.error("Error cargando métricas:", err);
    }
}

// 📈 2. Gráfico Donut con Chart.js
function actualizarGrafico(general, prioritario) {
    const ctx = document.getElementById('chartFilas').getContext('2d');
    
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['General', 'Prioritario'],
            datasets: [{
                data: [general, prioritario],
                backgroundColor: ['#2563eb', '#c026d3'],
                borderColor: '#0f172a',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 11, weight: 'bold' } }
                }
            }
        }
    });
}

// 🏢 3. Monitoreo de Ventanillas en Vivo
async function cargarVentanillas() {
    try {
        const res = await fetch('/api/atencion', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const turnos = await res.json();
        const grid = document.getElementById('gridVentanillas');
        grid.innerHTML = '';

        // Filtrar turnos actualmente llamados
        const enAtencion = turnos.filter(t => t.estado === 'llamado');

        if (enAtencion.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center text-slate-600 text-xs py-6 italic">No hay ventanillas con turnos activos en este momento.</div>`;
            return;
        }

        enAtencion.forEach(t => {
            const card = document.createElement('div');
            card.className = "bg-slate-950 border border-blue-500/30 p-3 rounded-xl text-center shadow-md animate-fade-in";
            card.innerHTML = `
                <span class="text-[10px] font-bold uppercase text-slate-400">Ventanilla #${t.ventanilla || '--'}</span>
                <div class="text-2xl font-black text-blue-400 my-1">${t.numero}</div>
                <span class="text-[9px] px-2 py-0.5 rounded-full font-bold bg-green-500/10 text-green-400 border border-green-500/20">En Atención</span>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Error al cargar ventanillas:", err);
    }
}

// 👥 4. Cargar Usuarios
async function cargarUsuarios() {
    try {
        const res = await fetch('/api/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await res.json();
        
        const tablaDesktop = document.getElementById('tablaUsuariosDesktop');
        const mobileContainer = document.getElementById('listaUsuariosMobile');
        
        tablaDesktop.innerHTML = '';
        mobileContainer.innerHTML = '';

        usuarios.forEach(u => {
            const esAtencion = u.rol === 'atencion';
            const esAdmin = u.rol === 'admin';
            const esCajero = u.rol === 'cajero';

            let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
            if (esAdmin) badgeClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            if (esCajero) badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            if (esAtencion) badgeClass = 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';

            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors";
            tr.innerHTML = `
                <td class="p-3 text-slate-500 font-bold">${u.id}</td>
                <td class="p-3 font-semibold text-slate-200">${u.username}</td>
                <td class="p-3 capitalize text-xs">
                    <span class="px-2.5 py-0.5 rounded-full font-bold border ${badgeClass}">${u.rol}</span>
                </td>
                <td class="p-3 font-bold text-slate-400">${u.ventanillaDefault || '--'}</td>
                <td class="p-3 text-center">
                    <div class="inline-flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button onclick="abrirEditarModal(${u.id}, '${u.username}', '${u.rol}', ${u.ventanillaDefault})" title="Editar Perfil" class="text-blue-400 hover:text-white font-bold text-xs bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 px-2 py-1 rounded-lg transition-all">✏️</button>
                        <button onclick="abrirResetModal(${u.id}, '${u.username}')" title="Restablecer Contraseña" class="text-amber-400 hover:text-white font-bold text-xs bg-amber-500/10 hover:bg-amber-600 border border-amber-500/20 px-2 py-1 rounded-lg transition-all">🔑</button>
                        <button onclick="eliminarUsuario(${u.id})" title="Eliminar Usuario" class="text-red-400 hover:text-white font-bold text-xs bg-red-500/10 hover:bg-red-600 border border-red-500/20 px-2 py-1 rounded-lg transition-all">🗑️</button>
                    </div>
                </td>
            `;
            tablaDesktop.appendChild(tr);

            const card = document.createElement('div');
            card.className = "bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-sm";
            card.innerHTML = `
                <div>
                    <div class="font-bold text-slate-200 text-sm">${u.username}</div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}">${u.rol}</span>
                        <span class="text-xs text-slate-500">Ventanilla: ${u.ventanillaDefault || '--'}</span>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="abrirEditarModal(${u.id}, '${u.username}', '${u.rol}', ${u.ventanillaDefault})" class="text-xs bg-blue-500/10 text-blue-400 p-2 rounded-lg">✏️</button>
                    <button onclick="abrirResetModal(${u.id}, '${u.username}')" class="text-xs bg-amber-500/10 text-amber-400 p-2 rounded-lg">🔑</button>
                    <button onclick="eliminarUsuario(${u.id})" class="text-xs bg-red-500/10 text-red-400 p-2 rounded-lg">🗑️</button>
                </div>
            `;
            mobileContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
    }
}

// Modales y Controles
function toggleVentanilla() {
    const rol = document.getElementById('rol').value;
    const divV = document.getElementById('divVentanilla');
    if (rol === 'cajero') divV.classList.remove('hidden');
    else { divV.classList.add('hidden'); document.getElementById('ventanillaDefault').value = ''; }
}

function toggleVentanillaEdit() {
    const rol = document.getElementById('editRolSelect').value;
    const divV = document.getElementById('divEditVentanilla');
    if (rol === 'cajero') divV.classList.remove('hidden');
    else { divV.classList.add('hidden'); document.getElementById('editVentanillaInput').value = ''; }
}

function abrirEditarModal(id, username, rol, ventanillaDefault) {
    usuarioEditId = id;
    document.getElementById('modalEditarUsername').innerText = username;
    document.getElementById('editRolSelect').value = rol;
    document.getElementById('editVentanillaInput').value = ventanillaDefault || '';
    toggleVentanillaEdit();
    document.getElementById('modalEditarPerfil').classList.remove('hidden');
}

function cerrarEditarModal() {
    usuarioEditId = null;
    document.getElementById('modalEditarPerfil').classList.add('hidden');
}

document.getElementById('formEditarPerfil').onsubmit = async (e) => {
    e.preventDefault();
    if (!usuarioEditId) return;

    try {
        const res = await fetch(`/api/admin/usuarios/${usuarioEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                rol: document.getElementById('editRolSelect').value,
                ventanillaDefault: document.getElementById('editVentanillaInput').value ? parseInt(document.getElementById('editVentanillaInput').value) : null
            })
        });

        if (res.ok) {
            cerrarEditarModal();
            cargarUsuarios();
            cargarDashboardMetrics();
        }
    } catch (err) { console.error(err); }
};

function abrirResetModal(id, username) {
    usuarioResetId = id;
    document.getElementById('modalResetUsername').innerText = username;
    document.getElementById('nuevaPasswordInput').value = '';
    document.getElementById('modalResetPassword').classList.remove('hidden');
}

function cerrarResetModal() {
    usuarioResetId = null;
    document.getElementById('modalResetPassword').classList.add('hidden');
}

async function confirmarResetPassword() {
    const nuevaPassword = document.getElementById('nuevaPasswordInput').value.trim();
    if (!nuevaPassword) return alert("Ingresa una contraseña válida.");

    try {
        const res = await fetch(`/api/admin/usuarios/${usuarioResetId}/reset-password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ nuevaPassword })
        });
        if (res.ok) {
            alert("Contraseña restablecida con éxito.");
            cerrarResetModal();
        }
    } catch (err) { console.error(err); }
}

document.getElementById('userForm').onsubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/admin/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value,
                rol: document.getElementById('rol').value,
                ventanillaDefault: document.getElementById('ventanillaDefault').value ? parseInt(document.getElementById('ventanillaDefault').value) : null
            })
        });
        if (res.ok) {
            cargarUsuarios();
            cargarDashboardMetrics();
            e.target.reset();
            toggleVentanilla();
        }
    } catch (err) { console.error(err); }
};

async function eliminarUsuario(id) {
    if (!confirm("¿Eliminar usuario?")) return;
    try {
        const res = await fetch(`/api/admin/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) { cargarUsuarios(); cargarDashboardMetrics(); }
    } catch (err) { console.error(err); }
}

async function reiniciarSistema() {
    if (!confirm("⚠️ ¿Vaciar filas y reiniciar contadores desde cero?")) return;
    try {
        await fetch('/api/atencion/reiniciar', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        cargarDashboardMetrics();
    } catch (err) { console.error(err); }
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// 🔄 Sockets en Vivo
socket.on('nuevo-turno-generado', cargarDashboardMetrics);
socket.on('turno-llamado', cargarDashboardMetrics);

document.addEventListener('DOMContentLoaded', () => {
    toggleVentanilla();
    cargarUsuarios();
    cargarDashboardMetrics();
});