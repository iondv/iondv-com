const ResourceAdapter = require('modules/portal/lib/interfaces/ResourceAdapter');
const Resource = require('modules/portal/lib/interfaces/Resource');
const F = require('core/FunctionCodes');

/**
 *
 * @param {{}} options
 * @param {DataRepository} options.dataRepo
 * @param {String} options.className
 * @constructor
 */
function Adapter(options) {

  if (!options.dataRepo) {
    throw new Error('Не указан репозиторий данных.');
  }
  const className = options.className;

  this._getResources = (offset, count) => {
    try {
      const result = [];
      const listOptions = {
        'filter': {[F.AND]: [
          {[F.EQUAL]: ['$publish', true]},
          {[F.LESS_OR_EQUAL]: ['$datePublish', new Date]}
        ]},
        'count': count || 10,
        'offset': offset || 0,
        'countTotal': true,
        'sort': {
          'datePublish': -1
        }
      };
      return options.dataRepo.getList(className, listOptions)
        .then(items=> {
          return items;
        });
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   * @param {String} id
   */
  this.getResource = id => options.dataRepo.getItem(className, id, {}).then(item => {
    if (!item.get('publish')) {
      return Promise.resolve(null);
    }
    return getItems(item.get('relatedPosts')).then(items => {
      item.set('relatedPosts', items);
      return Promise.resolve(item);
    });
  });

  function getItems (ids) {
    if (!Array.isArray(ids) || !ids.length) {
      return Promise.resolve([]);
    }
    return options.dataRepo.getList(className, {
      'filter': {[F.AND]: [
        {[F.EQUAL]: ['$publish', true]},
        {[F.IN]: ['$id', ids]}
      ]}
    });
  }
}

Adapter.prototype = new ResourceAdapter();
module.exports = Adapter;

