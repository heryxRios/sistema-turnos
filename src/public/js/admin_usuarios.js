// src/public/js/admin_usuarios.js

const token = localStorage.getItem('token');
if (!token || localStorage.getItem('rol') !== 'admin') {
    window.location.href = '/login.html';
}

const tablaDesktop = document.getElementById('tablaUsuariosDesktop');
const mobileContainer = document.getElementById('listaUsuariosMobile');

let usuarioEditId = null;
let usuarioResetId = null;

// Alternar visibilidad de Ventanilla en Formulario Principal
function toggleVentanilla() {
    const rol = document.getElementById('rol').value;
    const divV = document.getElementById('divVentanilla');
    if (rol === 'cajero') {
        divV.classList.remove('hidden');
    } else {
        divV.classList.add('hidden');
        document.getElementById('ventanillaDefault').value = '';
    }
}

// Alternar visibilidad de Ventanilla en Modal de Edición
function toggleVentanillaEdit() {
    const rol = document.getElementById('editRolSelect').value;
    const divV = document.getElementById('divEditVentanilla');
    if (rol === 'cajero') {
        divV.classList.remove('hidden');
    } else {
        divV.classList.add('hidden');
        document.getElementById('editVentanillaInput').value = '';
    }
}

// 📊 1. Cargar Reportes de la Jornada
async function cargarReportes() {
    try {
        const res = await fetch('/api/admin/reportes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        document.getElementById('repTotalTurnos').innerText = data.totalTurnos || 0;
        document.getElementById('repAtendidos').innerText = data.turnosAtendidos || 0;
        document.getElementById('repEnEspera').innerText = data.turnosEspera || 0;
        document.getElementById('repPrioritarios').innerText = data.turnosPrioritario || 0;
    } catch (err) {
        console.error("Error al cargar reportes:", err);
    }
}

// 👥 2. Cargar Lista de Usuarios
async function cargarUsuarios() {
    try {
        const res = await fetch('/api/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await res.json();
        
        tablaDesktop.innerHTML = '';
        mobileContainer.innerHTML = '';

        if (usuarios.length === 0) {
            tablaDesktop.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-600 italic">No hay usuarios registrados.</td></tr>`;
            mobileContainer.innerHTML = `<div class="text-center text-slate-600 italic text-sm p-4">No hay usuarios registrados.</div>`;
            return;
        }

        usuarios.forEach(u => {
            const esAtencion = u.rol === 'atencion';
            const esAdmin = u.rol === 'admin';
            const esCajero = u.rol === 'cajero';

            let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
            if (esAdmin) badgeClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            if (esCajero) badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            if (esAtencion) badgeClass = 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';

            // --- 🖥️ Render Tabla Desktop ---
            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors";
            tr.innerHTML = `
                <td class="p-3 text-slate-500 font-bold">${u.id}</td>
                <td class="p-3 font-semibold text-slate-200">${u.username}</td>
                <td class="p-3 capitalize text-xs">
                    <span class="px-2.5 py-0.5 rounded-full font-bold border ${badgeClass}">
                        ${u.rol}
                    </span>
                </td>
                <td class="p-3 font-bold text-slate-400">${u.ventanillaDefault || '--'}</td>
                <td class="p-3 text-center">
                    <div class="inline-flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button onclick="abrirEditarModal(${u.id}, '${u.username}', '${u.rol}', ${u.ventanillaDefault})" title="Editar Perfil" class="text-blue-400 hover:text-white font-bold text-xs bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                            ✏️ <span class="hidden xl:inline">Editar</span>
                        </button>
                        <button onclick="abrirResetModal(${u.id}, '${u.username}')" title="Restablecer Contraseña" class="text-amber-400 hover:text-white font-bold text-xs bg-amber-500/10 hover:bg-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                            🔑 <span class="hidden xl:inline">Clave</span>
                        </button>
                        <button onclick="eliminarUsuario(${u.id})" title="Eliminar Usuario" class="text-red-400 hover:text-white font-bold text-xs bg-red-500/10 hover:bg-red-600 border border-red-500/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                            🗑️
                        </button>
                    </div>
                </td>
            `;
            tablaDesktop.appendChild(tr);

            // --- 📱 Render Tarjetas Móviles ---
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
                <div class="flex gap-1.5">
                    <button onclick="abrirEditarModal(${u.id}, '${u.username}', '${u.rol}', ${u.ventanillaDefault})" class="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 p-2 rounded-lg">✏️</button>
                    <button onclick="abrirResetModal(${u.id}, '${u.username}')" class="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 p-2 rounded-lg">🔑</button>
                    <button onclick="eliminarUsuario(${u.id})" class="text-xs bg-red-500/10 text-red-400 border border-red-500/20 p-2 rounded-lg">🗑️</button>
                </div>
            `;
            mobileContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
    }
}

// ✏️ 3. Lógica del Modal 1: Editar Perfil (Rol y Ventanilla)
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

    const rol = document.getElementById('editRolSelect').value;
    const ventanillaDefault = document.getElementById('editVentanillaInput').value;

    try {
        const res = await fetch(`/api/admin/usuarios/${usuarioEditId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                rol,
                ventanillaDefault: ventanillaDefault ? parseInt(ventanillaDefault) : null
            })
        });

        const data = await res.json();
        if (!res.ok) {
            alert("Error: " + (data.error || "No se pudo actualizar el perfil."));
            return;
        }

        alert(data.mensaje);
        cerrarEditarModal();
        cargarUsuarios();
    } catch (err) {
        console.error("Error al editar perfil:", err);
    }
};

// 🔑 4. Lógica del Modal 2: Restablecer Contraseña
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
    if (!nuevaPassword || nuevaPassword.length < 4) {
        return alert("Por favor ingresa una nueva contraseña válida (mínimo 4 caracteres).");
    }

    try {
        const res = await fetch(`/api/admin/usuarios/${usuarioResetId}/reset-password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ nuevaPassword })
        });

        const data = await res.json();
        if (!res.ok) {
            alert("Error: " + (data.error || "No se pudo restablecer la contraseña."));
            return;
        }

        alert(data.mensaje);
        cerrarResetModal();
    } catch (err) {
        console.error("Error al restablecer contraseña:", err);
    }
}

// ➕ 5. Crear Usuario
document.getElementById('userForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;
    const ventanillaDefault = document.getElementById('ventanillaDefault').value;

    try {
        const res = await fetch('/api/admin/usuarios', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                username,
                password,
                rol,
                ventanillaDefault: ventanillaDefault ? parseInt(ventanillaDefault) : null
            })
        });

        const data = await res.json();
        if (!res.ok) {
            alert("Error: " + (data.error || "No se pudo crear el usuario"));
            return;
        }

        cargarUsuarios(); 
        cargarReportes();
        e.target.reset();
        toggleVentanilla();
    } catch (err) {
        console.error("Error al guardar:", err);
    }
};

// 🗑️ 6. Eliminar Usuario
async function eliminarUsuario(id) {
    if (!confirm("¿Está seguro de que desea eliminar a este empleado?")) return;
    try {
        const res = await fetch(`/api/admin/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            cargarUsuarios();
            cargarReportes();
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    toggleVentanilla();
    cargarUsuarios();
    cargarReportes();
});



/**
 * 
 
const token = localStorage.getItem('token');
if (!token || localStorage.getItem('rol') !== 'admin') {
    window.location.href = '/login.html';
}

const tablaDesktop = document.getElementById('tablaUsuariosDesktop');
const mobileContainer = document.getElementById('listaUsuariosMobile');
let usuarioResetId = null;

function toggleVentanilla() {
    const rol = document.getElementById('rol').value;
    const divV = document.getElementById('divVentanilla');
    if (rol === 'cajero') {
        divV.classList.remove('hidden');
    } else {
        divV.classList.add('hidden');
        document.getElementById('ventanillaDefault').value = '';
    }
}

// 📊 1. Cargar Reportes de la Jornada
async function cargarReportes() {
    try {
        const res = await fetch('/api/admin/reportes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        document.getElementById('repTotalTurnos').innerText = data.totalTurnos || 0;
        document.getElementById('repAtendidos').innerText = data.turnosAtendidos || 0;
        document.getElementById('repEnEspera').innerText = data.turnosEspera || 0;
        document.getElementById('repPrioritarios').innerText = data.turnosPrioritario || 0;
    } catch (err) {
        console.error("Error al cargar reportes:", err);
    }
}

// 👥 2. Cargar Lista de Usuarios
async function cargarUsuarios() {
    try {
        const res = await fetch('/api/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await res.json();
        
        tablaDesktop.innerHTML = '';
        mobileContainer.innerHTML = '';

        if (usuarios.length === 0) {
            tablaDesktop.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-600 italic">No hay usuarios registrados.</td></tr>`;
            mobileContainer.innerHTML = `<div class="text-center text-slate-600 italic text-sm p-4">No hay usuarios registrados.</div>`;
            return;
        }

        usuarios.forEach(u => {
            const esAtencion = u.rol === 'atencion';
            const esAdmin = u.rol === 'admin';
            const esCajero = u.rol === 'cajero';

            let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
            if (esAdmin) badgeClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            if (esCajero) badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            if (esAtencion) badgeClass = 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';

            // --- 🖥️ Render Tabla Desktop ---
            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors";
            tr.innerHTML = `
                <td class="p-3 text-slate-500 font-bold">${u.id}</td>
                <td class="p-3 font-semibold text-slate-200">${u.username}</td>
                <td class="p-3 capitalize text-xs">
                    <span class="px-2.5 py-0.5 rounded-full font-bold border ${badgeClass}">
                        ${u.rol}
                    </span>
                </td>
                <td class="p-3 font-bold text-slate-400">${u.ventanillaDefault || '--'}</td>
                <td class="p-3 text-center flex justify-center gap-2">
                    <button onclick="abrirResetModal(${u.id}, '${u.username}')" title="Restablecer Contraseña" class="text-amber-400 hover:text-white font-bold text-xs bg-amber-500/10 hover:bg-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-all">
                        🔑 Restablecer
                    </button>
                    <button onclick="eliminarUsuario(${u.id})" title="Eliminar Usuario" class="text-red-400 hover:text-white font-bold text-xs bg-red-500/10 hover:bg-red-600 border border-red-500/20 px-2.5 py-1 rounded-lg transition-all">
                        🗑️ Eliminar
                    </button>
                </td>
            `;
            tablaDesktop.appendChild(tr);

            // --- 📱 Render Tarjetas Móviles ---
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
                <div class="flex gap-2">
                    <button onclick="abrirResetModal(${u.id}, '${u.username}')" class="text-xs bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/20 p-2 rounded-lg transition-all">🔑</button>
                    <button onclick="eliminarUsuario(${u.id})" class="text-xs bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 p-2 rounded-lg transition-all">🗑️</button>
                </div>
            `;
            mobileContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
    }
}

// 🔑 3. Lógica del Modal de Restablecer Contraseña
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
    if (!nuevaPassword || nuevaPassword.length < 4) {
        return alert("Por favor ingresa una nueva contraseña válida (mínimo 4 caracteres).");
    }

    try {
        const res = await fetch(`/api/admin/usuarios/${usuarioResetId}/reset-password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ nuevaPassword })
        });

        const data = await res.json();
        if (!res.ok) {
            alert("Error: " + (data.error || "No se pudo restablecer la contraseña."));
            return;
        }

        alert(data.mensaje);
        cerrarResetModal();
    } catch (err) {
        console.error("Error al restablecer contraseña:", err);
    }
}

// ➕ 4. Crear Usuario
document.getElementById('userForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;
    const ventanillaDefault = document.getElementById('ventanillaDefault').value;

    try {
        const res = await fetch('/api/admin/usuarios', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                username,
                password,
                rol,
                ventanillaDefault: ventanillaDefault ? parseInt(ventanillaDefault) : null
            })
        });

        const data = await res.json();
        if (!res.ok) {
            alert("Error: " + (data.error || "No se pudo crear el usuario"));
            return;
        }

        cargarUsuarios(); 
        cargarReportes();
        e.target.reset();
        toggleVentanilla();
    } catch (err) {
        console.error("Error al guardar:", err);
    }
};

// 🗑️ 5. Eliminar Usuario
async function eliminarUsuario(id) {
    if (!confirm("¿Está seguro de que desea eliminar a este empleado?")) return;
    try {
        const res = await fetch(`/api/admin/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            cargarUsuarios();
            cargarReportes();
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    toggleVentanilla();
    cargarUsuarios();
    cargarReportes();
});
*/

/**
const token = localStorage.getItem('token');
if (!token || localStorage.getItem('rol') !== 'admin') {
    window.location.href = '/login.html';
}

const tablaDesktop = document.getElementById('tablaUsuariosDesktop');
const mobileContainer = document.getElementById('listaUsuariosMobile');

function toggleVentanilla() {
    const rol = document.getElementById('rol').value;
    const divV = document.getElementById('divVentanilla');
    if (rol === 'cajero') {
        divV.classList.remove('hidden');
    } else {
        divV.classList.add('hidden');
        document.getElementById('ventanillaDefault').value = '';
    }
}

async function cargarUsuarios() {
    try {
        const res = await fetch('/api/admin/usuarios', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const usuarios = await res.json();
        
        tablaDesktop.innerHTML = '';
        mobileContainer.innerHTML = '';

        if (usuarios.length === 0) {
            tablaDesktop.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-600 italic">No hay usuarios registrados.</td></tr>`;
            mobileContainer.innerHTML = `<div class="text-center text-slate-600 italic text-sm p-4">No hay usuarios registrados.</div>`;
            return;
        }

        usuarios.forEach(u => {
            const esAtencion = u.rol === 'atencion';
            const esAdmin = u.rol === 'admin';
            const esCajero = u.rol === 'cajero';

            // Estilos dinámicos de Badges
            let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
            if (esAdmin) badgeClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            if (esCajero) badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            if (esAtencion) badgeClass = 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20';

            // --- 🖥️ Render Tabla Desktop ---
            const tr = document.createElement('tr');
            tr.className = "border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors";
            tr.innerHTML = `
                <td class="p-3 text-slate-500 font-bold">${u.id}</td>
                <td class="p-3 font-semibold text-slate-200">${u.username}</td>
                <td class="p-3 capitalize text-xs">
                    <span class="px-2.5 py-0.5 rounded-full font-bold border ${badgeClass}">
                        ${u.rol}
                    </span>
                </td>
                <td class="p-3 font-bold text-slate-400">${u.ventanillaDefault || '--'}</td>
                <td class="p-3 text-center">
                    <button onclick="eliminarUsuario(${u.id})" class="text-red-400 hover:text-white font-bold text-xs bg-red-500/10 hover:bg-red-600 border border-red-500/20 px-2.5 py-1 rounded-lg transition-all">
                        Eliminar
                    </button>
                </td>
            `;
            tablaDesktop.appendChild(tr);

            // --- 📱 Render Tarjetas Móviles ---
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
                <button onclick="eliminarUsuario(${u.id})" class="text-xs bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 p-2 rounded-lg transition-all">
                    🗑️
                </button>
            `;
            mobileContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error al cargar usuarios:", err);
    }
}

document.getElementById('userForm').onsubmit = async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;
    const ventanillaDefault = document.getElementById('ventanillaDefault').value;

    try {
        const res = await fetch('/api/admin/usuarios', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                username,
                password,
                rol,
                ventanillaDefault: ventanillaDefault ? parseInt(ventanillaDefault) : null
            })
        });

        const data = await res.json();
        if (!res.ok) {
            alert("Error: " + (data.error || "No se pudo crear el usuario"));
            return;
        }

        cargarUsuarios(); 
        e.target.reset();
        toggleVentanilla();
    } catch (err) {
        console.error("Error al guardar:", err);
    }
};

async function eliminarUsuario(id) {
    if (!confirm("¿Está seguro de que desea eliminar a este empleado?")) return;
    try {
        const res = await fetch(`/api/admin/usuarios/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) cargarUsuarios();
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    toggleVentanilla();
    cargarUsuarios();
});
*/