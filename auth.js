// ================================================================
// 1. IMPORTACIONES DE FIREBASE (Auth + Firestore)
// ================================================================
// Importamos la lógica base de Firebase y las funciones de autenticación y base de datos [cite: 153-166].
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged // Vigilante que detecta si el usuario sigue logueado[cite: 159].
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
    getFirestore, 
    doc, 
    setDoc,
    getDoc // Función para leer documentos específicos del usuario[cite: 165].
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================================================================
// 2. CONFIGURACIÓN DE "CUÉNTAME TU HISTORIA"
// ================================================================
// Llaves maestras que conectan tu código con los servidores de Google [cite: 171-179].
const firebaseConfig = {
    apiKey: "AIzaSyCUXb6Pu-cfK2M3bAt8Ujli03mto43bpjg",
    authDomain: "cuentame-tu-historia-f6481.firebaseapp.com",
    projectId: "cuentame-tu-historia-f6481",
    storageBucket: "cuentame-tu-historia-f6481.firebasestorage.app",
    messagingSenderId: "456117844543",
    appId: "1:456117844543:web:20709c51ad76ea670fd68a"
};

// Inicializamos los servicios que usaremos en toda la app [cite: 181-184].
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Manejador de identidades.
const db = getFirestore(app); // Nuestra base de datos NoSQL.
const proveedorGoogle = new GoogleAuthProvider(); // Activador del inicio con Google.

// ================================================================
// 3. CONECTANDO CON EL HTML (DOM)
// ================================================================
// Capturamos los elementos del diseño para poder darles vida con código [cite: 189-196].
const btnGoogle = document.getElementById('btnGoogle');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnSubmit = document.getElementById('submitBtn');
const toggleRegister = document.getElementById('toggleRegister');
const formTitle = document.getElementById('formTitle');
const authMessage = document.getElementById('authMessage');

// Campos adicionales para cuando el usuario se registra por primera vez [cite: 194-196].
const camposRegistro = document.getElementById('camposRegistro');
const nombreInput = document.getElementById('nombre');
const apellidosInput = document.getElementById('apellidos');
const fechaNInput = document.getElementById('fechaN');

let esModoRegistro = false; // Interruptor: false = Login / true = Registro.

// ================================================================
// 4. FUNCIÓN PARA MOSTRAR MENSAJES (Alertas)
// ================================================================
// Función personalizada para avisar al usuario si todo salió bien o hubo un error [cite: 202-211].
function mostrarMensaje(texto, tipoError = false) {
    authMessage.textContent = texto;
    authMessage.classList.remove('d-none'); // Hacemos visible el cuadro de alerta.
    
    // Cambiamos el color según el resultado: Rojo para fallos, Verde para éxitos[cite: 205].
    authMessage.style.backgroundColor = tipoError ? '#8b0000' : '#006400'; 
    authMessage.style.color = 'white';
    authMessage.style.padding = '10px';
    authMessage.style.borderRadius = '8px';
    authMessage.style.textAlign = 'center';
    authMessage.style.fontWeight = 'bold';

    // Desvanecemos el mensaje automáticamente después de 5 segundos [cite: 212-214].
    setTimeout(() => {
        authMessage.classList.add('d-none');
    }, 5000);
}

// ================================================================
// 5. EL GUARDIÁN DE LA SESIÓN
// ================================================================
// Este observador se activa cada vez que el estado de la cuenta cambia [cite: 218-227].
onAuthStateChanged(auth, async (usuario) => {
    if (usuario) {
        // Detecta si hay una sesión guardada en el navegador[cite: 221].
        console.log("Sesión activa detectada:", usuario.email);
    } else {
        console.log("No hay ninguna sesión activa. Debes iniciar sesión.");
    }
});

// ================================================================
// 6. INICIAR SESIÓN CON GOOGLE
// ================================================================
btnGoogle.addEventListener('click', async () => {
    try {
        btnGoogle.disabled = true; // Evitamos múltiples clics.
        btnGoogle.innerHTML = 'Conectando con el más allá...';
        
        // Abre la ventana emergente de Google [cite: 237-238].
        const resultado = await signInWithPopup(auth, proveedorGoogle);
        const usuario = resultado.user;
        
        // Verificamos si es un usuario nuevo en nuestra base de datos [cite: 240-241].
        const docRef = doc(db, "Usuarios", usuario.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            // Si es su primera vez, creamos su perfil automáticamente .
            await setDoc(docRef, {
                nombre: usuario.displayName,
                email: usuario.email,
                rol: "lector", // Rol base por defecto.
                fechaRegistro: new Date()
            });
        }
        
        mostrarMensaje(`¡Bienvenido a la oscuridad, ${usuario.displayName}!`);
        
        // Redirigimos al inicio después de 2 segundos [cite: 255-257].
        setTimeout(() => {
            window.location.href = "inicio.html";
        }, 2000);

    } catch (error) {
        console.error("Error con Google:", error);
        mostrarMensaje("Los espíritus impidieron tu conexión con Google.", true);
    } finally {
        btnGoogle.disabled = false;
        btnGoogle.innerHTML = '<img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" style="width: 20px;"> Continuar con Google';
    }
});

// ================================================================
// 7. CAMBIAR ENTRE INICIAR SESIÓN Y REGISTRO
// ================================================================
// Esta lógica limpia y adapta el formulario según lo que el usuario necesite [cite: 273-294].
toggleRegister.addEventListener('click', (e) => {
    e.preventDefault();
    esModoRegistro = !esModoRegistro; 
    
    if (esModoRegistro) {
        formTitle.textContent = "Crear Cuenta";
        btnSubmit.textContent = "Unirse a la comunidad";
        toggleRegister.textContent = "¿Ya tienes cuenta? Inicia sesión";
        
        camposRegistro.classList.remove('d-none'); // Muestra campos de Nombre/Fecha[cite: 282].
        nombreInput.required = true;
        apellidosInput.required = true;
        fechaNInput.required = true;
    } else {
        formTitle.textContent = "Iniciar Sesión";
        btnSubmit.textContent = "Entrar en la oscuridad";
        toggleRegister.textContent = "Únete y cuenta tu relato";
        
        camposRegistro.classList.add('d-none'); // Oculta campos extra[cite: 291].
        nombreInput.required = false;
        apellidosInput.required = false;
        fechaNInput.required = false;
    }
});

// ================================================================
// 8. INICIAR SESIÓN / REGISTRARSE CON CORREO
// ================================================================
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Detiene la recarga de la página.
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Invocando credenciales...";

    try {
        if (esModoRegistro) {
            // --- MODO REGISTRO: Creamos usuario en Firebase Auth [cite: 308-309]. ---
            const credenciales = await createUserWithEmailAndPassword(auth, email, password);
            const usuario = credenciales.user;

            // Guardamos los datos detallados en Firestore [cite: 310-317].
            await setDoc(doc(db, "Usuarios", usuario.uid), {
                nombre: nombreInput.value.trim(),
                apellidos: apellidosInput.value.trim(),
                email: email,
                fecha_N: fechaNInput.value,
                rol: "lector",
                fechaRegistro: new Date()
            });

            mostrarMensaje(`¡Cuenta creada con éxito! Bienvenido, ${nombreInput.value.trim()}.`);
            loginForm.reset(); 
            
        } else {
            // --- MODO INICIO DE SESIÓN: Validamos contra Firebase Auth[cite: 322]. ---
            const credenciales = await signInWithEmailAndPassword(auth, email, password);
            const usuario = credenciales.user;
            
            // Consultamos Firestore para obtener su nombre personalizado [cite: 324-325].
            const docRef = doc(db, "Usuarios", usuario.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const datosExtra = docSnap.data();
                mostrarMensaje(`¡Bienvenido de vuelta a las sombras, ${datosExtra.nombre}!`);
            } else {
                mostrarMensaje("¡Sesión iniciada correctamente!");
            }
            
            // Salto automático a la página principal [cite: 334-335].
            setTimeout(() => {
                window.location.href = "inicio.html";
            }, 2000);
        }
    } catch (error) {
        console.error("Error de autenticación:", error);
        // Traducimos los códigos técnicos de Firebase a mensajes que el usuario entienda [cite: 340-343].
        let textoError = "Ocurrió un error misterioso.";
        if (error.code === 'auth/email-already-in-use') textoError = "Este correo ya pertenece a otra alma.";
        if (error.code === 'auth/weak-password') textoError = "Tu contraseña es muy débil (mínimo 6 caracteres).";
        if (error.code === 'auth/invalid-credential') textoError = "Las credenciales no coinciden con nuestros registros.";
        
        mostrarMensaje(textoError, true);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = esModoRegistro ? "Unirse a la comunidad" : "Entrar en la oscuridad";
    }
});