var database = require("mysql");
var Table = require("cli-table");
var table = new Table();

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});

var query = 'select Account.id, Account.email, AddressBook.name from Account join AddressBook on Account.id = AddressBook.accountId';

connection.connect();

connection.query(query, function(err, response){
    //Create a new array to store our objects
    var newAccounts = [];
    //Loop over existing array
    response.forEach(function(oldAccount, index){
        //Create a found flag
        var found = false;
        //Create a counter that will store the position of the found object
        var counter;
        //Loop over the new array
        newAccounts.forEach(function(newAccount, index){
            
            if(newAccount.id === oldAccount.id){
                //If something is found set our flag to true
                found = true;
                //Set our index to the found position
                counter = index; 
            }
        })
        if(!found){
            //If nothing found create the new object and push the first instance of addressbooks to the books array
            var account = {'id': oldAccount.id, 'email': oldAccount.email, books: [oldAccount.name]};
            newAccounts.push(account);
        } else {
            //If it was found, push to the object and the position that was found the addressbooks from oldAccount
            newAccounts[counter].books.push(oldAccount.name);
        }
    })
    
    console.log(newAccounts);
})
    

connection.end();

