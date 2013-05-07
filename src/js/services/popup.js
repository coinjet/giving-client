/**
 * POPUP
 *
 * The popup service is used to provide modals, alerts, and confirmation screens
 */

var module = angular.module('popup', []);

module.factory('rpPopup', ['$http', '$compile',
                           function ($http, $compile)
{
  var popupService = {};

  // Get the popup
  popupService.getPopup = function(create)
  {
    if (!popupService.popupElement && create)
    {
      popupService.popupElement = $( '<div class="modal hide"></div>' );
      popupService.popupElement.appendTo( 'BODY' );
    }

    return popupService.popupElement;
  };

  popupService.compileAndRunPopup = function (popup, scope, options) {
    $compile(popup)(scope);
    popup.modal(options);
  };

  popupService.confirm = function(title, actionText, actionButtonText, actionFunction, actionButtonCss, cancelButtonText, cancelFunction, cancelButtonCss, scope, options) {
    actionText = (actionText) ? actionText : "Are you sure?";
    actionButtonText = (actionButtonText) ? actionButtonText : "Ok";
    actionButtonCss = (actionButtonCss) ? actionButtonCss : "btn btn-info";
    cancelButtonText = (cancelButtonText) ? cancelButtonText : "Cancel";
    cancelButtonCss = (cancelButtonCss) ? cancelButtonCss : "";

    var popup = popupService.getPopup(true);
    var confirmHTML = "";

    if (title) {
      confirmHTML += "<div class=\"modal-header\"><h1>"+title+"</h1></div>";
    }

    confirmHTML += "<div class=\"modal-body\"><p class=\"question\">"+actionText+"</p>"
        +    "<p class=\"actions\">";

    if (actionFunction) {
      confirmHTML += "<button class=\"" + actionButtonCss + " btn-cancel\" ng-click=\""+actionFunction+"\">"+actionButtonText+"</button>";
    }
    else {
      confirmHTML += "<button class=\"" + actionButtonCss + " btn-cancel\">"+actionButtonText+"</button>";
    }

    if (cancelFunction) {
      confirmHTML += "<a class=\"" + cancelButtonCss + " btn-cancel\" ng-click=\""+cancelFunction+"\">"+cancelButtonText+"</a>";
    }
    else {
      confirmHTML += "<a class=\"" + cancelButtonCss + " btn-cancel\">"+cancelButtonText+"</a>";
    }

    confirmHTML += "</p></div>";

    popup.html(confirmHTML);

    if (!actionFunction) {
      popup.find(".btn-primary").click(function () {
        popupService.close();
      });
    }

    if (!cancelFunction) {
      popup.find(".btn-cancel").click(function () {
        popupService.close();
      });
    }

    popupService.compileAndRunPopup(popup, scope, options);
  };

  popupService.close = function()
  {
    var popup = popupService.getPopup();
    if (popup) {
      popup.modal('hide');
    }
  };

  return popupService;
}]);
