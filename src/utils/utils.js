import {getRequest, postRequest} from './api'
import {constructReqData} from './data'
import {Message} from 'element-ui'

export const isNotNullORBlank = (...args)=> {
  for (var i = 0; i < args.length; i++) {
    var argument = args[i];
    if (argument == null || argument == '' || argument == undefined) {
      Message.warning({message: '数据不能为空!'})
      return false;
    }
  }
  return true;
}
export const initMenu = (router, store) => {
  if (store.state.routes.length > 0) {
    return;
  }
  constructReqData({}).then(reqData => {
    postRequest("http://127.0.0.1:8081/tbtool/menu/list", reqData).then(resp=> {
      if (resp && resp.status == 200) {
        var fmtRoutes = formatRoutes(resp.data.content.list);
        router.addRoutes(fmtRoutes);
        store.commit('initMenu', fmtRoutes);
        store.dispatch('connect');
      }
    });
  });
}
export const formatRoutes = (routes)=> {
  let fmRoutes = [];
  routes.forEach(router=> {
    let {
      path,
      component,
      name,
      meta,
      iconCls,
      children
    } = router;
    if (children && children instanceof Array) {
      children = formatRoutes(children);
    }
    let fmRouter = {
      path: path,
      component(resolve){
        if (component.startsWith("Home")) {
          require(['../components/' + component + '.vue'], resolve)
        } else if (component.startsWith("Emp")) {
          require(['../components/emp/' + component + '.vue'], resolve)
        } else if (component.startsWith("Per")) {
          require(['../components/personnel/' + component + '.vue'], resolve)
        } else if (component.startsWith("Sal")) {
          require(['../components/salary/' + component + '.vue'], resolve)
        } else if (component.startsWith("Sta")) {
          require(['../components/statistics/' + component + '.vue'], resolve)
        } else if (component.startsWith("Sys")) {
          require(['../components/system/' + component + '.vue'], resolve)
        } else if(component.startsWith("Task")) {
          require(['../components/task/' + component + '.vue'], resolve)
        } else if(component.startsWith("TDetail")) {
          require(['../components/tdetail/' + component + '.vue'], resolve)
        } else if(component.startsWith("User")) {
          require(['../components/user/' + component + '.vue'], resolve)
        }
      },
      name: name,
      iconCls: iconCls,
      meta: {
        "keepAlive": true,
        "requireAuth": true
      },
      children: children
    };
    fmRoutes.push(fmRouter);
  });

  return fmRoutes;
}
