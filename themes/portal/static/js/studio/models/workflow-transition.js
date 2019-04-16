"use strict";

Studio.WorkflowTransitionModel = function (workflow, data) {
  this.app = workflow.app;
  this.workflow = workflow;
  Studio.Model.call(this, 'workflowState:', this.app.studio, data);
};

$.extend(Studio.WorkflowTransitionModel.prototype, Studio.Model.prototype, {
  constructor: Studio.WorkflowTransitionModel,

  getStartState: function () {
    return this.workflow.getState(this.data.startState);
  },

  getFinishState: function () {
    return this.workflow.getState(this.data.finishState);
  },

  remove: function () {
    this.workflow.removeTransition(this);
  },

  // STORE

  exportData: function () {
    let data = Object.assign({}, this.getData());
    this.normalizeExportData(data);
    return data;
  },

  normalizeExportData: function (data) {
    if (data) {
      this.workflow.replaceIdToStateName('startState', data);
      this.workflow.replaceIdToStateName('finishState', data);
    }
    return data;
  },

  afterImport: function () {
    this.normalizeImportData(this.data);
  },

  normalizeImportData: function (data) {
    if (data) {
      this.workflow.replaceStateNameToId('startState', data);
      this.workflow.replaceStateNameToId('finishState', data);
    }
    return data;
  }
});