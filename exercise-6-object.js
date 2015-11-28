var database = require("mysql");
var util = require('util');

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});

var query = 'SELECT Account.id as \'account_id\', Account.email, AddressBook.id as \'addressbook_id\', AddressBook.name, Entry.id as \'entry_id\', Entry.firstName, Entry.lastName, Entry.addressbookId as \'entry_add_id\' FROM Entry JOIN AddressBook on Entry.addressbookId = AddressBook.id JOIN Account on Account.id = AddressBook.accountId';


connection.connect();

var finalResult = [];

connection.query(query, function(err, results){
   var ACCOUNT = {};
   var BOOKS = {};
   var ENTRIES = {};
   results.forEach(function(account){
     
     
     
       //If undefined we assign to the ACCOUNT key with that ------> object
       var acc = ACCOUNT[account.account_id] || (ACCOUNT[account.account_id] = {id: account.account_id, email : account.email, books : []});
       var ab = BOOKS[account.addressbook_id] || (BOOKS[account.addressbook_id] = {id: account.addressbook_id, name: account.name, entries: []});
       console.log(acc)
       var ent = {id: account.entry_id, firstName: account.firstName, lastName: account.lastName};
       
       ab.entries.push(ent);
       
      if(acc.books.indexOf(ab) === -1){
           acc.books.push(ab)
       }
       
       //When result is pushed acc refers to the reference but not to the actual object
      if(finalResult.indexOf(acc) === -1){
          finalResult.push(acc);
       }
       
     console.log(finalResult.indexOf(acc));

   })
   //console.log(util.inspect(finalResult, {depth: 10}));
})

connection.end();