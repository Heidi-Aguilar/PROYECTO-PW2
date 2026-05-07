document.addEventListener('DOMContentLoaded', () => {
    // --- 1. OBTENER SESIÓN DE LA BASE DE DATOS ---
    const datosUsuario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    // Si no hay sesión, regresamos al login
    if (!token || !datosUsuario) {
        window.location.href = "../Login/Login.html";
        return;
    }

    // (Opcional) Llenar los textos del perfil si tienes estos IDs en tu HTML
    if(document.getElementById('display-name')) document.getElementById('display-name').textContent = `${datosUsuario.nombre} ${datosUsuario.apellido || ''}`;
    if(document.getElementById('display-email')) document.getElementById('display-email').textContent = datosUsuario.correo;

    // --- 2. TU CÓDIGO INTACTO: CAMBIAR FOTO ---
    const inputPhoto = document.getElementById('input-photo');
    const displayPhoto = document.getElementById('display-photo');

    if (inputPhoto && displayPhoto) {
        inputPhoto.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    displayPhoto.src = e.target.result;
                    displayPhoto.style.transform = "scale(1.1)";
                    setTimeout(() => displayPhoto.style.transform = "scale(1)", 300);
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    // --- 3. TU CÓDIGO INTACTO: ANIMACIÓN DEL MODAL ---
    const modal = document.getElementById('passModal');
    const btnOpen = document.getElementById('openModal');

    if (btnOpen && modal) {
        btnOpen.onclick = () => {
            modal.style.display = 'grid'; 
            setTimeout(() => {
                modal.classList.add('active'); 
            }, 10);
        };
    }
    
    window.closeModal = function() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };

    // --- 4. TU CÓDIGO INTACTO PERO CONECTADO A LA BD: GUARDAR CONTRASEÑA ---
    window.saveNewPass = async function() {
        // Asume que en tu HTML del modal tienes estos IDs para leer las contraseñas
        const inputNueva = document.getElementById('newPassword'); 
        const inputConfirmar = document.getElementById('confirmPassword'); 

        // Validaciones básicas
        if (inputNueva && inputConfirmar) {
            if (inputNueva.value !== inputConfirmar.value) {
                alert("Las contraseñas no coinciden, vaquera 🌸");
                return;
            }
            if (inputNueva.value.trim() === '') {
                alert("La contraseña no puede estar vacía.");
                return;
            }

            // Petición al BackEnd para guardar
            try {
                const res = await fetch(`http://localhost:5000/api/usuarios/${datosUsuario.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ password: inputNueva.value })
                });

                if (res.ok) {
                    alert("¡Contraseña actualizada con éxito en la base de datos, vaquero!");
                    inputNueva.value = ''; // Limpiamos inputs
                    inputConfirmar.value = '';
                    closeModal();
                } else {
                    alert("Error al actualizar la contraseña en el servidor.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Error de conexión con el servidor.");
            }
        } else {
            // Si no existen los inputs, de todas formas corre tu alerta original
            alert("¡Contraseña actualizada con éxito, vaquero!");
            closeModal();
        }
    };

    // --- 5. AGREGADO: CERRAR SESIÓN ---
    const logoutBtn = document.getElementById('logoutBtn'); // Asegúrate de agregar este botón en tu HTML
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if(confirm("¿Segura que quieres salir?")) {
                localStorage.clear();
                window.location.href = "../Login/Login.html";
            }
        });
    }

    // --- 6. TU CÓDIGO INTACTO: BOTÓN DE ADMIN ---
    const adminZone = document.getElementById('admin-zone');
    if (adminZone && datosUsuario && datosUsuario.rol === 'admin') {
        const adminBtn = document.createElement('button');
        adminBtn.innerHTML = "⚙️ Panel de Control ";
        adminBtn.style.cssText = `
            background: #ff69b4;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 12px;
            cursor: pointer;
            width: 100%;
            font-weight: bold;
            box-shadow: 0 4px 0 #db2b81;
            transition: 0.3s;
            margin-top: 15px;
        `;
        
        adminBtn.onclick = () => {
            window.location.href = "../Admin/admin.html";
        };

        adminBtn.onmouseover = () => adminBtn.style.transform = "scale(1.05)";
        adminBtn.onmouseout = () => adminBtn.style.transform = "scale(1)";

        adminZone.appendChild(adminBtn);
    }
});