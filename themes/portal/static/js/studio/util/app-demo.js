"use strict";

Studio.AppDemo = function (url, studio) {
  this.studio = studio;
  this.url = url;
};

$.extend(Studio.AppDemo.prototype, Studio.AppUpload.prototype, {

  constructor: Studio.AppDemo,

  execute: function () {
    (new JSZip.external.Promise(function (resolve, reject) {
      JSZipUtils.getBinaryContent(this.url, function(err, data) {
        err ? reject(err) : resolve(data);
      }.bind(this));
    }.bind(this)))
      .then(this.loadFile.bind(this))
      .catch(this.handleError.bind(this));
  },
});