import local from './localstorage.js'
import session from './session.js'

let storage = {
  config:{
    type: 'local',
    expires: new Date().getTime() + 60 * 60 * 1000
  },

  getStorage(options) {
    let config = {};
    if(options) {
      config = Object.assign({}, this.config, options);
    } else {
      config = this.config;
    }

    return this.createStorage(config.type);
  },

  createStorage(name) {
    switch(name) {
      case 'local': return local; break;
      case 'session': return session; break;
    }
  },

  getItem(key, options) {
    let store = this.getStorage(options);
    return store.getItem(key);
  },

  setItem(key, value, options) {
    let store = this.getStorage(options);
    store.setItem(key, value);
  },

  removeItem(key, options) {
    let store = this.getStorage(options);
    store.removeItem(key);
  },

  getAll() {

  },

  clear(options) {
    let store = this.getStorage(options);
    store.clear();
  },

  key(n) {

  },

  lenght() {

  },

  has(key) {

  },

  forEach(cb) {

  },

  deleteAllExpires() {

  },

  getMaxSpace(options) {
    let store = this.getStorage(options);
    store.getMaxSpace();
  },

  getUsedSpace(options) {
    let store = this.getStorage(options);
    store.getUsedSpace();
  }
}

export default storage;