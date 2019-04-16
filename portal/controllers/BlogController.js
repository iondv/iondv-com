const {resTemplate} = require('modules/portal/backend/template');
const {onApiError} = require('modules/portal/backend/error');
const moduleName = require('modules/portal/module-name');
const moment = require('moment');
const di = require('core/di');

module.exports = function (options) {

  this.init = () => {
    const scope = di.context('portal');

    options.module.get('/portal/blog/:page?', (req, res) => {
      let page = parseInt(req.params.page) || 1;
      let count = 10;
      let offset = (page - 1) * count;
      scope.provider.getResources('blog', offset, count)
        .then(items => {
          res.render('../../themes/portal/templates/pages/blog', extendParams(req, {
            'moment': moment,
            'items': items,
            'pager': {
              'current': page ,
              'total': Math.ceil(items.total / count),
              'url': page => `/portal/blog/${page}`
            }
          }));
        })
        .catch(err => onApiError(scope, err, res));
    });

    options.module.get('/portal/blog/post/:id', (req, res) => {
      scope.provider.getResource('blog', req.params.id)
        .then(item => {
          res.render('../../themes/portal/templates/pages/post', extendParams(req, {
            'moment': moment,
            'item': item
          }));
        })
        .catch(err => onApiError(scope, err, res));
    });

    function extendParams (req, params) {
      return {
        'hostUrl': `${req.protocol}://${req.get('host')}`,
        'portal': scope.settings.get('portal.portalName'),
        'module': moduleName,
        'query': req.query,
        ...params
      };
    }
  };
};