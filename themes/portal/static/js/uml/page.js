"use strict";

Uml.Page = function (data, uml) {
  this.data = data;
  this.id = data.id;
  this.uml = uml;
  this.$page = this.createHtml();
  this.uml.$pages.append(this.$page);
  this.clearRects();
  this.createRects(data.rects);
  this.clearLinks();
  this.addLinks(data.links);
};

$.extend(Uml.Page.prototype, {

  createHtml: function () {
    return $(this.uml.getSample('page', {
      id: this.id
    })).data('uml', this);
  },

  isActive: function () {
    return this.$page.hasClass('active');
  },

  resolveOffset: function (pos) {
    var offset = this.$page.offset();
    pos.left = pos.left - this.$page.scrollLeft() + offset.left;
    pos.top = pos.top - this.$page.scrollTop() + offset.top;
    return pos;
  },

  addScroll: function (pos) {
    pos.left += this.$page.scrollLeft();
    pos.top += this.$page.scrollTop();
    return pos;
  },

  toggleUpdating: function (state) {
    this.$page.toggleClass('updating');
  },

  activate: function () {
    if (!this.isActive()) {
      this.uml.deactivatePages();
      this.$page.addClass('active');
      this.toggleUpdating(true);
      //Helper.Array.eachMethod('setPosition', this.rects);
      setTimeout(function () {
        this.updateLinks();
        this.toggleUpdating(false);
      }.bind(this), 0);
    }
  },

  deactivate: function () {
    this.$page.removeClass('active');
    Helper.Array.eachMethod('deactivate', this.rects);
  },

  remove: function () {
    this.$page.remove();
    this.uml.removePage(this);
  },

  // RECT

  getActiveRect: function () {
    return this.$page.children('.active').data('uml');
  },

  getRect: function (id) {
    return this.rectMap[id];
  },

  createRects: function (items) {
    if (items instanceof Array) {
      items.forEach(this.createRect.bind(this));
    }
  },

  createRect: function (data) {
    var rect = new Uml.Rect(data, this);
    this.rects.push(rect);
    this.rectMap[rect.id] = rect;
    return rect;
  },

  clearRects: function () {
    this.rects = [];
    this.rectMap = {};
    this.$page.find('.uml-rect').remove();
  },

  deactivateRects: function () {
    Helper.Array.eachMethod('deactivate', this.rects);
  },

  removeRect: function (rect) {
    Helper.Array.removeValue(rect, this.rects);
    delete this.rectMap[rect.id];
    this.removeLinksByNode(rect);
  },

  removeRectAttr: function (attr) {
    attr.rect.removeAttr(attr);
    this.removeLinksByNode(attr);
  },

  // LINK

  clearLinks: function (items) {
    this.links = [];
    this.$page.find('.uml-link').remove();
  },

  addLinks: function (items) {
    this.links = this.links.concat(items.map(this.createLink.bind(this)));
  },

  createLink: function (data) {
    var rect;
    switch (data.type) {
      case 'parent':
        return new Uml.ParentLink(this, this.getRect(data.child), this.getRect(data.parent));
      case 'ref':
        rect = this.getRect(data.class);
        return new Uml.RefLink(this, rect.getAttr(data.attr), this.getRect(data.target));
      case 'collection':
        rect = this.getRect(data.class);
        return new Uml.CollectionLink(this, rect.getAttr(data.attr), this.getRect(data.target));
    }
    throw new Error('Not found link type');
  },

  updateLinks: function () {
    Helper.Array.eachMethod('update', this.links);
  },

  updateLinksByNode: function (rect) {
    for (let i = 0; i < this.links.length; ++i) {
      if (this.links[i].isNode(rect)) {
        this.links[i].update();
      }
    }
  },

  removeLinksByNode: function (rect, checker) {
    checker = checker || 'isNode';
    for (let i = this.links.length - 1; i >= 0; --i) {
      if (this.links[i][checker](rect)) {
        this.links[i].remove();
        this.links.splice(i, 1);
      }
    }
  }
});