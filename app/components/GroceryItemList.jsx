var React = require('react');
var addons = require('react-addons');

var classSet = addons.classSet;

var GroceryItem = require('./GroceryItem.jsx');
var GroceryListAddItem = require('./GroceryListAddItem.jsx');

module.exports = React.createClass({
    render:function(){
        return (
            <div>
                <h1>Grocery Listify </h1>
                <div>
                    {this.props.items.map(function(item,index){
                        return(
                            <GroceryItem item={item} key={"item"+index}/>
                        )
                    })
                    }
                </div>
                <GroceryListAddItem />
            </div>
        )
    }
})