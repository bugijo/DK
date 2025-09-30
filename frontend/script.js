document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<img src="/icons/Olho.png" alt="Mostrar senha" style="width: 16px; height: 16px;" />' : '<img src="/icons/Cadeado.png" alt="Ocultar senha" style="width: 16px; height: 16px;" />';
        });
    }
});