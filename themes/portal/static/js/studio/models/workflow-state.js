"use strict";

Studio.WorkflowStateModel = function (workflow, data) {
  this.app = workflow.app;
  this.workflow = workflow;
  Studio.Model.call(this, 'workflowState:', this.app.studio, data);
};

$.extend(Studio.WorkflowStateModel.prototype, Studio.Model.prototype, {
  constructor: Studio.WorkflowStateModel,

  getStartTransitions: function () {
    return this.workflow.transitions.filter(function (model) {
      return model.getStartState() === this;
    }, this);
  },

  remove: function () {
    this.workflow.removeState(this);
  }

});