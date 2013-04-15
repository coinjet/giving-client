var util = require('util');
var Tab = require('../client/tab').Tab;
var id = require('../client/id').Id.singleton;

var RatesTab = function ()
{
  Tab.call(this);

  this.on('afterrender', this.onAfterRender.bind(this));
};

util.inherits(RatesTab, Tab);

RatesTab.prototype.parent = 'wallet';

RatesTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/rates.jade')();
};

RatesTab.prototype.onAfterRender = function ()
{

};

module.exports = RatesTab;
