var database = require("mysql");

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});

var query = 'SELECT Account.id as \'account_id\', Account.email, AddressBook.id as \'addressbook_id\', AddressBook.name, Entry.id as \'entry_id\', Entry.firstName, Entry.lastName FROM Entry JOIN AddressBook on Entry.addressbookId = AddressBook.id JOIN Account on Account.id = AddressBook.accountId';

connection.connect();

connection.query(query, function(err,accounts){
   
   var orderedAccounts = [];
   accounts.forEach(function(account){
       var found;
       var position;
       orderedAccounts.forEach(function(newAccount, index){
           if(account.account_id === newAccount.account_id){
               found = true;
               position = index;
           } else {
               found = false;
           }
       })
       if(found === false){
           var formatedAccount = {'id': account.account_id, 'email': account.email, 'books':[account.name]};
           orderedAccounts.push(formatedAccount);
       } else {
           orderedAccounts[position].books.push(account.name);
       }
   }) 

});


connection.end();