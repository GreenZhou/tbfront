import Vue from 'vue'
import Vuex from 'vuex'
import '../lib/sockjs'
import '../lib/stomp'
import storage from './storage'

Vue.use(Vuex)

var store = new Vuex.Store({
  state: {
    token: '',
    user: {
      id: '',
      loginName: '',
      userface: '',
      userName: '',
      userType: -1
    },
    routes: [],
    msgList: [],
    isDotMap: new Map(),
    currentFriend: {},
    stomp: Stomp.over(new SockJS("/ws/endpointChat")),
    nfDot: false
  },
  mutations: {
    initMenu(state, menus){
      state.routes = menus;
      storage.setItem("routes", menus, { type: 'session' });
    },
    login(state, user){
      state.user = user;
      storage.setItem("user", user, { type: 'session' });
    },
    logout(state){
      storage.removeItem("user", { type: 'session' });
      state.routes = [];
    },
    toggleNFDot(state, newValue){
      state.nfDot = newValue;
    },
    updateMsgList(state, newMsgList){
      state.msgList = newMsgList;
    },
    updateCurrentFriend(state, newFriend){
      state.currentFriend = newFriend;
    },
    addValue2DotMap(state, key){
      state.isDotMap.set(key, "您有未读消息")
    },
    removeValueDotMap(state, key){
      state.isDotMap.delete(key);
    },
    setToken(state, newToken) {
      if(newToken) {
        state.token = newToken;
        storage.setItem("token", newToken, { type: 'session' });
      }
    }
  },
  actions: {
    connect(context){
      context.state.stomp = Stomp.over(new SockJS("/ws/endpointChat"));
      context.state.stomp.connect({}, frame=> {
        context.state.stomp.subscribe("/user/queue/chat", message=> {
          var msg = JSON.parse(message.body);
          var oldMsg = window.localStorage.getItem(context.state.user.username + "#" + msg.from);
          if (oldMsg == null) {
            oldMsg = [];
            oldMsg.push(msg);
            window.localStorage.setItem(context.state.user.username + "#" + msg.from, JSON.stringify(oldMsg))
          } else {
            var oldMsgJson = JSON.parse(oldMsg);
            oldMsgJson.push(msg);
            window.localStorage.setItem(context.state.user.username + "#" + msg.from, JSON.stringify(oldMsgJson))
          }
          if (msg.from != context.state.currentFriend.username) {
            context.commit("addValue2DotMap", "isDot#" + context.state.user.username + "#" + msg.from);
          }
          //更新msgList
          var oldMsg2 = window.localStorage.getItem(context.state.user.username + "#" + context.state.currentFriend.username);
          if (oldMsg2 == null) {
            context.commit('updateMsgList', []);
          } else {
            context.commit('updateMsgList', JSON.parse(oldMsg2));
          }
        });
        context.state.stomp.subscribe("/topic/nf", message=> {
          context.commit('toggleNFDot', true);
        });
      }, failedMsg=> {

      });
    }
  }
});

export default store;

export let storageManager = {
  getToken: () => {
    return store.state.token || storage.getItem("token", { type: 'session' }) || '';
  },
  getUser: () => {
    let user = store.state.user;
    if(user || user.id) {
      user = storage.getItem("user", { type: 'session' });
      if(user || user.id) {
        // 重新给store.state.user赋值
        store.state.user = user;
      } else {
        user = {
          id: '',
          loginName: '',
          userface: '',
          userName: '',
          userType: -1
        };
        store.state.user = user;
      }
    }

    return user;
  },
  getMenus: () => {
    return store.state.user || storage.getItem("routes", { type: 'session' }) || [];
  }
}
