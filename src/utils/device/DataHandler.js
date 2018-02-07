import { bytesToNumber, toAscii, bytesToHex } from './HexUtils'
import { Cmd } from './Packet'
import { alert, notify, toast } from './../toast'
import { senddataBytes } from './../device/WXDevice'
import { l } from './../base'
import { addDeviceDataSleep, addDeviceDataSport, addDeviceDataPulse, addDeviceDataTempRHPress } from './../../sverse/api'

let hrCountFig = 1;
/**
*  数据处理程序
 * @param {number} cmd Cmd.枚举 指令
 * @param {number} framesize 数据帧大小
**/
export const getStorage = {
    deviceId: ()=>{
        return window.localStorage.getItem('wecDeviceId')
    },
    heartRateGaugeToast: () =>{
        return Number(window.localStorage.getItem('heartRateGaugeToast'))
    }
}
export function DataHandler(cmd, framesize, t_data) {
    const { commit, dispatch } = t_data
    let vm = t_data.state.main
    /**
    * 发送帧次数
    **/
    this.SendCount = 1;
    /**
    * 是否需要回复
    **/
    this.NeedReply = false;
    /**
    * 数据域说明 0请求帧 1-10 数据帧  11发送完成 12接收错误 13接收正确 14允许发送 15数据总长度
    **/
    this.DataDomain = 0;
    /**
    * 最后接收到的数据帧号
    **/
    this.LastDataFrameNum = 0;
    /**
    * 接收到的数据域说明 0请求帧 1-10 数据帧  11发送完成 12接收错误 13接收正确 14允许发送 15数据总长度
    **/
    this.ReceiveDataDomain = 0;
    /**
    * 数据总长度
    **/
    this.DataLen = 0;
    /**
    * 数据帧大小
    **/
    this.DataFrameSize = 0;
    if (!(typeof framesize == "undefined")) {
        this.DataFrameSize = framesize;
    }
    /**
    * 数据列表
    **/
    this.DataList = [];
    /**
    * 指令
    **/
    this.Cmd = 0;
    if (!(typeof cmd == "undefined")) {
        this.Cmd = cmd;
    }
    if (typeof DataHandler._initialized == "undefined") {

        //公共指令解析
        DataHandler.prototype.DecodePacket = function (packet) {

            l.i('DataHandler.DecodePacket')
            // 判断设备返回数据得到 0请求帧 1-10 数据帧  11发送完成 12接收错误 13接收正确 14允许发送 15数据总长度
            switch (packet.Cmd) {
                // 获取心率设置频率值
                case Cmd.setFrequency: {
                    if (packet.FrameNum.datadomain == 13) {

                        let heartRateGaugeToast = getStorage.heartRateGaugeToast()
                        if(heartRateGaugeToast=='1'||heartRateGaugeToast==1){
                            alert({msg: '设置成功！'})
                        }else{
                            console.error('心率频率设置成功！')
                        }

                        dispatch('taskQueueExec', { QueueName: 'setFrequencyData' })

                        commit('configSet', { lastSetTime: new Date() })
                    } else {
                        l.e({ msg: '心率频率设置失败！' })
                    }
                    break;
                }
                case Cmd.setTime: {
                    if (packet.FrameNum.datadomain == 13) {
                        console.log('时间设置成功！')
                        dispatch('taskQueueExec', { QueueName: 'setLCDDTime' })
                        commit('configSet', { lastSetTime: new Date() })
                    } else {
                        l.e({ msg: '时间设置失败！' })
                    }
                    break;
                }
                case Cmd.bracelet:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取电量成功！')
                            dispatch('taskQueueExec', { QueueName: 'getBattery' })
                            let bracelet = bytesToNumber(packet.Data.slice(0, 1));
                            dispatch('deviceInfoSet', { bracelet: bracelet });
                            commit('configSet', { lastSetTime: new Date() });
                            l.w(`电量${bracelet}`)
                        } else {
                            l.e({ msg: '读取电量失败！' })
                        }
                        break;
                    }
                case Cmd.LCDDisplayDataNew:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取里程成功！')
                            dispatch('taskQueueExec', { QueueName: 'getLCDDisplayDataNew' })

                            var km = bytesToNumber(packet.Data.slice(4, 6));
                            if (km > 0) km = (km / 10).toFixed(1);

                            dispatch('deviceInfoSet', { km: km })
                            commit('configSet', { lastSetTime: new Date() });

                            l.w(`里程${km}`)
                        } else {
                            l.e({ msg: '读取里程失败！' })
                        }
                        break;
                    }
                case Cmd.personalInfo:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            if (packet.DataLen == 4) {

                                l.w('读取身高体重成功！')

                                var Height = bytesToNumber(packet.Data.slice(0, 1));
                                var Weight = bytesToNumber(packet.Data.slice(1, 2));

                                dispatch('deviceInfoSet', { Height: Height, Weight: Weight })
                                l.w(`身高${Height}cm,体重${Weight}kg`)


                                dispatch('taskQueueExec', { QueueName: 'getPersonalInfo' })
                                commit('configSet', { lastSetTime: new Date() });
                            }
                            else {
                                l.w('设置身高体重成功！')
                                dispatch('taskQueueExec', { QueueName: 'setPersonalInfo' })
                            }
                        } else {
                            l.e({ msg: '读取或设置身高体重失败！' })
                        }
                        break;
                    }
                case Cmd.FlashingWarningThreshold:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            console.error(`阈值的数据长度是【${packet.DataLen}】`)
                            if (packet.DataLen>4) {
                                l.w('读取提醒阀值成功！')
                                

                                var rawDeviceSetHeartRateMax = bytesToNumber(packet.Data.slice(0, 1));
                                var rawDeviceSetStepTarget = bytesToNumber(packet.Data.slice(1, 3));
                                var rawDeviceSetTempDiff = bytesToNumber(packet.Data.slice(3, 4));

                                var rawDeviceSetTempDiffStr = Number(rawDeviceSetTempDiff).toString(2).PadLeft(8);
                                // var datadomain = parseInt(FrameNumStr.slice(0, 1), 2);
                                rawDeviceSetTempDiff = parseInt(rawDeviceSetTempDiffStr.slice(1, 8), 2);

                                dispatch('deviceInfoSet', {
                                    rawDeviceSetHeartRateMax: rawDeviceSetHeartRateMax,
                                    rawDeviceSetStepTarget: rawDeviceSetStepTarget,
                                    rawDeviceSetTempDiff: rawDeviceSetTempDiff
                                })

                                l.w(`心率${rawDeviceSetHeartRateMax},步数目标${rawDeviceSetStepTarget},温差${rawDeviceSetTempDiff}`)

                                dispatch('taskQueueExec', { QueueName: 'getFlashingWarningThreshold' })
                                commit('configSet', { lastSetTime: new Date() });
                            }
                            else {
                                l.w('设置提醒阀值成功！')
                                dispatch('taskQueueExec', { QueueName: 'setFlashingWarningThreshold' })
                            }
                        } else {
                            l.e({ msg: '读取或设置提醒阀值失败！' })
                        }
                        break;
                    }
                case Cmd.userCodeVer:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取手环版本成功！')
                            dispatch('taskQueueExec', { QueueName: 'getUserCodeVer' })

                            var ver = toAscii(bytesToHex(packet.Data)).replace("?", '');

                            dispatch('deviceInfoSet', { userCodeVer: ver })
                            commit('configSet', { lastSetTime: new Date() });
                            l.w(`版本${ver}`)
                        } else {
                            l.e({ msg: '读取手环版本失败！' })
                        }
                        break;
                    }
                case Cmd.holidayReminder:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            l.w('读取节日提醒成功 女性生理周期成功！')

                            console.error(
                                `女性生理周期命令返回的【数据长度】
                                ${packet.Data.length}
                                `
                            )
                            if(packet.Data.length==0){
                                dispatch('taskQueueExec', { QueueName: 'setHolidayReminder' })
                                toast({msg: '生理周期设置成功！'})
                            }else{
                                dispatch('taskQueueExec', { QueueName: 'getHolidayReminder' })
    
                                let remindonstate = bytesToNumber(packet.Data.slice(0, 1));
                                let cycle = bytesToNumber(packet.Data.slice(1, 2));
                                let nextremind = bytesToNumber(packet.Data.slice(2, 3));
    
                                dispatch('deviceInfoSet', { remindonstate: remindonstate, cycle: cycle, nextremind: nextremind })
                                commit('configSet', { lastSetTime: new Date() });

                                l.w(`开关显示${remindonstate}，周期${cycle}，下次提醒天数${nextremind}`)
                            }
                        } else {
                            console.error('读取 / 设置 节日提醒失败！')
                        }
                        break;
                    }
                case Cmd.dynamicHeartRate:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            commit('configSet', { lastSetTime: new Date() });
                            if(packet.Cmdx==1){

                                this['num'] = 0;

                                this['loopHeartRate'] = setInterval(()=>{
                                    
                                    // 保存定时器到数据中心
                                    commit('setDynamicHeartRate', {heartRateTimer: this.loopHeartRate});

                                    this.num++;
                                    if(this.num<5000){
                                        dispatch('pushDynamicHeartRate')
                                    }else{
                                        console.error(`读取动态心率次数【${this.num}】关闭循环方法【${this.loopHeartRate}】`)
                                        clearInterval(this.loopHeartRate)
                                    }
                                    
                                    // 设备链接断开或者是动态心率按钮关闭时 就关闭读取动态心率
                                    if((t_data.state.main.deviceInfo.connectState==false)&&(t_data.state.main.deviceInfo.WXDeviceLibState!==1)){
                                        clearInterval(this.loopHeartRate)
                                    }
                                    
                                },1000)
                                
                                toast({msg: '动态心率已打开'})
                                console.error(`已【打开】动态心率【1】`);

                                // commit('setDynamicHeartRate', {status: 1}) // 保存状态已打开 打开后执行采集数据

                            }else if(packet.Cmdx==2){

                                // commit('setDynamicHeartRate', {status: 2}) // 保存状态 正在同步接收同步数据
                                
                                console.error(`执行读取心率循环函数开头【第${this.num}次】【typeof ${ typeof(this.num) }】
                                    设备链接状态【${vm.deviceInfo.connectState}】
                                    动态心率的开关状态【${vm.dynamicHeartRate.status}】
                                    动态心率的开关状态的类型【${typeof(vm.dynamicHeartRate.status)}】
                                    测量次数${hrCountFig}
                                    读取心率值 【结果↓】
                                `)
                                console.error(packet.Data)

                                let now = new Date();
                                let nowtimebytes = [now.getFullYear(), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
                                let date = `${now.getFullYear()}-${(now.getMonth() + 1)}-${now.getDate()}`
                                let time = `${now.getHours()<10?'0'+now.getHours():now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
                                let valType = bytesToNumber(packet.Data.slice(0, 1));
                                let valx = bytesToNumber(packet.Data.slice(1, 2));

                                if(valType == 2){

                                    if(valx&&valx<255&&valx!==1){
                                        commit('pushHeartRateList', {testTime: `${date} ${time}`, hrCount: valx})
                                    }else if(valx==1||valx==255){
                                        if(hrCountFig==1||(hrCountFig%10)==0){
                                            toast({msg: '测量中，请稍后...'});
                                            hrCountFig = hrCountFig+1;
                                        }
                                    }

                                }else{
                                    // toast({msg: '正在检测心率请稍后'})
                                    if(this.num==1){
                                        toast({msg: '正在检测心率请稍后'})
                                    }
                                    console.log('正在检测心率请稍后')
                                    // clearInterval(this.loopHeartRate);
                                }
                                
                                

                            }else if(packet.Cmdx==3){

                                toast({msg: '动态心率已关闭'});
                                console.log(`已【关闭】动态心率【3】`);
                                clearInterval(this.loopHeartRate);
                                commit('setDynamicHeartRate', {status: 3}); // 保存状态 关闭动态心率

                            }

                            // dispatch('taskQueueExec', { QueueName: true })
                            // var remindonstate = bytesToNumber(packet.Data.slice(0, 1));
                            // dispatch('deviceInfoSet', { remindonstate: remindonstate, cycle: cycle, nextremind: nextremind })

                        } else {
                            toast({msg: '动态心率打开失败，请重试。'});
                            commit('setDynamicHeartRate', {status: 3});
                        }
                        break;
                    }
                case Cmd.alarmClock:
                    {
                        if (packet.FrameNum.datadomain == 13) {

                            commit('configSet', { lastSetTime: new Date() });

                            console.error('查询或设置闹钟成功！')

                            console.error(
                                `查询或设置闹钟【数据长度】
                                ${packet.Data.length}
                                `
                            )

                            if(packet.Data.length==0){
                                // toast({msg: '设置闹钟成功！'})
                            }else{
                                
                                console.error(`在次发起查询闹钟`)
                                dispatch('loopClockListInquire', {})
    
                                // {
                                //     index: 1,
                                //     status: true,
                                //     repeatByte: [0,1,0,1,0,1,0,1],
                                //     time: [11,40,0]
                                // },

                                function countRepeat(str){
                                    if(str.length==8){
                                        return str.split('')
                                    }else{
                                        let strArr = str.split('').reverse();
                                        let strLen = str.length;
                                        for(let i=0; i<8-strLen; i++){
                                            strArr.push(0)
                                        }
                                        return strArr.reverse();
                                    }
                                }

                                let statusStr = [true, false, null];
                                let clockIndex = (bytesToNumber(packet.Data.slice(0, 1))-1);
                                let colckStatus = bytesToNumber(packet.Data.slice(1, 2));
                                let clockRepeatByte = bytesToNumber(packet.Data.slice(2, 3));
                                let clockTime = [bytesToNumber(packet.Data.slice(3, 4)),bytesToNumber(packet.Data.slice(4, 5)),bytesToNumber(packet.Data.slice(5, 6))];

                                let repeatByte = clockRepeatByte.toString(2)

                                commit('changeClock', { 
                                    index: clockIndex,
                                    data: {
                                        index: clockIndex+1,
                                        status: statusStr[colckStatus-1],
                                        repeatByte: countRepeat(repeatByte),
                                        time: clockTime
                                    }
                                })
    
                            }
                        } else {
                            console.error('读取 / 设置 节日提醒失败！')
                        }
                        break;
                    }
                case Cmd.setCall:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            commit('configSet', { lastSetTime: new Date() });
                            console.error(`来电提醒设置成功【setCallX】`)
                            dispatch('taskQueueExec', { QueueName: 'setCallX' })
                            // toast({msg: '来电提醒设置成功！'})
                        } else {
                            console.error('来电提醒设置失败！')
                        }
                        break;
                    }
                // case Cmd.setShock:
                //     {
                //         if (packet.FrameNum.datadomain == 13) {
                //             console.error(`来电提醒设置成功【setCall】`)
                //             dispatch('taskQueueExec', { QueueName: 'setCall' })
                //             toast({msg: '来电提醒设置成功！'})
                //         } else {
                //             console.error('来电提醒设置失败！')
                //         }
                //         break;
                //     }
                case Cmd.setSedentary:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            commit('configSet', { lastSetTime: new Date() });
                            if(packet.Data.length==0){

                                toast({msg: '久坐提醒设置成功！'})
                                dispatch('taskQueueExec', { QueueName: 'setSedentary' })

                            }else{

                                function countRepeat(str){
                                    if(str.length==8){
                                        return str.split('')
                                    }else{
                                        let strArr = str.split('').reverse();
                                        let strLen = str.length;
                                        for(let i=0; i<8-strLen; i++){
                                            strArr.push(0)
                                        }
                                        return strArr.reverse();
                                    }
                                }

                                let callRepeatByte = (bytesToNumber(packet.Data.slice(0, 1)));
                                let startTime = [bytesToNumber(packet.Data.slice(1, 2)), bytesToNumber(packet.Data.slice(2, 3))];
                                let endTime = [bytesToNumber(packet.Data.slice(3, 4)),bytesToNumber(packet.Data.slice(4, 5))];
                                let repeatByte = callRepeatByte.toString(2)
                                
                                dispatch('taskQueueExec', { QueueName: 'readySedentary' })
                                
                                commit('saveSedentary', {
                                    repeatByte: countRepeat(repeatByte),
                                    startTime: startTime,
                                    endTime: endTime,
                                })
    
                            }
                        } else {
                            console.error('久坐提醒设置失败！')
                        }
                        break;
                    }
                case Cmd.setShock:
                    {
                        if (packet.FrameNum.datadomain == 13) {
                            commit('configSet', { lastSetTime: new Date() });
                            if(packet.Data.length==0){
                                toast({msg: '设置成功！'})
                                dispatch('taskQueueExec', { QueueName: 'setyShock' })
                            }else{

                                let data1 = (bytesToNumber(packet.Data.slice(0, 1)));
                                let data2 = bytesToNumber(packet.Data.slice(1, 2));
                                let data3 = bytesToNumber(packet.Data.slice(2, 3));

                                console.error(
                                    `
                                        手环设置的开关状态【开关】
                                    `
                                )
                                console.error({
                                    data1: data1,
                                    data2: data2,
                                    data3: data3,
                                })
                                
                                dispatch('taskQueueExec', { QueueName: 'readyShock' })
                                
                                commit('saveFlagObj', {
                                    callStatus: Boolean(data1),
                                    sedentaryStatus: Boolean(data2),
                                    keepStatus: Boolean(data3),
                                })
    
                            }
                        } else {
                            console.error('久坐提醒设置失败！')
                        }
                        break;
                    }
                default: {
                    break;
                }
            }
        };

        //历史数据指令回复
        DataHandler.prototype.HistoryDataReply = function (packet) {
            const { t_data } = packet
            const { commit, state } = packet.t_data
            let vm = state.main
            console.error(`执行命令的状态【${vm.runCommandStatus}】；在{localStorage}里：【${window.localStorage.localStorage}】`)
            //需要回复
            if (packet.FrameNum.needreply) {
                //数据域为数据长度
                if (packet.FrameNum.datadomain == 15) {
                    this.DataLen = bytesToNumber(packet.Data);
                    if (this.DataLen > 0) {
                        //重置数据长度和已接收长度
                        commit('configSet', { DataLen: (this.DataLen / this.DataFrameSize), ReceiveDataLen: 0 })

                        //允许发送历史数据
                        this.SendCount = 1;
                        this.NeedReply = true;
                        this.DataDomain = 14;

                        // 停止继续发送命令读取历史数据
                        commit('saveHistoryDataObj',{ status: !vm.runCommandStatus, data: this, t_data: t_data })
                        if(vm.runCommandStatus===false){
                            console.error(`【已暂停】历史数据读取`)
                            commit('tooltipInfoSet', '')
                            
                            // 跳过当前命令执行下一条
                            setTimeout(()=>{
                                dispatch('taskQueueExec', { QueueName: packet.QueueName })
                            }, 1500)
                        }else{
                            console.error(`【继续】历史数据读取`)
                            senddataBytes(getStorage.deviceId(), { cmd: this.Cmd, data: '', dataHandler: this, t_data: t_data })
                        }

                    }
                    else {
                        l.i('历史数据已经被读空了！');

                        commit('configSet', { DataLen: 0, ReceiveDataLen: 0 })

                        commit('tooltipInfoSet', '')
                        // if (!(typeof this.ReceiveSuccess == "undefined")) {
                        //     //this.ReceiveSuccess();
                        // }
                        dispatch('taskQueueExec', { QueueName: packet.QueueName })
                    }
                }
                //传输完成
                else if (packet.FrameNum.datadomain == 11) {
                   
                    l.i("收到传输完成标志！");
                    if (!(typeof this.ReceiveSuccess == "undefined")) {
                        this.ReceiveSuccess((res) => {

                            if (res.data.status) {
                                l.w('服务器以保存成功')

                                commit('tooltipInfoSet', '')

                                //回复接收完成，清空数据
                                this.SendCount = 1;
                                this.NeedReply = false;
                                this.DataDomain = 11;
                                
                                // 停止继续发送命令读取历史数据
                                commit('saveHistoryDataObj',{ status: !vm.runCommandStatus, data: this, t_data: t_data })
                                if(vm.runCommandStatus===false){
                                    console.error(`【已暂停】历史数据读取`)
                                    commit('tooltipInfoSet', '')

                                    // 跳过当前命令执行下一条
                                    setTimeout(()=>{
                                        dispatch('taskQueueExec', { QueueName: packet.QueueName })
                                    }, 1500)

                                }else{
                                    console.error(`【继续】历史数据读取`)
                                    senddataBytes(getStorage.deviceId(), { cmd: this.Cmd, data: '', dataHandler: this, t_data: t_data })
                                }


                            } else {
                                l.w('服务器以保存失败')
                            }

                            setTimeout(()=>{
                                dispatch('taskQueueExec', { QueueName: packet.QueueName })
                            }, 1500)
                            
                        });
                    }
                    //测试用 暂时不回复
                    //senddataBytes(vm.deviceInfo.deviceId, { cmd: this.Cmd, data: '', dataHandler: this })
                }
                //数据帧 >=1  ？ <=10
                else if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10) {
                    //回复接收正确
                    this.SendCount = 1;
                    this.NeedReply = false;
                    this.DataDomain = 13;
                    
                    // 停止继续发送命令读取历史数据
                    commit('saveHistoryDataObj',{ status: !vm.runCommandStatus, data: this, t_data: t_data })
                    if(vm.runCommandStatus===false){
                        console.error(`【已暂停】历史数据读取`)
                        commit('tooltipInfoSet', '')

                        // 跳过当前命令执行下一条
                        setTimeout(()=>{
                            dispatch('taskQueueExec', { QueueName: packet.QueueName })
                        }, 1500)
                    }else{
                        console.error(`【继续】历史数据读取`)
                        senddataBytes(getStorage.deviceId(), { cmd: this.Cmd, data: '', dataHandler: this, t_data: t_data })
                    }
                }
            }

        };
        DataHandler._initialized = true;
    }
}

export function LCDDisplayDataHandler(t_data) {
    const { commit, dispatch } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.LCDDisplayData, 14, t_data);
    if (typeof LCDDisplayDataHandler._initialized == "undefined") {
        LCDDisplayDataHandler.prototype.DecodePacket = function (packet) {
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            //通用回复处理
            //this.HistoryDataReply(packet);

            //数据帧 >=1  ？ <=10
            if (packet.FrameNum.datadomain == 13 && packet.Data.length == 14) {
                //标记已经读取成功
                // if (!vm.config.LCDDisplayDataHandlerSuccessFlag) {
                //     //立即开始读取
                //     //vm.ReadHistory();
                // }
                //if (!vm.config.LCDDisplayDataHandlerSuccessFlag)
                    dispatch('taskQueueExec', { QueueName: packet.QueueName })

                commit('configSet', { 'LCDDisplayDataHandlerSuccessFlag': true })

                var sportstep = bytesToNumber(packet.Data.slice(0, 4));
                let km = bytesToNumber(packet.Data.slice(4, 6));
                var calorie = bytesToNumber(packet.Data.slice(6, 8));
                var sleephour = bytesToNumber(packet.Data.slice(8, 9)) / 10;
                var heartrate = bytesToNumber(packet.Data.slice(9, 10));
                var bodysurfacetemp = bytesToNumber(packet.Data.slice(10, 12)) / 10;
                var humidity = bytesToNumber(packet.Data.slice(12, 13));
                var temperature = bytesToNumber(packet.Data.slice(13, 14));
                var pressure = bytesToNumber(packet.Data.slice(14, 16)) / 10;

                console.error(
                    `
                        步数：【${sportstep}】
                        里程：【${km}】
                        卡路里：【${calorie}】
                        睡眠数据：【${sleephour}】
                        心率值：【${heartrate}】
                        体表温度：【${bodysurfacetemp}】
                    `
                )

                dispatch('deviceInfoSet', { km: km })

                commit('LCDDisplayDataSet', {
                    sportstep: sportstep,
                    calorie: calorie,
                    sleephour: sleephour,
                    heartrate: heartrate,
                    bodysurfacetemp: bodysurfacetemp,
                    humidity: humidity,
                    temperature: temperature,
                    pressure: pressure,
                })
                console.log('已读取设备显示信息')
                console.log({
                    sportstep: sportstep,
                    calorie: calorie,
                    sleephour: sleephour,
                    heartrate: heartrate,
                    bodysurfacetemp: bodysurfacetemp,
                    humidity: humidity,
                    temperature: temperature,
                    pressure: pressure,
                })
            }
        };
        LCDDisplayDataHandler._initialized = true;
    }
}

export function SleepDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.sleep, 10, t_data);

    this.SleepDataSchema =
        {
            SleepStatus: null,
            SleepStartTime: null,
            SleepDuration: null,
            SleepStepCount: null,
            SleepCalorie: null,
            RawHex: null,
        };
    if (typeof SleepDataHandler._initialized == "undefined") {
        SleepDataHandler.prototype.ReceiveSuccess = function (callback) {

            commit('configSet', { lastSetTime: new Date() });
            // DataInterface.AddDeviceDataSleep(this.DataList);
            let param = {
                deviceId: vm.deviceInfo.wecDeviceId,
                dataList: this.DataList
            }
            console.log('****睡眠历史提交(SleepDataHandler)***')
            console.log(param)
            addDeviceDataSleep(param).then((res) => {
                console.log(res)
                if (res.data.status) {
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { SleepDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        SleepDataHandler.prototype.DecodePacket = function (packet) {

            l.i('SleepDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 10) {
                /* 状态	        开始时间	      持续时间
                0x01：深睡；
                0x02：浅睡；
                0x03：清醒；	年月日时分秒      时分秒
                */
                this.LastDataFrameNum = packet.FrameNum.datadomain;

                var SleepStatus = bytesToNumber(packet.Data.slice(0, 1));
                var SleepStartTimeYear = bytesToNumber(packet.Data.slice(1, 2));
                var SleepStartTimeMonth = bytesToNumber(packet.Data.slice(2, 3));
                var SleepStartTimeDay = bytesToNumber(packet.Data.slice(3, 4));
                var SleepStartTimeHours = bytesToNumber(packet.Data.slice(4, 5));
                var SleepStartTimeMinutes = bytesToNumber(packet.Data.slice(5, 6));
                var SleepStartTimeSeconds = bytesToNumber(packet.Data.slice(6, 7));
                var SleepStartTime = '20' + String(SleepStartTimeYear).PadLeft(2) + '-' + SleepStartTimeMonth + '-' + SleepStartTimeDay + ' ' + SleepStartTimeHours + ':' + SleepStartTimeMinutes + ':' + SleepStartTimeSeconds;

                var SleepDurationHours = bytesToNumber(packet.Data.slice(7, 8));
                var SleepDurationMinutes = bytesToNumber(packet.Data.slice(8, 9));
                var SleepDurationSeconds = bytesToNumber(packet.Data.slice(9, 10));
                var SleepDuration = (SleepDurationHours * 60 + SleepDurationMinutes) * 60 + SleepDurationSeconds;

                // let postData = {
                //     "deviceType": 1, //设备类型 0:h1,1:G1,2:S3,3:S4
                //     "type": 0,     //0：走路，1：跑步
                //     "stepNum": 12000,  //步数
                //     "caloric": 5000.2, //卡路里
                //     "mileage": 10000,  //里程，米
                //     "startTime": "2017-08-31 18:25:21",
                //     "endTime": "2017-08-31 19:28:21",
                //     "durationTime": 63,  //持续时间，秒
                //     "deviceId": 998      //设备id必填项
                // }

                var param = {
                    type: SleepStatus,
                    deviceType: 1,
                    startTime: SleepStartTime,
                    endTime: '',
                    durationTime: SleepDuration,
                    belongDate: '',
                    wecDeviceId: getStorage.deviceId()
                }

                // let arrs = [
                //     {
                //         "type":1,
                //         "deviceType": 1,
                //         "startTime":"2017-11-11 11:11:11",
                //         "endTime":"2017-11-11 11:11:11",
                //         "durationTime":60,
                //         "belongDate":"2017-11-11",
                //         "deviceId":1
                //     }
                // ]
                
                this.DataList.push(param);
                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                if(vm.config.ReceiveDataLen<vm.config.DataLen){
                    console.log(`已读取的数据长度【${vm.config.ReceiveDataLen}】总长度【${vm.config.DataLen}】`)
                    commit('tooltipInfoSet', `睡眠数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)
                }else{
                    commit('tooltipInfoSet', '')
                }

                //DataInterface.AddDeviceDataSleep(param)
            }
        };
        SleepDataHandler._initialized = true;
    }
}

export function SportDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.sports, 14, t_data);

    this.SportDataSchema =
        {
            SportStatus: null,
            SportStartTime: null,
            SportDuration: null,
            SportStepCount: null,
            SportCalorie: null,
            RawHex: null,
        };
    if (typeof SportDataHandler._initialized == "undefined") {
        SportDataHandler.prototype.ReceiveSuccess = function (callback) {

            // DataInterface.AddDeviceDataSport(this.DataList);

            commit('configSet', { lastSetTime: new Date() });
            let param = {
                deviceId: vm.deviceInfo.deviceId,
                dataList: this.DataList
            }
            l.e('****运动历史提交(SportDataHandler)***')
            console.log(param)
            addDeviceDataSport(param).then((res)=>{
                if(res.data.status){
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { SportDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        SportDataHandler.prototype.DecodePacket = function (packet) {

            l.i('SportDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10 
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 14) {
                /* 状态	        开始时间	    持续时间	总步数	        检测卡路里
                             0x01：走路；
                             0x02：跑步	    年月日时分秒      时分秒	低字节高字节      低字节高字节
                             */
                var SportStatus = bytesToNumber(packet.Data.slice(0, 1));
                var SportStartTimeYear = bytesToNumber(packet.Data.slice(1, 2));
                var SportStartTimeMonth = bytesToNumber(packet.Data.slice(2, 3));
                var SportStartTimeDay = bytesToNumber(packet.Data.slice(3, 4));
                var SportStartTimeHours = bytesToNumber(packet.Data.slice(4, 5));
                var SportStartTimeMinutes = bytesToNumber(packet.Data.slice(5, 6));
                var SportStartTimeSeconds = bytesToNumber(packet.Data.slice(6, 7));
                var SportStartTime = '20' + String(SportStartTimeYear).PadLeft(2) + '-' + SportStartTimeMonth + '-' + SportStartTimeDay + ' ' + SportStartTimeHours + ':' + SportStartTimeMinutes + ':' + SportStartTimeSeconds;

                var SportDurationHours = bytesToNumber(packet.Data.slice(7, 8));
                var SportDurationMinutes = bytesToNumber(packet.Data.slice(8, 9));
                var SportDurationSeconds = bytesToNumber(packet.Data.slice(9, 10));
                var SportDuration = (SportDurationHours * 60 + SportDurationMinutes) * 60 + SportDurationSeconds;

                var SportStepCount = bytesToNumber(packet.Data.slice(10, 12));
                var SportCalorie = bytesToNumber(packet.Data.slice(12, 14));

                var param = {
                    deviceType: 1,//设备类型
                    type: SportStatus,//运动状态
                    stepNum: SportStepCount,//步数
                    caloric: SportCalorie,//卡路里
                    mileage: '',
                    startTime: SportStartTime,//运动开始时间
                    endTime: '',
                    durationTime: SportDuration,//持续时间
                    wecDeviceId: getStorage.deviceId()
                }

                // var data = [
                //     {
                //         "deviceType": 1, //设备类型 0:h1,1:G1,2:S3,3:S4
                //         "type": 0,     //0：走路，1：跑步
                //         "stepNum": 12000,  //步数
                //         "caloric": 5000.2, //卡路里
                //         "mileage": 10000,  //里程，米
                //         "startTime": "2017-08-31 18:25:21",
                //         "endTime": "2017-08-31 19:28:21",
                //         "durationTime": 63,  //持续时间，秒
                //         "deviceId": 998      //设备id必填项
                //     }
                // ]

                this.DataList.push(param);
                l.w(param);

                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                if(vm.config.ReceiveDataLen<vm.config.DataLen){
                    console.log(`已读取的数据长度【${vm.config.ReceiveDataLen}】总长度【${vm.config.DataLen}】`)
                    commit('tooltipInfoSet', `运动数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)
                }else{
                    commit('tooltipInfoSet', '')
                }
            }
        };
        SportDataHandler._initialized = true;
    }
}

export function TempRHPressDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.Temphumpres, 13, t_data);

    this.TempRHPressDataSchema =
        {
            Temp: null,
            RH: null,
            Press: null,
            RecordTime: null,
            RawHex: null,
        };
    if (typeof TempRHPressDataHandler._initialized == "undefined") {
        TempRHPressDataHandler.prototype.ReceiveSuccess = function (callback) {

            // DataInterface.AddDeviceDataTempRHPress(this.DataList);

            commit('configSet', { lastSetTime: new Date() });
            let param = {
                deviceId: vm.deviceInfo.deviceId,
                dataList: this.DataList
            }
            console.log('****历史数据提交(TempRHPressDataHandler)***')
            console.log(param)
            addDeviceDataTempRHPress(param).then((res) => {
                console.log(res)
                if (res.data.status) {
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { TempRHPressDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        TempRHPressDataHandler.prototype.DecodePacket = function (packet) {

            l.i('TempRHPressDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10 
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 13) {
                /*温度	          湿度	                气压	            时间
                低字节	高字节	低字节	高字节	低字节	中字节	高字节	年	月	日	时	分	秒
                内存低位	……	内存高位
                */
                var Temp = (bytesToNumber(packet.Data.slice(0, 2)) * 175.72 / 65536 - 46.85).toFixed(2);
                var RH = (bytesToNumber(packet.Data.slice(2, 4)) * 125 / 65535 - 6).toFixed(2);
                var Press = (bytesToNumber(packet.Data.slice(4, 7)) / 4096).toFixed(2);
                var RecordTimeYear = bytesToNumber(packet.Data.slice(7, 8));
                var RecordTimeMonth = bytesToNumber(packet.Data.slice(8, 9));
                var RecordTimeDay = bytesToNumber(packet.Data.slice(9, 10));
                var RecordTimeHours = bytesToNumber(packet.Data.slice(10, 11));
                var RecordTimeMinutes = bytesToNumber(packet.Data.slice(11, 12));
                var RecordTimeSeconds = bytesToNumber(packet.Data.slice(12, 13));
                var RecordTime = '20' + String(RecordTimeYear).PadLeft(2) + '-' + RecordTimeMonth + '-' + RecordTimeDay + ' ' + RecordTimeHours + ':' + (RecordTimeMinutes<10?'0'+RecordTimeMinutes:RecordTimeMinutes) + ':' + (RecordTimeSeconds<10?'0'+RecordTimeSeconds:RecordTimeSeconds);

                var param = {
                    deviceType: 1,
                    wecDeviceId: getStorage.deviceId(),
                    temperature: Number(Temp),
                    humidity: Number(RH),
                    press: Number(Press),
                    measureType: 2,
                    testTime: RecordTime
                }

                // var data = [
                //     {
                //      "deviceType":1,     //设备类型0:h1,1:G1，2：S3,3:S4
                //      "deviceId":3,       //设备id
                //      "temperature": 35.3,//温度：摄氏度
                //      "humidity": 28,     //湿度：%
                //      "press": 1020.5,    //气压：mb    
                //      "measureType": 2,   //1手动，2自动(S4没有手动)
                //      "testTime": "2017-07-14 15:00:00"//测试时间
                //     }
                //  ]

                this.DataList.push(param);
                l.w(param);

                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                if(vm.config.ReceiveDataLen<vm.config.DataLen){
                    console.log(`已读取的数据长度【${vm.config.ReceiveDataLen}】总长度【${vm.config.DataLen}】`)
                    commit('tooltipInfoSet', `温湿度气压数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)
                }else{
                    commit('tooltipInfoSet', '')
                }
            }
        };
        TempRHPressDataHandler._initialized = true;
    }
}

export function PulseDataHandler(t_data) {
    const { commit } = t_data
    let vm = t_data.state.main
    DataHandler.call(this, Cmd.historicalPulse, 11, t_data);

    this.PulseDataSchema =
        {
            Pulse: null,
            SportStatus: null,
            StartType: null,
            BodySurfaceTemp: null,
            RecordTime: null,
            RawHex: null,
        };
    if (typeof PulseDataHandler._initialized == "undefined") {
        PulseDataHandler.prototype.ReceiveSuccess = function (callback) {

            // DataInterface.AddDeviceDataTempRHPress(this.DataList);

            commit('configSet', { lastSetTime: new Date() });
            let param = {
                deviceId: vm.deviceInfo.deviceId,
                dataList: this.DataList
            }
            console.log('****历史数据提交(PulseDataHandler)***')
            console.log(param)
            addDeviceDataPulse(param).then((res) => {
                console.log(res)
                if (res.data.status) {
                    // alert({msg: '提交成功'})
                    callback(res)
                }
            })

            //标记已经读取成功
            commit('configSet', { PulseDataHandlerSuccessFlag: true })
            // //立即开始读取
            // vm.ReadHistory();
        };

        PulseDataHandler.prototype.DecodePacket = function (packet) {

            l.i('PulseDataHandler.DecodePacket')
            this.ReceiveDataDomain = packet.FrameNum.datadomain;
            packet['t_data'] = t_data
            this.HistoryDataReply(packet);
            //解析数据帧 >=1  ？ <=10 
            if (packet.FrameNum.datadomain >= 1 && packet.FrameNum.datadomain <= 10 && packet.Data.length == 11) {
                /*
                脉搏数	    运动状态	        启动方式	    体表温度	        时间
                1~254：脉搏值
                0xFF：无效数据	0x01：表示静止；
                                0x02：表示运动	    0x01：手动
                                                    0x02：自动	    低字节	高字节	     年	月	日	时	分	秒
                */
                var Pulse = bytesToNumber(packet.Data.slice(0, 1));
                var SportStatus = bytesToNumber(packet.Data.slice(1, 2));
                var StartType = bytesToNumber(packet.Data.slice(2, 3));

                var BodySurfaceTemp = bytesToNumber(packet.Data.slice(3, 5)) / 10;
                l.w(`体表温度|${BodySurfaceTemp}`)

                var RecordTimeYear = bytesToNumber(packet.Data.slice(5, 6));
                var RecordTimeMonth = bytesToNumber(packet.Data.slice(6, 7));
                var RecordTimeDay = bytesToNumber(packet.Data.slice(7, 8));
                var RecordTimeHours = bytesToNumber(packet.Data.slice(8, 9));
                var RecordTimeMinutes = bytesToNumber(packet.Data.slice(9, 10));
                var RecordTimeSeconds = bytesToNumber(packet.Data.slice(10, 11));
                var RecordTime = '20' + String(RecordTimeYear).PadLeft(2) + '-' + RecordTimeMonth + '-' + RecordTimeDay + ' ' + RecordTimeHours + ':' + RecordTimeMinutes + ':' + RecordTimeSeconds;

                var param = {
                    wecDeviceId: getStorage.deviceId(),
                    hrCount: Pulse,
                    deviceType: 1,
                    type: SportStatus,
                    measureType: StartType,
                    surfaceTem: BodySurfaceTemp,
                    testTime: RecordTime
                }

                // var data = [
                //     {
                //     "deviceId":1,       //设备id
                //     "hrCount": 95,       //心率值
                //     "result": 1,       //-1偏低、0理想、1正常、2偏快
                //     "deviceType": 1,   //设备类型 0:h1,1:G1,2:S3,3:S4
                //     "type": 0,           //所处状态：0 静止、1动态,默认0
                //     "measureType": 1,  //检测模式 1：手动 2：自动,3:未带手环,4：整点测量 5：动态心率
                //     "surfaceTem": 37.5,//体表温度：摄氏度
                //     "testTime": "2016-12-25 18:00:00", //测试时间：yyyy-MM-dd HH:mm:ss
                //     }
                // ]

                this.DataList.push(param);
                l.w(param);

                commit('configSet', { ReceiveDataLen: (vm.config.ReceiveDataLen + 1) })
                if(vm.config.ReceiveDataLen<vm.config.DataLen){
                    console.log(`已读取的数据长度【${vm.config.ReceiveDataLen}】总长度【${vm.config.DataLen}】`)
                    commit('tooltipInfoSet', `历史脉搏数据同步中(${vm.config.ReceiveDataLen}/${vm.config.DataLen})，请不要关闭页面`)
                }else{
                    commit('tooltipInfoSet', '')
                }
            }
        };
        PulseDataHandler._initialized = true;
    }
}

