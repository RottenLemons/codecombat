/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS104: Avoid inline assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let MyMatchesTabView;
require('app/styles/play/ladder/my_matches_tab.sass');
const CocoView = require('views/core/CocoView');
const Level = require('models/Level');
const LevelSession = require('models/LevelSession');
const LeaderboardCollection  = require('collections/LeaderboardCollection');
const LadderSubmissionView = require('views/play/common/LadderSubmissionView');
const {teamDataFromLevel, scoreForDisplay} = require('./utils');
require('d3/d3.js');

module.exports = (MyMatchesTabView = (function() {
  MyMatchesTabView = class MyMatchesTabView extends CocoView {
    constructor(...args) {
      this.generateScoreLineChart = this.generateScoreLineChart.bind(this);
      super(...args);
    }

    static initClass() {
      this.prototype.id = 'my-matches-tab-view';
      this.prototype.template = require('app/templates/play/ladder/my_matches_tab');
    }

    initialize(options, level, sessions) {
      this.level = level;
      this.sessions = sessions;
      this.nameMap = {};
      this.previouslyRankingTeams = {};
      return this.refreshMatches(20);
    }

    refreshMatches(refreshDelay) {
      let match;
      this.refreshDelay = refreshDelay;
      this.teams = teamDataFromLevel(this.level);

      const convertMatch = (match, submitDate) => {
        const opponent = match.opponents[0];
        let state = 'win';
        if (match.metrics.rank > opponent.metrics.rank) { state = 'loss'; }
        if (match.metrics.rank === opponent.metrics.rank) { state = 'tie'; }
        const fresh = match.date > (new Date(new Date() - (this.refreshDelay * 1000))).toISOString();
        if (fresh) {
          this.playSound('chat_received');
        }
        return {
          state,
          opponentName: this.nameMap[opponent.userID],
          opponentID: opponent.userID,
          when: moment(match.date).fromNow(),
          sessionID: opponent.sessionID,
          stale: match.date < submitDate,
          fresh,
          codeLanguage: match.codeLanguage,
          simulator: match.simulator ? JSON.stringify(match.simulator) + ' | seed ' + match.randomSeed : ''
        };
      };

      for (var team of Array.from(this.teams)) {
        team.session = ((() => {
          const result = [];
          for (var s of Array.from(this.sessions.models)) {             if (s.get('team') === team.id) {
              result.push(s);
            }
          }
          return result;
        })())[0];
        var stats = this.statsFromSession(team.session);
        team.readyToRank = team.session != null ? team.session.readyToRank() : undefined;
        team.isRanking = team.session != null ? team.session.get('isRanking') : undefined;
        team.matches = ((() => {
          const result1 = [];
          for (match of Array.from(((stats != null ? stats.matches : undefined) || []))) {             result1.push(convertMatch(match, team.session.get('submitDate')));
          }
          return result1;
        })());
        team.matches.reverse();
        team.score = ((stats != null ? stats.totalScore : undefined) != null ? (stats != null ? stats.totalScore : undefined) : 10).toFixed(2);
        team.wins = _.filter(team.matches, {state: 'win', stale: false}).length;
        team.ties = _.filter(team.matches, {state: 'tie', stale: false}).length;
        team.losses = _.filter(team.matches, {state: 'loss', stale: false}).length;
        var scoreHistory = stats != null ? stats.scoreHistory : undefined;
        if ((scoreHistory != null ? scoreHistory.length : undefined) > 1) {
          team.scoreHistory = scoreHistory;
        }

        if (!team.isRanking && this.previouslyRankingTeams[team.id]) {
          this.playSound('cast-end');
        }
        this.previouslyRankingTeams[team.id] = team.isRanking;
      }

      return this.loadNames();
    }

    loadNames() {
      // Only fetch the names for the userIDs we don't already have in @nameMap
      let match, matches, session;
      let ids = [];
      for (session of Array.from(this.sessions.models)) {
        matches = this.statsFromSession(session).matches || [];
        for (match of Array.from(matches)) {
          var id = match.opponents[0].userID;
          if (!id) {
            console.error('Found bad opponent ID in malformed match:', match, 'from session', session);
            continue;
          }
          if (!this.nameMap[id]) { ids.push(id); }
        }
      }

      ids = _.uniq(ids);
      if (!ids.length) { return; }

      const success = nameMap => {
        if (this.destroyed) { return; }
        for (session of Array.from(this.sessions.models)) {
          matches = this.statsFromSession(session).matches || [];
          for (match of Array.from(matches)) {
            var opponent = match.opponents[0];
            if (this.nameMap[opponent.userID]) { continue; }
            var opponentUser = nameMap[opponent.userID];
            var name = opponentUser != null ? opponentUser.name : undefined;
            if (opponentUser != null ? opponentUser.firstName : undefined) { if (!name) { name = opponentUser.firstName + ' ' + opponentUser.lastName; } }
            if (opponentUser) { if (!name) { name = `Anonymous ${opponent.userID.substr(18)}`; } }
            if (!name) {
              console.log('found', nameMap[opponent.userID], 'for', opponent.userID, `http://codecombat.com/db/user/${opponent.userID}`);
            }
            if (!name) { name = '<bad match data>'; }
            if (name.length > 21) {
              name = name.substr(0, 18) + '...';
            }
            this.nameMap[opponent.userID] = name;
          }
        }
        if (this.supermodel.finished()) { return this.render(); }
      };

      const userNamesRequest = this.supermodel.addRequestResource('user_names', {
        url: '/db/user/-/names',
        data: {ids},
        method: 'POST',
        success
      }, 0);
      return userNamesRequest.load();
    }

    afterRender() {
      super.afterRender();
      for (var key in this.subviews) { var subview = this.subviews[key]; if (subview instanceof LadderSubmissionView) { this.removeSubView(subview); } }
      this.$el.find('.ladder-submission-view').each((i, el) => {
        let mirrorSession, needle;
        const placeholder = $(el);
        const sessionID = placeholder.data('session-id');
        const session = _.find(this.sessions.models, {id: sessionID});
        if (this.level.get('mirrorMatch') || (needle = this.level.get('slug'), ['ace-of-coders', 'elemental-wars', 'the-battle-of-sky-span', 'tesla-tesoro', 'escort-duty', 'treasure-games', 'king-of-the-hill'].includes(needle))) {  // TODO: remove slug list once these levels are configured as mirror matches
          mirrorSession = ((() => {
            const result = [];
            for (var s of Array.from(this.sessions.models)) {               if (s.get('team') !== session.get('team')) {
                result.push(s);
              }
            }
            return result;
          })())[0];
        }
        const ladderSubmissionView = new LadderSubmissionView({session, level: this.level, mirrorSession});
        return this.insertSubView(ladderSubmissionView, placeholder);
      });

      this.$el.find('.score-chart-wrapper').each((i, el) => {
        const scoreWrapper = $(el);
        const team = _.find(this.teams, {name: scoreWrapper.data('team-name')});
        return this.generateScoreLineChart(scoreWrapper.attr('id'), team.scoreHistory, team.name);
      });

      return this.$el.find('tr.fresh').removeClass('fresh', 5000);
    }

    statsFromSession(session) {
      if (!session) { return null; }
      if (this.options.league) {
        let left;
        return (left = __guard__(_.find(session.get('leagues') || [], {leagueID: this.options.league.id}), x => x.stats)) != null ? left : {};
      }
      return session.attributes;
    }

    generateScoreLineChart(wrapperID, scoreHistory, teamName) {
      const margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
      };

      const width = 450 - margin.left - margin.right;
      const height = 125;
      const x = d3.time.scale().range([0, width]);
      const y = d3.scale.linear().range([height, 0]);

      const xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(4).outerTickSize(0);
      const yAxis = d3.svg.axis().scale(y).orient('left').ticks(4).outerTickSize(0);

      const line = d3.svg.line().x((d => x(d.date))).y(d => y(d.close));
      const selector = '#' + wrapperID;

      const svg = d3.select(selector).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      let time = 0;
      const data = scoreHistory.map(function(d) {
        time +=1;
        return {
          date: time,
          close: scoreForDisplay(d[1])
        };});

      x.domain(d3.extent(data, d => d.date));
      let [yMin, yMax] = Array.from(d3.extent(data, d => d.close));
      const axisFactor = 500;
      const yRange = yMax - yMin;
      const yMid = yMin + (yRange / 2);
      yMin = Math.min(yMin, yMid - axisFactor);
      yMax = Math.max(yMax, yMid + axisFactor);
      y.domain([yMin, yMax]);

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 4)
        .attr('dy', '.75em')
        .style('text-anchor', 'end')
        .text('Score');
      let lineClass = 'line';
      if (teamName.toLowerCase() === 'ogres') { lineClass = 'ogres-line'; }
      if (teamName.toLowerCase() === 'humans') { lineClass = 'humans-line'; }
      return svg.append('path')
        .datum(data)
        .attr('class', lineClass)
        .attr('d', line);
    }
  };
  MyMatchesTabView.initClass();
  return MyMatchesTabView;
})());

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}