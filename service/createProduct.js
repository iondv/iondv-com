/**
 * Created by IVAN KUZNETSOV{piriflegetont@gmail.com} on 25.09.2018.
 */
'use strict';
const assert = require('assert');
const Service = require('modules/rest/lib/interfaces/Service');
const dataToFilter = require('core/interfaces/DataRepository/lib/util').dataToFilter;

/**
 * REST сервис для создания объекта класса product. Реализация абстрактного REST сервиса.
 * @param options
 */
function CreateProduct(options) {
  const dr = options.dataRepo;
  const mr = options.metaRepo;
  const is = options.imgStorage;
  const className = options.className;

  /**
   * Создаёт объект указанного класса. Для поля screenshots сохраняет файлы в файловом хранилище.
   * @param {Object} data тело запроса, объект, который нужно сохранить
   * @returns {Object} объект, сохранённый в базе данных.
   */
  async function create (data) {
    try {
      let screenshots = typeof data.screenshots !== 'undefined' ? data.screenshots : [];
      let imgSaveResult = await Promise.all(screenshots.map((img) => {
        return is.accept(Buffer.from(img.data, 'base64'), null, {name: img.name, size: img.size, mime: img.mime})
      }));
      data.screenshots = imgSaveResult.map(img => img.id);

      let newitem = await dr.createItem(className, data);
      let props = newitem.getProperties();
      let result = {};
      for (let key in props) {
        if (props.hasOwnProperty(key)) {
          result[props[key].getName()] = props[key].getValue();
        }
      }
      return {data: result};
    } catch (err) {
      return err;
    }
  }

  /**
   * Редактирует объект указанного класса. Для поля screenshots сравнивает имя каждого переданного файла с именами
   * сохранённых файлов, и пропускает те, что уже есть.
   * @param {Object} data тело запроса, объект, который нужно отредактировать.
   * @param {Object} item существующий обхект.
   * @returns {Object} объект, сохранённый в базе данных.
   */
  async function update (data, oldItem) {
    try {
      let screenshots = typeof data.screenshots !== 'undefined' ? data.screenshots : [];
      let oldScreensIds = oldItem.screenshots || [];
      let oldScreensObjects = await is.fetch(oldScreensIds);

      let oldScreensNames = oldScreensObjects.map(screen => screen.name);
      let needToBeAccepted = screenshots.filter(img => oldScreensNames.indexOf(img.name) === -1);
      let newScreensObjects = await Promise.all(needToBeAccepted.map((img) => {
        return is.accept(Buffer.from(img.data, 'base64'), null, {name: img.name, size: img.size, mime: img.mime})
      }));
      let newScreensIds = newScreensObjects.map(img => img.id);
      let newScreensNames = screenshots.map(img => img.name);
      let existedScreensIds = oldScreensObjects.filter(img => newScreensNames.indexOf(img.name) !== -1);
      existedScreensIds = existedScreensIds.map(screen => screen.id);
      data.screenshots = [].concat(existedScreensIds, newScreensIds);
      let newItem = await dr.editItem(className, oldItem.id, data);
      let props = newItem.getProperties();
      let result = {};
      for (let key in props) {
        if (props.hasOwnProperty(key)) {
          result[props[key].getName()] = props[key].getValue();
        }
      }
      return {data: result};
    } catch (err) {
      return err;
    }
  }

  /**
   *
   * @param value
   * @param dictionary
   */
  function checkDictionary(value, dictionary) {
    let exists = false;
    let {list} = dictionary;
    for (let i = 0; i < list.length; i++) {
      if (value === list[i].key) {
        value = list[i].value;
        exists = true;
        break;
      }
    }
    return exists;
  }

  /**
   * Проверить переданный файл на наличие полей композитных индексов, затем составить из присутствующих полей запрос в
   * базу данных.
   * @param {Object} data тело запроса - объект, который нужно найти.
   * @param {Array} index композитный индекс, поля в объекте, сочитание которых должно быть уникальным.
   * @returns {Object} объект запроса к базе данных. Конъюнкция наличия всех переданных полей в объекте.
   */
  function makeConditions(data, index) {
    assert.strictEqual(Array.isArray(index), true, 'Композитные индексы уквзвнного класса не массив');
    index.forEach(index => {
      assert.notStrictEqual(typeof data[index], 'undefined',
        `Поле ${index} композитного индекса отсутствует в объекте запроса`);
    });
    let conditions = {};
    index.forEach(index => {
      conditions[index] = data[index]
    });
    return dataToFilter(conditions);
  }

  /**
   * Обработчик запросов. Создаёт объекты указанного в deploy класса. По-умолчанию класс product.
   * @param {Request} req - объект запроса
   * @returns {Promise}
   * @private
   */
  this._handle = async function (req) {
    let meta = await mr.getMeta(className);
    let props = await mr.propertyMetas(className);
    let complexIds = meta.plain.compositeIndexes;
    let data = req.body;
    let oldItem;
    let conditions;
    let langCorrect = checkDictionary(data.lang, props.filter(i => i.name === 'lang')[0].selectionProvider);
    let regionCorrect = checkDictionary(data.region, props.filter(i => i.name === 'region')[0].selectionProvider);
    if (!langCorrect)
      return {err: 'Неверные данные поля lang!'};
    if (!regionCorrect)
      return {err: 'Неверные данные поля region!'};
    if (complexIds) {
      for (let i = 0; i < complexIds.length; i++) {
        conditions = await makeConditions(data, complexIds[i].properties);
        oldItem = await dr.aggregate(className, {filter: conditions});
        if (Array.isArray(oldItem)) {
          assert.strictEqual(oldItem.length < 2, true, 'Найдено более одного объекта с одним композитным индексом');
          oldItem = oldItem[0];
          break;
        }
      }
    }
    if (data.id) {
      oldItem = await dr.getItem(className, data.id);
    }
    if (oldItem) {
      return update(data, oldItem);
    } else {
      return create(data);
    }
  };
}

CreateProduct.prototype = new Service();

module.exports = CreateProduct;
