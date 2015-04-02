var SCOPES = {
  user: [
    'username'
  ],
  email: [
    'email'
  ]
};

module.exports = {
  filterUserForScopes: function(user, scopes) {
    var filtered = {};

    if ( !Array.isArray(scopes) ) {
      scopes = [scopes];
    }

    scopes.forEach(function(scope) {
      var scopeAttrs = SCOPES[scope];
      if ( scopeAttrs ) {
        scopeAttrs.forEach(function(attr) {
          filtered[attr] = user[attr];
        });
      }
    });

    return filtered;
  }
};
