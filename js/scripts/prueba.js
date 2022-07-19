// inicio de prueba con reactJS
const UIManager = {
    getColor: function (parent, callback) {
        callback($("#box").css('background-color'), parent)
    },
    setColor: function (name) {
        $("#box").css('background-color', name);
    }
}; 
/// fin de objeto de prueba

$(function(){
    setTimeout(_ => {
        let root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(
            React.createElement(MyComponent, { context: UIManager })
        )
    }, 0)
});