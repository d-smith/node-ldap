var ldap = require('ldapjs');

var server = ldap.createServer();

server.listen(1389, function() {
    console.log('LDAP server up at: %s', server.url);
});
