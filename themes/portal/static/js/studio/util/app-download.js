"use strict";

Studio.AppDownload = function (app) {
  this.app = app;
  this.studio = app.studio;
};

$.extend(Studio.AppDownload.prototype, {
  constructor: Studio.AppDownload,

  download: function () {
    this.studio.toggleLoader(true);
    setTimeout(function () {
      this.execute().finally(function () {
        this.studio.toggleLoader(false);
      }.bind(this)).then(function (blob) {
        saveAs(blob, this.app.getName() +'.zip');
      }.bind(this), function (err) {
        console.error(err);
      }.bind(this));
    }.bind(this), 100);
  },

  execute: function () {
    this.app.createDefaultClassViews();
    this.app.createNavSectionByClasses();
    var zip = new JSZip;
    var root = zip.folder(this.app.getName());
    this.studioData = {};
    this.saveMeta(root.folder('meta'));
    this.saveViews(root.folder('views'));
    this.saveNavSections(root.folder('navigation'));
    this.savePackage(root);
    this.saveJsonFile('studio', this.studioData, root);
    return Promise.all([
      this.saveCommonInterfaceAssets(root)
    ]).then(()=> {
      return zip.generateAsync({
        type: 'blob'
      });
    });
  },

  saveMeta: function (root) {
    var items = this.app.classes.map(function (model) {
      return this.getClassData(model);
    }, this);
    this.studioData.classes = this.getClassStudioData(items);
    items.forEach(function (data) {
      this.saveJsonFile(data.name +'.class', data, root);
    }, this);
  },

  saveViews: function (root) {
    this.app.classes.forEach(function (model) {
      var views = model.views.filter(function (item) {
        return !item.isEmpty();
      });
      if (views.length) {
        var folder = root.folder(model.data.name);
        views.forEach(function (view) {
          this.saveJsonFile(view.data.name, this.getClassViewData(view), folder);
        }, this);
      }
    }, this);
  },

  savePrintViews: function (root) {
    this.app.classes.forEach(function (model) {
      this.saveTypePrintViews('item', model, root);
      this.saveTypePrintViews('list', model, root);
    }, this);
  },

  saveTypePrintViews: function (type, cls, root) {
    var items = cls.getPrintViewsByType(type);
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      this.savePrintViewFile(item, i, root);
    }
  },

  savePrintViewFile: function (model, index, root) {
    try {
      var file = model.getFile();
      var dir = model.data.type + (index > 0 ? (index + 1) : '');
      var folder = root.folder(dir).folder(model.cls.app.getName());
      var fileName = model.cls.getName() +'.'+ model.data.extension;
      folder.file(fileName, Helper.File.getBlob(file.content));
    } catch (err) {
      console.error(err);
    }
  },

  saveWorkflows: function (root) {
    var items = this.app.workflows.map(function (model) {
      return this.getWorkflowData(model);
    }, this);
    this.studioData.workflows = this.getWorkflowStudioData(items);
    items.forEach(function (data) {
      this.saveJsonFile(data.name +'.wf', data, root);
    }, this);
  },

  saveNavSections: function (root) {
    var items = this.app.navSections.map(function (model) {
      this.saveNavItems(model, root.folder(model.getName()));
      return this.getNavSectionData(model);
    }, this);
    items.forEach(function (data) {
      this.saveJsonFile(data.name +'.section', data, root);
    }, this);
  },

  saveNavItems: function (section, root) {
    var items = section.getNestedItems().map(function (model) {
      return this.getNavItemData(model);
    }, this);
    items.forEach(function (data) {
      this.saveJsonFile(data.code, data, root);
    }, this);
  },

  saveNavItemViews: function (root) {
    this.app.navSections.forEach(function (section) {
      section.getItems().forEach(function (item) {
        this.saveNavItemListView(item.getListView(), item, root);
      }, this);
    }, this);
  },

  saveNavItemListView: function (view, item, root) {
    if (view) {
      var folder = root.folder(item.getName()).folder(view.cls.getNamespaceName());
      this.saveJsonFile('list', this.getClassViewData(view), folder);
    }
  },

  saveTasks: function (root) {
    var items = this.app.tasks.map(function (model) {
      let data = Object.assign({}, model.getData());
      model.normalizeExportData(data);
      return data;
    }, this);
    this.saveJsonFile('tasks', items, root);
  },

  // INTERFACE

  saveInterfaces: function (root) {
    this.studioData.interfaces = this.app.interfaces.map(function (model) {
      return model.getData();
    });
    if (this.app.interfaces.length) {
      root = root.folder('interfaces');
      this.app.interfaces.forEach(function (model) {
        this.saveInterface(model, root);
      }, this);
    }
  },

  saveInterface: function (model, root) {
    var data = model.getEditorData();
    if (data) {
      root = root.folder(model.getName());
      root.file('index.html', this.studio.renderSample('interface-html', {
        'title': model.getTitle(),
        'body': $.trim(data['gjs-html'])
      }));
      root.folder('css').file('style.css', $.trim(data['gjs-css']));
    }
  },

  saveCommonInterfaceAssets: function (root) {
    if (!this.app.interfaces.length) {
      return Promise.resolve();
    }
    return $.when(
      $.get(Helper.createStaticUrl('lib/interface-handler/form.js')),
      $.get(Helper.createStaticUrl('lib/interface-handler/list.js')),
      $.get(Helper.createStaticUrl('lib/interface-handler/list-search.js')),
      $.get(Helper.createStaticUrl('lib/interface-handler/tree-menu.js'))
    ).then(function (...args){
      root = root.folder('interfaces').folder('common-assets');
      root.file('form.js', args[0][0]);
      root.file('list.js', args[1][0]);
      root.file('list-search.js', args[2][0]);
      root.file('tree-menu.js', args[3][0]);
    });
  },

  saveChangeLogs: function () {
    this.studioData.changeLogs = this.app.changeLogs;
  },

  savePackage: function (root) {
    let data = Object.assign({}, this.app.data.package, this.app.data);
    this.saveJsonFile('package', data, root);
  },

  saveJsonFile: function (name, data, folder) {
    folder.file(name +'.json', JSON.stringify(data, null, 2));
  },

  // STUDIO

  getClassStudioData: function (classes) {
    return this.indexItemOptionsByName(classes);
  },

  getWorkflowStudioData: function (workflows) {
    var result = {};
    workflows.forEach(function (data) {
      result[data.name] = {
        'states': this.indexItemOptionsByName(data.states),
        'transitions': this.indexItemOptionsByName(data.transitions)
      };
    }, this);
    return result;
  },

  indexItemOptionsByName: function (items) {
    var result = {};
    if (items instanceof Array) {
      items.forEach(function (data) {
        result[data.name] = data.options;
        delete data.options;
      });
    }
    return result;
  },

  // CLASS

  getClassData: function (model) {
    let data = Object.assign({}, model.getData());
    data.properties = Helper.Array.mapMethod('exportData', model.attrs);
    model.normalizeExportData(data);
    return data;
  },

  // VIEW

  getClassViewData: function (view) {
    var data;
    switch (view.data.name) {
      case 'list':
        data = this.getClassListView(view);
        break;
      default:
        data = this.getClassItemView(view);
    }
    delete data.name;
    return data;
  },

  getClassListView: function (view) {
    return Object.assign({
      'columns': view.getAttrs().map(this.getViewAttrData, this)
    }, view.data);
  },

  getClassItemView: function (view) {
    view.setGroupChildren();
    return Object.assign({
      'tabs': this.getClassViewTabs(view)
    }, view.data);
  },

  getClassViewTabs: function (view) {
    var tabs = view.getTabs();
    return tabs.length
        ? tabs.map(this.getViewTabData, this)
        : this.getDefaultViewTabData(view);
  },

  getViewTabData: function (tab) {
    return {
      'caption': tab.data.caption,
      'fullFields': this.getViewItemsData(tab.children),
      'shortFields': []
    };
  },

  getDefaultViewTabData: function (view) {
    return [{
      'caption': '',
      'fullFields': this.getViewItemsData(view.getNotGroupedItems()),
      'shortFields': []
    }];
  },

  getViewItemsData: function (items) {
    return items.map(function (item) {
      return item instanceof Studio.ClassViewGroupModel
        ? this.getViewGroupData(item)
        : this.getViewAttrData(item);
    }, this);
  },

  getViewAttrData: function (attr) {
    var data = Object.assign({
      'property': attr.data.name,
    }, attr.data);
    data.type = parseInt(data.type);
    delete data.name;
    delete data.group;
    return data;
  },

  getViewGroupData: function (group) {
    var data = Object.assign({
      'caption': '',
      'type': 0,
      'fields': this.getViewItemsData(group.children)
    }, group.data);
    delete data.display;
    delete data.name;
    delete data.group;
    return data;
  },

  // WORKFLOW

  getWorkflowData: function (model) {
    let data = Object.assign({}, model.getData());
    data.states = Helper.Array.mapMethod('exportData', model.states);
    data.transitions = Helper.Array.mapMethod('exportData', model.transitions);
    model.normalizeExportData(data);
    return data;
  },

  // NAV SECTION

  getNavSectionData: function (model) {
    let data = Object.assign({}, model.getData());
    return data;
  },

  // NAV ITEM

  getNavItemData: function (model) {
    let data = Object.assign({
      code: model.getCode()
    }, model.getData());
    this.normalizeNavItemInterface(model, data);
    model.normalizeExportData(data);
    delete data.name;
    return data;
  },

  normalizeNavItemInterface: function (model, data) {
    var face = model.getInterface();
    delete data.interface;
    if (!model.getUrl() && face) {
      data.url = face.getUrl();
    }
  }
});