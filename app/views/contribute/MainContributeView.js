/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let MainContributeView;
require('app/styles/contribute/contribute.sass');
const ContributeClassView = require('views/contribute/ContributeClassView');
const template = require('app/templates/contribute/contribute');

module.exports = (MainContributeView = (function() {
  MainContributeView = class MainContributeView extends ContributeClassView {
    static initClass() {
      this.prototype.id = 'contribute-view';
      this.prototype.template = template;
  
      this.prototype.events =
        {'change input[type="checkbox"]': 'onCheckboxChanged'};
    }
  };
  MainContributeView.initClass();
  return MainContributeView;
})());
