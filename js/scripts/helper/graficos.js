var Grafico = { 
    /**
     * @type {Object}
     */
    _charts: {},
     /**
     * @param { HTMLCanvasElement } elemento 
     * @param { Array<String> } labels
     * @param { Array<Object> } datos
     * @param { Number } maxValue
     * @returns Gráfico
     */
    crearGraficoLineal: function (elemento, labels, datos)  {
        if(!elemento) return;
        const graficoLineal = elemento.getContext('2d');
        graficoLineal.clearRect(0, 0, graficoLineal.width, graficoLineal.height);
        // crear las líneas del gráfico
        let dataset = []
        labels = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
        for (var i in datos.tags) {
            let r = (Math.random() * 255).toFixed()
            let g = (Math.random() * 255).toFixed()
            let b = (Math.random() * 255).toFixed()
            let al = Math.random().toFixed(2)
            let data = {
                label: datos.tags[i],
                data: datos.data[i], // agregamos los valores de cada data
                borderColor: `rgb(${r},${g},${b})`,//datos.bgColor,
                backgroundColor: `rgba(${b},${g},${r},${al})`,//datos.bgColor,
                lineTension: 0.3
            }
            dataset.push(data)
        }

        this._charts[elemento.id] = new Chart(graficoLineal, {
            type: 'line',
            data: {
                labels: labels,
                datasets: dataset
            },
            options: {
                responsive: true,
                    plugins: {
                    legend: {position: 'top'}
                }
            }
        })
    },
    destroyCharts: function(id) {
        if (this._charts[id]) this._charts[id].destroy()
    }
};
export {Grafico};