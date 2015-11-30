/*
1. Using `inquirer` or a similar library, ask the user for their email (see it as a login)
2. Find the account that corresponds to this email, and show the user a list of `firstName lastName` entries, listed in alphabetical order of last name.
3. When the user chooses an entry, display a `cli-table` showing all the data for that entry.
4. Then loop back to show them all the entries again.
5. Hint #1: if a person (account) has multiple address books, we want to see all entries from all address books, no matter what.
6. Hint #2: you will need to join a few tables together to get your result.
*/



var database = require("mysql");
var util = require('util');
var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");



var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});


//THIS FOLLOWS THE SAME PRINCIPLE AS EXERCISE 6

var query = 'SELECT Account.id as account_id,Account.email,AddressBook.id as addressbook_id,AddressBook.name as name,Entry.id as entry_id,Entry.firstName,Entry.lastName,Phone.id as phone_id,Phone.type as phone_type,Phone.subtype,Phone.phoneNumber,Email.id as email_id,Email.type as email_type,Email.address as email_address,Address.id as address_id,Address.type as address_type,Address.line1,Address.line2,Address.city,Address.state,Address.zip,Address.country FROM Entry JOIN Phone ON Phone.entryId = Entry.id JOIN Email ON Email.entryId = Entry.id JOIN Address ON Address.entryId = Entry.id JOIN AddressBook ON Entry.addressbookId = AddressBook.id JOIN Account ON Account.id = AddressBook.accountId';


//This is a funcion that validates an email address using RegEx. The validation is very limited!
//It checks to see if the user has used the @ symbol and also checks for the presence of a dot.
function validateEmail(input) {
    var n = /^[^@]+@[^@]+\.[^@]+$/;
    if (n.exec(input) !== null) {
        return true;
    }
    else {
        console.log('\nPlease input valid email!')
        return false;
    }
}





inquirer.prompt([{
    name: 'login',
    message: 'Please input email to login.',
    validate: validateEmail
}], function(userEmail) {
    connection.connect();
    connection.query(query, function(err, allAccounts) {
        
        //The only difference from exercise 6 is that in this case we only need to access one account at a time
        //For this reason we will restructure our data based on a single account
        
        //matchedAccount represents all the rows from the databases that matches our account
        var matchedAccount = [];
        //ACCOUNT  will store our unique account object
        var ACCOUNT;
        //BOOKS will store our unique address books
        var BOOKS = {};
        //ENTRIES will store our unique entries
        var ENTRIES = {};
        var PHONES = {};
        var EMAILS = {};
        var ADDRESSES = {};
        
        

        //Here we are creating our ACCOUNT
        allAccounts.forEach(function(account) {
            if (userEmail.login === account.email) {
                matchedAccount.push(account);
                ACCOUNT = {
                    id: account.account_id,
                    email: account.email,
                    books: []
                };
            }
        })
        
    
        //If a match was found we will run the matchFound function
        //The verification is simple, we are checking to see if anything was pushed into our matchedAccount array
        if(matchedAccount.length !== 0){
            matchFound()
        } else {
            //If the array is empty we exit the program
            console.log('  You have entered an invalid email!  '.bgRed.white)
            return;
        }
        
        function matchFound(){
            
        //This part is the same as exercise 6 so if you would like to understand it please see my notebook for exercise 6.    
        matchedAccount.forEach(function(account) {

            var accBook = BOOKS[account.addressbook_id] || (BOOKS[account.addressbook_id] = {
                id: account.addressbook_id,
                name: account.name,
                entries: []
            });
            if (ACCOUNT.books.indexOf(accBook) === -1) {
                ACCOUNT.books.push(accBook);
            }

            var ent = ENTRIES[account.entry_id] || (ENTRIES[account.entry_id] = {
                id: account.entry_id,
                firstName: account.firstName,
                lastName: account.lastName,
                emails: [],
                phoneNumbers: [],
                addresses: []
            });

            if (BOOKS[account.addressbook_id].entries.indexOf(ent) === -1) {
                BOOKS[account.addressbook_id].entries.push(ent);
            }

            var phone = PHONES[account.phone_id] || (PHONES[account.phone_id] = {
                id: account.phone_id,
                type: account.phone_type,
                subtype: account.subtype,
                phoneNumber: account.phoneNumber
            });


            if (ENTRIES[account.entry_id].phoneNumbers.indexOf(phone) === -1) {
                ENTRIES[account.entry_id].phoneNumbers.push(phone);
            }

            var email = EMAILS[account.email_id] || (EMAILS[account.email_id] = {
                id: account.email_id,
                type: account.email_type,
                email: account.email_address
            });

            if (ENTRIES[account.entry_id].emails.indexOf(email) === -1) {
                ENTRIES[account.entry_id].emails.push(email);
            }

            var address = ADDRESSES[account.address_id] || (ADDRESSES[account.address_id] = {
                id: account.address_id,
                type: account.address_type,
                line1: account.line1,
                line2: account.line2,
                city: account.city,
                state: account.state,
                zip: account.zip,
                country: account.country
            });
            if (ENTRIES[account.entry_id].addresses.indexOf(address) === -1) {
                ENTRIES[account.entry_id].addresses.push(address);
            }
        })
        
        
        
        
        //IMPORTANT!
        //At this point we would like to have access to all our entries for the purpose of showing them as choices in inquirer
        //allEntries is an array that will store all the entries from all the addressbooks BUT not all the data!!
        //allEntries is aonly used to create our choices that will be passed to inquirer
        //inquirer takes an array of objects as it's choices
        //each object must have a name key that will be displayed and a value key that will be passed to the callback function
        //the value key is the entry id. This way we can later find all the info on our entry
        //the id was used instead of the name because we can have multiple entries with same names
        var allEntries = [];
        
        
        ACCOUNT.books.forEach(function(book) {
            book.entries.forEach(function(entry){
                //We are pushing new objects to our allEntries array
                //The reason why there are firstName and lastName values is for the purposes of sorting our results by the last name
                allEntries.push({name:entry.lastName + ' ' + entry.firstName, value: entry.id, lastName: entry.lastName.toUpperCase(), firstName: entry.firstName.toUpperCase(), id: entry.id});
            })
        })
        
        //This function when passed to a .sort() method will compare two objects and sort them accordingly
        function sortByLastName(a,b){
            //If the lastName of a is less than the lastName of b then b is pushed to the left
            if(a.lastName < b.lastName) return -1
            //If the lastName of a is more than the lastName of b then a is pushed to the right
            if(a.lastName > b.lastName) return 1
            //If equal the objects stay in the same place
            return 0
        }
        
        
        function returnChoicesArray(array){
            return array;
        }
        
        var choices = {
            name: 'choice',
            message: 'Please choose a contact',
            type: 'list',
            choices: returnChoicesArray(allEntries.sort(sortByLastName)) //Sorting our choices by lastName
        };
        
        var searchMenu = {
            name: 'search',
            message: 'What would you like to do?',
            type: 'list',
            choices: [{
                name: 'View all contacts',
                value: 'view'
            }, {
                name: 'Exit program',
                value: 'Exit'
            }]
        }
        
        
        //These next functions are used to build our strings to display in cli-table
        //Only the first one is explained since they are all simillar
        
        function checkForEmails(entry){
            //We start with an empty string
            var emails = '';
            //We check to see if any emails are present
            if(entry.emails.length > 0){
                //If yes we then loop over all the emails
                entry.emails.forEach(function(email){
                    //We build our string
                    emails = emails + email.type.toUpperCase() + ':' + '\n' + email.email + '\n\n'
                })
            }
            //We return our string
            return emails;
        }
        
        function checkForPhones(entry){
            var phones = '';
            if(entry.phoneNumbers.length > 0){
                entry.phoneNumbers.forEach(function(number){
                    phones = phones + 'Type: '+ number.type.toUpperCase() + ' Subtype: ' + number.subtype.toUpperCase() + '\n' + number.phoneNumber + '\n\n'
                })
            }
            return phones;
        }
        
        function checkForAddresses(entry){
            var addresses = '';
            if(entry.addresses.length > 0){
                entry.addresses.forEach(function(address){
                    //This function only checks to see if there is a second line
                    //If not our string will not include the second line
                    function checkLine2(line){
                        if(line !== null){return '\n' + line}
                        return '';
                    }
                    addresses = addresses + 'Type: ' + address.type.toUpperCase() + '\n' + address.line1 + checkLine2(address.line2) + '\n' + address.city + ' ' + address.state + '\n' + address.zip + ' ' + address.country + '\n\n' 
                })
            }
            return addresses;
        }
        
        
        //This function will display all the contacts and allow the user to select one to display
        
        function showAllContacts(){
             inquirer.prompt(choices, function(contact){
                 //contact here will store the id of the entry chosen by the user
                 //We then loop over all the books from our account
           var showContact = ACCOUNT.books.forEach(function(book){
               //We also loop over all the entries from all the books
               book.entries.forEach(function(entry){
                   //If a match is found
                   if(entry.id === contact.choice){
                      //We create a table that will display all the info
                      //Our table uses the functions above to display the data
                       var table = new Table();
                       table.push({
                           'First Name' : entry.firstName
                       }, {
                           'Last Name': entry.lastName
                       }, {
                           'Emails' : checkForEmails(entry)
                       }, {
                           'Phone Numbers' : checkForPhones(entry)
                       }, {
                           'Addresses' : checkForAddresses(entry)
                       });
                       
                       console.log(table.toString());
                       
                       //Here we ask the user whether another search should be made or exit the program
                       inquirer.prompt(searchMenu, function(answer){
                           if(answer.search === 'Exit'){
                               console.log('  Have a good day!  '.bgGreen.white);
                               return;
                           } else {
                               showAllContacts();
                               //Run the search again
                           }
                       })
                   }
               })
           })
        })
        }
        
        showAllContacts();
        
        } //matchFound ENDS

    })
    connection.end();
});

