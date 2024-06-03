document.addEventListener('DOMContentLoaded', function () {
    // Total Chart
    const totalCtx = document.getElementById('totalChart').getContext('2d');
    new Chart(totalCtx, {
        type: 'doughnut',
        data: {
            labels: ['Retired', 'Studying', 'Graduates'],
            datasets: [{
                data: [9, 60, 2],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // M.Sc. Chart
    const mscCtx = document.getElementById('mscChart').getContext('2d');
    new Chart(mscCtx, {
        type: 'doughnut',
        data: {
            labels: ['Retired', 'Studying', 'Graduates'],
            datasets: [{
                data: [4, 20, 4],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // M.Eng. Chart
    const mengCtx = document.getElementById('mengChart').getContext('2d');
    new Chart(mengCtx, {
        type: 'doughnut',
        data: {
            labels: ['Retired', 'Studying', 'Graduates'],
            datasets: [{
                data: [3, 19, 3],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Ph.D. Chart
    const phdCtx = document.getElementById('phdChart').getContext('2d');
    new Chart(phdCtx, {
        type: 'doughnut',
        data: {
            labels: ['Retired', 'Studying', 'Graduates'],
            datasets: [{
                data: [5, 30, 5],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});
