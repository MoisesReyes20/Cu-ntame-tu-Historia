import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const form = document.getElementById('formNuevaHistoria');
let idUsuarioActual = "";
let nombreUsuarioActual = "";

onAuthStateChanged(auth, (user) => {
    if (user) {
        idUsuarioActual = user.uid;
        nombreUsuarioActual = user.displayName || user.email.split('@')[0];
    } else {
        window.location.href = "index.html";
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btnEnviar');
    btn.disabled = true;
    btn.textContent = "Enviando al más allá...";

    try {
        // Guardamos la historia en la colección de Firebase [cite: 1580, 1594]
        await addDoc(collection(db, "Historias"), {
            titulo: document.getElementById('tituloH').value,
            contenido: document.getElementById('contenidoH').value,
            url_video: document.getElementById('urlH').value,
            autor: nombreUsuarioActual,
            autorId: idUsuarioActual,
            estado: "pendiente", // El administrador debe aprobarla 
            fecha: new Date(),
            vistas: 0
        });

        alert("¡Historia enviada! Espera a que el administrador la publique[cite: 1397].");
        window.location.href = "inicio.html";
    } catch (error) {
        console.error("Error al enviar:", error);
        alert("Hubo un problema técnico con los espíritus. Intenta de nuevo.");
        btn.disabled = false;
        btn.textContent = "Enviar a Revisión";
    }
});
// Importamos la función signOut de Firebase (asegúrate de que esté en tus imports arriba)
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Seleccionamos el botón y el texto del nombre
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const nombreUsuarioCargando = document.getElementById('nombreUsuarioCargando');

// Actualizamos el nombre en la barra lateral cuando detecta al usuario
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Si quieres que aparezca su nombre real, puedes hacer el getDoc aquí también,
        // por ahora pondremos su correo o nombre de usuario de Google
        nombreUsuarioCargando.textContent = user.displayName || user.email.split('@')[0];
    }
});

// Lógica para cerrar sesión
btnCerrarSesion.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = "index.html"; // Regresa al login
    }).catch((error) => {
        console.error("Error al salir:", error);
    });
});