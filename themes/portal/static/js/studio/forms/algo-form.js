"use strict";

Studio.AlgoForm = function ($modal, studio) {
  Studio.ModelForm.call(this, $modal, Studio.AlgoModel, studio);
};

$.extend(Studio.AlgoForm.prototype, Studio.ModelForm.prototype, {
  constructor: Studio.AlgoForm,

  create: function (app, defaults) {
    this.app = app;
    Studio.ModelForm.prototype.create.call(this, defaults);
  },

  getValidationRules: function () {
    return {
      name: [
        ['required'],
        ['identifier']
      ],
      caption: [
        ['required']
      ]
    };
  }
});