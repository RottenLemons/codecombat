/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let TeacherClassView;
require('app/styles/courses/teacher-class-view.sass');
const RootView = require('views/core/RootView');
const State = require('models/State');
const helper = require('lib/coursesHelper');
const utils = require('core/utils');
const ozariaUtils = require('ozaria/site/common/ozariaUtils');
const ClassroomSettingsModal = require('views/courses/ClassroomSettingsModal');
const InviteToClassroomModal = require('views/courses/InviteToClassroomModal');
const ActivateLicensesModal = require('views/courses/ActivateLicensesModal');
const EditStudentModal = require('views/teachers/EditStudentModal');
const RemoveStudentModal = require('views/courses/RemoveStudentModal');
const CoursesNotAssignedModal = require('./CoursesNotAssignedModal');
const CourseNagSubview = require('views/teachers/CourseNagSubview');

const viewContentTemplate = require('app/templates/courses/teacher-class-view');
const viewContentTemplateWithLayout = require('app/templates/courses/teacher-class-view-full');

const Campaigns = require('collections/Campaigns');
const Classroom = require('models/Classroom');
const Classrooms = require('collections/Classrooms');
const Levels = require('collections/Levels');
const LevelSession = require('models/LevelSession');
const LevelSessions = require('collections/LevelSessions');
const User = require('models/User');
const Users = require('collections/Users');
const Course = require('models/Course');
const Courses = require('collections/Courses');
const CourseInstance = require('models/CourseInstance');
const CourseInstances = require('collections/CourseInstances');
const Prepaids = require('collections/Prepaids');
if (window.saveAs == null) { window.saveAs = require('file-saver/FileSaver.js'); } // `window.` is necessary for spec to spy on it
if (window.saveAs.saveAs) { window.saveAs = window.saveAs.saveAs; }  // Module format changed with webpack?
const TeacherClassAssessmentsTable = require('./TeacherClassAssessmentsTable').default;
const PieChart = require('core/components/PieComponent').default;
const GoogleClassroomHandler = require('core/social-handlers/GoogleClassroomHandler');
const { fetchInteractiveSessionForAllClassroomMembers } = require('ozaria/site/api/interactive.js');

const DOMPurify = require('dompurify');

const { STARTER_LICENSE_COURSE_IDS } = require('core/constants');

module.exports = (TeacherClassView = (function() {
  TeacherClassView = class TeacherClassView extends RootView {
    constructor(...args) {
      this.setCourseMembers = this.setCourseMembers.bind(this);
      this.onWindowResize = this.onWindowResize.bind(this);
      this.onClickAddStudents = this.onClickAddStudents.bind(this);
      super(...args);
    }

    static initClass() {
      this.prototype.id = 'teacher-class-view';
      this.prototype.helper = helper;
  
      this.prototype.events = {
        'click .nav-tabs a': 'onClickNavTabLink',
        'click .unarchive-btn': 'onClickUnarchive',
        'click .edit-classroom': 'onClickEditClassroom',
        'click .add-students-btn': 'onClickAddStudents',
        'click .edit-student-link': 'onClickEditStudentLink',
        'click .sort-button': 'onClickSortButton',
        'click #copy-url-btn': 'onClickCopyURLButton',
        'click #copy-code-btn': 'onClickCopyCodeButton',
        'click .remove-student-link': 'onClickRemoveStudentLink',
        'click .assign-student-button': 'onClickAssignStudentButton',
        'click .enroll-student-button': 'onClickEnrollStudentButton',
        'click .revoke-student-button': 'onClickRevokeStudentButton',
        'click .revoke-all-students-button': 'onClickRevokeAllStudentsButton',
        'click .assign-to-selected-students': 'onClickBulkAssign',
        'click .remove-from-selected-students': 'onClickBulkRemoveCourse',
        'click .export-student-progress-btn': 'onClickExportStudentProgress',
        'click .select-all': 'onClickSelectAll',
        'click .student-checkbox': 'onClickStudentCheckbox',
        'keyup #student-search': 'onKeyPressStudentSearch',
        'change .course-select, .bulk-course-select': 'onChangeCourseSelect',
        'click a.student-level-progress-dot': 'onClickStudentProgressDot',
        'click .sync-google-classroom-btn': 'onClickSyncGoogleClassroom',
        'click .scroll-arrow-right': 'onClickScrollRight',
        'click .scroll-arrow-left': 'onClickScrollLeft',
        'mouseover .module-content': 'focusModuleContent',
        'click .flagged-dot': 'onClickFlaggedDot',
        'click .view-capstone-project': 'trackClickEvent',
        'click .student-details-row': 'trackClickEvent'
      };
    }

    getInitialState() {
      return {
        sortValue: 'name',
        sortDirection: 1,
        activeTab: '#' + (Backbone.history.getHash() || 'students-tab'),
        students: new Users(),
        classCode: "",
        joinURL: "",
        errors: {
          nobodySelected: false
        },
        selectedCourse: undefined,
        checkboxStates: {},
        classStats: {
          averagePlaytime: "",
          totalPlaytime: "",
          averageLevelsComplete: "",
          totalLevelsComplete: "",
          enrolledUsers: ""
        }
      };
    }

    getMeta() {
      return {
        title: `${$.i18n.t('teacher.my_classes')} | ${$.i18n.t('common.ozaria')}`
      };
    }

    initialize(options, classroomID) {
      super.initialize(options);
      this.utils = utils;

      if (options.renderOnlyContent) {
        this.template = viewContentTemplate;
      } else {
        this.template = viewContentTemplateWithLayout;
      }

      // wrap templates so they translate when called
      const translateTemplateText = (template, context) => $('<div />').html(template(context)).i18n().html();
      this.singleStudentCourseProgressDotTemplate = _.wrap(require('app/templates/teachers/hovers/progress-dot-single-student-course'), translateTemplateText);
      this.singleStudentLevelProgressDotTemplate = _.wrap(require('app/templates/teachers/hovers/progress-dot-single-student-level'), translateTemplateText);
      this.allStudentsLevelProgressDotTemplate = _.wrap(require('app/templates/teachers/hovers/progress-dot-all-students-single-level'), translateTemplateText);

      this.urls = require('core/urls');

      this.debouncedRender = _.debounce(this.render);
      this.calculateProgressAndLevels = _.debounce(this.calculateProgressAndLevelsAux, 800);

      this.state = new State(this.getInitialState());

      if (options.readOnly) {
        this.state.set('readOnly', options.readOnly);
      }
      if (options.renderOnlyContent) {
        this.state.set('renderOnlyContent', options.renderOnlyContent);
      }

      this.updateHash(this.state.get('activeTab')); // TODO: Don't push to URL history (maybe don't use url fragment for default tab)

      this.classroom = new Classroom({ _id: classroomID });
      this.supermodel.trackRequest(this.classroom.fetch());
      this.onKeyPressStudentSearch = _.debounce(this.onKeyPressStudentSearch, 200);
      this.sortedCourses = [];
      this.latestReleasedCourses = [];

      this.prepaids = new Prepaids();
      this.supermodel.trackRequest(this.prepaids.fetchMineAndShared());

      this.students = new Users();
      this.classroom.sessions = new LevelSessions();

      this.moduleNameMap = utils.courseModules;
      this.courseModuleLevelsMap = {};
      this.interactiveSessions = [];
      this.listenTo(this.classroom, 'sync', function() {
        this.fetchStudents();
        this.fetchSessions();
        this.classroom.language = __guard__(this.classroom.get('aceConfig'), x => x.language);
        this.courseModuleLevelsMap = this.classroom.getLevelsByModules(); // build levels without intro content data
        this.classroom.fetchIntroContentDataForLevels(this.courseModuleLevelsMap).then(() => (typeof this.debouncedRender === 'function' ? this.debouncedRender() : undefined)); // fetch intro content data
        return this.fetchInteractiveSessions();
      });

      this.students.comparator = (student1, student2) => {
        const dir = this.state.get('sortDirection');
        const value = this.state.get('sortValue');
        if (value === 'name') {
          return (student1.broadName().toLowerCase() < student2.broadName().toLowerCase() ? -dir : dir);
        }

        if (value === 'progress') {
          // TODO: I would like for this to be in the Level model,
          //   but it doesn't know about its own courseNumber.
          const level1 = student1.latestCompleteLevel;
          const level2 = student2.latestCompleteLevel;
          if (!level1) { return -dir; }
          if (!level2) { return dir; }
          return dir * ((level1.courseNumber - level2.courseNumber) || (level1.levelIndex - level2.levelIndex));
        }

        if (value === 'status') {
          const statusMap = { expired: 0, 'not-enrolled': 1, enrolled: 2 };
          const diff = statusMap[student1.prepaidStatus()] - statusMap[student2.prepaidStatus()];
          if (diff) { return dir * diff; }
          return (student1.broadName().toLowerCase() < student2.broadName().toLowerCase() ? -dir : dir);
        }
      };

      this.courses = new Courses();
      this.supermodel.trackRequest(this.courses.fetch());

      this.courseInstances = new CourseInstances();
      this.supermodel.trackRequest(this.courseInstances.fetchForClassroom(classroomID));

      this.levels = new Levels();
      this.supermodel.trackRequest(this.levels.fetchForClassroom(classroomID, {data: {project: 'original,name,primaryConcepts,concepts,primerLanguage,practice,shareable,i18n,assessment,assessmentPlacement,slug,goals,displayName'}}));
      __guard__(me.getClientCreatorPermissions(), x => x.then(() => (typeof this.debouncedRender === 'function' ? this.debouncedRender() : undefined)));
      this.attachMediatorEvents();
      this.getLevelDisplayNameWithLabel = level => ozariaUtils.getLevelDisplayNameWithLabel(level);
      this.getIntroContentNameWithLabel = content => ozariaUtils.getIntroContentNameWithLabel(content);
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Loaded', {category: 'Teachers', classroomID: this.classroom.id});
      }
      this.onWindowResize = _.debounce(this.onWindowResize, 100);
      $(window).on('resize', this.onWindowResize);
      return this.timeSpentOnUnitProgress = null;
    }

    fetchStudents() {
      return Promise.all(this.students.fetchForClassroom(this.classroom, {removeDeleted: true, data: {project: 'firstName,lastName,name,email,coursePrepaid,coursePrepaidID,deleted'}}))
      .then(() => {
        if (this.destroyed) { return; }
        this.removeDeletedStudents(); // TODO: Move this to mediator listeners?
        this.calculateProgressAndLevels();
        return (typeof this.debouncedRender === 'function' ? this.debouncedRender() : undefined);
      });
    }

    fetchSessions() {
      return Promise.all(this.classroom.sessions.fetchForAllClassroomMembers(this.classroom))
      .then(() => {
        if (this.destroyed) { return; }
        this.removeDeletedStudents(); // TODO: Move this to mediator listeners?
        this.calculateProgressAndLevels();
        return (typeof this.debouncedRender === 'function' ? this.debouncedRender() : undefined);
      });
    }

    fetchInteractiveSessions() {
      const introLevelsContent = _.flatten(this.classroom.getLevels().models.filter(l => l.get('introContent')).map(l => l.get('introContent')));
      const language = __guard__(this.classroom.get('aceConfig'), x => x.language) || 'python';
      const interactiveIds = introLevelsContent.filter(c => c.type === 'interactive').map(c => (c.contentId || {})[language] || c.contentId) || [];
      if (interactiveIds.length > 0) {
        const interactivesSessionsFetch = fetchInteractiveSessionForAllClassroomMembers(this.classroom, {data: {interactiveIds}});
        return Promise.all(interactivesSessionsFetch)
        .then(interactiveSessions => {
          if (this.destroyed) { return; }
          this.interactiveSessions = interactiveSessions.flat();
          this.calculateInteractiveProgress();
          return (typeof this.debouncedRender === 'function' ? this.debouncedRender() : undefined);
        });
      }
    }

    attachMediatorEvents() {
      // Model/Collection events
      this.listenTo(this.classroom, 'sync change update', function() {
        const classCode = this.classroom.get('codeCamel') || this.classroom.get('code');
        this.state.set({
          classCode,
          joinURL: document.location.origin + "/students?_cc=" + classCode
        });
        this.sortedCourses = this.classroom.getSortedCourses();
        this.availableCourseMap = {};
        for (var course of Array.from(this.sortedCourses)) { this.availableCourseMap[course._id] = true; }
        return this.debouncedRender();
      });
      this.listenTo(this.courses, 'sync change update', function() {
        this.setCourseMembers(); // Is this necessary?
        if (!this.state.get('selectedCourse')) {
          this.state.set('selectedCourse', this.courses.first());
        }
        return this.setSelectedCourseInstance();
      });
      this.listenTo(this.courseInstances, 'sync change update', function() {
        this.setCourseMembers();
        return this.setSelectedCourseInstance();
      });
      this.listenTo(this.students, 'sync change update add remove reset', function() {
        // Set state/props of things that depend on students?
        // Set specific parts of state based on the models, rather than just dumping the collection there?
        this.calculateProgressAndLevels();
        this.state.set({students: this.students});
        const checkboxStates = {};
        for (var student of Array.from(this.students.models)) {
          checkboxStates[student.id] = this.state.get('checkboxStates')[student.id] || false;
        }
        return this.state.set({ checkboxStates });
    });
      this.listenTo(this.students, 'sort', function() {
        return this.state.set({students: this.students});
      });
      this.listenTo(this, 'course-select:change', function({ selectedCourse }) {
        return this.state.set({selectedCourse});
      });
      return this.listenTo(this.state, 'change:selectedCourse', function(e) {
        return this.setSelectedCourseInstance();
      });
    }

    setCourseMembers() {
      for (var course of Array.from(this.courses.models)) {
        course.instance = this.courseInstances.findWhere({ courseID: course.id, classroomID: this.classroom.id });
        course.members = (course.instance != null ? course.instance.get('members') : undefined) || [];
      }
      return null;
    }

    setSelectedCourseInstance() {
      const selectedCourse = this.state.get('selectedCourse') || this.courses.first();
      if (selectedCourse) {
        return this.state.set('selectedCourseInstance', this.courseInstances.findWhere({courseID: selectedCourse.id, classroomID: this.classroom.id}));
      } else if (this.state.get('selectedCourseInstance')) {
        return this.state.set('selectedCourseInstance', null);
      }
    }

    onLoaded() {
      // Get latest courses for student assignment dropdowns
      if (me.isAdmin()) {
        this.latestReleasedCourses = this.courses.models;
      } else if (me.isInternal()) {
        this.latestReleasedCourses = this.courses.filter(c => (c.get('releasePhase') === 'internalRelease') || (c.get('releasePhase') === 'released'));
      } else {
        this.latestReleasedCourses = this.courses.where({releasePhase: 'released'});
      }
      this.removeDeletedStudents(); // TODO: Move this to mediator listeners? For both classroom and students?
      this.calculateProgressAndLevels();

      // render callback setup
      this.listenTo(this.courseInstances, 'sync change update', this.debouncedRender);
      this.listenTo(this.state, 'sync change', function() {
        if (_.isEmpty(_.omit(this.state.changed, 'searchTerm'))) {
          return this.renderSelectors('#license-status-table');
        } else {
          return this.debouncedRender();
        }
      });
      this.listenTo(this.students, 'sort', this.debouncedRender);
      this.getCourseAssessmentPairs();
      this.setMeta({ title: `${$.i18n.t('teacher.my_classes')} | ${(this.classroom != null ? this.classroom.get('name') : undefined)} | ${$.i18n.t('common.ozaria')}` });
      return super.onLoaded();
    }

    afterRender() {
      super.afterRender(...arguments);
      if (!this.courseNagSubview) {
        this.courseNagSubview = new CourseNagSubview();
        this.insertSubView(this.courseNagSubview);
      }

      if (this.classroom.hasAssessments()) {
        let courseInstance;
        let levels = [];
        const course = this.state.get('selectedCourse');
        if (course) {
          levels = __guard__(_.find(this.courseAssessmentPairs, pair => pair[0] === course), x => x[1]) || [];
          levels = levels.map(l => l.toJSON());
          courseInstance = this.courseInstances.findWhere({ courseID: course.id, classroomID: this.classroom.id });
          if (courseInstance) {
            courseInstance = courseInstance.toJSON();
          }
        }
        const students = this.state.get('students').toJSON();

        const propsData = {
          students,
          levels,
          course: (course != null ? course.toJSON() : undefined),
          progress: __guard__(this.state.get('progressData'), x1 => x1.get({ classroom: this.classroom, course })),
          courseInstance,
          classroom: this.classroom.toJSON(),
          readOnly: this.state.get('readOnly')
        };

        new TeacherClassAssessmentsTable({
          el: this.$el.find('.assessments-table')[0],
          propsData
        });
        new PieChart({
          el: this.$el.find('.pie')[0],
          propsData: {
            percent: (100*2)/3,
            'strokeWidth': 10,
            color: "#20572B",
            opacity: 1
          }
        });
      }
      $('.has-tooltip').mouseenter(function() {
        let options;
        if ($(this).hasClass('course-tab')) {
          options = {
            html: true,
            container: $(this).closest('.module-container')
          };
        } else {
          options = { html: true };
        }
        $(this).tooltip(options);
        return $(this).tooltip('show');
      });
      $('.module-content').scroll(e => (typeof this.toggleModuleContainerFade === 'function' ? this.toggleModuleContainerFade($(e.currentTarget)) : undefined));
      return this.onWindowResize();
    }

    onWindowResize() {
      return $('.module-content').each((i,el) => {
        return (typeof this.toggleModuleContainerFade === 'function' ? this.toggleModuleContainerFade($(el)) : undefined);
      });
    }

    toggleModuleContainerFade(elem) {
      // Make room for floating point imprecision
      const delta = 1.5;
      if (Math.abs(elem[0].scrollWidth - elem.scrollLeft() - elem.outerWidth()) < delta) {
        elem.closest('.module-container').addClass('hide-fade-right');
        __guard__(elem.closest('.module-container').find('.scroll-arrow-right'), x => x.addClass('hide'));
      } else {
        elem.closest('.module-container').removeClass('hide-fade-right');
        __guard__(elem.closest('.module-container').find('.scroll-arrow-right'), x1 => x1.removeClass('hide'));
      }

      if (elem.scrollLeft() < delta) {
        elem.closest('.module-container').addClass('hide-fade-left');
        return __guard__(elem.closest('.module-container').find('.scroll-arrow-left'), x2 => x2.addClass('hide'));
      } else {
        elem.closest('.module-container').removeClass('hide-fade-left');
        return __guard__(elem.closest('.module-container').find('.scroll-arrow-left'), x3 => x3.removeClass('hide'));
      }
    }


    focusModuleContent(event) {
      return __guard__(event != null ? event.currentTarget : undefined, x => x.focus());
    }

    onClickScrollRight(e) {
      return __guardMethod__($(e.currentTarget).closest('.module-container').find('.module-content'), 'animate', o => o.animate({scrollLeft: '+=200px'}, 'slow'));
    }

    onClickScrollLeft(e) {
      return __guardMethod__($(e.currentTarget).closest('.module-container').find('.module-content'), 'animate', o => o.animate({scrollLeft: '-=200px'}, 'slow'));
    }

    reviewNeededTooltipHtml() {
      const tooltipHtml = `\
<div>
  <img src='/images/ozaria/teachers/content-icons/interactive-review.png'/>
  <span class='tooltip-label-text'>
    ${$.i18n.t('teacher.review_tooltip_heading')}
  </span>
  <div class='smallest-details review-tooltip-details'>
    ${$.i18n.t('teacher.review_tooltip_text')}
  </div>
</div>\
`;
      return tooltipHtml;
    }

    allStatsLoaded() {
      return ((this.classroom != null ? this.classroom.loaded : undefined) && (__guard__(this.classroom != null ? this.classroom.get('members') : undefined, x => x.length) === 0)) || ((this.students != null ? this.students.loaded : undefined) && __guard__(this.classroom != null ? this.classroom.sessions : undefined, x1 => x1.loaded));
    }

    calculateProgressAndLevelsAux() {
      if (this.destroyed) { return; }
      if ((this.supermodel.progress !== 1) || !this.allStatsLoaded()) { return; }
      const userLevelCompletedMap = this.classroom.sessions.models.reduce((map, session) => {
        if (session.completed()) {
          let name;
          if (map[name = session.get('creator')] == null) { map[name] = {}; }
          map[session.get('creator')][session.get('level').original.toString()] = true;
        }
        return map;
      }
      , {});
      // TODO: How to structure this in @state?
      for (var student of Array.from(this.students.models)) {
        // TODO: this is a weird hack
        var studentsStub = new Users([ student ]);
        student.latestCompleteLevel = helper.calculateLatestComplete(this.classroom, this.courses, this.courseInstances, studentsStub, userLevelCompletedMap);
      }
      const earliestIncompleteLevel = helper.calculateEarliestIncomplete(this.classroom, this.courses, this.courseInstances, this.students);
      const latestCompleteLevel = helper.calculateLatestComplete(this.classroom, this.courses, this.courseInstances, this.students, userLevelCompletedMap);

      const classroomsStub = new Classrooms([ this.classroom ]);
      const progressData = helper.calculateAllProgress(classroomsStub, this.courses, this.courseInstances, this.students);
      // conceptData: helper.calculateConceptsCovered(classroomsStub, @courses, @campaigns, @courseInstances, @students)

      return this.state.set({
        earliestIncompleteLevel,
        latestCompleteLevel,
        progressData,
        classStats: this.calculateClassStats()
      });
    }

    calculateInteractiveProgress() {
      const interactiveProgressData = helper.calculateAllProgressInteractives(new Classrooms([ this.classroom ]), this.interactiveSessions);
      return this.state.set({
        interactiveProgressData
      });
    }

    destroy() {
      $(window).off('resize', this.onWindowResize);
      this.trackTimeSpentOnUnitProgress();
      return super.destroy();
    }

    trackTimeSpentOnUnitProgress() {
      if (this.startTimeOnUnitProgress && !this.timeSpentOnUnitProgress) {
        this.timeSpentOnUnitProgress = new Date() - this.startTimeOnUnitProgress;
      }
      if (this.timeSpentOnUnitProgress) {
        if (application.tracker != null) {
          application.tracker.trackTiming(this.timeSpentOnUnitProgress, 'Teachers Time Spent', 'Unit Progress Tab', me.id);
        }
        return this.timeSpentOnUnitProgress = '';
      }
    }

    getCourseAssessmentPairs() {
      this.courseAssessmentPairs = [];
      for (var course of Array.from(this.courses.models)) {
        var needle;
        var assessmentLevels = this.classroom.getLevels({courseID: course.id, assessmentLevels: true}).models;
        var fullLevels = _.filter(this.levels.models, l => (needle = l.get('original'), Array.from(_.map(assessmentLevels, l2=> l2.get('original'))).includes(needle)));
        this.courseAssessmentPairs.push([course, fullLevels]);
      }
      return this.courseAssessmentPairs;
    }

    onClickNavTabLink(e) {
      e.preventDefault();
      const hash = $(e.target).closest('a').attr('href');
      if (hash !== window.location.hash) {
        const tab = hash.slice(1);
        if (window.tracker != null) {
          window.tracker.trackEvent('Teachers Class Switch Tab', { category: 'Teachers', classroomID: this.classroom.id, tab, label: tab });
        }
      }
      this.updateHash(hash);
      return this.state.set({activeTab: hash});
    }

    updateHash(hash) {
      if (application.testing) { return; }
      window.location.hash = hash;
      if ((hash === '#course-progress-tab') && !this.startTimeOnUnitProgress) {
        return this.startTimeOnUnitProgress = new Date();
      } else if (this.startTimeOnUnitProgress) {
        this.timeSpentOnUnitProgress = new Date() - this.startTimeOnUnitProgress;
        this.startTimeOnUnitProgress = null;
        return this.trackTimeSpentOnUnitProgress();
      }
    }

    onClickFlaggedDot() {
      return (window.tracker != null ? window.tracker.trackEvent('Teachers Click Concept check flag', { category: 'Teachers', label: this.classroom.id }) : undefined);
    }

    trackClickEvent(e) {
      const eventAction = $(e.currentTarget).data('event-action');
      if (eventAction) {
        return (window.tracker != null ? window.tracker.trackEvent(eventAction, { category: 'Teachers', label: this.classroom.id }) : undefined);
      }
    }

    onClickCopyCodeButton() {
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Copy Class Code', {category: 'Teachers', classroomID: this.classroom.id, classCode: this.state.get('classCode')});
      }
      this.$('#join-code-input').val(this.state.get('classCode')).select();
      return this.tryCopy();
    }

    onClickCopyURLButton() {
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Copy Class URL', {category: 'Teachers', classroomID: this.classroom.id, url: this.state.get('joinURL')});
      }
      this.$('#join-url-input').val(this.state.get('joinURL')).select();
      return this.tryCopy();
    }

    onClickUnarchive() {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Unarchive', {category: 'Teachers', classroomID: this.classroom.id});
      }
      return this.classroom.save({ archived: false });
    }

    onClickEditClassroom(e) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Edit Class Started', {category: 'Teachers', classroomID: this.classroom.id});
      }
      return this.promptToEdit();
    }

    promptToEdit() {
      const {
        classroom
      } = this;
      const modal = new ClassroomSettingsModal({ classroom });
      this.openModalView(modal);
      return this.listenToOnce(modal, 'hide', this.render);
    }

    onClickEditStudentLink(e) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Students Edit', {category: 'Teachers', classroomID: this.classroom.id});
      }
      const user = this.students.get($(e.currentTarget).data('student-id'));
      const modal = new EditStudentModal({ user, classroom: this.classroom });
      return this.openModalView(modal);
    }

    onClickRemoveStudentLink(e) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      const user = this.students.get($(e.currentTarget).data('student-id'));
      const modal = new RemoveStudentModal({
        classroom: this.classroom,
        user,
        courseInstances: this.courseInstances
      });
      this.openModalView(modal);
      return modal.once('remove-student', this.onStudentRemoved, this);
    }

    onStudentRemoved(e) {
      this.students.remove(e.user);
      return (window.tracker != null ? window.tracker.trackEvent('Teachers Class Students Removed', {category: 'Teachers', classroomID: this.classroom.id, userID: e.user.id}) : undefined);
    }

    onClickAddStudents(e) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Add Students', {category: 'Teachers', classroomID: this.classroom.id});
      }
      const modal = new InviteToClassroomModal({ classroom: this.classroom });
      this.openModalView(modal);
      return this.listenToOnce(modal, 'hide', this.render);
    }

    removeDeletedStudents() {
      if (!this.classroom.loaded || !this.students.loaded) { return; }
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      _.remove(this.classroom.get('members'), memberID => {
        return !this.students.get(memberID) || __guard__(this.students.get(memberID), x => x.get('deleted'));
      });
      return true;
    }

    onClickSortButton(e) {
      const value = $(e.target).val();
      if (value === this.state.get('sortValue')) {
        this.state.set('sortDirection', -this.state.get('sortDirection'));
      } else {
        this.state.set({
          sortValue: value,
          sortDirection: 1
        });
      }
      return this.students.sort();
    }

    onKeyPressStudentSearch(e) {
      return this.state.set('searchTerm', $(e.target).val());
    }

    onChangeCourseSelect(e) {
      return this.trigger('course-select:change', { selectedCourse: this.courses.get($(e.currentTarget).val()) });
    }

    getSelectedStudentIDs() {
      return Object.keys(_.pick(this.state.get('checkboxStates'), checked => checked));
    }

    ensureInstance(courseID) {}

    onClickEnrollStudentButton(e) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      const userID = $(e.currentTarget).data('user-id');
      const user = this.students.get(userID);
      const selectedUsers = new Users([user]);
      this.enrollStudents(selectedUsers);
      return window.tracker != null ? window.tracker.trackEvent($(e.currentTarget).data('event-action'), {category: 'Teachers', classroomID: this.classroom.id, userID}) : undefined;
    }

    enrollStudents(selectedUsers) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      const modal = new ActivateLicensesModal({ classroom: this.classroom, selectedUsers, users: this.students });
      this.openModalView(modal);
      return modal.once('redeem-users', enrolledUsers => {
        enrolledUsers.each(newUser => {
          const user = this.students.get(newUser.id);
          if (user) {
            return user.set(newUser.attributes);
          }
        });
        return null;
      });
    }

    onClickExportStudentProgress() {
      // TODO: Does not yield .csv download on Safari, and instead opens a new tab with the .csv contents
      let course, index, trimCourse, trimLevel;
      let c;
      if (window.tracker != null) {
        window.tracker.trackEvent('Teachers Class Export CSV', {category: 'Teachers', classroomID: this.classroom.id});
      }
      let courseLabels = "";
      const courses = ((() => {
        const result = [];
        for (c of Array.from(this.sortedCourses)) {           result.push(this.courses.get(c._id));
        }
        return result;
      })());
      const courseLabelsArray = helper.courseLabelsArray(courses);
      for (index = 0; index < courses.length; index++) {
        course = courses[index];
        courseLabels += `${courseLabelsArray[index]} Levels,${courseLabelsArray[index]} Playtime,`;
      }
      let csvContent = `Name,Username,Email,Total Levels,Total Playtime,${courseLabels}Concepts\n`;
      const levelCourseIdMap = {};
      const levelPracticeMap = {};
      const language = __guard__(this.classroom.get('aceConfig'), x => x.language);
      for (trimCourse of Array.from(this.classroom.getSortedCourses())) {
        for (trimLevel of Array.from(trimCourse.levels)) {
          if (language && (trimLevel.primerLanguage === language)) { continue; }
          if (trimLevel.practice) {
            levelPracticeMap[trimLevel.original] = true;
            continue;
          }
          levelCourseIdMap[trimLevel.original] = trimCourse._id;
        }
      }
      for (var student of Array.from(this.students.models)) {
        var courseID, level;
        var concepts = [];
        for (trimCourse of Array.from(this.classroom.getSortedCourses())) {
          course = this.courses.get(trimCourse._id);
          var instance = this.courseInstances.findWhere({ courseID: course.id, classroomID: this.classroom.id });
          if (instance && instance.hasMember(student)) {
            for (trimLevel of Array.from(trimCourse.levels)) {
              level = this.levels.findWhere({ original: trimLevel.original });
              if (level.get('assessment')) { continue; }
              var progress = this.state.get('progressData').get({ classroom: this.classroom, course, level, user: student });
              if (progress != null ? progress.completed : undefined) { var left;
              concepts.push((left = level.get('concepts')) != null ? left : []); }
            }
          }
        }
        concepts = _.union(_.flatten(concepts));
        var conceptsString = _.map(concepts, c => $.i18n.t("concepts." + c)).join(', ');
        var courseCountsMap = {};
        var levels = 0;
        var playtime = 0;
        for (var session of Array.from(this.classroom.sessions.models)) {
          if (session.get('creator') !== student.id) { continue; }
          if (!__guard__(session.get('state'), x1 => x1.complete)) { continue; }
          if (levelPracticeMap[__guard__(session.get('level'), x2 => x2.original)]) { continue; }
          level = this.levels.findWhere({ original: __guard__(session.get('level'), x3 => x3.original) });
          if (level != null ? level.get('assessment') : undefined) { continue; }
          levels++;
          playtime += session.get('playtime') || 0;
          if (courseID = levelCourseIdMap[__guard__(session.get('level'), x4 => x4.original)]) {
            if (courseCountsMap[courseID] == null) { courseCountsMap[courseID] = {levels: 0, playtime: 0}; }
            courseCountsMap[courseID].levels++;
            courseCountsMap[courseID].playtime += session.get('playtime') || 0;
          }
        }
        var playtimeString = playtime === 0 ? "0" : moment.duration(playtime, 'seconds').humanize();
        for (course of Array.from(this.sortedCourses)) {
          if (courseCountsMap[course._id] == null) { courseCountsMap[course._id] = {levels: 0, playtime: 0}; }
        }
        var courseCounts = [];
        for (course of Array.from(this.sortedCourses)) {
          courseID = course._id;
          var data = courseCountsMap[courseID];
          courseCounts.push({
            id: courseID,
            levels: data.levels,
            playtime: data.playtime
          });
        }
        utils.sortCourses(courseCounts);
        var courseCountsString = "";
        for (index = 0; index < courseCounts.length; index++) {
          var counts = courseCounts[index];
          courseCountsString += `${counts.levels},`;
          if (counts.playtime === 0) {
            courseCountsString += "0,";
          } else {
            courseCountsString += `${moment.duration(counts.playtime, 'seconds').humanize()},`;
          }
        }
        csvContent += `${student.broadName()},${student.get('name')},${student.get('email') || ''},${levels},${playtimeString},${courseCountsString}\"${conceptsString}\"\n`;
      }
      csvContent = csvContent.substring(0, csvContent.length - 1);
      const file = new Blob([csvContent], {type: 'text/csv;charset=utf-8'});
      return window.saveAs(file, 'CodeCombat.csv');
    }

    onClickAssignStudentButton(e) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      const userID = $(e.currentTarget).data('user-id');
      const user = this.students.get(userID);
      const members = [userID];
      const courseID = $(e.currentTarget).data('course-id');
      this.assignCourse(courseID, members);
      return window.tracker != null ? window.tracker.trackEvent('Teachers Class Students Assign Selected', {category: 'Teachers', classroomID: this.classroom.id, courseID, userID}) : undefined;
    }

    onClickBulkAssign() {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      const courseID = this.$('.bulk-course-select').val();
      const selectedIDs = this.getSelectedStudentIDs();
      const nobodySelected = selectedIDs.length === 0;
      this.state.set({errors: { nobodySelected }});
      if (nobodySelected) { return; }
      this.assignCourse(courseID, selectedIDs);
      return window.tracker != null ? window.tracker.trackEvent('Teachers Class Students Assign Selected', {category: 'Teachers', classroomID: this.classroom.id, courseID}) : undefined;
    }

    onClickBulkRemoveCourse() {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      const courseID = this.$('.bulk-course-select').val();
      const selectedIDs = this.getSelectedStudentIDs();
      const nobodySelected = selectedIDs.length === 0;
      this.state.set({errors: { nobodySelected }});
      if (nobodySelected) { return; }
      this.removeCourse(courseID, selectedIDs);
      return window.tracker != null ? window.tracker.trackEvent('Teachers Class Students Remove-Course Selected', {category: 'Teachers', classroomID: this.classroom.id, courseID}) : undefined;
    }

    assignCourse(courseID, members) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      let courseInstance = null;
      let numberEnrolled = 0;
      let remainingSpots = 0;

      return Promise.resolve()
      // Find or make the necessary course instances
      .then(() => {
        courseInstance = this.courseInstances.findWhere({ courseID, classroomID: this.classroom.id });
        if (!courseInstance) {
          courseInstance = new CourseInstance({
            courseID,
            classroomID: this.classroom.id,
            ownerID: this.classroom.get('ownerID'),
            aceConfig: {}
          });
          courseInstance.notyErrors = false; // handling manually
          this.courseInstances.add(courseInstance);
          return courseInstance.save();
        }
    }).then(() => {
        // Find the prepaids and users we're acting on (for both starter and full license cases)
        let prepaid;
        const availablePrepaids = this.prepaids.filter(prepaid => (prepaid.status() === 'available') && prepaid.includesCourse(courseID));
        const unenrolledStudents = _(members)
          .map(userID => this.students.get(userID))
          .filter(user => !user.isEnrolled() || !user.prepaidIncludesCourse(courseID))
          .value();
        const totalSpotsAvailable = _.reduce(((() => {
          const result = [];
          for (prepaid of Array.from(availablePrepaids)) {             result.push(prepaid.openSpots());
          }
          return result;
        })()), (val, total) => val + total) || 0;

        const canAssignCourses = totalSpotsAvailable >= _.size(unenrolledStudents);
        if (!canAssignCourses) {
          // These ones just matter for display
          const availableFullLicenses = this.prepaids.filter(prepaid => (prepaid.status() === 'available') && (prepaid.get('type') === 'course'));
          const numStudentsWithoutFullLicenses = _(members)
            .map(userID => this.students.get(userID))
            .filter(user => (user.prepaidType() !== 'course') || !user.isEnrolled())
            .size();
          const numFullLicensesAvailable = _.reduce(((() => {
            const result1 = [];
            for (prepaid of Array.from(availableFullLicenses)) {               result1.push(prepaid.openSpots());
            }
            return result1;
          })()), (val, total) => val + total) || 0;
          const modal = new CoursesNotAssignedModal({
            selected: members.length,
            numStudentsWithoutFullLicenses,
            numFullLicensesAvailable,
            courseID
          });
          this.openModalView(modal);
          const error = new Error('Not enough licenses available');
          error.handled = true;
          throw error;
        }

        numberEnrolled = _.size(unenrolledStudents);
        remainingSpots = totalSpotsAvailable - numberEnrolled;

        const requests = [];

        for (prepaid of Array.from(availablePrepaids)) {
          if (Math.min(_.size(unenrolledStudents), prepaid.openSpots()) > 0) {
            for (var i = 0, end = Math.min(_.size(unenrolledStudents), prepaid.openSpots()), asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
              var user = unenrolledStudents.shift();
              requests.push(prepaid.redeem(user));
            }
          }
        }

        this.trigger('begin-redeem-for-assign-course');
        return $.when(...Array.from(requests || []));
        }).then(() => {
        // refresh prepaids, since the racing multiple parallel redeem requests in the previous `then` probably did not
        // end up returning the final result of all those requests together.
        this.prepaids.fetchByCreator(me.id);
        this.fetchStudents();

        this.trigger('begin-assign-course'); // Only used for test automation
        if (members.length) {
          noty({text: $.i18n.t('teacher.assigning_course'), layout: 'center', type: 'information', killer: true});
          return courseInstance.addMembers(members);
        }
      }).then(() => {
        const course = this.courses.get(courseID);
        const lines = [
          $.i18n.t('teacher.assigned_msg_1')
            .replace('{{numberAssigned}}', members.length)
            .replace('{{courseName}}', course.get('name'))
        ];
        if (numberEnrolled > 0) {
          lines.push(
            $.i18n.t('teacher.assigned_msg_2')
              .replace('{{numberEnrolled}}', numberEnrolled)
          );
          lines.push(
            $.i18n.t('teacher.assigned_msg_3')
            .replace('{{remainingSpots}}', remainingSpots)
          );
        }
        noty({text: lines.join('<br />'), layout: 'center', type: 'information', killer: true, timeout: 5000});

        // TODO: refresh existing student progress. student may have progress from outside current classroom, and the course may have been updated upon assignment
        this.calculateProgressAndLevels();
        return this.classroom.fetch();
        }).catch(e => {
        // TODO: Use this handling for errors site-wide?
        if (e.handled) { return; }
        if (e instanceof Error && !application.isProduction()) { throw e; }
        const text = e instanceof Error ? 'Runtime error' : (e.responseJSON != null ? e.responseJSON.message : undefined) || e.message || $.i18n.t('loading_error.unknown');
        return noty({ text, layout: 'center', type: 'error', killer: true, timeout: 5000 });
      });
    }

    removeCourse(courseID, members) {
      if (me.id !== this.classroom.get('ownerID')) { return; } // May be viewing page as admin
      let courseInstance = null;
      let membersBefore = 0;

      return Promise.resolve()
      // Find the necessary course instance
      .then(() => {
        courseInstance = this.courseInstances.findWhere({ courseID, classroomID: this.classroom.id });
        if (courseInstance) {
          membersBefore = courseInstance.get('members').length;
        }
        // if not courseInstance
        // TODO: show some message if no courseInstance?
        return courseInstance;
    }).then(() => {
        this.fetchStudents();

        this.trigger('begin-remove-course'); // Only used for test automation
        if (members.length) {
          noty({text: $.i18n.t('teacher.removing_course'), layout: 'center', type: 'information', killer: true});
          return (courseInstance != null ? courseInstance.removeMembers(members) : undefined);
        }
      }).then(res => {
        const membersAfter = (courseInstance != null ? courseInstance.get('members').length : undefined) || 0;
        const numberRemoved = membersBefore - membersAfter;
        const course = this.courses.get(courseID);
        const lines = [
          $.i18n.t('teacher.removed_course_msg')
            .replace('{{numberRemoved}}', numberRemoved)
            .replace('{{courseName}}', course.get('name'))
        ];
        noty({text: lines.join('<br />'), layout: 'center', type: 'information', killer: true, timeout: 5000});

        this.calculateProgressAndLevels();
        return this.classroom.fetch();
      });
    }

    onClickRevokeStudentButton(e) {
      const button = $(e.currentTarget);
      const userID = button.data('user-id');
      const user = this.students.get(userID);
      const s = $.i18n.t('teacher.revoke_confirm').replace('{{student_name}}', user.broadName());
      if (!confirm(s)) { return; }
      const prepaid = user.makeCoursePrepaid();
      button.text($.i18n.t('teacher.revoking'));
      return prepaid.revoke(user, {
        success: () => {
          return user.unset('coursePrepaid');
        },
        error: (prepaid, jqxhr) => {
          const msg = jqxhr.responseJSON.message;
          return noty({text: msg, layout: 'center', type: 'error', killer: true, timeout: 3000});
        },
        complete: () => this.debouncedRender()
      });
    }

    onClickRevokeAllStudentsButton() {
      const s = $.i18n.t('teacher.revoke_all_confirm');
      if (!confirm(s)) { return; }
      return (() => {
        const result = [];
        for (var student of Array.from(this.students.models)) {
          var status = student.prepaidStatus();
          if ((status === 'enrolled') && (student.prepaidType() === 'course')) {
            var prepaid = student.makeCoursePrepaid();
            result.push(prepaid.revoke(student, {
              // The for loop completes before the success callback for the first student executes.
              // So, the `student` will be the last student when the callback executes.
              // Therefore, using a self calling anonymous function for the success callback
              // to retain the student data for each iteration.
              // Reference: https://www.pluralsight.com/guides/javascript-callbacks-variable-scope-problem
              success: (function() {
                const st = student;
                return () => st.unset('coursePrepaid');
              })(),
              error: (prepaid, jqxhr) => {
                const msg = jqxhr.responseJSON.message;
                return noty({text: msg, layout: 'center', type: 'error', killer: true, timeout: 3000});
              },
              complete: () => this.debouncedRender()
            }));
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    }

    onClickSelectAll(e) {
      let studentID;
      e.preventDefault();
      const checkboxStates = _.clone(this.state.get('checkboxStates'));
      if (_.all(checkboxStates)) {
        for (studentID in checkboxStates) {
          checkboxStates[studentID] = false;
        }
      } else {
        for (studentID in checkboxStates) {
          checkboxStates[studentID] = true;
        }
      }
      return this.state.set({ checkboxStates });
    }

    onClickStudentCheckbox(e) {
      e.preventDefault();
      const checkbox = $(e.currentTarget).find('input');
      const studentID = checkbox.data('student-id');
      const checkboxStates = _.clone(this.state.get('checkboxStates'));
      checkboxStates[studentID] = !checkboxStates[studentID];
      return this.state.set({ checkboxStates });
    }

    onClickStudentProgressDot(e) {
      const classroomId = this.classroom.id;
      const courseId = this.$(e.currentTarget).data('course-id');
      const studentId = this.$(e.currentTarget).data('student-id');
      const levelSlug = this.$(e.currentTarget).data('level-slug');
      const levelProgress = this.$(e.currentTarget).data('level-progress');
      return (window.tracker != null ? window.tracker.trackEvent('Click Class Courses Tab Student Progress Dot', {category: 'Teachers', classroomId, courseId, studentId, levelSlug, levelProgress}) : undefined);
    }

    calculateClassStats() {
      if (!(this.classroom.sessions != null ? this.classroom.sessions.loaded : undefined) || !this.students.loaded) { return {}; }
      const stats = {};

      let playtime = 0;
      let total = 0;
      for (var session of Array.from(this.classroom.sessions.models)) {
        var pt = session.get('playtime') || 0;
        playtime += pt;
        total += 1;
      }
      stats.averagePlaytime = playtime && total ? moment.duration(playtime / total, "seconds").humanize() : 0;
      stats.totalPlaytime = playtime ? moment.duration(playtime, "seconds").humanize() : 0;
      // TODO: Humanize differently ('1 hour' instead of 'an hour')

      const levelIncludeMap = {};
      const language = __guard__(this.classroom.get('aceConfig'), x => x.language);
      for (var level of Array.from(this.levels.models)) {
        levelIncludeMap[level.get('original')] = !level.get('practice') && ((language == null) || (level.get('primerLanguage') !== language));
      }
      const completeSessions = this.classroom.sessions.filter(s => __guard__(s.get('state'), x1 => x1.complete) && levelIncludeMap[__guard__(s.get('level'), x2 => x2.original)]);
      stats.averageLevelsComplete = this.students.size() ? (_.size(completeSessions) / this.students.size()).toFixed(1) : 'N/A';  // '
      stats.totalLevelsComplete = _.size(completeSessions);

      const enrolledUsers = this.students.filter(user => user.isEnrolled());
      stats.enrolledUsers = _.size(enrolledUsers);

      return stats;
    }

    studentStatusString(student) {
      const status = student.prepaidStatus();
      const expires = __guard__(student.get('coursePrepaid'), x => x.endDate);
      const date = (expires != null) ? moment(expires).utc().format('ll') : '';
      return utils.formatStudentLicenseStatusDate(status, date);
    }

    getTopScore({level, session}) {
      if (!level || !session) { return; }
      let scoreType = _.first(level.get('scoreTypes'));
      if (_.isObject(scoreType)) {
        scoreType = scoreType.type;
      }
      const topScores = LevelSession.getTopScores({level: level.toJSON(), session: session.toJSON()});
      const topScore = _.find(topScores, {type: scoreType});
      return topScore;
    }

    shouldShowGoogleClassroomButton() {
      return me.useGoogleClassroom() && this.classroom.isGoogleClassroom();
    }

    onClickSyncGoogleClassroom(e) {
      $('.sync-google-classroom-btn').text("Syncing...");
      $('.sync-google-classroom-btn').attr('disabled', true);
      return application.gplusHandler.loadAPI({
        success: () => {
          return application.gplusHandler.connect({
            scope: GoogleClassroomHandler.scopes,
            success: () => {
              return this.syncGoogleClassroom();
            },
            error: () => {
              $('.sync-google-classroom-btn').text($.i18n.t('teacher.sync_google_classroom'));
              return $('.sync-google-classroom-btn').attr('disabled', false);
            }
          });
        }
      });
    }

    syncGoogleClassroom() {
      return GoogleClassroomHandler.importStudentsToClassroom(this.classroom)
      .then(importedMembers => {
        if (importedMembers.length > 0) {
          console.debug("Students imported to classroom:", importedMembers);

          if (this.students.length === 0) {
            this.students = new Users(importedMembers);
            this.state.set('students', this.students);
          }
          for (var course of Array.from(this.courses.models)) {
            if (!course.get('free')) { continue; }
            var courseInstance = this.courseInstances.findWhere({classroomID: this.classroom.get("_id"), courseID: course.id});
            if (courseInstance) {
              importedMembers.forEach(i => courseInstance.get("members").push(i._id));
            }
          }
          return this.fetchStudents();
        }
      }
      , err => {
        return noty({text: err || 'Error in importing students.', layout: 'topCenter', timeout: 3000, type: 'error'});
    }).then(() => {
        $('.sync-google-classroom-btn').text($.i18n.t('teacher.sync_google_classroom'));
        return $('.sync-google-classroom-btn').attr('disabled', false);
      });
    }

    markdownIt(content) {
      if (!content) { return ''; }
      return DOMPurify.sanitize(marked(content));
    }
  };
  TeacherClassView.initClass();
  return TeacherClassView;
})());

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}