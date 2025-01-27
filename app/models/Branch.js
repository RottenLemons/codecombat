/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let Branch;
const CocoModel = require('./CocoModel');
const schema = require('schemas/models/branch.schema');
const CocoCollection = require('collections/CocoCollection');

module.exports = (Branch = (function() {
  Branch = class Branch extends CocoModel {
    static initClass() {
      this.className = 'Branch';
      this.schema = schema;
      this.prototype.urlRoot = '/db/branches';
    }
  };
  Branch.initClass();
  return Branch;
})());
