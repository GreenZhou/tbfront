import store from '../store'
import {storageManager} from '../store'

const defaultShowSize = 30;

export const constructReqData = (data, pageNo, showSize) => {
    let result = {};

    if(pageNo) {
        result.pageNo = pageNo;
        result.showSize = showSize ? showSize : defaultShowSize;
    }

    // 带上token
    if(storageManager.getToken()) {
        result.token = storageManager.getToken();
    }

    result.content = data ? data : {};

    return Promise.resolve(result);
}

export const resolveRespData = (data) => {
    let result;

    if(data && '0000' === data.code) {
        result = data.content;
        // 如果接口返回token数据，进行更新
        if(result.token) {
            store.commit('setToken', result.token);
        }        
    } else {
        result = (data && data.message) ? data.message : '系统错误'; 
    }

    return Promise.resolve(result);
}