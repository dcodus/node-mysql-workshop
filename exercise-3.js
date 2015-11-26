var database = require("mysql");
var Table = require("cli-table");
var table = new Table();

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});

function enumerate(id,email){
    var account = {};
    account[id] = email;
    return account;
}

connection.connect();

connection.query('SELECT id, email FROM Account limit 5', function(err,result){
        table.push({'Account ID': 'Account Email'})
        result.forEach(function(account){
            table.push(enumerate('#'+account.id+':', account.email))
        })
        console.log(table.toString());
})

connection.end();
