document.addEventListener('DOMContentLoaded', () => {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');

    
    const loginBtn = loginCard.querySelector('.login-btn');
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const inputs = loginCard.querySelectorAll('input');
        let allFilled = true;

        inputs.forEach(input => {
            if (input.value.trim() === "") {
                allFilled = false;
                input.style.border = "1px solid #ff4d4d";
            } else {
                input.style.border = "none";
            }
        });

        if (!allFilled) {
            shakeCard(loginCard);
            alert("¡Hey vaquero! Llena tus datos para entrar.");
        } else {
            
           window.location.href = "../Pagina-principal/index.html";
        }
    });

    
    const registerBtn = registerCard.querySelector('.login-btn');
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const inputs = registerCard.querySelectorAll('input');
        let allFilled = true;

        inputs.forEach(input => {
            if (input.value.trim() === "") {
                allFilled = false;
                input.style.border = "1px solid #ff4d4d";
            } else {
                input.style.border = "none";
            }
        });

        if (!allFilled) {
            shakeCard(registerCard);
            alert("Por favor, completa todos los campos para registrarte.");
        } else {
            
            alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
            toggleCards(); 
        }
    });

    function shakeCard(card) {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = 'shake 0.5s linear';
    }

    
    const allInputs = document.querySelectorAll('.input-box input');
    allInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('i').style.color = '#b88642';
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('i').style.color = 'rgba(255,255,255,0.6)';
        });
    });
});

function toggleCards() {
    const login = document.getElementById('login-card');
    const register = document.getElementById('register-card');

    if (login.style.display === "none") {
        login.style.display = "block";
        register.style.display = "none";
    } else {
        login.style.display = "none";
        register.style.display = "block";
    }
}