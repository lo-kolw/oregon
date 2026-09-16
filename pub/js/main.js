const ctx = document.getElementById('analytcsgraphic');

const hardwareChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'CPU (%)', data: [], borderColor: '#ff595e', backgroundColor: 'rgba(255, 89, 94, 0.1)', borderWidth: 2, tension: 0.2 },
            { label: 'RAM (%)', data: [], borderColor: '#1982c4', backgroundColor: 'rgba(25, 130, 196, 0.1)', borderWidth: 2, tension: 0.2 }
        ]
    },
    options: {
        scales: { y: { min: 0, max: 100 } },
        animation: false
    }
});

const eventSource = new EventSource('/metrics');

eventSource.onmessage = (event) => {
    const dados = JSON.parse(event.data);
    hardwareChart.data.labels.push(dados.time);
    hardwareChart.data.datasets[0].data.push(dados.cpu);
    hardwareChart.data.datasets[1].data.push(dados.ram);
    if (hardwareChart.data.labels.length > 15) {
        hardwareChart.data.labels.shift();
        hardwareChart.data.datasets[0].data.shift(); 
        hardwareChart.data.datasets[1].data.shift(); 
    }

    hardwareChart.update();
};