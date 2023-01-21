/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */
let MineModal;
require('app/styles/modal/mine-modal.sass');
const ModalView = require('views/core/ModalView');
const template = require('app/templates/core/mine-modal');
const Products = require('collections/Products');

// define expectations for good rates before releasing

module.exports = (MineModal = (function() {
  MineModal = class MineModal extends ModalView {
    static initClass() {
      this.prototype.id = 'mine-modal';
      this.prototype.template = template;
      this.prototype.hasAnimated = false;
      this.prototype.events = {
        'click #close-modal': 'hide',
        'click #buy-now-button': 'onBuyNowButtonClick',
        'click #submit-button': 'onSubmitButtonClick'
      };
    }

    constructor(options) {
      this.onBuyNowButtonClick = this.onBuyNowButtonClick.bind(this);
      if (options == null) { options = {}; }
      super(options);
      this.products = new Products();
      this.supermodel.loadCollection(this.products, 'products');
    }

    onLoaded() {
      this.basicProduct = this.products.getBasicSubscriptionForUser(me);
      if (this.basicProduct) {
        this.price = (this.basicProduct.get('amount') / 100).toFixed(2);
      }
      return super.onLoaded();
    }

    onBuyNowButtonClick(e) {
      if (window.tracker != null) {
        window.tracker.trackEvent("Mine Explored", {engageAction: "buy_button_click"});
      }
      $("#buy-now-button").hide();
      $("#submit-button").show();
      $("#details-header").text("Thanks for your interest");
      $("#info-text").hide();
      return $("#capacity-text").show();
    }

    onSubmitButtonClick(e) {
      if ($("#notify-me-check:checked").length > 0) {
        if (window.tracker != null) {
          window.tracker.trackEvent("Mine Explored", {engageAction: "notify_check_box_click"});
        }
      }
      if (window.tracker != null) {
        window.tracker.trackEvent("Mine Explored", {engageAction: "submit_button_click"});
      }
      return this.hide();
    }

    destroy() {
      $("#modal-wrapper").off('mousemove');
      return super.destroy();
    }
  };
  MineModal.initClass();
  return MineModal;
})());
