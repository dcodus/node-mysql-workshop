var database = require("mysql");
var util = require('util');

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});

var query = 'SELECT Account.id as \'account_id\', Account.email, AddressBook.id as \'addressbook_id\', AddressBook.name, Entry.id as \'entry_id\', Entry.firstName, Entry.lastName, Entry.addressbookId as \'entry_add_id\' FROM Entry JOIN AddressBook on Entry.addressbookId = AddressBook.id JOIN Account on Account.id = AddressBook.accountId';

connection.connect();

connection.query(query, function(err,accounts){
    //console.log(accounts);
   
   var orderedAccounts = [];
   
   
   accounts.forEach(function(oldAccount){
       var found = false;
       orderedAccounts.forEach(function(newAccount, index){
           if(oldAccount.account_id === newAccount.account_id){
               found = true;
           }
       })
       if(found === false){
           var createAccount = {'account_id': oldAccount.account_id, 'email': oldAccount.email, 'books': []};
           orderedAccounts.push(createAccount);
       }
   })
   
   var addressBooks = [];
   
   accounts.forEach(function(account){
       var found = false;
       addressBooks.forEach(function(book, index){
           if(account.addressbook_id === book.addressbook_id){
               found = true;
           }
       })
       if(found === false){
           var createAddressBook = {'addressbook_id': account.addressbook_id, 'name': account.name, 'account_id': account.account_id, 'entries': []};
           addressBooks.push(createAddressBook);
       }
   })
   
   addressBooks.forEach(function(book){
       accounts.forEach(function(account){
           if(book.addressbook_id === account.addressbook_id){
               book.entries.push({'id': account.entry_id, 'firstName': account.firstName, 'lastName': account.lastName})
           }
       })
   })
   
   orderedAccounts.forEach(function(account) {
       addressBooks.forEach(function(book){
           if(account.account_id === book.account_id){
              delete book.account_id
              account.books.push(book)
           }
       })
   })
   
    console.log(util.inspect(orderedAccounts, {depth: 10}));
   //console.log(newEntries);
   //console.log(util.inspect(addressBooks, {depth: 10}));
});


connection.end();