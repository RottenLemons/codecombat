/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let CertificatesView;
require('app/styles/user/certificates-view.sass');
const RootView = require('views/core/RootView');
const User = require('models/User');
const Classroom = require('models/Classroom');
const Course = require('models/Course');
const CourseInstance = require('models/CourseInstance');
const LevelSessions = require('collections/LevelSessions');
const Levels = require('collections/Levels');
const ThangTypeConstants = require('lib/ThangTypeConstants');
const ThangType = require('models/ThangType');
const utils = require('core/utils');
const fetchJson = require('core/api/fetch-json');
const locale = require('locale/locale');

module.exports = (CertificatesView = (function() {
  CertificatesView = class CertificatesView extends RootView {
    static initClass() {
      this.prototype.id = 'certificates-view';
      this.prototype.template = require('app/templates/user/certificates-view');
  
      this.prototype.events = {
        'click .print-btn': 'onClickPrintButton',
        'click .toggle-btn': 'onClickToggleButton'
      };
    }

    getTitle() {
      if (this.user.broadName() === 'Anonymous') { return 'Certificate'; }
      return `Certificate: ${this.user.broadName()}`;
    }

    hashString(str) {
      return (__range__(0, str.length, false).map((i) => str.charCodeAt(i))).reduce(((hash, char) => ((hash << 5) + hash) + char), 5381);  // hash * 33 + c
    }

    initialize(options, userID) {
      let classroomID, courseID;
      this.userID = userID;
      if (this.userID === me.id) {
        this.user = me;
        if (utils.isCodeCombat) {
          this.setHero();
        }
      } else {
        this.user = new User({_id: this.userID});
        this.user.fetch();
        this.supermodel.trackModel(this.user);
        if (utils.isCodeCombat) {
          this.listenToOnce(this.user, 'sync', () => (typeof this.setHero === 'function' ? this.setHero() : undefined));
        }
        this.user.fetchNameForClassmate({success: data => {
          this.studentName = User.broadName(data);
          return (typeof this.render === 'function' ? this.render() : undefined);
        }
        });
      }
      if (classroomID = utils.getQueryVariable('class')) {
        this.classroom = new Classroom({_id: classroomID});
        this.classroom.fetch();
        this.supermodel.trackModel(this.classroom);
        this.listenToOnce(this.classroom, 'sync', this.onClassroomLoaded);
      }
      if (courseID = utils.getQueryVariable('course')) {
        this.course = new Course({_id: courseID});
        this.course.fetch();
        this.supermodel.trackModel(this.course);
      }
      this.courseInstanceID = utils.getQueryVariable('course-instance');
      // TODO: anonymous loading of classrooms and courses with just enough info to generate cert, or cert route on server
      // TODO: handle when we don't have classroom & course
      // TODO: add a check here that the course is completed

      this.sessions = new LevelSessions();
      this.supermodel.trackRequest(this.sessions.fetchForCourseInstance(this.courseInstanceID, {userID: this.userID, data: { project: 'state.complete,level.original,playtime,changed,code,codeLanguage,team' }}));
      this.listenToOnce(this.sessions, 'sync', this.calculateStats);
      this.courseLevels = new Levels();
      this.supermodel.trackRequest(this.courseLevels.fetchForClassroomAndCourse(classroomID, courseID, {data: { project: 'concepts,practice,assessment,primerLanguage,type,slug,name,original,description,shareable,i18n,thangs.id,thangs.components.config.programmableMethods' }}));
      this.listenToOnce(this.courseLevels, 'sync', this.calculateStats);

      const tenbillion = 10000000;
      const nintybillion = 90000000;
      if (typeof features !== 'undefined' && features !== null ? features.chinaUx : undefined) {
        this.certificateNumber =   // keep only 8 digits
          (((this.hashString(this.user.id + this.courseInstanceID) % nintybillion) + nintybillion) % nintybillion) + tenbillion;   // 10000000 ~ 99999999
      }

      this.currentLang = me.get('preferredLanguage', true);
      return this.needLanguageToggle = this.currentLang.split('-')[0] !== 'en';
    }


    setHero(heroOriginal=null) {
      if (!heroOriginal) { heroOriginal = utils.getQueryVariable('hero') || __guard__(this.user.get('heroConfig'), x => x.thangType) || ThangTypeConstants.heroes.captain; }
      this.thangType = new ThangType();
      this.supermodel.trackRequest(this.thangType.fetchLatestVersion(heroOriginal, {data: {project:'slug,version,original,extendedName,heroClass'}}));
      return this.thangType.once('sync', thangType => {
        if (this.thangType.get('heroClass') !== 'Warrior') {
          // We only have basic warrior poses and signatures for now
          return this.setHero(ThangTypeConstants.heroes.captain);
        }
      });
    }

    onClassroomLoaded() {
      this.calculateStats();
      if (me.id === this.classroom.get('ownerID')) {
        return this.teacherName = me.broadName();
      } else {
        const teacherUser = new User({_id: this.classroom.get('ownerID')});
        return teacherUser.fetchNameForClassmate({success: data => {
          this.teacherName = User.broadName(data);
          return (typeof this.render === 'function' ? this.render() : undefined);
        }
        });
      }
    }

    getCodeLanguageName() {
      if (!this.classroom) { return 'Code'; }
      if (this.course && /web-dev-1/.test(this.course.get('slug'))) {
        return 'HTML/CSS';
      }
      if (this.course && /web-dev/.test(this.course.get('slug'))) {
        return 'HTML/CSS/JS';
      }
      return this.classroom.capitalizeLanguageName();
    }

    calculateStats() {
      if (!this.classroom.loaded || !this.sessions.loaded || !this.courseLevels.loaded) { return; }
      this.courseStats = this.classroom.statsForSessions(this.sessions, this.course.id, this.courseLevels);

      if (this.courseStats.levels.project) {
        const projectSession = this.sessions.find(session => session.get('level').original === this.courseStats.levels.project.get('original'));
        if (projectSession) {
          this.projectLink = `${window.location.origin}/play/${this.courseStats.levels.project.get('type')}-level/${projectSession.id}`;
          return fetchJson('/db/level.session/short-link', {method: 'POST', json: {url: this.projectLink}}).then(response => {
            this.projectShortLink = response.shortLink;
            return this.render();
          });
        }
      }
    }

    onClickPrintButton() {
      return window.print();
    }

    onClickToggleButton() {
      let newLang = 'en';
      if (this.currentLang.split('-')[0] === 'en') {
        newLang = me.get('preferredLanguage', true);
      }
      this.currentLang = newLang;
      return $.i18n.changeLanguage(newLang, () => {
        return locale.load(newLang).then(() => {
          return this.render();
        });
      });
    }


    afterRender() {
      return this.autoSizeText('.student-name');
    }

    autoSizeText(selector) {
      return this.$(selector).each((index, el) => (() => {
        const result = [];
        while ((el.scrollWidth > el.offsetWidth) || (el.scrollHeight > el.offsetHeight)) {
          var newFontSize = (parseFloat($(el).css('font-size').slice(0, -2)) * 0.95) + 'px';
          result.push($(el).css('font-size', newFontSize));
        }
        return result;
      })());
    }
  };
  CertificatesView.initClass();
  return CertificatesView;
})());

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}