// === 1. IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE ===
// Importamos funciones específicas de Firebase para manejar la App, la Autenticación y la Base de Datos (Firestore) [cite: 39-42]
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log("--- CARGANDO PANEL DE ADMINISTRADOR ---");

// Objeto de configuración con las llaves de acceso a tu proyecto de Firebase [cite: 44-50]
const firebaseConfig = {
    apiKey: "AIzaSyCUXb6Pu-cfK2M3bAt8Ujli03mto43bpjg", 
    authDomain: "cuentame-tu-historia-f6481.firebaseapp.com",
    projectId: "cuentame-tu-historia-f6481",
    storageBucket: "cuentame-tu-historia-f6481.firebasestorage.app",
    messagingSenderId: "456117844543",
    appId: "1:456117844543:web:20709c51ad76ea670fd68a"
};

// Inicializamos las herramientas de Firebase [cite: 51-53]
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);    // Herramienta para usuarios
const db = getFirestore(app); // Herramienta para base de datos

// === 2. EL GUARDIÁN AL CARGAR LA PÁGINA ===
// Esta función vigila si hay alguien conectado. Si no, lo expulsa al login [cite: 55-63]
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Usuario detectado:", user.email);
        // Si hay usuario, verificamos si tiene permiso de administrador [cite: 58]
        verificarPermisos(user.uid);
    } else {
        // Si nadie inició sesión, redirigimos al index [cite: 61]
        window.location.href = "index.html";
    }
});

// === 3. FUNCIÓN PARA VERIFICAR SI ES ADMINISTRADOR ===
// Busca el ID del usuario en la colección "Administrador" de Firestore [cite: 64-79]
async function verificarPermisos(uid) {
    try {
        const docRef = doc(db, "Administrador", uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            // Si el documento existe, el usuario es admin y puede ver las historias [cite: 70-71]
            console.log("¡Permiso concedido! Buscando historias...");
            cargarPendientes(); 
        } else {
            // Si no existe, lanzamos alerta y lo mandamos a la página de inicio común [cite: 75-76]
            alert("Acceso denegado: Tu cuenta no tiene permisos de Administrador.");
            window.location.href = "inicio.html";
        }
    } catch (error) {
        console.error("Error de permisos de Firebase:", error);
    }
}

// === 4. FUNCIÓN PARA CARGAR LAS HISTORIAS PENDIENTES ===
// Esta función trae de la base de datos todos los relatos que aún no has aprobado [cite: 80-113]
async function cargarPendientes() {
    const listaPendientes = document.getElementById('listaPendientes');
    
    try {
        // Creamos una consulta (query) para buscar en la colección "Historias" donde el estado sea "pendiente" [cite: 84]
        const q = query(collection(db, "Historias"), where("estado", "==", "pendiente"));
        const querySnapshot = await getDocs(q);
        
        listaPendientes.innerHTML = ""; // Limpiamos el mensaje de "Buscando..." [cite: 86]

        if (querySnapshot.empty) {
            // Si no hay nada, mostramos un mensaje amigable [cite: 87-89]
            listaPendientes.innerHTML = '<p class="text-center" style="color: white;">No hay relatos esperando ser aprobados.</p>';
            return;
        }

        // Si hay historias, recorremos cada una (forEach) para crear su tarjeta visual [cite: 92-108]
        querySnapshot.forEach((documento) => {
            const h = documento.data(); // Obtenemos los datos (título, autor, etc.)
            const id = documento.id;    // Guardamos el ID único del documento para poder aprobarlo o borrarlo
            
            // Recortamos el texto para que no sea muy largo en la vista previa [cite: 96]
            const resumen = h.contenido ? h.contenido.substring(0, 150) + "..." : "Sin descripción disponible.";

            // Inyectamos el código HTML con la información de la historia y los botones de acción 
            listaPendientes.innerHTML += `
                <div class="tarjeta-historia" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #8b0000;">
                    <h3 style="color: white; margin-top: 0;">${h.titulo || 'Relato sin título'}</h3>
                    <p style="color: #ccc;">${resumen}</p>
                    <small style="color: #8b0000;">Escrito por: ${h.autor || 'Anónimo'}</small> <br><br>
                    
                    ${h.url_video ? `<a href="${h.url_video}" target="_blank" style="color: #4da6ff; text-decoration: none; font-size: 0.9rem;">Ver evidencia (Video/Audio)</a><br><br>` : ''}
                    
                    <button onclick="aprobarHistoria('${id}')" style="width: auto; display: inline-block; padding: 8px 15px; margin-right: 10px; background-color: #006400; border: none; color: white; border-radius: 5px; cursor: pointer;">Liberar (Aprobar)</button>
                    <button onclick="rechazarHistoria('${id}')" style="width: auto; display: inline-block; padding: 8px 15px; background: transparent; border: 1px solid #8b0000; color: #8b0000; border-radius: 5px; cursor: pointer;">Destruir (Rechazar)</button>
                </div>
            `;
        });
        
    } catch (error) {
        console.error("ERROR CRÍTICO AL CARGAR HISTORIAS:", error);
        listaPendientes.innerHTML = `<p style="color: red; text-align: center;">Error de conexión. Revisa la consola.</p>`;
    }
}

// === 5. BOTONES DE ACCIÓN (Aprobar / Eliminar) ===

// Esta función se activa al hacer clic en "Liberar". Cambia el estado a "publicado" [cite: 115-125]
window.aprobarHistoria = async (id) => {
    try {
        const docRef = doc(db, "Historias", id);
        // Actualizamos solo el campo 'estado' en Firestore [cite: 118]
        await updateDoc(docRef, { estado: "publicado" });
        alert("¡Relato aprobado! Ahora todos pueden leerlo.");
        cargarPendientes(); // Recargamos la lista para que desaparezca la que ya aprobamos [cite: 120]
    } catch (error) {
        console.error("Error al aprobar:", error);
        alert("Error al aprobar el relato.");
    }
};

// Esta función elimina el documento permanentemente de la base de datos [cite: 126-137]
window.rechazarHistoria = async (id) => {
    if(confirm("¿Seguro que quieres borrar este relato para siempre? No habrá vuelta atrás.")) {
        try {
            // Borramos el documento usando su ID único [cite: 130]
            await deleteDoc(doc(db, "Historias", id));
            cargarPendientes(); // Actualizamos la vista [cite: 131]
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el relato.");
        }
    }
};

// === 6. CERRAR SESIÓN DESDE EL PANEL ADMIN ===
// Controla la salida segura del administrador [cite: 138-146]
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
if(btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Una vez cerrada la sesión en Firebase, regresamos al login [cite: 146]
            window.location.href = "index.html";
        });
    });
}