var database = require("mysql");
var Table = require("cli-table");
var table = new Table();

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
})

function enumerate(key, value){
    var object = {};
    object[key] = value;
    return object;
}

connection.connect();

connection.query('show databases', function(err, result,fields){
    table.push({'Database Id': 'Database Name'});
    for(var i = 0; i < result.length; i++){
        table.push(enumerate(i+1, result[i].Database))
    }
    console.log(table.toString());
})

connection.end();

