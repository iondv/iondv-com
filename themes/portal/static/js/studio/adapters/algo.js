"use strict";

Studio.AlgoAdapter = function ($container, studio) {
  this.studio = studio;
  this.menu = studio.menu;
  this.$container = $container;
};

$.extend(Studio.AlgoAdapter.prototype, {

  initListeners: function () {
    this.studio.events.on('changeContentMode', this.onChangeContentMode.bind(this));
    this.studio.events.on('createApp', this.onCreateApp.bind(this));
    this.studio.events.on('createAlgo', this.onCreateAlgo.bind(this));
    this.studio.events.on('removeAlgo', this.onRemoveAlgo.bind(this));
    this.studio.events.on('changeActiveItem', this.onChangeActiveItem.bind(this));

    jsPlumbToolkit.ready(function () {
      FlowChart.bind('dataUpdated', function () {
        var app = this.studio.getActiveApp();
        var algo = this.studio.getActiveAlgo();
        if (app && algo) {
          window.renderer.storePositionsInModel();
          algo.setScheme(window.FlowChart.exportData());
          this.studio.triggerChangeModel(algo);
        }
      }.bind(this));
    }.bind(this));
  },

  onChangeContentMode: function (event, mode) {
    this.$container.toggle(mode === 'algo');
  },

  onCreateApp: function (event, model) {
  },

  onCreateAlgo: function (event, model) {
  },

  onRemoveAlgo: function (event, model) {
  },

  onChangeActiveItem: function (event) {
    var app = this.studio.getActiveApp();
    var algo = this.studio.getActiveAlgo();
    var editor = this.$container.find('#jtk-demo-flowchart');
    if (app && algo) {
      var scheme = algo.getScheme();
      if (window.FlowChart) {
        FlowChart.clear();
        FlowChart.load({
          type: 'json',
          data: scheme
        });
      }
      editor.show();
    } else {
      if (window.FlowChart) {
        FlowChart.clear();
      }
      editor.hide();
    }
  },

  restore: function () {
  }
});
