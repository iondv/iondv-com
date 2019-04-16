"use strict";

Studio.AlgoModel = function (app, data) {
  this.app = app;
  Studio.Model.call(this, 'algo:', app.studio, data);
};

$.extend(Studio.AlgoModel.prototype, Studio.Model.prototype, {
  constructor: Studio.AlgoModel,

  remove: function () {
    this.app.removeAlgo(this);
  },

  getScheme: function () {
    return JSON.parse(JSON.stringify(this.data.scheme));
  },

  setScheme: function (scheme) {
    this.data.scheme = JSON.parse(JSON.stringify(scheme));
  },

  importData: function (data) {
    if (!data.scheme) {
      data.scheme = {
        nodes: [
          {
            h: 70,
            id: 'start',
            left: 100,
            text: 'Начало',
            top: 200,
            type: 'start',
            w: 100
          }
        ]
      };
    }
    this.setData(data);
  },

});

