"use strict";

Studio.Toolbar = function ($toolbar, studio) {
  this.studio = studio;
  this.$toolbar = $toolbar;
  this.$appFile = $toolbar.find('.upload-app-file');
  this.init();
};

$.extend(Studio.Toolbar.prototype, {

  init: function () {

    this.getTool('downloadApp').click(this.onDownloadApp.bind(this));
    this.getTool('uploadApp').click(this.onUploadApp.bind(this));
    this.getTool('exportApp').click(this.onExportApp.bind(this));

    this.getTool('createClass').click(this.onCreateClass.bind(this));
    this.getTool('cloneClass').click(this.onCloneClass.bind(this));
    this.getTool('updateClass').click(this.onUpdateClass.bind(this));
    this.getTool('removeClass').click(this.onRemoveClass.bind(this));

    this.getTool('createClassAttr').click(this.onCreateClassAttr.bind(this));
    this.getTool('updateClassAttr').click(this.onUpdateClassAttr.bind(this));
    this.getTool('removeClassAttr').click(this.onRemoveClassAttr.bind(this));

    this.getTool('createClassView').click(this.onCreateClassView.bind(this));
    this.getTool('updateClassView').click(this.onUpdateClassView.bind(this));
    this.getTool('removeClassView').click(this.onRemoveClassView.bind(this));

    this.getTool('createClassViewAttr').click(this.onCreateClassViewAttr.bind(this));
    this.getTool('updateClassViewAttr').click(this.onUpdateClassViewAttr.bind(this));
    this.getTool('removeClassViewAttr').click(this.onRemoveClassViewAttr.bind(this));
    this.getTool('appendAllClassAttrs').click(this.onAppendAllClassAttrs.bind(this));

    this.getTool('createClassViewGroup').click(this.onCreateClassViewGroup.bind(this));
    this.getTool('updateClassViewGroup').click(this.onUpdateClassViewGroup.bind(this));
    this.getTool('removeClassViewGroup').click(this.onRemoveClassViewGroup.bind(this));

    this.getTool('createClassPrintView').click(this.onCreateClassPrintView.bind(this));
    this.getTool('updateClassPrintView').click(this.onUpdateClassPrintView.bind(this));
    this.getTool('removeClassPrintView').click(this.onRemoveClassPrintView.bind(this));

    this.getTool('createWorkflow').click(this.onCreateWorkflow.bind(this));
    this.getTool('cloneWorkflow').click(this.onCloneWorkflow.bind(this));
    this.getTool('updateWorkflow').click(this.onUpdateWorkflow.bind(this));
    this.getTool('removeWorkflow').click(this.onRemoveWorkflow.bind(this));

    this.getTool('createWorkflowState').click(this.onCreateWorkflowState.bind(this));
    this.getTool('updateWorkflowState').click(this.onUpdateWorkflowState.bind(this));
    this.getTool('removeWorkflowState').click(this.onRemoveWorkflowState.bind(this));

    this.getTool('createWorkflowTransition').click(this.onCreateWorkflowTransition.bind(this));
    this.getTool('updateWorkflowTransition').click(this.onUpdateWorkflowTransition.bind(this));
    this.getTool('removeWorkflowTransition').click(this.onRemoveWorkflowTransition.bind(this));

    this.getTool('createNavSection').click(this.onCreateNavSection.bind(this));
    this.getTool('updateNavSection').click(this.onUpdateNavSection.bind(this));
    this.getTool('removeNavSection').click(this.onRemoveNavSection.bind(this));

    this.getTool('createNavItem').click(this.onCreateNavItem.bind(this));
    this.getTool('updateNavItem').click(this.onUpdateNavItem.bind(this));
    this.getTool('removeNavItem').click(this.onRemoveNavItem.bind(this));

    this.getTool('createNavItemListView').click(this.onCreateNavItemListView.bind(this));
    this.getTool('updateNavItemListView').click(this.onUpdateNavItemListView.bind(this));
    this.getTool('removeNavItemListView').click(this.onRemoveNavItemListView.bind(this));

    this.getTool('createNavListAttr').click(this.onCreateNavListAttr.bind(this));
    this.getTool('updateNavListAttr').click(this.onUpdateNavListAttr.bind(this));
    this.getTool('removeNavListAttr').click(this.onRemoveNavListAttr.bind(this));

    this.getTool('createTask').click(this.onCreateTask.bind(this));
    this.getTool('updateTask').click(this.onUpdateTask.bind(this));
    this.getTool('removeTask').click(this.onRemoveTask.bind(this));
    this.getTool('importTasks').click(this.onImportTasks.bind(this));

    this.getTool('createInterface').click(this.onCreateInterface.bind(this));
    this.getTool('updateInterface').click(this.onUpdateInterface.bind(this));
    this.getTool('removeInterface').click(this.onRemoveInterface.bind(this));

    this.getTool('alignClasses').click(this.onAlignClasses.bind(this));
    this.getTool('alignWorkflowItems').click(this.onAlignWorkflowItems.bind(this));

    this.getTool('classMode').click(this.onClassMode.bind(this));
    this.getTool('viewMode').click(this.onViewMode.bind(this));
    this.getTool('printViewMode').click(this.onPrintViewMode.bind(this));

    this.getTool('help').click(this.onHelp.bind(this));

    this.getSectionLabel('class').click(this.onClassLabel.bind(this));
    this.getSectionLabel('classAttr').click(this.onClassAttrLabel.bind(this));

    this.$selectClassView = this.getTool('selectClassView');
    this.$selectClassView.change(this.onSelectClassView.bind(this));
    this.getSections().hide();
  },

  initListeners: function () {
    this.menu = this.studio.menu;
    var changeActiveItem = this.onChangeActiveItem.bind(this);
    this.studio.events.on('changeActiveItem', changeActiveItem);
    this.studio.events.on('changeContentMode', changeActiveItem);
    this.studio.events.on('createNavItem', changeActiveItem); // redraw tools
    this.studio.events.on('updateNavItem', changeActiveItem);
    this.studio.events.on('createNavItemListView', changeActiveItem);
    this.studio.events.on('removeNavItemListView', changeActiveItem);

    this.studio.events.on('createClassView', this.afterCreateClassView.bind(this));
    this.studio.events.on('updateClassView', this.afterUpdateClassView.bind(this));
    this.studio.events.on('removeClassView', this.afterRemoveClassView.bind(this));
  },

  getSection: function (id) {
    return this.getSections().filter('[data-id="'+ id +'"]');
  },

  getSections: function () {
    return this.$toolbar.find('.toolbar-section');
  },

  getSectionLabel: function (id) {
    return this.getSection(id).children('label');
  },

  getTool: function (action) {
    return this.$toolbar.find('[data-action="'+ action +'"]');
  },

  getTools: function () {
    if (!arguments.length) {
      return this.$toolbar.find('[data-action]');
    }
    var $tools = this.getTool(arguments[0]);
    for (let i = 1; i < arguments.length; ++i) {
      $tools = $tools.add(this.getTool(arguments[i]));
    }
    return $tools;
  },

  onChangeActiveItem: function () {
    this.showModeTools();
  },

  // SHOW MODE

  showModeTools: function (type) {
    this.$toolbar.show();
    var $sections = this.getSections().hide();
    this.toggleSectionEnabled($sections, false);
    this.toggleSectionActive($sections, false);
    this.getTools().show();
    type = type || this.menu.getActiveType();
    this.getSection('external').show();
    switch (this.studio.contentMode) {
      case 'class': return this.showClassModeTools(type);
      case 'nav': return this.showNavModeTools(type);
      case 'listView': return this.showListViewModeTools(type);
      case 'view': return this.showViewModeTools(type);
      case 'printView': return this.showPrintViewModeTools(type);
      case 'workflow': return this.showWorkflowModeTools(type);
      case 'task': return this.showTaskModeTools(type);
      case 'algo': return this.showAlgoModeTools(type);
      case 'interface': return this.showInterfaceModeTools(type);
    }
  },

  showClassModeTools: function (activeType) {
    switch (activeType) {
      case undefined:
        this.getSection('app').show();
        this.getTool('updateApp').hide();
        this.getTool('removeApp').hide();
        break;
      case 'app':
        this.toggleSectionActive(this.getSection('app').show(), true);
        this.toggleSectionEnabled(this.getSection('class').show(), false);
        this.getTools('updateClass', 'removeClass', 'cloneClass').hide();
        break;
      case 'classes':
        this.toggleSectionEnabled(this.getSection('app').show(), true);
        this.getTools('createApp', 'updateApp', 'removeApp').hide();
        this.toggleSectionActive(this.getSection('class').show(), true);
        this.getTools('updateClass', 'removeClass', 'cloneClass').hide();
        this.getTool('alignClasses').show();
        break;
      case 'class':
        this.toggleSectionEnabled(this.getSection('app').show(), true);
        this.getTools('createApp', 'updateApp', 'removeApp').hide();
        this.toggleSectionActive(this.getSection('class').show(), true);
        this.toggleSectionEnabled(this.getSection('classAttr').show(), true);
        this.getTools('updateClassAttr', 'removeClassAttr').hide();
        this.getSection('viewMode').show();
        break;
      case 'classAttr':
        this.toggleSectionEnabled(this.getSection('app').show(), true);
        this.getTools('createApp', 'updateApp', 'removeApp').hide();
        this.toggleSectionEnabled(this.getSection('class').show(), true);
        this.getTools('updateClass', 'removeClass', 'cloneClass').hide();
        this.toggleSectionActive(this.getSection('classAttr').show(), true);
        this.getSection('viewMode').show();
        break;
    }
    var canExport = this.studio.canExport();
    this.getSection('exportApp').toggle(canExport);
    this.getSection('util').toggle(canExport);
  },

  showViewModeTools: function (activeType) {
    switch (activeType) {
      case 'class':
      case 'classAttr':
        this.getSection('classView').show();
        this.createClassViewSelect(this.menu.getActiveClass());
        break;
    }
    this.getSection('classMode').show();
  },

  showPrintViewModeTools: function (activeType) {
    switch (activeType) {
      case 'class':
      case 'classAttr':
        this.getSection('classPrintView').show();
        //this.createClassViewSelect(this.menu.getActiveClass());
        break;
    }
    this.getSection('classMode').show();
  },

  showNavModeTools: function (activeType) {
    switch (activeType) {
      case 'nav':
        this.getSection('navSection').show();
        this.getTool('updateNavSection').hide();
        this.getTool('removeNavSection').hide();
        break;
      case 'navSection':
        this.getSection('navSection').show();
        this.getSection('navItem').show();
        this.getTool('updateNavItem').hide();
        this.getTool('removeNavItem').hide();
        break;
      case 'navItem':
        this.getSection('navSection').show();
        this.getTool('createNavSection').hide();
        this.getTool('removeNavSection').hide();
        this.getSection('navItem').show();
        break;
    }
  },

  showListViewModeTools: function (activeType) {
    this.showNavModeTools(activeType);
    var navItem = this.studio.getActiveNavItem();
    if (navItem && navItem.getClass()) {
      this.getSection('navItemListView').show();
      if (navItem.getListView()) {
        this.getTool('createNavItemListView').hide();
        this.getSection('navListAttr').show();
      } else {
        this.getTool('updateNavItemListView').hide();
        this.getTool('removeNavItemListView').hide();
      }
    }
  },

  showWorkflowModeTools: function (activeType) {
    switch (activeType) {
      case 'workflows':
        this.getSection('workflow').show();
        this.getTool('cloneWorkflow').hide();
        this.getTool('updateWorkflow').hide();
        this.getTool('removeWorkflow').hide();
        break;
      case 'workflow':
        this.getSection('workflow').show();
        this.getSection('workflowState').show();
        this.getTool('updateWorkflowState').hide();
        this.getTool('removeWorkflowState').hide();
        this.getSection('workflowUtil').show();
        this.getTool('alignWorkflowItems').show();
        break;
      case 'workflowState':
        this.getSection('workflow').show();
        this.getTool('createWorkflow').hide();
        this.getTool('cloneWorkflow').hide();
        this.getTool('removeWorkflow').hide();
        this.getSection('workflowState').show();
        this.getSection('workflowTransition').show();
        this.getTool('updateWorkflowTransition').hide();
        this.getTool('removeWorkflowTransition').hide();
        break;
      case 'workflowTransition':
        this.getSection('workflow').show();
        this.getTool('createWorkflow').hide();
        this.getTool('cloneWorkflow').hide();
        this.getTool('removeWorkflow').hide();
        this.getSection('workflowState').show();
        this.getTool('createWorkflowState').hide();
        this.getTool('removeWorkflowState').hide();
        this.getSection('workflowTransition').show();
        break;
    }
  },

  showTaskModeTools: function (activeType) {
    switch (activeType) {
      case 'tasks':
        this.getSection('taskUtil').show();
        this.getSection('task').show();
        this.getTool('updateTask').hide();
        this.getTool('removeTask').hide();
        break;
      case 'task':
        this.getSection('task').show();
        break;
    }
  },

  showAlgoModeTools: function (activeType) {
    switch (activeType) {
      case 'algorythms':
        this.getSection('algorythm').show();
        this.getTool('removeAlgo').hide();
        break;
      case 'algorythm':
        this.getSection('algorythm').show();
        break;
    }
  },

  showInterfaceModeTools: function (activeType) {
    switch (activeType) {
      case 'interfaces':
        this.getSection('interface').show();
        this.getTool('updateInterface').hide();
        this.getTool('removeInterface').hide();
        break;
      case 'interface':
        this.getSection('interface').show();
        break;
    }
  },

  alertNotice: function (message) {
    if (message) {
      this.studio.alert.notice(message);
    }
  },

  isSectionEnabled: function (section) {
    return this.getSection(section).hasClass('enabled');
  },

  toggleSectionEnabled: function ($section, state) {
    $section.toggleClass('enabled', state);
  },

  isSectionActive: function (section) {
    return this.getSection(section).hasClass('active');
  },

  toggleSectionActive: function ($section, state) {
    $section.toggleClass('active', true);
  },

  onHelp: function (event) {
    this.studio.helpForm.show();
  },

  // MODEL

  updateModel: function (model, action, form) {
    var $tool = this.getTool(action);
    model ? form.update(model)
          : this.alertNotice($tool.data('selectMessage'));
  },

  removeModel: function (model, action) {
    var $tool = this.getTool(action);
    if (!model) {
      this.alertNotice($tool.data('selectMessage'));
    } else if (Helper.confirm($tool)) {
      model.remove();
    }
  },

  // APP

  onDownloadApp: function () {
    var $tool = this.getTool('downloadApp');
    var app = this.studio.getActiveApp();
    app ? (new Studio.AppDownload(app)).download()
      : this.alertNotice($tool.data('selectMessage'));
  },

  onUploadApp: function (event) {
    Helper.resetFormElement(this.$appFile);
    this.$appFile.click();
  },

  onChangeAppFile: function (event) {
    (new Studio.AppUpload(this.$appFile.get(0).files, this.studio)).execute();
  },

  onExportApp: function (event) {
    this.studio.exportForm.show(this.studio.getActiveApp());
  },

  changeApp: function (id) {
    if (!id) {
      return this.menu.deactivate();
    }
    this.menu.activate(this.menu.getItem(id));
  },

  // CLASS

  onClassLabel: function () {
    switch (this.menu.getActiveType()) {
      case 'app': return this.menu.activate(this.menu.getActiveAppSection('classes'));
      default: if (this.isSectionEnabled('class')) {
        this.menu.activate(this.menu.getActiveClassItem());
      }
    }
  },

  onCreateClass: function () {
    this.studio.classForm.create(this.studio.getActiveApp());
  },

  onCloneClass: function () {
    var source = this.studio.getActiveClass();
    if (source && Helper.confirm($(event.currentTarget))) {
      var model = source.clone();
      this.studio.triggerCreateClass(model);
      this.updateModel(model, 'updateClass', this.studio.classForm);
    }
  },

  onUpdateClass: function () {
    this.updateModel(this.studio.getActiveClass(), 'updateClass', this.studio.classForm);
  },

  onRemoveClass: function () {
    this.removeModel(this.studio.getActiveClass(), 'removeClass');
  },

  // CLASS ATTR

  onClassAttrLabel: function () {
    this.toggleSectionActive(this.getSection('class'), false);
    this.toggleSectionEnabled(this.getSection('class'), true);
    this.getTools('createClass', 'updateClass', 'removeClass').hide();
    this.toggleSectionActive(this.getSection('classAttr'), true);
    this.getTools('createClassAttr').show();
    if (this.menu.getActiveType() === 'classAttr') {
      this.getTools('updateClassAttr', 'removeClassAttr').show();
    }
  },

  onCreateClassAttr: function () {
    this.studio.classAttrForm.create(this.studio.getActiveClass());
  },

  onUpdateClassAttr: function () {
    this.updateModel(this.studio.getActiveClassAttr(), 'updateClassAttr', this.studio.classAttrForm);
  },

  onRemoveClassAttr: function () {
    var model = this.studio.getActiveClassAttr();
    if (model && model.isKey()) {
      return this.studio.alert.warning(Helper.L10n.translate('Cannot remove class key attribute'));
    }
    this.removeModel(model, 'removeClassAttr');
  },

  // CLASS VIEW

  getActiveClassViewId: function () {
    return this.$selectClassView.val();
  },

  onSelectClassView: function () {
    var state = !!this.$selectClassView.val();
    this.getSection('classViewAttr').toggle(state);
    this.getSection('classViewGroup').toggle(state);
    this.studio.triggerSelectClassView();
  },

  onCreateClassView: function () {
    this.studio.classViewForm.create(this.studio.getActiveClass());
  },

  onUpdateClassView: function () {
    this.updateModel(this.studio.getActiveClassView(), 'updateClassView', this.studio.classViewForm);
  },

  onRemoveClassView: function () {
    this.removeModel(this.studio.getActiveClassView(), 'removeClassView');
  },

  afterCreateClassView: function (event, model) {
    this.createClassViewSelect(model.cls);
    this.$selectClassView.val(model.id);
  },

  afterUpdateClassView: function (event, model) {
    this.createClassViewSelect(model.cls);
    this.$selectClassView.val(model.id);
  },

  afterRemoveClassView: function (event, model) {
    this.createClassViewSelect(model.cls);
  },

  createClassViewSelect: function (model) {
    var value = this.$selectClassView.val();
    this.$selectClassView.html(Helper.Html.createSelectItems({
      hasEmpty: false,
      items: model.views.map(function (model) {
        return {
          'value': model.id,
          'text': Helper.L10n.translate(model.getTitle(), 'view')
        };
      })
    })).val(value).change();
  },

  // CLASS VIEW ATTR

  onCreateClassViewAttr: function (event, classAttr) {
    this.studio.classViewAttrForm.create(this.studio.getActiveClassView(), classAttr);
  },

  onUpdateClassViewAttr: function () {
    this.updateModel(this.studio.getActiveClassViewAttr(), 'updateClassViewAttr', this.studio.classViewAttrForm);
  },

  onRemoveClassViewAttr: function () {
    this.removeModel(this.studio.getActiveClassViewAttr(), 'removeClassViewAttr');
  },

  onAppendAllClassAttrs: function () {
    this.studio.viewMaker.appendAllClassAttrs();
  },

  // CLASS VIEW GROUP

  onCreateClassViewGroup: function () {
    this.studio.classViewGroupForm.create(this.studio.getActiveClassView());
  },

  onUpdateClassViewGroup: function () {
    this.updateModel(this.studio.getActiveClassViewGroup(), 'updateClassViewGroup', this.studio.classViewGroupForm);
  },

  onRemoveClassViewGroup: function () {
    this.removeModel(this.studio.getActiveClassViewGroup(), 'removeClassViewGroup');
  },

  // CLASS PRINT VIEW

  getActiveClassPrintViewId: function () {
    return this.$selectClassPrintView.val();
  },

  onSelectClassPrintView: function () {
    var state = !!this.$selectClassPrintView.val();
    this.getSection('classViewAttr').toggle(state);
    this.getSection('classViewGroup').toggle(state);
    this.studio.triggerSelectClassView();
  },

  onCreateClassPrintView: function () {
    this.studio.classPrintViewForm.create(this.studio.getActiveClass());
  },

  onUpdateClassPrintView: function () {
    this.updateModel(this.studio.getActiveClassPrintView(), 'updateClassPrintView', this.studio.classPrintViewForm);
  },

  onRemoveClassPrintView: function () {
    this.removeModel(this.studio.getActiveClassPrintView(), 'removeClassPrintView');
  },

  afterCreateClassPrintView: function (event, model) {
    this.createClassViewSelect(model.cls);
    this.$selectClassView.val(model.id);
  },

  afterUpdateClassPrintView: function (event, model) {
    this.createClassViewSelect(model.cls);
    this.$selectClassView.val(model.id);
  },

  afterRemoveClassPrintView: function (event, model) {
    this.createClassViewSelect(model.cls);
  },

  createClassPrintViewSelect: function (model) {
    var value = this.$selectClassView.val();
    this.$selectClassView.html(Helper.Html.createSelectItems({
      hasEmpty: false,
      items: model.views.map(function (model) {
        return {
          'value': model.id,
          'text': Helper.L10n.translate(model.getTitle(), 'view')
        };
      })
    })).val(value).change();
  },

  // WORKFLOW

  onCreateWorkflow: function () {
    this.studio.workflowForm.create(this.studio.getActiveApp());
  },

  onCloneWorkflow: function () {
    var source = this.studio.getActiveWorkflow();
    if (source && Helper.confirm($(event.currentTarget))) {
      var model = source.clone();
      this.studio.triggerCreateWorkflow(model);
      this.updateModel(model, 'updateWorkflow', this.studio.workflowForm);
    }
  },

  onUpdateWorkflow: function () {
    this.updateModel(this.studio.getActiveWorkflow(), 'updateWorkflow', this.studio.workflowForm);
  },

  onRemoveWorkflow: function () {
    this.removeModel(this.studio.getActiveWorkflow(), 'removeWorkflow');
  },

  // WORKFLOW STATE

  onCreateWorkflowState: function () {
    this.studio.workflowStateForm.create(this.studio.getActiveWorkflow());
  },

  onUpdateWorkflowState: function () {
    this.updateModel(this.studio.getActiveWorkflowState(), 'updateWorkflowState', this.studio.workflowStateForm);
  },

  onRemoveWorkflowState: function () {
    this.removeModel(this.studio.getActiveWorkflowState(), 'removeWorkflowState');
  },

  // WORKFLOW TRANSITION

  onCreateWorkflowTransition: function () {
    this.studio.workflowTransitionForm.create(this.studio.getActiveWorkflowState());
  },

  onUpdateWorkflowTransition: function () {
    this.updateModel(this.studio.getActiveWorkflowTransition(), 'updateWorkflowTransition', this.studio.workflowTransitionForm);
  },

  onRemoveWorkflowTransition: function () {
    this.removeModel(this.studio.getActiveWorkflowTransition(), 'removeWorkflowTransition');
  },

  // ALGO

  onCreateAlgo: function () {
    this.studio.algoForm.create(this.studio.getActiveApp());
  },

  onRemoveAlgo: function () {
    this.removeModel(this.studio.getActiveAlgo(), 'removeAlgo');
  },

  // NAV SECTION

  onCreateNavSection: function () {
    this.studio.navSectionForm.create(this.studio.getActiveApp());
  },

  onUpdateNavSection: function () {
    this.updateModel(this.studio.getActiveNavSection(), 'updateNavSection', this.studio.navSectionForm);
  },

  onRemoveNavSection: function () {
    this.removeModel(this.studio.getActiveNavSection(), 'removeNavSection');
  },

  // NAV ITEM

  onCreateNavItem: function () {
    this.studio.navItemForm.create(this.studio.getActiveNav());
  },

  onUpdateNavItem: function () {
    this.updateModel(this.studio.getActiveNavItem(), 'updateNavItem', this.studio.navItemForm);
  },

  onRemoveNavItem: function () {
    this.removeModel(this.studio.getActiveNavItem(), 'removeNavItem');
  },

  // NAV ITEM LIST VIEW

  onCreateNavItemListView: function (event) {
    this.studio.navItemListViewForm.create(this.studio.getActiveNavItem());
  },

  onUpdateNavItemListView: function () {
    this.updateModel(this.studio.getActiveNavItem().getListView(), 'updateNavItemListView', this.studio.navItemListViewForm);
  },

  onRemoveNavItemListView: function () {
    var item = this.studio.getActiveNavItem();
    if (item && Helper.confirm(this.getTool('removeNavItemListView'))) {
      var model = item.getListView();
      item.removeListView();
      this.studio.triggerModelChanging('removeNavItemListView', model);
      this.showModeTools();
    }
  },

  // NAV LIST ATTR

  onCreateNavListAttr: function (event, classAttr) {
    this.studio.classViewAttrForm.create(this.studio.getActiveClassView(), classAttr);
  },

  onUpdateNavListAttr: function () {
    this.updateModel(this.studio.getActiveClassViewAttr(), 'updateClassViewAttr', this.studio.classViewAttrForm);
  },

  onRemoveNavListAttr: function () {
    this.removeModel(this.studio.getActiveClassViewAttr(), 'removeClassViewAttr');
  },

  // TASK

  onCreateTask: function () {
    this.studio.taskForm.create(this.studio.getActiveApp());
  },

  onUpdateTask: function () {
    this.updateModel(this.studio.getActiveTask(), 'updateTask', this.studio.taskForm);
  },

  onRemoveTask: function () {
    this.removeModel(this.studio.getActiveTask(), 'removeTask');
  },

  onImportTasks: function () {
    this.studio.importTaskForm.show(this.studio.getActiveApp());
  },

  // INTERFACE

  onCreateInterface: function () {
    this.studio.interfaceForm.create(this.studio.getActiveApp());
  },

  onUpdateInterface: function () {
    this.updateModel(this.studio.getActiveInterface(), 'updateInterface', this.studio.interfaceForm);
  },

  onRemoveInterface: function () {
    this.removeModel(this.studio.getActiveInterface(), 'removeInterface');
  },

  // UTIL

  onAlignClasses: function (event) {
    var $tool = $(event.currentTarget);
    if (!Helper.confirm($tool)) {
      return false;
    }
    this.studio.toggleLoader(true);
    setTimeout(function () {
      var app = this.studio.getActiveApp();
      var data = this.studio.classUml.getAlignmentData('class', app);
      data = (new Studio.Alignment(data)).execute();
      this.studio.classUml.setAlignmentData(data, 'class', app);
      this.studio.toggleLoader(false);
    }.bind(this), 10);
  },

  onAlignWorkflowItems: function (event) {
    var $tool = $(event.currentTarget);
    if (!Helper.confirm($tool)) {
      return false;
    }
    this.studio.toggleLoader(true);
    setTimeout(function () {
      var workflow = this.studio.getActiveWorkflow();
      var data = this.studio.workflowUml.getAlignmentData(workflow);
      data = (new Studio.Alignment(data)).execute();
      this.studio.workflowUml.setAlignmentData(data, workflow);
      this.studio.toggleLoader(false);
    }.bind(this), 10);
  },

  onClassMode: function () {
    this.studio.setContentMode('class');
  },

  onViewMode: function () {
    this.studio.setContentMode('view');
  },

  onPrintViewMode: function () {
    this.studio.setContentMode('printView');
  }
});