// src/public/js/cajas.js

// 1. Verificación de Autenticación
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

const socket = io(); 
let ventanilla = null;
let turnoActualObjeto = null;

// Referencias del DOM
const tablaPendientes = document.getElementById('tablaPendientesCaja');
const mobileContainer = document.getElementById('listaPendientesMobile');
const cantGeneral = document.getElementById('cantGeneral');
const cantPrioritario = document.getElementById('cantPrioritario');

function iniciarCaja() {
    const v = document.getElementById('numVentanilla').value;
    if(!v) return alert('Por favor, ingresa un número de ventanilla válido.');
    ventanilla = v;
    document.getElementById('labelVentanilla').innerText = v;
    document.getElementById('setupCaja').classList.add('hidden');
}

async function llamar(tipoFila) {
    if (!ventanilla) return alert('Primero debes configurar el número de ventanilla.');
    try {
        const res = await fetch('/api/cajas/llamar', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ventanilla, tipoFila })
        });
        const data = await res.json();
        
        if(data.turno) {
            turnoActualObjeto = data.turno;
            
            // Actualizar número en pantalla gigante
            document.getElementById('turnoActual').innerText = data.turno.numero;
            
            // Alternar a los botones de ciclo de atención
            document.getElementById('controlesLlamada').classList.add('hidden');
            document.getElementById('controlesAtencion').classList.remove('hidden');
        } else {
            alert(data.mensaje || "No hay turnos pendientes en esta fila.");
        }
    } catch (err) {
        console.error("Error al llamar turno:", err);
    }
}

// Acción: Marcar como Atendido
async function finalizarAtencion() {
    if (!turnoActualObjeto) return;
    try {
        const res = await fetch(`/api/cajas/atender/${turnoActualObjeto.id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            restablecerBotoneraCaja();
        } else {
            alert("Error al intentar cerrar la atención del turno.");
        }
    } catch (err) {
        console.error("Error en finalización:", err);
    }
}

// Acción: Regresar a Sala de Espera
async function devolverAFilaEspera() {
    if (!turnoActualObjeto) return;
    try {
        const res = await fetch(`/api/atencion/${turnoActualObjeto.id}/regresar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            restablecerBotoneraCaja();
        } else {
            alert("No se pudo devolver el turno a la lista de espera.");
        }
    } catch (err) {
        console.error("Error al regresar el turno:", err);
    }
}

function restablecerBotoneraCaja() {
    turnoActualObjeto = null;
    document.getElementById('turnoActual').innerText = "---";
    
    document.getElementById('controlesAtencion').classList.add('hidden');
    document.getElementById('controlesLlamada').classList.remove('hidden');
    
    actualizarMonitoreoCaja();
}

async function actualizarMonitoreoCaja() {
    try {
        const res = await fetch('/api/atencion', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const turnos = await res.json();
        
        // Filtrar solo los turnos en estado 'espera'
        const pendientes = turnos.filter(t => t.estado === 'espera');
        
        // Actualizar contadores numéricos
        cantGeneral.innerText = pendientes.filter(t => t.tipo === 'general').length;
        cantPrioritario.innerText = pendientes.filter(t => t.tipo === 'prioritario').length;
        
        // Renderizar vistas
        tablaPendientes.innerHTML = '';
        mobileContainer.innerHTML = '';

        if(pendientes.length === 0) {
            tablaPendientes.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-600 italic">No hay turnos pendientes en este momento.</td></tr>`;
            mobileContainer.innerHTML = `<div class="text-center text-slate-600 italic text-sm p-4">No hay turnos pendientes en este momento.</div>`;
            return;
        }

        pendientes.forEach(t => {
            const hora = new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const esPrioritario = t.tipo === 'prioritario';

            // --- 🖥️ Render Tabla Desktop ---
            const fila = document.createElement('tr');
            fila.className = "border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors";
            fila.innerHTML = `
                <td class="p-3 font-bold ${esPrioritario ? 'text-fuchsia-400' : 'text-blue-400'} text-base">${t.numero}</td>
                <td class="p-3 text-slate-200 font-medium">${t.cliente || 'Anónimo'}</td>
                <td class="p-3 capitalize text-xs">
                    <span class="px-2.5 py-0.5 rounded-full font-bold ${esPrioritario ? 'bg-fuchsia-400/10 text-fuchsia-400 border border-fuchsia-500/20' : 'bg-blue-400/10 text-blue-400 border border-blue-500/20'}">
                        ${t.tipo}
                    </span>
                </td>
                <td class="p-3 text-xs text-slate-400">${hora}</td>
            `;
            tablaPendientes.appendChild(fila);

            // --- 📱 Render Tarjetas Móviles/Tablets ---
            const card = document.createElement('div');
            card.className = `bg-slate-900 border ${esPrioritario ? 'border-fuchsia-500/30' : 'border-slate-800'} p-3 rounded-xl flex items-center justify-between shadow-sm`;
            card.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="text-xl font-black ${esPrioritario ? 'text-fuchsia-400' : 'text-blue-400'}">${t.numero}</div>
                    <div>
                        <div class="text-xs text-slate-200 font-bold">${t.cliente || 'Anónimo'}</div>
                        <div class="text-[10px] uppercase font-bold tracking-wider ${esPrioritario ? 'text-fuchsia-400' : 'text-slate-400'}">${t.tipo} • ${hora}</div>
                    </div>
                </div>
            `;
            mobileContainer.appendChild(card);
        });
    } catch (err) {
        console.error("Error al actualizar monitoreo:", err);
    }
}

// Sockets en tiempo real
socket.on('nuevo-turno-generado', actualizarMonitoreoCaja);
socket.on('turno-llamado', actualizarMonitoreoCaja);

function logout() { 
    localStorage.clear(); 
    window.location.href = '/login.html'; 
}

document.addEventListener('DOMContentLoaded', actualizarMonitoreoCaja);