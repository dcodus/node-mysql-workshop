var database = require("mysql");
var util = require('util');

var connection = database.createConnection({
    host: 'localhost',
    user: 'codus',
    database: 'addressbook'
});

var query = 'SELECT Account.id as account_id,Account.email,AddressBook.id as addressbook_id,AddressBook.name as name,Entry.id as entry_id,Entry.firstName,Entry.lastName,Phone.id as phone_id,Phone.type as phone_type,Phone.subtype,Phone.phoneNumber,Email.id as email_id,Email.type as email_type,Email.address as email_address,Address.id as address_id,Address.type as address_type,Address.line1,Address.line2,Address.city,Address.state,Address.zip,Address.country FROM Entry JOIN Phone ON Phone.entryId = Entry.id JOIN Email ON Email.entryId = Entry.id JOIN Address ON Address.entryId = Entry.id JOIN AddressBook ON Entry.addressbookId = AddressBook.id JOIN Account ON Account.id = AddressBook.accountId';

/*
How the final result has to look
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
            phones: [
                {id:
                type:
                subtype:
                number:
                },
                {}
            ]
            emails: [
                {
                    id:
                    type:
                    email;
                },
                {}
            ]
            addresses: [
                {
                    id:
                    type:
                    line_1:
                    line_2:
                    city:
                    state:
                    zip:
                    country:
                }, 
                {}
            ]
        ]
    ]
}

*/

connection.connect();

var finalResult = [];

connection.query(query, function(err, results) {

    var finalResult = [];

    var ACCOUNTS = {};
    var BOOKS = {};
    var ENTRIES = {};
    var ADDRESSES = {};
    var PHONES = {};
    var EMAILS = {};

    results.forEach(function(account) {

        var acc = ACCOUNTS[account.account_id] || (ACCOUNTS[account.account_id] = {
            id: account.account_id,
            email: account.email,
            books: []
        });
        var accBook = BOOKS[account.addressbook_id] || (BOOKS[account.addressbook_id] = {
            id: account.account_id,
            name: account.name,
            entries: []
        });
        var ent = ENTRIES[account.entry_id] || (ENTRIES[account.entry_id] = {id: account.entry_id, firstName: account.firstName, lastName: account.lastName, phones: [], emails: [], addresses: []});
        
        
        if(accBook.entries.indexOf(ent) === -1){
            accBook.entries.push(ent);
        }
        
        if (acc.books.indexOf(accBook) === -1) {
            acc.books.push(accBook);
        }


        if (finalResult.indexOf(acc) === -1) {
            finalResult.push(acc);
        }
        
        var phone = PHONES[account.phone_id] || (PHONES[account.phone_id] = {id: account.phone_id, type: account.phone_type, subtype: account.subtype, number: account.phoneNumber});
        var email = EMAILS[account.email_id] || (EMAILS[account.email_id] = {id: account.email_id, type: account.email_type, email: account.email_address});
        var address = ADDRESSES[account.address_id] || (ADDRESSES[account.address_id] = {id: account.address_id, type: account.address_type, line1: account.line1, line2: account.line2, city: account.city, state: account.state, zip: account.zip, country: account.country});
        
        if(ent.phones.indexOf(phone) === -1){
            ent.phones.push(phone)
        }
        
        if(ent.emails.indexOf(email) === -1){
            ent.emails.push(email);
        }
        
        if(ent.addresses.indexOf(address) === -1){
            ent.addresses.push(address);
        }
        
        
    });
    console.log(util.inspect(finalResult, {
        depth: 10,
        colors: true
    }));
})

connection.end();