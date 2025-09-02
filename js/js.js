document.addEventListener('DOMContentLoaded', function() {
    const bodyId = document.body.id;
    const navLinks = document.querySelectorAll('.main-nav a');
    const profileLink = document.getElementById('profile-link');
    const profileModal = document.getElementById('profile-modal');
    const closeModal = document.querySelector('.close-button');

    // Destaca o link de navegação ativo
    navLinks.forEach(link => {
        const linkFile = link.getAttribute('href').split('/').pop().replace('.html', '');
        if (`employer-${linkFile}` === bodyId || `freelancer-${linkFile}` === bodyId) {
            link.classList.add('active');
        }
    });

    // Garante que o código do modal só será executado se os elementos existirem
    if (profileLink && profileModal && closeModal) {
        // Mostra o modal ao clicar no ícone de perfil
        profileLink.addEventListener('click', function(event) {
            event.preventDefault();
            profileModal.style.display = 'block';
            profileModal.classList.add('fade-in');
        });

        // Fecha o modal ao clicar no botão de fechar
        closeModal.addEventListener('click', function() {
            profileModal.classList.remove('fade-in');
            profileModal.classList.add('fade-out');
            setTimeout(() => {
                profileModal.style.display = 'none';
                profileModal.classList.remove('fade-out');
            }, 300); // Tempo da animação
        });

        // Fecha o modal ao clicar fora dele
        window.addEventListener('click', function(event) {
            if (event.target === profileModal) {
                profileModal.classList.remove('fade-in');
                profileModal.classList.add('fade-out');
                setTimeout(() => {
                    profileModal.style.display = 'none';
                    profileModal.classList.remove('fade-out');
                }, 300); // Tempo da animação
            }
        });
    }
});