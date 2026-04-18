import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCUXb6Pu-cfK2M3bAt8Ujli03mto43bpjg",
    authDomain: "cuentame-tu-historia-f6481.firebaseapp.com",
    projectId: "cuentame-tu-historia-f6481",
    storageBucket: "cuentame-tu-historia-f6481.firebasestorage.app",
    messagingSenderId: "456117844543",
    appId: "1:456117844543:web:20709c51ad76ea670fd68a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ELEMENTOS DEL HTML
const menuAdmin = document.getElementById('menuAdmin');
const saludoBienvenida = document.getElementById('saludoBienvenida');
const contenedorHistorias = document.getElementById('contenedorHistorias');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const nombreUsuarioCargando = document.getElementById('nombreUsuarioCargando');

// 1. FUNCIÓN PARA CARGAR LAS HISTORIAS (SOLO LAS PUBLICADAS)
async function cargarHistorias() {
    try {
        // Solo traemos historias con estado "publicado"
        const q = query(collection(db, "Historias"), where("estado", "==", "publicado"));
        const querySnapshot = await getDocs(q);
        
        contenedorHistorias.innerHTML = ''; 

        if (querySnapshot.empty) {
            contenedorHistorias.innerHTML = '<p>Aún no hay leyendas publicadas. Sé el primero en contar una.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const h = doc.data();
            
            // Validación para evitar el error del substring si el contenido está vacío
            const resumen = h.contenido ? h.contenido.substring(0, 100) + "..." : "Sin descripción disponible.";

            contenedorHistorias.innerHTML += `
                <div class="tarjeta-historia" style="background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #8b0000;">
                    <h3 style="color: white; margin-top: 0;">${h.titulo || 'Relato sin título'}</h3>
                    <p style="color: #ccc;">${resumen}</p>
                    <small style="color: #8b0000;">Escrito por: ${h.autor || 'Anónimo'}</small>
                    <br><br>
                    <a href="${h.url_video || '#'}" target="_blank" class="boton-principal" style="padding: 5px 10px; font-size: 0.8rem; text-decoration: none;">Ver Video</a>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error cargando historias:", error);
    }
}

// 2. DETECTOR DE SESIÓN Y PERMISOS DE ADMIN
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // A. Jalar datos del usuario para el saludo
        const userRef = doc(db, "Usuarios", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const nombre = userSnap.data().nombre;
            if (nombreUsuarioCargando) nombreUsuarioCargando.textContent = nombre;
            if (saludoBienvenida) saludoBienvenida.textContent = `Bienvenido, ${nombre} 👻`;
        }

        // B. Verificar si es Administrador para mostrar el botón secreto
        // Cambiado de "Administradores" a "Administrador" para que coincida con tu Firestore
        const adminRef = doc(db, "Administrador", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            console.log("¡Eres el jefe! Mostrando panel de control...");
            if (menuAdmin) {
                menuAdmin.classList.remove('d-none');
            }
        }

        // C. Cargar las historias de la comunidad
        cargarHistorias();

    } else {
        // Si no hay sesión, al login
        window.location.href = "index.html";
    }
});

// 3. CERRAR SESIÓN
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        signOut(auth).then(() => { 
            window.location.href = "index.html"; 
        });
    });
}