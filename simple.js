var ldap = require('ldapjs');

var server = ldap.createServer();

server.bind('cn=xtrac', function(req, res, next) {
  try {
    if (req.dn.toString() !== 'cn=xtrac' || req.credentials !== 'secret')
      return next(new ldap.InvalidCredentialsError());


  } catch(err) {
    console.log('caught err: ' + err);
  }

  res.end();
  return next();
});

function authorize(req, res, next) {
  if (!req.connection.ldap.bindDN.equals('cn=xtrac'))
    return next(new ldap.InsufficientAccessRightsError());

  return next();
}

var foo = {
  dn: 'cn=foo,ou=users,o=atlas,o=xtrac',
  attributes: {
    cn: 'foo',
    uid: 1,
    gid: 'wheel',
    description: 'a user',
    objectClass: 'xtracUser'
  }
};

var bar = {
  dn: 'cn=bar,ou=users,o=atlas,o=xtrac',
  attributes: {
    cn: 'bar',
    uid: 2,
    gid: 'wheel',
    description: 'another user',
    objectClass: 'xtracUser'
  }
};

var baz = {
  dn: 'cn=baz,ou=users,o=beefy,o=xtrac',
  attributes: {
    cn: 'baz',
    uid: 1,
    gid: 'wheel',
    description: 'another user',
    objectClass: 'xtracUser'
  }
};

var baz2 = {
  dn: 'cn=baz,ou=users,o=atlas,o=xtrac',
  attributes: {
    cn: 'baz',
    uid: 3,
    gid: 'wheel',
    description: 'another user',
    objectClass: 'xtracUser'
  }
};


var users = {};
users['foo'] = foo;
users['bar'] = bar;
users['baz'] = baz;
users['baz2'] = baz2;

function loadUsers(req, res, next) {
  req.users = users;
  return next();
}

function dump(req, res, next) {
  console.log(req.dn);
  console.log('filter ' + req.filter);
  console.log(req.json);
  console.log(req.dn.toString());
  return next();
}

var pre = [authorize, loadUsers, dump];

server.search('', pre, function(req, res, next) {
  console.log('root search');
  res.end();
  return next();
});

server.search('o=xtrac', pre, function(req, res, next) {

  Object.keys(req.users).forEach(function(k) {
    console.log(k);
    if (req.filter.matches(req.users[k].attributes))
      res.send(req.users[k]);
  });

  res.end();
  return next();
});

server.listen(1389, function() {
    console.log('LDAP server up at: %s', server.url);
});
