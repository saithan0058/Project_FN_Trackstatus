document.addEventListener("DOMContentLoaded", function() {
    fetch('/layouts/layout1.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error));
});

// test