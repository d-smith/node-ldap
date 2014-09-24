var ldap = require('ldapjs');

var server = ldap.createServer();

server.bind('cn=xtrac', function(req, res, next) {
  if (req.dn.toString() !== 'cn=xtrac' || req.credentials !== 'secret')
    return next(new ldap.InvalidCredentialsError());

  res.end();
  return next();
});

server.listen(1389, function() {
    console.log('LDAP server up at: %s', server.url);
});
