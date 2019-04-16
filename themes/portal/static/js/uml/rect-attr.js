"use strict";

Uml.RectAttr = function (data, rect) {
  this.id = data.id;
  this.data = data;
  this.rect = rect;
  this.uml = rect.uml;
  this.$attr = this.createHtml();
  this.rect.$attrs.append(this.$attr);
};

$.extend(Uml.RectAttr.prototype, {

  createHtml: function () {
    return $(this.uml.getSample('attr', Object.assign({
      'id': this.id
    }, this.data))).data('uml', this);
  },

  update: function (data) {
    this.data = data;
    Helper.updateTemplate('update-attr-id', this.$attr, data);
  },

  remove: function () {
    this.$attr.remove();
    this.uml.events.trigger('removeRectAttr', this);
  },

  isActive: function () {
    return this.$attr.hasClass('active');
  },

  activate: function () {
    this.$attr.addClass('active');
  },

  deactivate: function () {
    this.$attr.removeClass('active');
  },

  getAnchor: function () {
    let pos = this.getPosition();
    pos.left += parseInt(this.$attr.width() / 2);
    pos.top += parseInt(this.$attr.height() / 2);
    return pos;
  },

  getPosition: function () {
    var pos = this.$attr.position();
    var rectPos = this.rect.getPosition();
    return {
      'left': rectPos.left + pos.left,
      'top': rectPos.top + pos.top
    };
  }

});