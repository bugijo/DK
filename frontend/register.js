document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordElements = document.querySelectorAll('.toggle-password');

    togglePasswordElements.forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.textContent = '🙈'; // Olho fechado
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<img src="/icons/Olho.png" alt="Mostrar senha" style="width: 16px; height: 16px;" />'; // Olho aberto
            }
        });
    });
});