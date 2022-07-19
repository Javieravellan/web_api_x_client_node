var lista = null
const select = $("#select-cont > select")
const pantalla = $("#pantalla")

export const selectPicker = {
    _items: [
        {nombre: 'Alemania', valor: 'DE', icon: 'DE.png', moneda: 'EUR'},
        {nombre: 'Argentina', valor: 'AR', icon: 'AR.png', moneda: 'ARS'},
        {nombre: 'Bolivia', valor: 'BO', icon: 'BO.png', moneda: 'BS'},
        {nombre: 'Brasil', valor: 'BR', icon: 'BR.png', moneda: 'BRL'},
        {nombre: 'Canadá', valor: 'CA', icon: 'CA.png', moneda: 'CAD'},
        {nombre: 'Chile', valor: 'CL', icon: 'CL.png', moneda: 'CLP'},
        {nombre: 'China', valor: 'CN', icon: 'CN.png', moneda: 'CNY'},
        {nombre: 'Colombia', valor: 'CO', icon: 'CO.png', moneda: 'COP'},
        {nombre: 'Ecuador', valor: 'EC', icon: 'EC.png', moneda: 'USD'},
        {nombre: 'España', valor: 'ES', icon: 'ES.png', moneda: 'EUR'},
        {nombre: 'EE.UU', valor: 'US', icon: 'US.png', moneda: 'USD'},
        {nombre: 'Francia', valor: 'FR', icon: 'FR.png', moneda: 'FRF'},
        {nombre: 'Italia', valor: 'IT', icon: 'IT.png', moneda: 'ITL'},
        {nombre: 'Japón', valor: 'JP', icon: 'JP.png', moneda: 'JPY'},
        {nombre: 'México', valor: 'MX', icon: 'MX.png', moneda: 'MXN'},
        {nombre: 'Paraguay', valor: 'PY', icon: 'PY.png', moneda: 'PYG'},
        {nombre: 'Perú', valor: 'PE', icon: 'PE.png', moneda: 'PEN'},
        {nombre: 'Portugal', valor: 'PT', icon: 'PT.png', moneda: 'EUR'},
        {nombre: 'Reino Unido', valor: 'UK', icon: 'UK.png', moneda: 'GBP'},
        {nombre: 'Rusia', valor: 'RU', icon: 'RU.png', moneda: 'RUB'},
        {nombre: 'Suiza', valor: 'CH', icon: 'CH.png', moneda: 'CHF'},
        {nombre: 'Ucrania', valor: 'UA', icon: 'UA.png', moneda: 'UAH'},
        {nombre: 'Uruguay', valor: 'UY', icon: 'UY.png', moneda: 'UYU'},
        {nombre: 'Venezuela', valor: 'VE', icon: 'VE.png', moneda: 'VES'}
    ],
    esVisible: false,
    defaultText: "Seleccione uno...",
    itemSelected: null,
    /**
     * 
     * @param { String } idElement 
     */
    iniciar: function(idElement, cssClass) {
        window["selectPicker"] = this
        lista = $(`#${idElement}`)
        $(pantalla).on('click', this.onClick)
        $(pantalla).html(this.defaultText)
        $(select).hide()
        $(lista).addClass(cssClass)
        $(lista).hide()
        $(select).html("<option hidden selected value='0'>0</option>")
        
        this._items.forEach(i => {
            // lista de items que será visible
            let item = this.crearItems(i)
            $(lista).append(item)
            $(item).on('click', this.onItemClick)
            // lista de items del select ocultos que se vincula con los items visible
            let html = $(select).html()
            $(select).html(html + this.crearOpciones(i))
        })
    },
    /**
     * 
     * @param {object} opcion 
     * @returns {*}
     */
    crearItems: function(opcion) {
        let item = $('<li />', {
            'style': "background-image: url(js/scripts/plugin-select/icons/"+opcion.icon+")",
            'html': opcion.nombre,
            'data-moneda': opcion.moneda,
            'data-value': opcion.valor
        })
        return item;
    },
    crearOpciones: function (opcion) {
        return `<option value="${opcion.valor}" data-moneda="${opcion.moneda}">${opcion.nombre}</option>`;
    },
    onClick: function(e) {
        if (!this.esVisible) $(lista).show()
        else $(lista).hide()
        this.esVisible = !this.esVisible
    },
    onItemClick: function (e) {
        /**
         * @type { HTMLElement }
         */
        let element = e.target
        let picker = window.selectPicker
        if (picker.itemSelected !== element) {
            $(pantalla).html('')
            let span = $('<span />', {
                'style': `background-image: ${element.style.backgroundImage}`,
                'html': element.innerHTML
            })
            $(pantalla).append(span)
            $(select).val($(element).attr("data-value"))
            picker.itemSelected = element
        }
        $(pantalla).click();
    },
}