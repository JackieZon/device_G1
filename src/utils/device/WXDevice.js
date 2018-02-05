import store from 'vuex'
import { Packet, EncodePacket, GetFrameNum,GetErrorCode } from './../../utils/device/Packet'
import { l } from './../base'
import { alertStay, alert } from './../toast'
import axiosApi from './../axios'
import { apiUrl } from './../subei_config'

import { bytesToHex, base64ToBytes, bytesToBase64, hexToBytes, hexToByte, byteToHex } from './../device/HexUtils'


window.sendTimeOut = null;
window.lastDeviceID = null;
window.lastpacketObj = null;

export const linkBlue = (deviceId) => {
    console.error(
        `
            执行连接手环蓝牙@@
            设备ID是【${deviceId}】
        `
    )
    if(deviceId){
        wx.invoke('connectWXDevice', { 'deviceId': deviceId }, function (res) {
            console.error('执行连接设备返回数据');
            console.error('connectWXDevice', res);
            console.error(res);
        });
    }
}

export const config = (store, $router) => {
    const { commit, dispatch, state } = store
    
    console.log('检查commit 是否存在 向下')
    console.log(commit)

    let vm = store.state.main
    wx_configs(function () {
        l.i('进入微信配置方法')
        wx.error(function (res) {
            l.e('wx.error:' + JSON.stringify(res));
        });
        // 初始化设备库
        wx.invoke('openWXDeviceLib', { 'connType': 'blue' }, function (res) {
            if (res.err_msg === 'openWXDeviceLib:ok') {

                switch (res.bluetoothState) {

                    case 'off':
                        commit('configSet', { WXDeviceLibState: 3 })
                        l.i('请打开手机蓝牙');
                        alertStay({ msg: '请打开手机蓝牙' })
                        break;

                    case 'unauthorized':
                        commit('configSet', { WXDeviceLibState: 2 })
                        l.i('请授权蓝牙功能');
                        alertStay({ msg: '请授权蓝牙功能' })
                        break;

                    case 'on':
                        commit('configSet', { WXDeviceLibState: 1 })
                        l.i('蓝牙已打开');
                        break;
                }
            } else {
                commit('configSet', { WXDeviceLibState: 4 })
                l.i('请授权微信蓝牙功能并打开蓝牙');
                alertStay({msg: '请通过公众号进入本页面！'})
            }
        });

        // 获取设备信息
        wx.invoke('getWXDeviceInfos', {}, function (res) {

            if (res.err_msg === 'getWXDeviceInfos:ok') {

                var deviceNum = res.deviceInfos.length;  // 绑定设备总数量
                console.log(`设备列表`)
                console.log(res.deviceInfos)
                for (var i = 0; i < deviceNum; i++) {
                    if (res.deviceInfos[i].state === 'connected') {
                        //等于当前控制的设备则更新连接状态
                        if (vm.deviceInfo.wecDeviceId == '' || vm.deviceInfo.wecDeviceId == res.deviceInfos[i].deviceId)
                        {
                            window.localStorage.setItem('wecDeviceId', res.deviceInfos[i].deviceId)
                            // commit('deviceInfoSet',{deviceId: res.deviceInfos[i].deviceId})
                            commit('deviceInfoSet',{connectState: true})
                        }
                        l.i(res.deviceInfos[i].deviceId + '已连接');
                        break;
                    }
                    else if (res.deviceInfos[i].state === 'disconnected') {
                        console.log('执行连接设备')
                        // 链接设备
                        wx.invoke('connectWXDevice', { 'deviceId': res.deviceInfos[i].deviceId }, function (res) {
                            console.log('执行连接设备返回数据')
                            console.log('connectWXDevice', res);
                        });
                    }
                }
            } else {
                l.i('获取设备信息失败');
            }
        });

        // 设备连接状态变化
        wx.on('onWXDeviceStateChange', function (res) {
            l.i("onWXDeviceStateChange:" + formatJson(JSON.stringify(res)));

            switch (res.state) {

                case 'connecting':
                    l.i(res.deviceId + '连接中');
                    break;

                case 'connected':
                    //等于当前控制的设备则更新连接状态
                    if (vm.deviceInfo.wecDeviceId == '' || vm.deviceInfo.wecDeviceId == res.deviceId) {
                        // commit('deviceInfoSet', { deviceId: res.deviceId })
                        commit('deviceInfoSet', { connectState: true })
                    }
                    l.i(res.deviceId + '已连接');
                    break;

                case 'disconnected':
                    //等于当前控制的设备则更新连接状态
                    if (vm.deviceInfo.wecDeviceId == res.deviceId)
                        commit('deviceInfoSet', { connectState: false })
                    l.i(res.deviceId + '连接断开');
                    // alert({msg:'连接断开'})
                    linkBlue(res.deviceId)
                    commit('tooltipInfoSet', '')
                    break;
            }
        });

        // 蓝牙打开状态变化
        wx.on('onWXDeviceBluetoothStateChange', function (res) {
            l.w("onWXDeviceBluetoothStateChange:" + formatJson(JSON.stringify(res)));
            switch (res.state) {

                case 'on':
                    window.location.reload()
                    l.w(`onWXDeviceBluetoothStateChange ${res.state}`)
                    break;
                case 'off':
                    alertStay({ msg: '请打开手机蓝牙' })
                    l.w(`onWXDeviceBluetoothStateChange ${res.state}`)
                    break;
            }
        });
        // 设备绑定状态变化
        wx.on('onWXDeviceBindStateChange', function (res) {
            l.w("onWXDeviceBindStateChange:" + formatJson(JSON.stringify(res)));
            switch (res.state) {

                case 'bind':
                    l.w('已绑定：' + res.deviceId)

                    wx.invoke('connectWXDevice', { 'deviceId': res.deviceId }, function (res) {
                        window.location = '#/'
                        window.location.reload()
                        console.log('connectWXDevice', res);
                    });
                    l.w(`onWXDeviceBindStateChange.bind ${res.state}`)

                    break;
                case 'unbind':
                    l.w('已解绑：' + res.deviceId)
                    commit('tooltipInfoSet', '')
                    l.w(`onWXDeviceBindStateChange.unbind ${res.state}`)
                    break;
            }
        });

        // 接收到蓝牙设备数据
        wx.on('onReceiveDataFromWXDevice', function (res) {
            console.log('蓝牙返回数据')
            console.log(res)
            l.l("onReceiveDataFromWXDevice:" + formatJson(JSON.stringify(res)));
            if (res.base64Data) {

                var bytes = base64ToBytes(res.base64Data)
                // 对应字节返回对应数组 值为10进制数据
                console.log('返回base64数据转成10进制数据')
                console.log(bytes)
                //包头AA55
                if (bytes.length > 1 && bytes[0] == 0xAA && bytes[1] == 0x55) {
                    if (sendTimeOut != null) {
                        clearTimeout(sendTimeOut);
                        sendTimeOut = null;
                    }
                    //标记成功接收时间
                    commit('configSet', { lastReceiveSuccessTime: new Date() })
                    DecodePacket(bytes)
                }
                else {
                    l.e('错误包');
                }
                l.i("Bytes:" + JSON.stringify(bytes));
                l.i("HEX:" + JSON.stringify(bytesToHex(bytes)));
            }
        });

    })
}

//微信config（必须先执行它）
export function wx_configs(callback) {
    l.e('执行微信配置 【 wx.config 】')
    axiosApi(`${apiUrl}server/getJsApiSign`, "get", {}).then((res)=>{
        
        let data = res.data
        console.log('getJsApiSign返回数据')
        console.log(data)

        if (data.status) {
            if (!data.status) {
                toastShow(data.info, 1000);
                return;
            }

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
                // toastShow("初始化成功！", 3000);
                console.log('微信配置初始化成功！')
                callback();
            })

            wx.error(function (res) {
                window.alert('wx.error:' + JSON.stringify(res));
            });

        }
    });

}

/**
*  获取封包字节数组
*  反解析Base64字符
* @Param byte数组
**/
export function DecodePacket(bytes) {
    var pack = new Packet(bytes);
    //解包成功
    if (pack.Decode) {
        l.i(pack.FrameNum);
        pack.DecodePacket();
    }
    else {
        // 解包失败 重新发送
        l.e('解包失败');
        if (!(typeof lastDeviceID == "undefined")) {
            resenddataBytes(lastDeviceID, lastpacketObj, 4);
        }
    }
}

// EncodePacket(Cmd.sleeps, '', GetFrameNum(this.NeedReply, this.SendCount, this.DataDomain)),
//     vm.deviceInfo.deviceId,
//      { cmd: Cmd.sleeps, data: '', dataHandler: this }


/**
*  开始执行发送数据
*  获取封包字节数组
* @Param selDeviceID 数组
* @Param packetObj 数组
* @Param errtype 1
**/
export function resenddataBytes(selDeviceID, packetObj, errtype) {
    if (typeof errtype == "undefined") {
        errtype = 3;
    }
    l.l("重发错误类型:" + errtype);
    lastDeviceID = selDeviceID;
    lastpacketObj = packetObj;
    var cmdBytes;
    //数据帧重发
    if (packetObj.dataHandler.ReceiveDataDomain >= 1 && packetObj.dataHandler.ReceiveDataDomain <= 10) {
        l.l("数据帧重发HEX:");
        var reqDataFrameNum = packetObj.dataHandler.LastDataFrameNum > 9 ? 1 : (packetObj.dataHandler.LastDataFrameNum + 1);
        cmdBytes = EncodePacket(packetObj.cmd, byteToHex(GetErrorCode(reqDataFrameNum, errtype)), GetFrameNum(true, packetObj.dataHandler.SendCount, 12));
    }
    else {
        cmdBytes = EncodePacket(packetObj.cmd, packetObj.data, GetFrameNum(true, packetObj.dataHandler.SendCount, packetObj.dataHandler.DataDomain));
    }
    return senddataToDevice(selDeviceID, packetObj, cmdBytes)
}


export function senddataBytes(selDeviceID, packetObj) {
    lastDeviceID = selDeviceID;
    lastpacketObj = packetObj;
    var cmdBytes = EncodePacket(packetObj.cmd, packetObj.data, GetFrameNum(packetObj.dataHandler.NeedReply, packetObj.dataHandler.SendCount, packetObj.dataHandler.DataDomain));
    return senddataToDevice(selDeviceID, packetObj, cmdBytes)
}


export function senddataToDevice(selDeviceID, packetObj, cmdBytes) {
    const { commit } = packetObj.t_data
    //1. 如果输入的参数长度为零，则直接退出
    if (cmdBytes.length <= 0) { return 1 };
    // alert("向微信发送指令数据");
    //1.1 如果设备ID为空，则直接返回
    if (selDeviceID.length <= 0) { return 1 };
    //2. 发送数据
    var x = 0;

    l.l("开始发送数据HEX:");
    l.i(bytesToHex(cmdBytes));
    var base64Data = bytesToBase64(cmdBytes);

    console.log('发送的base64数据')
    console.log(base64Data)

    WeixinJSBridge.invoke('sendDataToWXDevice', {
        "deviceId": selDeviceID,
        "base64Data": base64Data
    }, function (res) {
        //alert("向微信发送指令数据返回的状态"+res.err_msg);
        if (res.err_msg == 'sendDataToWXDevice:ok') {
            //标记发送成功时间

            commit('configSet', { lastSendSuccessTime: new Date() })

            x = 0;
            l.l("数据发送成功");

            var timeoutMillisecond = 4000;
            //数据帧1秒超时
            if (packetObj.dataHandler.ReceiveDataDomain >= 1 && packetObj.dataHandler.ReceiveDataDomain <= 10) {
                timeoutMillisecond = 2000;
            }

            //超时检测程序
            sendTimeOut = setTimeout(function () {
                if (packetObj.dataHandler.SendCount < 5) {
                    l.e("数据超时重发：" + packetObj.dataHandler.SendCount);
                    // commit('tooltipInfoSet', '')
                    packetObj.dataHandler.SendCount = packetObj.dataHandler.SendCount + 1;
                    resenddataBytes(selDeviceID, packetObj);
                }
                else {
                    sendTimeOut = null
                    commit('tooltipInfoSet', '')
                    l.e("数据超时5次,放弃");
                }
            }, timeoutMillisecond);
        }
        else {
            x = 1;
            l.e(`数据发送失败 deviceId: ${selDeviceID}`);
            commit('tooltipInfoSet', '')
            // alert({msg: '数据发送失败'})
        }
    });
    return x;
}
