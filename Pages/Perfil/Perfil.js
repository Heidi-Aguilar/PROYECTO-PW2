document.addEventListener('DOMContentLoaded', () => {
    

    const inputPhoto = document.getElementById('input-photo');
    const displayPhoto = document.getElementById('display-photo');

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


    const modal = document.getElementById('passModal');
    const btnOpen = document.getElementById('openModal');


    btnOpen.onclick = () => {
        modal.style.display = 'grid'; 
        setTimeout(() => {
            modal.classList.add('active'); 
        }, 10);
    };

    
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

    window.saveNewPass = function() {
        alert("¡Contraseña actualizada con éxito, vaquero!");
        closeModal();
    };
});