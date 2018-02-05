import Vue from 'vue'
import axiosApi from './axios'
import { apiUrl } from './subei_config'

/**
 * 遍历arr，把元素分别放入tmp数组(不存在才放)
 * @param { Array } arr 
 */
export function unique(arr){
  var tmp = new Array();
  for(var i in arr){
  //该元素在tmp内部不存在才允许追加
  if(tmp.indexOf(arr[i])==-1){
    tmp.push(arr[i]);
  }
  }
  return tmp;
}

/**
 * 控制台打印
 */
export const l = {
  i: function (desc, obj, line, theadname, objvalue) {
      console.log(
          new Date().format('yyyy-MM-dd hh:mm:ss:S') +
          "\t" +
          (desc ? JSON.stringify(desc) : '') +
          "\t" +
          (obj ? JSON.stringify(obj) : '') +
          "\t" +
          (theadname ? JSON.stringify(theadname) : '') +
          "\t" +
          (line ? JSON.stringify(line) : '') +
          "\t" +
          (objvalue ? JSON.stringify(objvalue) : '')
      );
  },
  e: function (desc, obj, line, theadname, objvalue) {
      console.error(
          new Date().format('yyyy-MM-dd hh:mm:ss:S') +
          "\t" +
          (desc ? JSON.stringify(desc) : '') +
          "\t" +
          (obj ? JSON.stringify(obj) : '') +
          "\t" +
          (theadname ? JSON.stringify(theadname) : '') +
          "\t" +
          (line ? JSON.stringify(line) : '') +
          "\t" +
          (objvalue ? JSON.stringify(objvalue) : '')
      );
  },
  l: function (desc, obj, line, theadname, objvalue) {
      console.info(
          new Date().format('yyyy-MM-dd hh:mm:ss:S') +
          "\t" +
          (desc ? JSON.stringify(desc) : '') +
          "\t" +
          (obj ? JSON.stringify(obj) : '') +
          "\t" +
          (theadname ? JSON.stringify(theadname) : '') +
          "\t" +
          (line ? JSON.stringify(line) : '') +
          "\t" +
          (objvalue ? JSON.stringify(objvalue) : '')
      );
  },
  w: function (desc, obj, line, theadname, objvalue) {
      console.warn(
          new Date().format('yyyy-MM-dd hh:mm:ss:S') +
          "\t" +
          (desc ? JSON.stringify(desc) : '') +
          "\t" +
          (obj ? JSON.stringify(obj) : '') +
          "\t" +
          (theadname ? JSON.stringify(theadname) : '') +
          "\t" +
          (line ? JSON.stringify(line) : '') +
          "\t" +
          (objvalue ? JSON.stringify(objvalue) : '')
      );
  },
}

// 底部文字提示
export const toast = (info, width, posttion) => {
  Vue.$vux.toast.show({
    text: info,
    type: 'text',
    position: !posttion ? 'bottom' : posttion,
    width: !width ? '7.6rem' : width,
    time: 1000
  })
}

// 弹出确认框
export const openConfirm = (discription, callback) => {
  Vue.$vux.confirm.show({
    title: '提示',
    content: discription,
    onCancel () {
      console.log('点击取消')
    },
    onConfirm () {
      if (typeof (callback) === 'function') {
        callback()
      }
    }
  })
}

// 弹出确认框
export const openConfirms = (discription, callback) => {
  Vue.$vux.alert.show({
    title: '提示',
    content: discription,
    onShow () {
      console.log('Plugin: I\'m showing')
    },
    onHide () {
      if (typeof (callback) === 'function') {
        callback()
      }
    }
  })
}

// 对象的深度复制
export const objectClone = (object) => {
  let newobj = {}
  for (var i in object) {
    newobj[i] = object[i]
  }
  return newobj
}

// 数组的深复制
export const arrayClone = (array) => {
  const len = array.lenght
  let newArray = []

  for (let i = 0; i < len; i++) {
    if (typeof array[i] !== 'object') {
      newArray.push(array[i])
    } else {
      newArray.push(array[i].clone())
    }
  }
  return newArray
}

// 日期转化
export const dateFormat = (date) => {
  date = date.toString().substring(0, 10)
  date = date.split('/').join('-')
  return date
}


//微信config（必须先执行它）
export const wx_config = () => {

    return new Promise((resolve, reject)=>{

      axiosApi(`${apiUrl}Weixin/wx`, "get", { url: window.location.href }).then((data)=>{

        wx.config({
          beta: true,
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: data.info.jsapi_appId, // 必填，公众号的唯一标识
          timestamp: data.info.jsapi_timestamp, // 必填，生成签名的时间戳
          nonceStr: data.info.jsapi_nonceStr, // 必填，生成签名的随机串
          signature: data.info.jsapi_signature,// 必填，签名，见附录1
          jsApiList: [
              'openWXDeviceLib',
              'closeWXDeviceLib',
              'getWXDeviceInfos',
              'getWXDeviceBindTicket',
              'getWXDeviceUnbindTicket',
              'startScanWXDevice',
              'stopScanWXDevice',
              'connectWXDevice',
              'disconnectWXDevice',
              'sendDataToWXDevice',
              'onWXDeviceBindStateChange',
              'onWXDeviceStateChange',
              'onScanWXDeviceResult',
              'onReceiveDataFromWXDevice',
              'onWXDeviceBluetoothStateChange',
              'checkJsApi',
              'onMenuShareTimeline',
              'onMenuShareAppMessage',
              'onMenuShareQQ',
              'onMenuShareWeibo',
              'onMenuShareQZone',
              'hideMenuItems',
              'showMenuItems',
              'hideAllNonBaseMenuItem',
              'showAllNonBaseMenuItem',
              'translateVoice',
              'startRecord',
              'stopRecord',
              'onVoiceRecordEnd',
              'playVoice',
              'onVoicePlayEnd',
              'pauseVoice',
              'stopVoice',
              'uploadVoice',
              'downloadVoice',
              'chooseImage',
              'previewImage',
              'uploadImage',
              'downloadImage',
              'getNetworkType',
              'openLocation',
              'getLocation',
              'hideOptionMenu',
              'showOptionMenu',
              'closeWindow',
              'scanQRCode',
              'chooseWXPay',
              'openProductSpecificView',
              'addCard',
              'chooseCard',
              'openCard'
          ]
        });

        wx.ready(function () {
            toastShow("初始化成功！", 3000);
            resolve();
        })

        wx.error(function (res) {
            alert('wx.error:' + JSON.stringify(res));
        });
      
      })
    })
}

