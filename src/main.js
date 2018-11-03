// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import store from './store'
import {storageManager} from './store'
import {constructReqData} from './utils/data'
import {resolveRespData} from './utils/data'
import {getRequest} from './utils/api'
import {postRequest} from './utils/api'
import {deleteRequest} from './utils/api'
import {putRequest} from './utils/api'
import {initMenu} from './utils/utils'
import {isNotNullORBlank} from './utils/utils'
import './utils/filter_utils'
import 'font-awesome/css/font-awesome.min.css'

Vue.config.productionTip = false
Vue.use(ElementUI)

Vue.prototype.constructReqData = constructReqData;
Vue.prototype.resolveRespData = resolveRespData;
Vue.prototype.getRequest = getRequest;
Vue.prototype.postRequest = postRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.isNotNullORBlank = isNotNullORBlank;
Vue.prototype.storageManager = storageManager;

router.beforeEach((to, from, next)=> {
  if (to.name == 'Login') {
    next();
    return;
  }

  if(!to.meta.requireAuth) {
    next();
  }

  var loginName = storageManager.getUser().loginName;
  if (!loginName) {
    if (to.meta.requireAuth || to.name) {
      next({path: '/', query: {redirect: to.path}})
    } else {
      next();
    }
  } else {
    initMenu(router, store);
    if(to.path=='/chat')
      store.commit("updateMsgList", []);
    next();
  }
});

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: {App}
})