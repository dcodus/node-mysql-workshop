var database = require("mysql");
var util = require('util');

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});

var query = 'SELECT Account.id as \'account_id\', Account.email, AddressBook.id as \'addressbook_id\', AddressBook.name, Entry.id as \'entry_id\', Entry.firstName, Entry.lastName, Entry.addressbookId as \'entry_add_id\' FROM Entry JOIN AddressBook on Entry.addressbookId = AddressBook.id JOIN Account on Account.id = AddressBook.accountId';

/*

Account {
    id: 
    email:
    addressbook: [
        id:
        name:
        entry: [
            id:
            firstName: 
            lastName:
        ]
    ]
}

*/

connection.connect();

var finalResult = [];

connection.query(query, function(err, results){
    //These are bins that will be used to store unique accounts
    //We create these bins because we can reffer to each item in the bin by it's unique id.
    
    /*
    ACCOUNT EXAMPLE FROM RESULST WHICH HOLDS ALL THE ACCOUNT RETREIVED FROM MYSQL
    
    {
      account_id: 6,
      email: 'red@green.blue',
      addressbook_id: 14,
      name: 'people i dont like',
      entry_id: 628,
      firstName: 'Leandra',
      lastName: 'Zimmerman',
      entry_add_id: 14 
    }
    
    */
    
    var finalResult = [];
    
    var ACCOUNTS = {};
    var BOOKS = {};
    var ENTRIES = {};
    
   results.forEach(function(account){
      
       
       //If ACCOUNTS[account.accoun_id] is undefined we then create a new account object
       //In this case ACCOUNTS[account.account_id] is the key of the object bin ex: 1: {new account obj}, 2: {new account obj}
       //We are settig the key to be equal to the account.account_id
       //Notice how we "push" the object on the right hand side
       //We are stating that if ACCOUNTS[account.account_id] is undefined we should set ACCOUNTS[account.account_id] equal to a new objetc
        var acc = ACCOUNTS[account.account_id] || (ACCOUNTS[account.account_id] = {id: account.account_id, email: account.email, books: []});
        
         /*
    THE OUTPUT OF ACCOUNTS:
    Notice how each key is equal to each id
    { '1': { id: 1, email: 'john@smith.com', books: [] },
      '2': { id: 2, email: 'jane@smith.com', books: [] },
      '3': { id: 3, email: 'tarzan@jungle.com', books: [] },
      '4': { id: 4, email: 'meow@kitty.com', books: [] },
      '6': { id: 6, email: 'red@green.blue', books: [] } }
    */
        
        //ALTERNATIVE
        /*
        This is the same principle as above but perhaps easier to follow
        */
    
        // if(!ACCOUNTS[account.account_id]){
        //     ACCOUNTS[account.account_id] = {id: account.account_id, email: account.account_id, book: []};
        // }
       
       
       
       //Same principle as above
       //If the left hand side returns a falsy we set BOOKS[account.addressbook_id] equal to a new object
       //This new object will have an id, a name and an empty array
       var accBook = BOOKS[account.addressbook_id] || (BOOKS[account.addressbook_id] = {id: account.account_id, name: account.name, entries: []});
       
       //ALTERNATIVE
       
        // if(!BOOKS[account.addressbook_id]){
        //     BOOKS[account.addressbook_id] = {id: account.addressbook_id, name: account.name, entries: []};
        // }
       
       //Now we have to get our entries
       //Since our entries are all unique we dont have to filter them
       
       var ent = {id: account.entry_id, firstName: account.firstName, lastName: account.lastName};
       
       //Now we simply push our entries to our addressbook
       
       accBook.entries.push(ent);
       
       //We then have to push our addressbooks to our accounts. In this case we have to check if there are no duplicates.
       
       //THIS NEEDS SPECIAL ATTENTION!!!
       //Here we will be checking to see if our books array in our acc already holds a reference to our accBook which is an addressbook abject. Look above.
       //REMEMBER THAT accBook is simply a REFERENCE to an object not the actual object! As such we can use indeOx to search if that reference is already present in our books array!
       //acc.books.indexOf(accBook) === -1 this means nothing was found so we push our accBook to our books array in acc
       //if the result of acc.books.indexOf(accBook) would be anything other than -1 that would mean a match was found and nothing would happed
       
       if(acc.books.indexOf(accBook) === -1){
           acc.books.push(accBook);
       }
       
       //We will now push our accounts to an array
       
       //The same principle as above is applied here
       //Since acc is a reference to an object we can use this reference to check if it is already present in our finalResult array
       //If nothing is found we push our acc object to the array
       if(finalResult.indexOf(acc) === -1){
           finalResult.push(acc);
       }
   });
   console.log(util.inspect(finalResult, {depth: 10, colors: true}));
})

connection.end();