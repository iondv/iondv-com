"use strict";

Studio.WorkflowUmlAdapter = function ($container, studio) {
  this.studio = studio;
  this.menu = studio.menu;
  this.$container = $container;
  this.uml = new Uml($container);
};

$.extend(Studio.WorkflowUmlAdapter.prototype, {

  initListeners: function () {
    this.studio.events.on('changeContentMode', this.onChangeContentMode.bind(this));
    this.studio.events.on('createApp', this.onCreateApp.bind(this));
    this.studio.events.on('createWorkflow', this.onCreateWorkflow.bind(this));
    this.studio.events.on('updateWorkflow', this.onUpdateWorkflow.bind(this));
    this.studio.events.on('removeWorkflow', this.onRemoveWorkflow.bind(this));
    this.studio.events.on('createWorkflowState', this.onCreateState.bind(this));
    this.studio.events.on('updateWorkflowState', this.onUpdateState.bind(this));
    this.studio.events.on('removeWorkflowState', this.onRemoveState.bind(this));
    this.studio.events.on('createWorkflowTransition', this.onCreateTransition.bind(this));
    this.studio.events.on('updateWorkflowTransition', this.onUpdateTransition.bind(this));
    this.studio.events.on('removeWorkflowTransition', this.onRemoveTransition.bind(this));
    this.studio.events.on('changeActiveItem', this.onChangeActiveItem.bind(this));
    this.uml.events.on('clickRect', this.onClickRect.bind(this));
    this.uml.events.on('doubleClickRect', this.onDoubleClickRect.bind(this));
    this.uml.events.on('clickPage', this.onClickPage.bind(this));
    this.uml.events.on('doubleClickPage', this.onDoubleClickPage.bind(this));
    this.uml.draggable.events.on('end', this.onDragEnd.bind(this));
  },

  onChangeContentMode: function (event, mode) {
    this.$container.toggle(mode === 'workflow');
  },

  onCreateApp: function (event, model) {
    this.createPages(model);
  },

  onCreateWorkflow: function (event, model) {
    this.createPage(model);
  },

  onUpdateWorkflow: function (event, model) {
  },

  onRemoveWorkflow: function (event, model) {
    this.getPage(model).remove();
  },

  onCreateState: function (event, model) {
    var page = this.getPage(model.workflow);
    var rect = page.createRect(this.getStateRectData(model));
  },

  onUpdateState: function (event, model) {
    var page = this.getPage(model.workflow);
    var rect = page.getRect(model.id);
    rect.update(this.getStateRectData(model));
  },

  onRemoveState: function (event, model) {
    var page = this.getPage(model.workflow);
    page.getRect(model.id).remove();
  },

  onCreateTransition: function (event, model) {
    var page = this.getPage(model.workflow);
    var rect = page.createRect(this.getTransitionRectData(model));
    page.addLinks(this.getTransitionLinks(model));
    page.updateLinksByNode(rect);
  },

  onUpdateTransition: function (event, model) {
    var page = this.getPage(model.workflow);
    var rect = page.getRect(model.id);
    rect.update(this.getTransitionRectData(model));
    page.removeLinksByNode(rect);
    page.addLinks(this.getTransitionLinks(model));
    page.updateLinksByNode(rect);
  },

  onRemoveTransition: function (event, model) {
    var page = this.getPage(model.workflow);
    page.getRect(model.id).remove();
  },

  onChangeActiveItem: function (event) {
    var app = this.studio.getActiveApp();
    var workflow = this.studio.getActiveWorkflow();
    if (!app || !workflow) {
      return this.uml.deactivatePages();
    }
    var page = this.uml.getPage(workflow.id);
    page.activate();
    var item = this.getActiveWorkflowItem();
    if (!item) {
      return true;
    }
    var rect = page.getRect(item.id);
    if (!rect.isActive()) {
      page.deactivateRects();
      rect.activate();
    }
  },

  onClickRect: function (event, data) {
    this.menu.activate(this.menu.getItem(data.umlTarget.id));
  },

  onDoubleClickRect: function (event, data) {
    this.menu.updateByItem(this.menu.getItem(data.umlTarget.id));
  },

  onClickPage: function (event, data) {
    var rect = data.umlTarget.getActiveRect();
    if (rect) {
      rect.deactivate();
    }
  },

  onDoubleClickPage: function (event, data) {
  },

  onDragEnd: function (event, data) {
    var model = this.getActiveWorkflowItem();
    model.setUmlPosition(data.position);
    this.studio.triggerChangeModel(model);
  },

  getActiveWorkflowItem:  function () {
    return this.studio.getActiveWorkflowTransition() || this.studio.getActiveWorkflowState();
  },

  restore: function () {
    this.studio.apps.forEach(function (app) {
      this.createPages(app);
    }, this);
  },

  // PAGE

  getPage: function (model) {
    return this.uml.getPage(this.getPageId(model));
  },

  getPageId: function (model) {
    return model.id;
  },

  createPages: function (app) {
    app.workflows.forEach(this.createPage, this);
  },

  createPage: function (workflow) {
    this.uml.createPage({
      'id': this.getPageId(workflow),
      'title': workflow.getTitle(),
      'rects': this.getRects(workflow),
      'links': this.getLinks(workflow)
    });
  },

  // RECT

  getRects: function (workflow) {
    var states = workflow.states.map(this.getStateRectData, this);
    var transitions = workflow.transitions.map(this.getTransitionRectData, this);
    return states.concat(transitions);
  },

  getStateRectData: function (model) {
    return {
      'sample': 'state',
      'id': model.id,
      'name': model.getName(),
      'title': model.getTitle(),
      'offset': model.getOptionData('uml.offset')
    };
  },

  getTransitionRectData: function (model) {
    return {
      'sample': 'transition',
      'id': model.id,
      'title': model.getTitle(),
      'name': model.getName(),
      'offset': model.getOptionData('uml.offset')
    };
  },

  // LINKS

  getLinks: function (workflow) {
    var links = [];
    workflow.transitions.forEach(function (model) {
      links = links.concat(this.getTransitionLinks(model));
    }, this);
    return links;
  },

  getTransitionLinks: function (model) {
    var startLink = this.getParentTypeLink(model, model.getStartState());
    var finishLink = this.getParentTypeLink(model.getFinishState(), model);
    return Helper.Array.pushNotEmpty([], startLink, finishLink);
  },

  getParentTypeLink: function (parent, child) {
    if (parent && child) {
      return {
        'type': 'parent',
        'child': child.id,
        'parent': parent.id
      };
    }
  },

  // ALIGNMENT

  getAlignmentData: function (workflow) {
    var page = this.getPage(workflow);
    return {
      'page': {
        'width': page.$page.width(),
        'height': page.$page.height()
      },
      'items': page.rects.map(function (rect) {
        return {
          'rect': rect,
          'width': rect.$rect.width(),
          'height': rect.$rect.height()
        };
      })
    };
  },

  setAlignmentData: function (items, workflow) {
    items.forEach(function (item) {
      item.rect.setPosition(item);
      workflow.getItem(item.rect.id).setUmlPosition(item.rect.getPosition());
    });
    var page = this.getPage(workflow);
    page.updateLinks();
    this.studio.triggerChangeModel(workflow);
  },
});
