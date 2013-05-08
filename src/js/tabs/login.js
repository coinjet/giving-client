var util = require('util');
    Tab = require('../client/tab').Tab,
    webutil = require('../util/web');

var LoginTab = function ()
{
  Tab.call(this);
};

util.inherits(LoginTab, Tab);

LoginTab.prototype.pageMode = 'single';
LoginTab.prototype.parent = 'main';

LoginTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/login.jade')();
};

LoginTab.prototype.angular = function (module) {
  var self = this;

  module.controller('LoginCtrl', ['$scope', '$element', '$routeParams',
                                  '$location', 'rpId',
                                  function ($scope, $element, $routeParams,
                                            $location, $id)
  {
    // if logged in redirect appropriately
    if ($id.loginStatus)
      webutil.defaultDestination($id);
    //  if register hash is empty then redirect to signup
    else if ( ! $routeParams.register)
      $location.path('/signup');

    $scope.backendChange = function()
    {
      $id.blobBackends = $scope.blobBackendCollection.something.value.split(',');
      store.set('ripple_blobBackends', $id.blobBackends);
    };

    $scope.error = '';
    $scope.username = '';
    $scope.password = '';
    $scope.loginForm && $scope.loginForm.$setPristine(true);

    $scope.submitForm = function()
    {
      $scope.backendMessages = [];

      // Issue #36: Password managers may change the form values without
      // triggering the events Angular.js listens for. So we simply force
      // an update of Angular's model when the form is submitted.
      var username;
      var password;

      $.each($element.find('input[name="login_username"]'), function(index,field){
        if ($(field).val()) {
          username = $(field).val();
        }
      });

      $.each($element.find('input[name="login_password"]'), function(index,field){
        if ($(field).val()) {
          password = $(field).val();
        }
      });

      $scope.loginForm.login_username.$setViewValue(username);
      $scope.loginForm.login_password.$setViewValue(password);
      // set register
     var register = webutil.getRegisterHash($routeParams);

      setImmediate(function () {
        $id.login($scope.username, $scope.password, register,
          function(backendName, err, success) {
          $scope.ajax_loading = false;
          if (success) {
            if ($routeParams.tab) {
              $location.path('/'+$routeParams.tab);
            } else {
              webutil.defaultDestination($id.giveaway_register);
            }
          } else {
            $scope.backendMessages.push({'backend':backendName, 'message':err.message});
          }

          $scope.$apply();
        });
      });

      $scope.ajax_loading = true;
      $scope.error = '';
      $scope.status = 'Fetching wallet...';
    };

    // redirect to create wallet
    $scope.create_wallet = function(){
      $location.path('/register');
    };

  }]);
};

module.exports = LoginTab;
