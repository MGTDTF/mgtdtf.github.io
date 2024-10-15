document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('reloadImage').addEventListener('click', function() {
        location.reload();
    });
});

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('open');
  }
