import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const contenedorPodcast = document.getElementById('contenedorPodcast');
const menuAdmin = document.getElementById('menuAdmin');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const nombreUsuarioCargando = document.getElementById('nombreUsuarioCargando');

// 1. FUNCIÓN PARA CARGAR LOS PODCASTS (DESDE LA COLECCIÓN COLABORACIONES)
async function cargarPodcasts() {
    try {
        const q = query(collection(db, "Colaboraciones"));
        const querySnapshot = await getDocs(q);
        
        contenedorPodcast.innerHTML = ''; 
        let hayPodcasts = false;

        querySnapshot.forEach((documento) => {
            const h = documento.data();
            hayPodcasts = true;
            
            // Sacamos el influencer del arreglo (el [0] es el primero de la lista)
            const nombreInfluencer = (h.Influencer && h.Influencer.length > 0) ? h.Influencer[0] : "Invitado especial";

            // NUEVO DISEÑO TIPO APPLE PODCASTS (SIN CUADROS VERDES)
            contenedorPodcast.innerHTML += `
                <article class="episodio-item">
                    <div class="episodio-fecha">${h.Canal || 'Podcast Oficial'}</div>
                    <h3 class="episodio-titulo">${h.Titulo || 'Episodio sin título'}</h3>
                    <p class="episodio-resumen">Un episodio imperdible. <br><strong>Duración:</strong> ${h.Duracion || 'Desconocida'}</p>
                    <div class="episodio-controles">
                        <a href="${h.URL}" target="_blank" class="btn-play-mini" title="Escuchar"><i class="bi bi-play-fill"></i></a>
                        <span class="episodio-duracion">Con: ${nombreInfluencer}</span>
                    </div>
                </article>
            `;
        });

        if (!hayPodcasts) {
            contenedorPodcast.innerHTML = '<p style="text-align: center; color: var(--texto-secundario);">Aún no hay episodios de podcast grabados.</p>';
        }

    } catch (error) {
        console.error("Error cargando podcasts:", error);
        contenedorPodcast.innerHTML = '<p style="color: red;">Interferencia espectral al cargar los audios.</p>';
    }
}

// 2. EL GUARDIÁN Y DATOS DEL USUARIO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "Usuarios", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && nombreUsuarioCargando) {
            nombreUsuarioCargando.textContent = userSnap.data().nombre;
        }

        const adminRef = doc(db, "Administrador", user.uid);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists() && menuAdmin) {
            menuAdmin.classList.remove('d-none');
        }

        cargarPodcasts();
    } else {
        window.location.href = "index.html";
    }
});

// 3. CERRAR SESIÓN
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        signOut(auth).then(() => { window.location.href = "index.html"; });
    });
}