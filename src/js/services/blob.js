/**
 * BLOB
 *
 * The blob service manages the user's private information.
 */

var webutil = require("../util/web"),
    log = require("../util/log");

var module = angular.module('blob', []);

module.factory('rpBlob', ['$rootScope', function ($scope)
{
  var BlobObj = function ()
  {
    this.data = {};
    this.meta = {};
  };

  function processBackendsParam(backends)
  {
    if (!Array.isArray(backends)) {
      backends = [backends];
    }

    backends = backends.map(function (backend) {
      if ("string" === typeof backend) {
        return BlobObj.backends[backend];
      } else {
        return backend;
      }
    });

    return backends;
  }

  /**
   * Attempts to retrieve the blob from the specified backend.
   */
  BlobObj.get = function(backends, user, pass, callback)
  {
    backends = processBackendsParam(backends);

    var backend = backends.shift();

    var key = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(user + pass));
    try {
      backend.get(key, function (err, data) {
        setImmediate(function () {
          $scope.$apply(function () {
            if (err) {
              console.warn("Backend failed: ", err);
              log.exception(err);
              callback(backend.name, new Error(err));

              tryNext();
              return;
            }

            if (data) {
              var blob = BlobObj.decrypt(user+pass, atob(data));
              callback(backend.name, null, blob);
            } else if (backends.length) {
              tryNext();
            } else {
              callback(backend.name, Error('Wallet not found (Username / Password is wrong)'));
            }
          });
        });
      });
    } catch (e) {
      console.warn("Backend failed: ", e);
      callback(new Error(backend.name, "Something went wrong."));
      log.exception(e);
      tryNext();
    }

    function tryNext() {
      // Do we have more backends to try?
      if (backends.length) {
        BlobObj.get(backends, user, pass, callback);
      }
    }
  };

  BlobObj.enc = function(username,password,bl)
  {
    // filter out contacts before they are encrypted
    if (typeof(bl.data.contacts) === 'object')
      bl.data.contacts = angular.fromJson(angular.toJson(bl.data.contacts));

    return btoa(sjcl.encrypt(username + password, JSON.stringify(bl.data), {
      iter: 1000,
      adata: JSON.stringify(bl.meta),
      ks: 256
    }));
  };

  BlobObj.set = function(backends, username, password, bl, callback)
  {
    // Callback is optional
    if ("function" !== typeof callback) callback = $.noop;

    backends = processBackendsParam(backends);

    var hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(username + password));
    var encData = BlobObj.enc(username, password, bl);

    backends.forEach(function (backend) {
      backend.set(hash, encData, callback);
    });
  };

  BlobObj.decrypt = function (priv, ciphertext)
  {
    var blob = new BlobObj();
    blob.data = JSON.parse(sjcl.decrypt(priv, ciphertext));
    // TODO unescape is deprecated
    blob.meta = JSON.parse(unescape(JSON.parse(ciphertext).adata));
    return blob;
  };

  var VaultBlobBackend = {
    name: "Payward",

    get: function (key, callback) {
      var url = Options.blobvault;

      if (url.indexOf("://") === -1) url = "http://" + url;

      $.ajax({
        url: url + '/' + key,
        timeout: 8000
      })
        .success(function (data) {
          callback(null, data);
        })
        .error(webutil.getAjaxErrorHandler(callback, "BlobVault GET"));
    },

    set: function (key, value, callback) {
      var url = Options.blobvault;

      if (url.indexOf("://") === -1) url = "http://" + url;

      $.post(url + '/' + key, { blob: value })
        .success(function (data) {
          callback(null, data);
        })
        .error(webutil.getAjaxErrorHandler(callback, "BlobVault SET"));
    }
  };

  var LocalBlobBackend = {
    name: "Local browser",

    get: function (key, callback)
    {
      console.log('local get','ripple_blob_' + key);
      var blob = store.get('ripple_blob_'+key);
      // We use a timeout to simulate this function being asynchronous
      callback(null, blob);
    },

    set: function (key, value, callback)
    {
      store.set('ripple_blob_'+key, value);
      callback();
    }
  };

  BlobObj.backends = {
    vault: VaultBlobBackend,
    local: LocalBlobBackend
  };

  return BlobObj;
}]);
