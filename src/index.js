const helper = require('think-helper');
const Mysql = require('./mysql');
const MysqlRelation = require('./mysql/relation');

Mysql.Relation = MysqlRelation;
module.exports = app => {

  const getClass = function(type, name, m){
    let mcls = app[type];
    let cls = null;
    if(app.modules.length){
      if(mcls[m]){
        cls = mcls[m][name];
      }
      if(!cls && m !== 'common' && mcls.common){
        cls = mcls.common[name];
      }
    }else{
      cls = mcls[name];
    }
    return cls;
  }

  const getModels = function(m){
    if(app.modules.length){
      return helper.extend({}, app.models.common, app.models[m]);
    }else{
      return app.models;
    }
  }

  const model = function(name, config, m = 'common'){
    const cls = getClass('models', name, m);
    let commonConfig = helper.parseAdapterConfig(this.config('model'));
    config = Object.assign({}, commonConfig, config);
    //add models in config, it's need in model when get relation model instance
    config.models = getModels(m) || {};
    if(cls){
      return new cls(name, config);
    }
    return new Mysql(name, config);
  }

  return {
    think: {
      Model: Mysql,
      model
    },
    controller: {
      model: (name, config, m = this.module) => {
        return this.ctx.model(name, config, m);
      }
    },
    context: {
      model: (name, config, m = this.module) => {
        config = helper.parseAdapterConfig(this.config('model'), config);
        //add adapter cache config
        config.cache = helper.parseAdapterConfig(this.config('cache'), config.cache);
        return model(name, config, m);
      }
    }
  };
}