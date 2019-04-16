"use strict";

Studio.AppForm = function ($modal, studio) {
  Studio.ModelForm.call(this, $modal, Studio.AppModel, studio);
};

$.extend(Studio.AppForm.prototype, Studio.ModelForm.prototype, {
  constructor: Studio.AppForm,

  getValidationRules: function () {
    return {
      name: [
        ['required'],
        ['identifier'],
        ['uniqueModel', {
          getModel: this.getUniqueModel
        }]
      ]
    };
  },

  getUniqueModel: function (value, validator) {
    return validator.attr.form.studio.getAppByName(value);
  },

  getBehaviorMap: function () {
    return {
      'customHandler': {
        afterUpdate: this.afterUpdate.bind(this)
      }
    };
  },

  afterUpdate: function (behavior) {
    if (this.isVersionChanged()) {
      this.model.setChangedState(true); // disable auto versioning after manual editing
    }
  },

  isVersionChanged: function () {
    return false; // this.model && this.getValue('version') !== this.model.getVersion();
  },
});