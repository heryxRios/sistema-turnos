// src/public/js/atencion.js

// 1. Verificación del Token de Seguridad
/**
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

// 2. Inicialización de Socket.io
const socket = io(); 
let turnoSeleccionado = null;
let ultimoTurnoGenerado = null;

// 3. Generar Turno vía HTTP API
async function generar(tipo) {
    try {
        const res = await fetch('/api/atencion', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cliente: 'Cliente', tipo })
        });
        const data = await res.json();
        
        if (data.numero) {
            ultimoTurnoGenerado = data;
            const alertaTicket = document.getElementById('ultimoTicket');
            document.getElementById('numeroTicket').innerText = data.numero;
            alertaTicket.classList.remove('hidden');
            
            // Recargar historial local
            cargarHistorialInicial();
        }
    } catch (err) { 
        console.error("Error al generar turno:", err); 
    }
}

// 4. Obtener listado de turnos inicial
async function cargarHistorialInicial() {
    try {
        const res = await fetch('/api/atencion', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const turnos = await res.json();
        renderizarHistorial(turnos);
    } catch (err) { 
        console.error("Error al cargar historial:", err); 
    }
}

// 5. Renderizado Sincronizado y Responsivo (Desktop vs Mobile Card Shift)
function renderizarHistorial(turnos) {
    const tbody = document.getElementById('tablaHistorialDesktop');
    const mobileContainer = document.getElementById('listaHistorialMobile');
    
    if (!tbody || !mobileContainer) return;
    
    tbody.innerHTML = '';
    mobileContainer.innerHTML = '';
    
    if (turnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-gray-400 italic">No hay turnos registrados hoy.</td></tr>`;
        mobileContainer.innerHTML = `<div class="text-center text-gray-400 italic text-sm p-4">No hay turnos registrados hoy.</div>`;
        return;
    }

    turnos.forEach(turno => {
        const hora = new Date(turno.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const esPrioritario = turno.tipo === 'prioritario';
        
        // --- Render Estilo Tabla (Desktop) ---
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 border-b border-gray-100 transition-colors cursor-pointer";
        tr.onclick = () => abrirModal(turno);
        tr.innerHTML = `
            <td class="p-3 font-bold ${esPrioritario ? 'text-amber-600' : 'text-blue-600'} text-base">${turno.numero}</td>
            <td class="p-3 capitalize">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${esPrioritario ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">
                    ${turno.tipo}
                </span>
            </td>
            <td class="p-3 text-gray-600 font-medium">${hora}</td>
            <td class="p-3 text-center">
                <button class="text-xs bg-gray-100 border border-gray-200 hover:bg-green-600 hover:text-white font-bold px-3 py-1 rounded-md transition-all">
                    🖨️ Reimprimir
                </button>
            </td>
        `;
        tbody.appendChild(tr);

        // --- Render Estilo Tarjeta (Mobile/Tablet) ---
        const card = document.createElement('div');
        card.className = "bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm active:bg-gray-50 transition-all cursor-pointer";
        card.onclick = () => abrirModal(turno);
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="text-2xl font-black ${esPrioritario ? 'text-amber-600' : 'text-blue-600'}">${turno.numero}</div>
                <div>
                    <div class="text-[10px] uppercase font-bold tracking-wider text-gray-400">${turno.tipo}</div>
                    <div class="text-xs text-gray-500 font-semibold">Hora: ${hora}</div>
                </div>
            </div>
            <button class="text-xs bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-gray-600">🖨️</button>
        `;
        mobileContainer.appendChild(card);
    });
}

// 6. Control de Modales Interactivos
function abrirModal(turno) {
    turnoSeleccionado = turno;
    document.getElementById('modalNumero').innerText = turno.numero;
    document.getElementById('modalTurno').classList.remove('hidden');
}

// 7. Cerrar Modal
function cerrarModal() {
    document.getElementById('modalTurno').classList.add('hidden');
    turnoSeleccionado = null;
}

// 8. Lanzamiento del Motor de Impresión
function ejecutarImpresion(numero, tipo, fecha) {
    document.getElementById('printNumero').innerText = numero;
    document.getElementById('printFila').innerText = `Fila: ${tipo}`;
    document.getElementById('printHora').innerText = `Hora: ${new Date(fecha).toLocaleTimeString()}`;
    window.print();
}

function imprimirDesdeModal() {
    if (turnoSeleccionado) {
        ejecutarImpresion(turnoSeleccionado.numero, turnoSeleccionado.tipo, turnoSeleccionado.createdAt);
        cerrarModal();
    }
}

function imprimirTicketFisicoDirecto() {
    if (ultimoTurnoGenerado) {
        ejecutarImpresion(ultimoTurnoGenerado.numero, ultimoTurnoGenerado.tipo, ultimoTurnoGenerado.createdAt);
        document.getElementById('ultimoTicket').classList.add('hidden');
    }
}

// 9. Reset Operativo Completo
async function reiniciarSistema() {
    if (!confirm("⚠️ ¿Deseas vaciar por completo las listas y contadores desde cero?")) return;
    try {
        const res = await fetch('/api/atencion/reiniciar', { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        alert(data.mensaje);
        cargarHistorialInicial();
    } catch (err) { 
        console.error("Error al reiniciar sistema:", err); 
    }
}

// 10. Salida Segura del Sistema
function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// 11. Escucha Activa de WebSockets (Tiempo Real)
socket.on('nuevo-turno-generado', () => {
    cargarHistorialInicial();
});

// Inicialización Automática al Cargar DOM
document.addEventListener('DOMContentLoaded', cargarHistorialInicial);
**/

// src/public/js/atencion.js

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

const socket = io(); 
let turnoSeleccionado = null;
let ultimoTurnoGenerado = null;

async function generar(tipo) {
    try {
        const res = await fetch('/api/atencion', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cliente: 'Cliente', tipo })
        });
        const data = await res.json();
        
        if (data.numero) {
            ultimoTurnoGenerado = data;
            const alertaTicket = document.getElementById('ultimoTicket');
            document.getElementById('numeroTicket').innerText = data.numero;
            alertaTicket.classList.remove('hidden');
            
            cargarHistorialInicial();
        }
    } catch (err) { 
        console.error("Error al generar turno:", err); 
    }
}

async function cargarHistorialInicial() {
    try {
        const res = await fetch('/api/atencion', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const turnos = await res.json();
        renderizarHistorial(turnos);
    } catch (err) { 
        console.error("Error al cargar historial:", err); 
    }
}

function renderizarHistorial(turnos) {
    const tbody = document.getElementById('tablaHistorialDesktop');
    const mobileContainer = document.getElementById('listaHistorialMobile');
    
    if (!tbody || !mobileContainer) return;
    
    tbody.innerHTML = '';
    mobileContainer.innerHTML = '';
    
    if (turnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-600 italic">No hay turnos registrados hoy.</td></tr>`;
        mobileContainer.innerHTML = `<div class="text-center text-slate-600 italic text-sm p-4">No hay turnos registrados hoy.</div>`;
        return;
    }

    turnos.forEach(turno => {
        const hora = new Date(turno.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const esPrioritario = turno.tipo === 'prioritario';
        
        // --- 🖥️ RENDER ESTILO TABLA (DESKTOP) ---
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/50 border-b border-slate-800/60 transition-colors cursor-pointer";
        tr.onclick = () => abrirModal(turno);
        
        // Aplicamos lógica de color condicional: Fucsia para Prioritarios, Azul para General
        tr.innerHTML = `
            <td class="p-3 font-bold ${esPrioritario ? 'text-fuchsia-400' : 'text-blue-400'} text-base">${turno.numero}</td>
            <td class="p-3 capitalize">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${esPrioritario ? 'bg-fuchsia-400/10 text-fuchsia-400 border border-fuchsia-500/20' : 'bg-blue-400/10 text-blue-400 border border-blue-500/20'}">
                    ${turno.tipo}
                </span>
            </td>
            <td class="p-3 text-slate-400 font-medium">${hora}</td>
            <td class="p-3 text-center">
                <button class="text-xs bg-slate-800 border border-slate-700 hover:bg-green-600 hover:text-white hover:border-green-600 font-bold px-3 py-1 rounded-md transition-all">
                    🖨️ Reimprimir
                </button>
            </td>
        `;
        tbody.appendChild(tr);

        // --- 📱 RENDER ESTILO TARJETA (MOBILE/TABLET) ---
        const card = document.createElement('div');
        // Estilo condicional de bordes externos para las tarjetas móviles
        card.className = `bg-slate-900 border ${esPrioritario ? 'border-fuchsia-500/30' : 'border-slate-800'} p-4 rounded-xl flex items-center justify-between shadow-md active:bg-slate-850 transition-all cursor-pointer`;
        card.onclick = () => abrirModal(turno);
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="text-2xl font-black ${esPrioritario ? 'text-fuchsia-400' : 'text-blue-400'}">${turno.numero}</div>
                <div>
                    <div class="text-[10px] uppercase font-bold tracking-wider ${esPrioritario ? 'text-fuchsia-400' : 'text-slate-400'}">${turno.tipo}</div>
                    <div class="text-xs text-slate-500 font-semibold">Hora: ${hora}</div>
                </div>
            </div>
            <button class="text-xs bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-slate-400">🖨️</button>
        `;
        mobileContainer.appendChild(card);
    });
}

function abrirModal(turno) {
    turnoSeleccionado = turno;
    document.getElementById('modalNumero').innerText = turno.numero;
    document.getElementById('modalTurno').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalTurno').classList.add('hidden');
    turnoSeleccionado = null;
}

function ejecutarImpresion(numero, tipo, fecha) {
    document.getElementById('printNumero').innerText = numero;
    document.getElementById('printFila').innerText = `Fila: ${tipo}`;
    document.getElementById('printHora').innerText = `Hora: ${new Date(fecha).toLocaleTimeString()}`;
    window.print();
}

function imprimirDesdeModal() {
    if (turnoSeleccionado) {
        ejecutarImpresion(turnoSeleccionado.numero, turnoSeleccionado.tipo, turnoSeleccionado.createdAt);
        cerrarModal();
    }
}

function imprimirTicketFisicoDirecto() {
    if (ultimoTurnoGenerado) {
        ejecutarImpresion(ultimoTurnoGenerado.numero, ultimoTurnoGenerado.tipo, ultimoTurnoGenerado.createdAt);
        document.getElementById('ultimoTicket').classList.add('hidden');
    }
}

async function reiniciarSistema() {
    if (!confirm("⚠️ ¿Deseas vaciar por completo las listas y contadores desde cero?")) return;
    try {
        const res = await fetch('/api/atencion/reiniciar', { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        alert(data.mensaje);
        cargarHistorialInicial();
    } catch (err) { 
        console.error("Error al reiniciar sistema:", err); 
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

socket.on('nuevo-turno-generado', () => {
    cargarHistorialInicial();
});

document.addEventListener('DOMContentLoaded', cargarHistorialInicial);