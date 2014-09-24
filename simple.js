var ldap = require('ldapjs');

var server = ldap.createServer();

server.bind('cn=xtrac', function(req, res, next) {
  if (req.dn.toString() !== 'cn=xtrac' || req.credentials !== 'secret')
    return next(new ldap.InvalidCredentialsError());

  res.end();
  return next();
});

function authorize(req, res, next) {
  if (!req.connection.ldap.bindDN.equals('cn=xtrac'))
    return next(new ldap.InsufficientAccessRightsError());

  return next();
}

var foo = {
  dn: 'cn=foo,ou=users,o=atlas',
  attributes: {
    cn: 'foo',
    uid: 1,
    gid: 'wheel',
    description: 'a user',
    objectClass: 'xtracUser'
  }
};

var bar = {
  dn: 'cn=bar,ou=users,o=atlas',
  attributes: {
    cn: 'bar',
    uid: 2,
    gid: 'wheel',
    description: 'another user',
    objectClass: 'xtracUser'
  }
};


var users = {};
users['foo'] = foo;
users['bar'] = bar;

function loadUsers(req, res, next) {
  req.users = users;
  return next();
}

var pre = [authorize, loadUsers];

server.search('o=atlas', pre, function(req, res, next) {

  Object.keys(req.users).forEach(function(k) {
    if (req.filter.matches(req.users[k].attributes))
      res.send(req.users[k]);
  });

  res.end();
  return next();
});

server.listen(1389, function() {
    console.log('LDAP server up at: %s', server.url);
});
