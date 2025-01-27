/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let Problem;
const ace = require('lib/aceContainer');
const {
  Range
} = ace.require('ace/range');

// This class can either wrap an AetherProblem,
// or act as a general runtime error container for web-dev iFrame errors.
// TODO: Use subclasses? Might need a factory pattern for that (bleh)
module.exports = (Problem = (function() {
  Problem = class Problem {
    static initClass() {
      this.prototype.annotation = null;
      this.prototype.markerRange = null;
    }
    // Construction with AetherProblem will include all but `error`
    // Construction with a standard error will have `error`, `isCast`, `levelID`, `ace`
    constructor({ aether, aetherProblem, ace1, isCast, levelID, error, userCodeHasChangedSinceLastCast }) {
      this.aether = aether;
      this.aetherProblem = aetherProblem;
      this.ace = ace1;
      this.levelID = levelID;
      if (isCast == null) { isCast = false; }
      if (this.aetherProblem) {
        let col;
        this.annotation = this.buildAnnotationFromAetherProblem(this.aetherProblem);
        if (isCast) { ({ lineMarkerRange: this.lineMarkerRange, textMarkerRange: this.textMarkerRange } = this.buildMarkerRangesFromAetherProblem(this.aetherProblem)); }

        ({ level: this.level, range: this.range, message: this.message, hint: this.hint, userInfo: this.userInfo, errorCode: this.errorCode, i18nParams: this.i18nParams } = this.aetherProblem);
        ({ row: this.row, [this.column]: col } = (this.aetherProblem.range != null ? this.aetherProblem.range[0] : undefined) || {});
        this.createdBy = 'aether';
      } else {
        if (!userCodeHasChangedSinceLastCast) {
          this.annotation = this.buildAnnotationFromWebDevError(error);
          ({ lineMarkerRange: this.lineMarkerRange, textMarkerRange: this.textMarkerRange } = this.buildMarkerRangesFromWebDevError(error));
        }

        this.level = 'error';
        this.row = error.line;
        this.column = error.column;
        this.message = error.message || 'Unknown Error';
        if (error.line && !userCodeHasChangedSinceLastCast) {
          this.message = `Line ${error.line + 1}: ` + this.message; // Ace's gutter numbers are 1-indexed but annotation.rows are 0-indexed
        }
        if (userCodeHasChangedSinceLastCast) {
          this.hint = "This error was generated by old code — Try running your new code first.";
        } else {
          this.hint = undefined;
        }
        this.userInfo = undefined;
        this.createdBy = 'web-dev-iframe';
      }
        // TODO: Include runtime/transpile error types depending on something?

      const camelToSnake = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (this.errorCode) {
        this.message = $.i18n.t(`esper.error${camelToSnake(this.errorCode)}`, this.i18nParams);
      } else {
        this.message = this.translate(this.message);
      }
      this.hint = this.translate(this.hint);
      // TODO: get ACE screen line, too, for positioning, since any multiline "lines" will mess up positioning
      if (application.isIPadApp) { Backbone.Mediator.publish("problem:problem-created", {line: this.annotation.row, text: this.annotation.text}); }
    }

    isEqual(problem) {
      return _.all(['row', 'column', 'level', 'column', 'message', 'hint'], attr => {
        return this[attr] === problem[attr];
    });
    }

    destroy() {
      this.removeMarkerRanges();
      if (this.userCodeProblem) { return this.userCodeProblem.off(); }
    }

    buildAnnotationFromWebDevError(error) {
      const translatedErrorMessage = this.translate(error.message);
      return {
        row: error.line,
        column: error.column,
        raw: translatedErrorMessage,
        text: translatedErrorMessage,
        type: 'error',
        createdBy: 'web-dev-iframe'
      };
    }

    buildAnnotationFromAetherProblem(aetherProblem) {
      if (!aetherProblem.range) { return; }
      const text = this.translate(aetherProblem.message.replace(/^Line \d+: /, ''));
      const start = aetherProblem.range[0];
      return {
        row: start.row,
        column: start.col,
        raw: text,
        text,
        type: this.aetherProblem.level != null ? this.aetherProblem.level : 'error',
        createdBy: 'aether'
      };
    }

    buildMarkerRangesFromWebDevError(error) {
      const lineMarkerRange = new Range(error.line, 0, error.line, 1);
      lineMarkerRange.start = this.ace.getSession().getDocument().createAnchor(lineMarkerRange.start);
      lineMarkerRange.end = this.ace.getSession().getDocument().createAnchor(lineMarkerRange.end);
      lineMarkerRange.id = this.ace.getSession().addMarker(lineMarkerRange, 'problem-line', 'fullLine');
      const textMarkerRange = undefined; // We don't get any per-character info from standard errors
      return { lineMarkerRange, textMarkerRange };
    }

    buildMarkerRangesFromAetherProblem(aetherProblem) {
      if (!aetherProblem.range) { return {}; }
      const [start, end] = Array.from(aetherProblem.range);
      const textClazz = `problem-marker-${aetherProblem.level}`;
      const textMarkerRange = new Range(start.row, start.col, end.row, end.col);
      textMarkerRange.start = this.ace.getSession().getDocument().createAnchor(textMarkerRange.start);
      textMarkerRange.end = this.ace.getSession().getDocument().createAnchor(textMarkerRange.end);
      textMarkerRange.id = this.ace.getSession().addMarker(textMarkerRange, textClazz, 'text');
      const lineClazz = "problem-line";
      const lineMarkerRange = new Range(start.row, start.col, end.row, end.col);
      lineMarkerRange.start = this.ace.getSession().getDocument().createAnchor(lineMarkerRange.start);
      lineMarkerRange.end = this.ace.getSession().getDocument().createAnchor(lineMarkerRange.end);
      lineMarkerRange.id = this.ace.getSession().addMarker(lineMarkerRange, lineClazz, 'fullLine');
      return { lineMarkerRange, textMarkerRange };
    }

    removeMarkerRanges() {
      if (this.textMarkerRange) {
        this.ace.getSession().removeMarker(this.textMarkerRange.id);
        this.textMarkerRange.start.detach();
        this.textMarkerRange.end.detach();
      }
      if (this.lineMarkerRange) {
        this.ace.getSession().removeMarker(this.lineMarkerRange.id);
        this.lineMarkerRange.start.detach();
        return this.lineMarkerRange.end.detach();
      }
    }

    // Here we take a string from the locale file, find the placeholders ($1/$2/etc)
    //   and replace them with capture groups (.+),
    // returns a regex that will match against the error message
    //   and capture any dynamic values in the text
    makeTranslationRegex(englishString) {
      const escapeRegExp = str => // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
      str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      return new RegExp(escapeRegExp(englishString).replace(/\\\$\d/g, '(.+)').replace(/ +/g, ' +'));
    }

    translate(msg) {
      if (!msg) { return msg; }
      if (/\n/.test(msg)) { // Translate each line independently, since regexes act weirdly with newlines
        return msg.split('\n').map(line => this.translate(line)).join('\n');
      }

      msg = msg.replace(/([A-Za-z]+Error:) \1/, '$1');
      if (['en', 'en-US'].includes($.i18n.language)) { return msg; }

      // Separately handle line number and error type prefixes
      const en = require('locale/en').translation;
      const applyReplacementTranslation = (text, regex, key) => {
        const fullKey = `esper.${key}`;
        const replacementTemplate = $.i18n.t(fullKey);
        if (replacementTemplate === fullKey) { return; }
        // This carries over any capture groups from the regex into $N placeholders in the template string
        const replaced = text.replace(regex, replacementTemplate);
        if (replaced !== text) {
          return [replaced.replace(/``/g, '`'), true];
        }
        return [text, false];
      };

      // These need to be applied in this order, before the main text is translated
      const prefixKeys = ['line_no', 'uncaught', 'reference_error', 'argument_error', 'type_error', 'syntax_error', 'error'];

      for (var keySet of [prefixKeys, Object.keys(_.omit(en.esper), prefixKeys)]) {
        for (var translationKey of Array.from(keySet)) {
          var didTranslate;
          var englishString = en.esper[translationKey];
          var regex = this.makeTranslationRegex(englishString);
          [msg, didTranslate] = Array.from(applyReplacementTranslation(msg, regex, translationKey));
          if (didTranslate && (keySet !== prefixKeys)) { break; }
          null;
        }
      }

      return msg;
    }
  };
  Problem.initClass();
  return Problem;
})());
