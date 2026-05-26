let aguaPura = 0;
let otrosLiquidos = 0;
let metaAguaPura = 2100;
let temporizadorAgua;

// Registrar el Service Worker para habilitar la instalación nativa
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registrado Exitosamente'))
            .catch(err => console.log('Error al registrar Service Worker', err));
    }

window.onload = function() {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        document.getElementById('btn-permiso').style.display = 'block';
    }

    // --- LOGICA DE RESETEO AUTOMATICO DIARIO ---
    let fechaHoy = new Date().toLocaleDateString();
    let ultimaFechaGuardada = localStorage.getItem('ultimaFechaRegistro');

    if (ultimaFechaGuardada !== fechaHoy) {
        // Es un día nuevo o la primera vez que entra: limpiamos consumo viejo
        localStorage.removeItem('aguaPura');
        localStorage.removeItem('otrosLiquidos');
        localStorage.removeItem('colagenoTomado');
        // Guardamos la fecha de hoy para el próximo control
        localStorage.setItem('ultimaFechaRegistro', fechaHoy);
    }
    // -------------------------------------------

    if (localStorage.getItem('pesoUsuario')) {
        document.getElementById('txt-peso').value = localStorage.getItem('pesoUsuario');
        document.getElementById('txt-altura').value = localStorage.getItem('alturaUsuario');
        document.getElementById('txt-edad').value = localStorage.getItem('edadUsuario');
        
        calcularYMostrarMeta(
            localStorage.getItem('pesoUsuario'),
            localStorage.getItem('alturaUsuario'),
            localStorage.getItem('edadUsuario')
        );
    }
    
    if (localStorage.getItem('aguaPura')) {
        aguaPura = parseInt(localStorage.getItem('aguaPura'));
        document.getElementById('lbl-agua').innerText = aguaPura;
    }
    if (localStorage.getItem('otrosLiquidos')) {
        otrosLiquidos = parseInt(localStorage.getItem('otrosLiquidos'));
        document.getElementById('lbl-otros').innerText = otrosLiquidos;
    }
    if (localStorage.getItem('colagenoTomado') === 'true') {
        deshabilitarBotonColageno();
    }
};

function solicitarPermisoNotificaciones() {
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            document.getElementById('btn-permiso').style.display = 'none';
            new Notification("¡De una! Te vas a enterar cuando te toque agua pura ✨");
        }
    });
}

function guardarPerfil() {
    let peso = parseFloat(document.getElementById('txt-peso').value);
    let altura = parseFloat(document.getElementById('txt-altura').value);
    let edad = parseInt(document.getElementById('txt-edad').value);
    
    if (peso > 0 && altura > 0 && edad > 0) {
        localStorage.setItem('pesoUsuario', peso);
        localStorage.setItem('alturaUsuario', altura);
        localStorage.setItem('edadUsuario', edad);
        calcularYMostrarMeta(peso, altura, edad);
    }
}

function calcularYMostrarMeta(peso, altura, edad) {
    let liquidoTotalBase = (peso * 30) + (altura * 0.5) - (edad * 3);
    metaAguaPura = Math.round(liquidoTotalBase * 0.6);
    
    document.getElementById('lbl-meta-agua').innerText = metaAguaPura;
    document.getElementById('lbl-meta-dinamica').innerText = metaAguaPura;
}

function tomarColageno() {
    aguaPura += 150;
    document.getElementById('lbl-agua').innerText = aguaPura;
    localStorage.setItem('aguaPura', aguaPura);
    localStorage.setItem('colagenoTomado', 'true');
    // Asentamos la fecha del registro adentro de la función
    localStorage.setItem('ultimaFechaRegistro', new Date().toLocaleDateString());
    deshabilitarBotonColageno();
    reiniciarTemporizadorAlerta();
}

function deshabilitarBotonColageno() {
    document.getElementById('btn-colageno').disabled = true;
    document.getElementById('btn-colageno').innerText = "✨ Colágeno Tomado";
}

function sumarLiquido(tipo, cantidad) {
    if (tipo === 'agua') {
        aguaPura += cantidad;
        document.getElementById('lbl-agua').innerText = aguaPura;
        localStorage.setItem('aguaPura', aguaPura);
        reiniciarTemporizadorAlerta();
    } else {
        otrosLiquidos += cantidad;
        document.getElementById('lbl-otros').innerText = otrosLiquidos;
        localStorage.setItem('otrosLiquidos', otrosLiquidos);
        programarAlertaCompensacion();
    }
    // Asentamos la fecha del registro acá también, al final de la función
    localStorage.setItem('ultimaFechaRegistro', new Date().toLocaleDateString());
}

function programarAlertaCompensacion() {
    clearTimeout(temporizadorAgua);
    
    let horaActual = new Date().getHours();
    if (horaActual >= 21 || horaActual < 7) {
        console.log("Modo nocturno activo. No se programa alerta.");
        return;
    }
    
    let tiempoEspera = 7200000; 

    temporizadorAgua = setTimeout(() => {
        if (Notification.permission === "granted") {
            new Notification("Che, colgada 🧉", {
                body: "Venís re bien con el mate, pero clávate un vaso de agua pura para compensar.",
                icon: "https://emojicdn.elk.sh/💧"
            });
        }
    }, tiempoEspera);
}

function reiniciarTemporizadorAlerta() {
    clearTimeout(temporizadorAgua);
}

function borrarProgreso() {
    if (confirm("¿Querés reiniciar los contadores de consumo de hoy?")) {
        aguaPura = 0;
        otrosLiquidos = 0;
        
        document.getElementById('lbl-agua').innerText = 0;
        document.getElementById('lbl-otros').innerText = 0;
        
        document.getElementById('btn-colageno').disabled = false;
        document.getElementById('btn-colageno').innerText = "Tomar Colágeno (150ml)";
        
        localStorage.removeItem('aguaPura');
        localStorage.removeItem('otrosLiquidos');
        localStorage.removeItem('colagenoTomado');
        
        reiniciarTemporizadorAlerta();
    }
}
