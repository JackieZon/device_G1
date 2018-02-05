import Vue from 'vue'
import { Confirm, Alert, Toast, Notify, Loading } from 'vue-ydui/dist/lib.rem/dialog'

Vue.prototype.$dialog = {
  confirm: Confirm,
  alert: Alert,
  toast: Toast,
  notify: Notify,
  loading: Loading
}

export const toast = ({msg, time}) => {
    Toast({mes: msg, timeout: time || 2000});
}

export const confirm = ({title, msg, opts}) => {

    return new Promise((resolve, reject)=>{
        Confirm({
            title: title,
            mes: msg || '提醒',
            opts: [{
                txt: '取消',
                color: false,
                callback: () => {
                    resolve(0)
                }
            },
            {
                txt: '确定',
                color: true,
                callback: () => {
                    resolve(1)
                }
            }]
        });
    })

}

/**
 * 
 * @param {*} param0 
 */
export const alert = ({msg}) => {
    Alert({mes: msg || '温馨提示！'});
}

export const alertStay = ({msg, title}) => {

    Confirm({
        title: title || '温馨提示',
        mes: msg || '提醒',
        // opts: [
        //     {
        //         txt: '确定',
        //         color: '#CCC',
        //         stay: true,
        //         callback: () => {
        //         }
        //     }
        // ]
    });

}

export const loading = ({msg, time}) => {
    Loading.open(msg || '加载中...');
    setTimeout(() => {
        Loading.close();
    }, time || 2000);
}

export const success = ({msg, time}) => {
    Toast({
        mes: msg || '成功！',
        timeout: time || 2000,
        icon: 'success'
    });
}

export const error = ({msg, time}) => {
    Toast({
        mes: msg || '操作失败！',
        timeout: time || 2000,
        icon: 'error'
    });
}

/**
 * 
 * @param {*} param0 
 */
export const notify = ({msg, time}) => {
    return new Promise((resolve, reject)=>{
        Notify({
            mes: msg || '有新消息！',
            timeout: time || 5000,
            callback: (e) => {
                resolve(e)
            }
        });
    })
}

