"use strict";

Uml.Link = function (page, sample) {
  this.page = page;
  this.$link = this.createHtml(sample);
  this.page.$page.append(this.$link);
};

$.extend(Uml.Link.prototype, {

  getData: function (start, end) {
    var dx = end.left - start.left;
    var dy = end.top - start.top;
    var length = Math.round(Math.sqrt(dx * dx + dy * dy));
    var angle = Math.asin(dy / length);
    if (dx < 0) {
      angle = -angle;
    }
    this.$link.toggleClass('uml-link-flip', dx < 0);
    start.left += dx / 2;
    start.top += dy / 2;
    return [length, start, angle];
  },

  setData: function (length, center, angle) {
    this.$link.css('transform', 'none');
    this.$link.width(length);
    center.left -= length / 2;
    this.setPosition(center);
    this.$link.css('transform', 'rotate('+ angle +'rad)');
  },

  getPosition: function () {
    return {
      'left': parseInt(this.$link.css('left')),
      'top': parseInt(this.$link.css('top'))
    }
  },

  setPosition: function (pos) {
    if (pos) {
      this.$link.css({
        'left': pos.left +'px',
        'top': pos.top + 'px'
      });
    }
  },

  remove: function () {
    this.$link.remove();
  },

  createHtml: function (sample, params) {
    return $(this.page.uml.getSample(sample, params || {}));
  }
});

// PARENT LINK

Uml.ParentLink = function (page, child, parent) {
  Uml.Link.call(this, page, 'parentLink');
  this.child = child;
  this.parent = parent;
};

$.extend(Uml.ParentLink.prototype, Uml.Link.prototype, {
  constructor: Uml.ParentLink,

  isNode: function (node) {
    return this.child === node || this.parent === node;
  },

  isMaster: function (node) {
    return this.child === node;
  },

  update: function () {
    this.setData.apply(this, this.getData(this.child.getAnchor(), this.parent.getAnchor()))
  }
});

// REF LINK

Uml.RefLink = function (page, attr, target, sample) {
  Uml.Link.call(this, page, sample || 'refLink');
  this.attr = attr;
  this.target = target;
};

$.extend(Uml.RefLink.prototype, Uml.Link.prototype, {
  constructor: Uml.RefLink,

  isNode: function (node) {
    return this.target === node || this.attr === node || this.attr.rect === node;
  },

  isMaster: function (node) {
    return this.attr === node || this.attr.rect === node;
  },

  update: function () {
    this.setData.apply(this, this.getData(this.attr.getAnchor(), this.target.getAnchor()))
  }
});

// REF LINK

Uml.CollectionLink = function (page, attr, target) {
  Uml.RefLink.call(this, page, attr, target, 'collectionLink');
};

$.extend(Uml.CollectionLink.prototype, Uml.RefLink.prototype, {
  constructor: Uml.CollectionLink,

});