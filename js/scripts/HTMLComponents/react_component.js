const e = React.createElement;

class MyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            context: props.context
        }
        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.state.context.getColor(this, function(color, that) {
            if (color==='rgb(255, 0, 0)') {
                color = 'green'
            }
            else {
                color = 'red'
            }
            console.log(color)
            that.state.context.setColor(color);
        })
    }

    render() {
        //return e('button', {className: 'btn btn-primary', onClick: this.onClick}, 'Click Me!');
        return (
            <button 
                type='button' 
                className='btn btn-default' 
                onClick={this.onClick }>
                Click Me!
            </button>
        )
    }
} 