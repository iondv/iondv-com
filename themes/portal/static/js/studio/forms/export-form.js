"use strict";

Studio.ExportForm = function ($modal, studio) {

  this.PROGRESS_TIMEOUT = 500;

  this.recentServiceAddressStoreId = 'SelectExternalServiceFormAttr.ExportForm';
  this.fakeData = {};

  Studio.Form.call(this, $modal, studio);
};

$.extend(Studio.ExportForm.prototype, Studio.Form.prototype, {
  constructor: Studio.ExportForm,

  init: function () {
    Studio.Form.prototype.init.call(this);

    this.alert = new Studio.Alert(this.$modal.find('.form-alert'));
    this.$export = this.$modal.find('.form-export');
    this.$abort = this.$modal.find('.form-abort');
    this.$ready = this.$modal.find('.form-ready');

    this.$newSection = this.$modal.find('[data-section="new"]');
    this.$progressSection = this.$modal.find('[data-section="progress"]');
    this.$readySection = this.$modal.find('[data-section="ready"]');

    this.$export.click(this.onExport.bind(this));
    this.$abort.click(this.onAbort.bind(this));
    this.$ready.click(this.onReady.bind(this));
  },

  show: function (app) {
    this.app = app;
    this.alert.hide();
    this.reset();
    this.$modal.modal('show');
    this.requestInfo().done(this.processData.bind(this));
  },

  reset: function () {
    this.$newSection.hide();
    this.$progressSection.hide();
    this.$readySection.hide();
    this.$export.hide();
    this.$abort.hide();
    this.$ready.hide();
  },

  requestInfo: function () {
    this.toggleLoader(true);
    return this.postInfo().always(function () {
      this.toggleLoader(false);
    }.bind(this)).fail(function (data) {
      this.alert.danger('Request error');
    }.bind(this));
  },

  processData: function (data) {
    this.reset();
    if (!data || data.error === 'no data') {
      return this.processNew();
    }
    if (data.url) {
      return this.processReady(data);
    }
    if (data.progress) {
      return this.processProgress(data);
    }
    this.alert.danger('Request error');
  },

  processNew: function () {
    this.$newSection.show();
    this.$export.show();
  },

  processProgress: function (data) {
    this.$progressSection.show();
    var $bar = this.$progressSection.find('.progress-bar');
    $bar.css('width', data.progress + '%');
    $bar.html(data.progress + '%');
    setTimeout(function () {
      if (this.isShown()) {
        this.postInfo().done(this.processData.bind(this));
      }
    }.bind(this), this.PROGRESS_TIMEOUT);
  },

  processReady: function (data) {
    this.alert.hide();
    this.$readySection.show();
    this.$ready.attr('href', data.url).show();
  },

  onExport: function () {
    this.studio.toggleLoader(true);
    setTimeout(function () {
      var zip = (new Studio.AppDownload(this.app)).execute();
      zip.then(this.upload.bind(this), function (err) {
        console.error(err);
        this.studio.toggleLoader(false);
      }.bind(this));
    }.bind(this), 100);
  },

  onReady: function () {

  },

  onAbort: function () {

  },

  postInfo: function (data) {
    var id = this.app.getExternalId();
    if (!id) {
      return this.postResolved({
        error: 'no data'
      });
    }
    return this.post({
      'action': 'info',
      'id': id
    });
  },

  postResolved: function (data) {
    this.abortPost();
    return $.Deferred().resolve(data);
  },

  post: function (data) {
    this.abortPost();
    if (this.params.serviceUrl) {
      this.xhr = $.post(this.params.serviceUrl, data);
    } else {
      this.xhr = this.fakePost(data);
    }
    return this.xhr;
  },

  abortPost: function () {
    if (this.xhr) {
      this.xhr.abort && this.xhr.abort();
      this.xhr = null;
    }
  },

  // UPLOAD BLOB

  upload: function (blob) {
    this.abortPost();
    if (!this.params.serviceUrl) {
      return this.xhr = this.fakeUpload(data).done(this.doneUpload.bind(this));
    }
    this.xhr = new XMLHttpRequest;
    this.xhr.open('POST', this.params.serviceUrl);
    this.xhr.onreadystatechange = this.onReadyStateChange.bind(this);
    var data = {
      'action': 'upload',
      'file': blob
    };
    this.xhr.send(data);
  },

  onReadyStateChange: function (event) {
    var xhr = event.target;
    if (xhr.readyState === 4) {
      xhr.status === 200 ? this.doneUpload(xhr) : this.failUpload(xhr);
    }
  },

  doneUpload: function (xhr) {
    this.studio.toggleLoader(false);
    var data = Helper.parseJson(xhr.response);
    if (!data.id) {
      return this.alert.danger('Invalid ID');
    }
    this.app.setExternalId(data.id);
    this.studio.store.save();
    this.processData(data);
    this.alert.success('The application has been successfully registered!');
  },

  failUpload: function (xhr) {
    this.studio.toggleLoader(false);
    var message = xhr.status ? (xhr.status +' '+ xhr.statusText) : this.getFailedMessage();
    this.alert.danger(message);
  },

  getErrorMessage: function (data) {
    if (data) {
      if (data.error) {
        return data.error;
      }
      if (data.upload && data.create) {
        if (data.upload.error) {
          return data.upload.error;
        }
        if (data.create.error) {
          return data.create.error;
        }
        return null;
      }
    }
    return this.getFailedMessage();
  },

  getSuccessMessage: function (data) {
    var result = Helper.L10n.translate('Application exported');
    return result;
  },

  getFailedMessage: function (data) {
    return Helper.L10n.translate('Export is failed');
  },

  getFormData: function (data) {
    var result = new FormData;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        result.append(key, Helper.stringifyBoolean(data[key]));
      }
    }
    return result;
  },

  // BEHAVIOR

  getBehaviorMap: function () {
    return {
      'customHandler': {
        beforeClose: this.beforeClose.bind(this)
      }
    };
  },

  beforeClose: function (behavior) {
    this.abortPost();
  },

  // FAKE

  fakePost: function (data) {
    var xhr = $.Deferred();
    setTimeout(function () {
      data = data || {};
      var item = this.fakeData[data.id];
      if (!item) {
        return xhr.resolve({
          error: 'no data'
        });
      }
      item.progress += 5;
      if (item.progress >= 100) {
        item.progress = 100;
        item.url = 'ready url';
      }
      xhr.resolve(item);
    }.bind(this), 1000);
    return xhr;
  },

  fakeUpload: function (data) {
    var xhr = $.Deferred();
    setTimeout(function () {
      var item = {
        'id': Helper.generateId(),
        'progress': 5
      };
      this.fakeData[item.id] = item;
      xhr.resolve({
        response: item
      });
    }.bind(this), 2000);
    return xhr;
  },
});
