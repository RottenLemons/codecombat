/*
 * decaffeinate suggestions:
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
const CocoClass = require('./CocoClass');

const namesCache = {};

class SystemNameLoader extends CocoClass {
  getName(id) { return (namesCache[id] != null ? namesCache[id].name : undefined); }

  setName(system) { return namesCache[system.get('original')] = {name: system.get('name')}; }
}

module.exports = new SystemNameLoader();
