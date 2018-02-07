/**
 * Created by Administrator on 2017/9/15.
 */
import { l } from './../../utils/base'
import { Cmd } from './../../utils/device/Packet'
import { DataHandler, LCDDisplayDataHandler, SleepDataHandler, SportDataHandler, TempRHPressDataHandler, PulseDataHandler } from './../../utils/device/DataHandler'
import { senddataBytes } from './../../utils/device/WXDevice'
import { bytesToHex, byteToHex, hexToBytes } from './../../utils/device/HexUtils'
import { confirm, toast } from './../../utils/toast'
import { linkBlue } from './../../utils/device/WXDevice'

let state = {
    taskQueue: [{
            //【读取】节日提醒女性生理周期提醒
            name: 'getHolidayReminder',
            isExec: true
        },
        {
            //【读取】屏幕显示数据
            name: 'getLCDDisplayData',
            isExec: false
        },
        {
            //【读取】读取里程信息
            name: 'getLCDDisplayDataNew',
            isExec: true
        },
        {
            //【读取】读取久坐开关状态
            name: 'readyShock',
            isExec: false
        },
        {
            //【读取】读取久坐提醒
            name: 'readySedentary',
            isExec: false
        },
        {
            //【读取】读取查询闹钟列表
            name: 'loopClockListInquire',
            isExec: false
        },
        {
            //【读取】手环电量查询
            name: 'getBattery',
            isExec: false
        },
        {
            //【读取】读取提醒阈值
            name: 'getFlashingWarningThreshold',
            isExec: true
        },
        {
            //【读取】读取个人信息(身高体重)
            name: 'getPersonalInfo',
            isExec: false
        },
        {
            //【读取】读取版本
            name: 'getUserCodeVer',
            isExec: false
        },
        {
            //【设置】同步时间
            name: 'setLCDDTime',
            isExec: false
        },
        {
            //【设置】设置提醒阈值
            name: 'setFlashingWarningThreshold',
            isExec: false
        },
        {
            //【设置】设置个人信息(身高体重)
            name: 'setPersonalInfo',
            isExec: false
        },
        {
            //【读取】读取运动历史
            name: 'getSport',
            isExec: false
        },
        {
            //【读取】读取温湿度气压
            name: 'getTempRHPress',
            isExec: true
        },
        {
            //【读取】读取历史脉搏数据
            name: 'getHistoricalPulse',
            isExec: false
        },
        {
            //【读取】读取睡眠
            name: 'getSleep',
            isExec: false
        },
    ],
    taskQueueIndex: 0,
    mainTheadRunIng: false,
    runCommandStatus: true, // 【true】正常执行任务 【false】暂停
    historyDataObj: {
        status: false, // 【true】停止了【为被停止】
        data: {},
        t_data: {}
    },
    config: {
        //实时数据读取线程开关
        readLCDDataTheadEnable: true,
        //WX设备库状态
        WXDeviceLibState: 0,
        //最后发起读取实时数据的时间
        lastReadLCDDataTime: new Date('2017/1/1'),
        //读取实时数据的间隔秒数
        readLCDDataInterval: 6,
        //是否读取历史数据中
        IsReadHistoryData: false,
        //最后发送成功的时间
        lastSendSuccessTime: new Date('2017/1/1'),
        //最后成功接收的时间
        lastReceiveSuccessTime: new Date('2017/1/1'),
        lastSetTime: new Date('2017/1/1'),
        //历史数据长度
        DataLen: 0,
        //已接收数据长度
        ReceiveDataLen: 0,
        ///当前指令
        CurCmd: Cmd.sports,
        ///当前处理程序
        CurHandler: null,
        //最后执行队列的时间
        taskQueueTimeLast: new Date('2017/1/1'),
        LCDDisplayDataHandlerSuccessFlag: false,
        SleepDataHandlerSuccessFlag: false,
        SportDataHandlerSuccessFlag: false,
        TempRHPressDataHandlerSuccessFlag: false,
        PulseDataHandlerSuccessFlag: false,
    },
    deviceInfo: {
        deviceId: '',
        deviceType: '',
        connectState: false, // 设备已连接状态

        //心率提醒参数
        heartRateSwitch: false,
        heartRateDate: 0,

        //温差提醒参数
        tempDiffSwitch: false,
        tempDiffDate: 0,

        //步数目标参数
        stepNumber: 0,

        // 电量
        bracelet: 5,

        //固件版本
        userCodeVer: 'v1.0.0',
        //心率报警值
        rawDeviceSetHeartRateMax: 0,
        //步数目标
        rawDeviceSetStepTarget: 0,
        //温差提醒阀值
        rawDeviceSetTempDiff: 0,
        //里程
        km: 0,
        //身高
        Height: 172,
        //体重
        Weight: 60,
        //节日提醒开启状态
        remindonstate: false,
        //周期
        cycle: 0,
        //下次提醒天数
        nextremind: 0,

    },
    deviceInfoSeting: {
        deviceType: 1,
        heartRateCountRemind: 0,
        heartRateRemind: 0,
        sportTarget: 0,
        sportTargetRemind: 1,
        temperatureDifferenceRemind: 0,
        temperatureDifferenceValue: 0,
        lowHeartRateValue: 0
    },
    userInfo: {
        openId: 'openId',
        menstruationCycle: 28,
        menstruationDays: 5,
        lastMenstruationDate: '2018-01-01',
    },
    female: {
        maleStart: false,
        maleEnd: false,
    },
    LCDDisplayData: {
        sportstep: null,
        calorie: null,
        sleephour: null,
        heartrate: null,
        bodysurfacetemp: null,
        humidity: null,
        temperature: null,
        pressure: null
    },
    tooltipInfo: '', //顶部提示信息
    dynamicHeartRate: {
        heartRateTimer: 0,
        status: 3, // 1已打开 2同步中 3关闭 
        heartRateList: [],
    },
    clockList: [{
            index: 1,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 2,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 3,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 4,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 5,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 6,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 7,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 8,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 9,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
        {
            index: 10,
            status: null,
            repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
            time: [0, 0, 0]
        },
    ],
    clockListIndex: 1,
    flagObj: {
        callStatus: false,
        sedentaryStatus: true,
        keepStatus: false
    },
    sedentaryData: {
        status: false,
        repeatByte: [0, 0, 0, 0, 0, 0, 0, 0],
        startTime: [],
        endTime: [],
    },
    setCallNum: '01'
}

const mutations = {
    // 改变命令执行状态 暂停命令【执行】或【继续】
    changeRunCommand(state, payload) {
        let { status } = payload
        console.error(`改变执行命令状态【runCommandStatus】：${status}`)
        window.localStorage.setItem('runCommandStatus', status)
        state.runCommandStatus = status;
    },
    saveHistoryDataObj(state, payload) {
        state.historyDataObj = {...state.historyDataObj, ...payload }
    },
    saveSetCallNum(state, payload) {
        console.error(
            `
                设置电话提醒
                ==${payload}==
            `
        )

        state.setCallNum = payload;
    },
    saveFlagObj(state, payload) {
        console.error(
            `
                保存手环开关设置
                callStatus: 【${payload.callStatus}】
                sedentaryStatus: 【${payload.sedentaryStatus}】
                keepStatus: 【${payload.keepStatus}】
            `
        )

        state.flagObj = {...state.flagObj, ...payload };
    },
    saveSedentary(state, payload) {
        // {
        //     repeatByte: countRepeat(repeatByte),
        //     startTime: startTime,
        //     endTime: endTime,
        // }
        console.log(`久坐提醒保存到 store 中`)
        console.log(payload)
        state.sedentaryData = {...state.sedentaryData, ...payload }
    },

    changeClock(state, payload) {
        console.error(`在store.js中得到查询的闹钟【↓】`)
        console.error(payload)
        const { index, data } = payload;
        state.clockList[index] = data;
        if (index == 9) {
            console.error('已查询完成');
            console.error(state.clockList);
        }
    },
    saveClockListIndex(state, payload) {
        state.clockListIndex = payload;
    },
    pushHeartRateList(state, payload) {

        console.error(`保存到store中,【${payload.hrCount}】`)
        state.dynamicHeartRate.heartRateList.push(payload)

    },
    clearHeartRateList(state, payload) {
        console.log('执行清空心率数据')
        state.dynamicHeartRate.heartRateList = []
    },
    setDynamicHeartRate(state, payload) {
        if (payload.status == 3) {
            console.log('关闭循环读取心率数据')
            clearInterval(state.dynamicHeartRate.heartRateTimer)
        }
        state.dynamicHeartRate = {...state.dynamicHeartRate, ...payload }
    },
    deviceInfoSetingSet(state, payload) {
        state.deviceInfoSeting = {...state.deviceInfoSeting, ...payload }
    },
    userInfoSets(state, payload) {
        state.userInfo = {...state.userInfo, ...payload }
    },
    femaleSet(state, payload) {
        state.female = {...state.female, ...payload }
    },
    saveMainTheadRunIng(state, payload) { // 存储商品信息
        state.mainTheadRunIng = payload
    },
    configSet(state, payload) {
        state.config = {...state.config, ...payload }
    },
    deviceInfoSet(state, payload) {
        state.deviceInfo = {...state.deviceInfo, ...payload }
    },
    LCDDisplayDataSet(state, payload) {
        state.LCDDisplayData = {...state.LCDDisplayData, ...payload }
    },
    taskQueueSet(state, payload) {
        const { index } = payload
        state.taskQueue[index].isExec = true
    },
    taskQueueIndexSet(state, payload) {
        state.taskQueueIndex = payload
    },
    taskQueueTimeLastSet(state, payload) {
        state.taskQueueTimeLast = new Date()
    },
    tooltipInfoSet(state, payload) {
        // l.w('更新到Store')
        l.w(payload)
        state.tooltipInfo = payload
    },
    // changeQueue(state, payload) {
    //     // l.w('更新到Store')
    //     l.w(payload)
    //     state.taskQueue[payload.index] = payload.obj
    // },
}

const actions = {
        userInfoSet({ commit, state, dispatch, getters }, payload) {
            commit('userInfoSets', payload);
        },
        deviceInfoSet({ commit, state, dispatch, getters }, payload) {
            commit('deviceInfoSet', payload);
        },
        mainthead({ commit, state, dispatch, getters }, payload) {
            let { WXDeviceLibState, lastReceiveSuccessTime, taskQueueTimeLast, lastSendSuccessTime } = state.config

            // console.log(`
            //     WXDeviceLibState: 保存的设备库状态(蓝牙状态); =1(蓝牙已打开) =2(微信未授权蓝牙) =3(蓝牙未打开) =4(设备库初始化失败)
            //     lastReceiveSuccessTime: 成功接收蓝牙数据的时间
            //     taskQueueTimeLast: 上一次执行队列任务的时间
            //     lastSendSuccessTime: 数据发送成功的时间
            // `)

            let { connectState, wecDeviceId } = state.deviceInfo
            // if (connectState == false) {
            //     linkBlue(wecDeviceId)
            // }
            //保持单例运行
            if (state.mainTheadRunIng) return;
            // l.i('运行中...')
            commit('saveMainTheadRunIng', true)
            try {

                //读取历史记录超过13秒未响应（需要配合接收超时的重试间隔和次数）
                // console.log(`尝试执行队列任务 以下是状态`)
                // console.log(`
                //     WXDeviceLibStateL(蓝牙连接状态): 【 ${WXDeviceLibState} 】,
                //     connectState(设备连接状态): 【 ${connectState} 】,
                //     (new Date().getTime() / 1000 - taskQueueTimeLast.getTime() / 1000): 【 ${ ((new Date().getTime() / 1000 - taskQueueTimeLast.getTime() / 1000) > 3) } 】
                //     (sendTimeOut === null || ((new Date().getTime() / 1000 - lastSendSuccessTime.getTime() / 1000) > 13))：【 ${(sendTimeOut === null || ((new Date().getTime() / 1000 - lastSendSuccessTime.getTime() / 1000) > 13))} 】
                // `)

                if (WXDeviceLibState == 1 &&
                    connectState &&
                    (new Date().getTime() / 1000 - taskQueueTimeLast.getTime() / 1000) > 3 &&
                    (new Date().getTime() / 1000 - lastReceiveSuccessTime.getTime() / 1000) > 13 &&
                    (sendTimeOut === null || ((new Date().getTime() / 1000 - lastSendSuccessTime.getTime() / 1000) > 13))
                ) {
                    commit('taskQueueTimeLastSet') // 保存当前执行时间
                    dispatch('taskQueueExec', {})
                }
            } catch (e) {
                l.e('主线程出错', e.message, e.stack)
            }

            commit('saveMainTheadRunIng', false)
            setTimeout(() => {
                dispatch('mainthead')
            }, 1000);

        },
        taskQueueExec: function({ commit, state, dispatch, getters }, payload) {
            // console.error(`队列任务执行中...`)
            // console.log(`开始执行队列任务：【 taskQueueExec 】`)
            let { taskQueue, taskQueueIndex, runCommandStatus } = state
            let { QueueName } = payload

            // 改变执行完的任务状态
            if (QueueName) {
                // console.warn('执行改变任务状态方法前');
                // console.warn(`QueueName:【${QueueName}】`);
                QueueNameFor: for (let task = 0; task < taskQueue.length; task++) {
                    if (taskQueue[task].name == QueueName) {
                        commit('taskQueueSet', { index: task });
                    }
                    let taskLen = taskQueue.length;
                    if ((taskLen - 1) == task) {
                        break QueueNameFor;
                    }
                }
            }

            // 判断命令是否暂停
            if (runCommandStatus === false) {
                return
            }
            // 执行未执行的任务
            QueueLoop:
                for (let i = 0; i < taskQueue.length; i++) {

                    // console.warn(`执行【${taskQueue[i].name}】状态是${taskQueue[i].isExec}`)

                    if (taskQueue[i].isExec === false) {
                        console.warn(`状态通过，立即执行【${ taskQueue[i].name }】`)
                        dispatch(taskQueue[i].name)
                        break QueueLoop;
                    }
                    let taskLen = taskQueue.length;
                    if ((taskLen - 1) == i) {
                        console.warn('单项任务已执行完。')
                        dispatch('readLCDDataThead')
                    }

                }

        },
        readLCDDataThead({ commit, state, dispatch, getters }, payload) {
            let {
                WXDeviceLibState,
                IsReadHistoryData,
                LCDDisplayDataHandlerSuccessFlag,
                TempRHPressDataHandlerSuccessFlag,
                lastReadLCDDataTime,
                readLCDDataInterval,
                readLCDDataTheadEnable,
                lastSetTime
            } = state.config

            let { connectState } = state.deviceInfo
            try {
                // l.i('readLCDDataThead')
                const { taskQueue, taskQueueIndex, dynamicHeartRate } = state

                //没有在读取历史数据
                let taskLen = taskQueue.length;
                if (WXDeviceLibState == 1 && taskQueue[taskLen - 1].isExec && dynamicHeartRate.status == 3) {
                    //设备处于连接状态 且 已经超过读取间隔
                    //l.i(`connectState=${connectState}||lastReadLCDDataTime=${((new Date().getTime() / 1000) - (lastReadLCDDataTime.getTime() / 1000))}||readLCDDataInterval=${readLCDDataInterval}||TempRHPressDataHandlerSuccessFlag=${TempRHPressDataHandlerSuccessFlag}`)
                    if (connectState &&
                        ((new Date().getTime() / 1000) - (lastReadLCDDataTime.getTime() / 1000)) > readLCDDataInterval) {

                        lastReadLCDDataTime = new Date();
                        commit('configSet', { lastReadLCDDataTime: new Date() })
                        dispatch('getLCDDisplayData', {})
                    }
                }
            } catch (e) {
                l.e('readLCDDataThead方法内错误')
            }

            //读取实时数据启用中
            if (readLCDDataTheadEnable) {
                setTimeout(() => {
                    dispatch('readLCDDataThead')
                }, 2000);
            }
        },
        getLCDDisplayData: function({ commit, state, dispatch, getters }, payload) {
            // console.log(`执行读取手环数据：【 getLCDDisplayData 】`)
            let t_data = this;
            if (typeof(window.lcdDisplayDataHandler) !== 'function') {
                (function() {
                    var Super = function() {};
                    Super.prototype = DataHandler.prototype;
                    SleepDataHandler.prototype = new Super();
                })();
                window.lcdDisplayDataHandler = new LCDDisplayDataHandler(t_data)
            }
            const { IsReadHistoryData } = state.config
            if (IsReadHistoryData) return;
            window.lcdDisplayDataHandler.SendCount = 1;
            window.lcdDisplayDataHandler.NeedReply = true;
            window.lcdDisplayDataHandler.DataDomain = 0;
            senddataBytes(state.deviceInfo.wecDeviceId, {
                cmd: Cmd.LCDDisplayData,
                data: '',
                dataHandler: window.lcdDisplayDataHandler,
                t_data: t_data
            })
        },
        setLCDDTime({ commit, state, dispatch, getters }, payload) {
            var now = new Date();
            var nowtimebytes = [now.getFullYear() - 2000, (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
            // console.log('同步设置时间')
            // console.log(bytesToHex(nowtimebytes))
            dispatch('SendCmd', { cmd: Cmd.setTime, data: bytesToHex(nowtimebytes) });
        },
        getBattery({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.bracelet, data: '' });
        },
        getLCDDisplayDataNew({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.LCDDisplayDataNew, data: '' });
        },
        getPersonalInfo({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.personalInfo, data: '01' });
        },
        // 0x95 震动提醒命令
        setCall({ commit, state, dispatch, getters }, payload) {
            let { callStatus, sedentaryStatus } = state.flagObj;
            let num = state.setCallNum;
            let p = navigator.platform;
            console.log(
                `
                设置来电提醒的值 【${num}】
                系统类型        【${p}】
            `
            )
            state.taskQueue.push({
                name: 'setyShock',
                isExec: false
            })

            if (p == 'iPhone') {} else {
                dispatch('changesetCall', {})
            }

        },
        //添加设置来电提醒命令 【97】【操作】
        changesetCall({ commit, state, dispatch, getters }, payload) {
            let num = state.setCallNum;
            if (num == '01') {
                state.taskQueue.push({
                    name: 'setCallX',
                    isExec: false
                })
            }
        },
        // 来电提醒指令 【0x97】【命令】
        setCallX({ commit, state, dispatch, getters }, payload) {
            let num = state.setCallNum;
            dispatch('SendCmd', { cmd: Cmd.setCall, data: num + bytesToHex([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) });
        },

        // 查询久坐提醒【久坐信息】
        readySedentary({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.setSedentary, data: '02' });
        },
        // 查询久坐提醒 【开关】
        readyShock({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.setShock, data: '01' });
        },
        // 设置久坐提醒 【开关】
        setyShock({ commit, state, dispatch, getters }, payload) {

            let { callStatus, sedentaryStatus, keepStatus } = state.flagObj;
            console.error(
                `
                提醒开关设置的值
                【${Number(callStatus)}】【${Number(sedentaryStatus)}】【0】
            `
            )
            dispatch('SendCmd', { cmd: Cmd.setShock, data: '02' + bytesToHex([Number(callStatus), Number(sedentaryStatus), 0]) });

        },
        setPersonalInfo({ commit, state, dispatch, getters }, payload) {
            //是否需要设置身高体重
            if (!(typeof state.userInfo.height == 'undefined') && state.userInfo.height > 0 &&
                !(typeof state.userInfo.weight == 'undefined') && state.userInfo.weight > 0 &&
                (state.userInfo.height != state.deviceInfo.Height || state.userInfo.weight != state.deviceInfo.Weight)) {
                const { height, weight } = state.userInfo
                l.w(`Height:${height},Weight:${weight}`)
                    // console.log(`设置的身高数据:${bytesToHex([height, weight])}`)
                dispatch('SendCmd', { cmd: Cmd.personalInfo, data: '02' + bytesToHex([height, weight]) });
            } else {
                l.w('身高体重跳过')
                    //直接跳过
                dispatch('taskQueueExec', { QueueName: 'setPersonalInfo' })
            }
        },
        setHolidayReminder({ commit, state, dispatch, getters }, payload) {
            let { remindonstate, cycle, nextremind } = state.deviceInfo
            let command = `0${remindonstate}`
            console.log(
                `
                设置前的参数【女性生理周期】
                子命令: 【02】;
                开关: 【${remindonstate}】;
                周期：【${cycle}】;
                天数：【${nextremind}】;
            `
            )
            dispatch('SendCmd', { cmd: Cmd.holidayReminder, data: '02' + bytesToHex([remindonstate, cycle, nextremind]) });

        },
        setFrequencyData({ commit, state, dispatch, getters }, payload) {
            let frequencyVal = localStorage.getItem('heartRateGaugeValue')
            if(frequencyVal!==null&&frequencyVal!=='null'){
                console.error(
                    `
                    设置心率测量频率【${frequencyVal}】
                `
                )
                dispatch('SendCmd', { cmd: Cmd.setFrequency, data: '01' + bytesToHex([ Number(frequencyVal) ]) });
            }

        },
        addSetFrequencyData({ commit, state, dispatch, getters }, payload){
            state.taskQueue.push({
                //添加心率频率设置
                name: 'setFrequencyData',
                isExec: false
            })
        },
        getFlashingWarningThreshold({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.FlashingWarningThreshold, data: '01' });
        },
        setFlashingWarningThreshold({ commit, state, dispatch, getters }, payload) {
            const {
                rawDeviceSetHeartRateMax,
                rawDeviceSetStepTarget,
                rawDeviceSetTempDiff,
                heartRateCountRemind,
                sportTarget,
                temperatureDifferenceValue,
                heartRateRemind,
                temperatureDifferenceRemind,
                sportTargetRemind,
                lowHeartRateValue
            } = state.deviceInfo

            // rawDeviceSetHeartRateMax 手环里面的心率值（为零等于未开启）
            // heartRateRemind 服务器返回的心率开关
            // heartRateCountRemind 服务器返回的心率值

            // rawDeviceSetStepTarget 手环的步数目标值（为零等于未开启）
            // sportTargetRemind 接口返回步数开关
            // sportTarget 接口返回步数值

            // rawDeviceSetTempDiff 温差提醒筏值开关（为零等于未开启）
            // temperatureDifferenceRemind 接口返回温差提醒筏值开关
            // temperatureDifferenceValue 温差筏值

            //  if(heartRateRemind==1){

            //  }

            console.error(`heartRateRemind:${heartRateRemind},rawDeviceSetHeartRateMax:${rawDeviceSetHeartRateMax},heartRateCountRemind:${heartRateCountRemind},rawDeviceSetStepTarget:${rawDeviceSetStepTarget},sportTarget:${sportTarget},rawDeviceSetTempDiff:${rawDeviceSetTempDiff},temperatureDifferenceValue:${temperatureDifferenceValue}`)

            const heartMax = (heartRateRemind == 0 ? 0 : heartRateCountRemind)
            const heartMin = (heartRateRemind == 0 ? 0 : lowHeartRateValue)

            const ratemax = heartRateRemind ? heartRateCountRemind : 0; // 设置心率值
            const steptarget = hexToBytes(Number(sportTargetRemind ? sportTarget : 0).toString(16).PadLeft(4)).reverse(); // 设置运动步数
            const tempdiff = parseInt('0' + Number(temperatureDifferenceRemind ? temperatureDifferenceValue : 0).toString(2).PadLeft(7), 2); // 设置温差提醒

            console.warn(
                `
                设置提醒阀值执行
                高心率:【${heartMax}】
                步数steptarget:【${bytesToHex(steptarget)}】
                步数sportTarget:【${sportTarget}】
                温差tempdiff:【${tempdiff}】
            `
            )

            dispatch('SendCmd', { cmd: Cmd.FlashingWarningThreshold, data: '02' + bytesToHex([heartMax].concat(steptarget, [tempdiff])) });

            // dispatch('taskQueueExec', { isSetSuccess: true })
            // if (rawDeviceSetHeartRateMax != heartRateCountRemind ||
            //     rawDeviceSetStepTarget != sportTarget ||
            //     rawDeviceSetTempDiff != temperatureDifferenceValue) {
            // }
            // else {
            //     l.w('设置提醒阀值跳过')
            //     //直接跳过
            //     dispatch('taskQueueExec', { isSetSuccess: true })
            // }
        },
        getUserCodeVer({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.userCodeVer, data: '' });
        },
        getHolidayReminder({ commit, state, dispatch, getters }, payload) {
            dispatch('SendCmd', { cmd: Cmd.holidayReminder, data: '01' });
        },
        SendCmd({ commit, state, dispatch, getters }, payload) {
            let t_data = this
            if (typeof(window.dataHandler) !== 'function') {
                window.dataHandler = new DataHandler(undefined, undefined, t_data)
            }

            // 发送的本帧编号
            window.dataHandler.SendCount = 1; // 重发次数
            window.dataHandler.NeedReply = true; // 是否为必须应答
            window.dataHandler.DataDomain = 0; // 数据域定义

            senddataBytes(state.deviceInfo.wecDeviceId, {
                cmd: payload.cmd,
                data: payload.data,
                dataHandler: window.dataHandler,
                t_data: t_data
            })

        },
        getSleep({ commit, state, dispatch, getters }, payload) {
            let payloadx = payload;
            let { status, data, t_data } = state.historyDataObj
            let t_datax = this;
            // console.log('读取睡眠时间')
            commit('configSet', { IsReadHistoryData: true })
            if (typeof(window.sleepDataHandler) !== 'function') {
                (function() {
                    var Super = function() {};
                    Super.prototype = DataHandler.prototype;
                    SleepDataHandler.prototype = new Super();
                })();
                window.sleepDataHandler = new SleepDataHandler(t_datax);
            }
            //发送请求帧
            window.sleepDataHandler.SendCount = 1;
            window.sleepDataHandler.NeedReply = true;
            window.sleepDataHandler.DataDomain = 0;

            // console.error(`睡眠历史数据任务暂停的状态【${status}】`)
            // if (status === true) {
            //     console.error(`睡眠被暂停后继续执行历史任务【${status}】【${data.DataDomain}】`)
            //     senddataBytes(window.localStorage.wecDeviceId, { cmd: data.Cmd, data: '', dataHandler: data, t_data: t_data })
            // } else {

            senddataBytes(state.deviceInfo.wecDeviceId, {
                cmd: Cmd.sleep,
                data: '',
                dataHandler: window.sleepDataHandler,
                t_data: t_datax
            })

            // }
        },
        getSport({ commit, state, dispatch, getters }, payload) {
            console.error(1)
            let payloadx = payload;
            let { status, data } = state.historyDataObj
            let t_datax = this;
            // l.i('读取历史运动数据')
            //commit('configSet',{IsReadHistoryData: true})
            if (typeof(window.sportDataHandler) !== 'function') {
                //通用回复处理
                (function() {
                    var Super = function() {};
                    Super.prototype = DataHandler.prototype;
                    SportDataHandler.prototype = new Super();
                })();
                window.sportDataHandler = new SportDataHandler(t_datax);
            }
            // console.error(2)
            //发送请求帧
            window.sportDataHandler.SendCount = 1;
            window.sportDataHandler.NeedReply = true;
            window.sportDataHandler.DataDomain = 0;

            // console.error(`运动历史数据任务暂停的状态【${status}】【${data.DataDomain}】`)
            // if (status === true) {

            //     console.error(2.1)
            //     console.error(`运动被暂停后继续执行历史任务【${status}】【${data.DataDomain}】`)
            //     senddataBytes(window.localStorage.wecDeviceId, { cmd: data.Cmd, data: '', dataHandler: data, t_data: t_data })

            // } else {
            // console.error(2.2)
            senddataBytes(state.deviceInfo.wecDeviceId, {
                cmd: Cmd.sports,
                data: '',
                dataHandler: window.sportDataHandler,
                t_data: t_datax
            })
            // }
        },
        getTempRHPress({ commit, state, dispatch, getters }, payload) {
            let payloadx = payload;
            let { status, data, t_data } = state.historyDataObj
            let t_datax = this;
            // l.i('读取历史温湿度气压数据')
            //commit('configSet',{IsReadHistoryData: true})
            if (typeof(window.tempRHPressDataHandler) !== 'function') {
                //通用回复处理
                (function() {
                    var Super = function() {};
                    Super.prototype = DataHandler.prototype;
                    TempRHPressDataHandler.prototype = new Super();
                })();
                window.tempRHPressDataHandler = new TempRHPressDataHandler(t_datax);
            }
            //发送请求帧 
            window.tempRHPressDataHandler.SendCount = 1;
            window.tempRHPressDataHandler.NeedReply = true;
            window.tempRHPressDataHandler.DataDomain = 0;

            // console.error(`环境历史数据任务暂停的状态【${status}】`)
            // if (status === true) {
            //     console.error(`环境被暂停后继续执行历史任务【${status}】【${data.DataDomain}】`)
            //     senddataBytes(window.localStorage.wecDeviceId, { cmd: data.Cmd, data: '', dataHandler: data, t_data: t_data })
            // } else {
            senddataBytes(state.deviceInfo.wecDeviceId, {
                cmd: Cmd.Temphumpres,
                data: '',
                dataHandler: window.tempRHPressDataHandler,
                t_data: t_datax
            })
            // }
        },
        getHistoricalPulse({ commit, state, dispatch, getters }, payload) {
            let payloadx = payload;
            let { status, data, t_data } = state.historyDataObj
            let t_datax = this;
            // l.i('读取历史脉搏数据')
            //commit('configSet',{IsReadHistoryData: true})
            if (typeof(window.pulseDataHandler) !== 'function') {
                //通用回复处理
                (function() {
                    var Super = function() {};
                    Super.prototype = DataHandler.prototype;
                    PulseDataHandler.prototype = new Super();
                })();
                window.pulseDataHandler = new PulseDataHandler(t_datax);
            }
            //发送请求帧
            window.pulseDataHandler.SendCount = 1;
            window.pulseDataHandler.NeedReply = true;
            window.pulseDataHandler.DataDomain = 0;

            // console.error(`脉搏历史数据任务暂停的状态【${status}】`)
            // if (status === true) {
            //     console.error(`脉搏被暂停后继续执行历史任务【${status}】【${data.DataDomain}】`)
            //     senddataBytes(window.localStorage.wecDeviceId, { cmd: data.Cmd, data: '', dataHandler: data, t_data: t_data })
            // } else {
                
            senddataBytes(state.deviceInfo.wecDeviceId, {
                cmd: Cmd.historicalPulse,
                data: '',
                dataHandler: window.pulseDataHandler,
                t_data: t_datax
            })

            // }
        },
        //更改设备信息
        changeDeviceInfo({ commit, state, dispatch, getters }, payload) {
            // l.w('changeDeviceInfo')
            state.taskQueue.push({
                //设置提醒阈值
                name: 'setFlashingWarningThreshold',
                isExec: false
            })
        },
        //读取界面显示信息
        changeGetHolidayReminder({ commit, state, dispatch, getters }, payload) {
            // l.w('changeDeviceInfo')
            state.taskQueue.push({
                //【读取】节日提醒女性生理周期提醒
                name: 'getHolidayReminder',
                isExec: false
            })
        },
        //更改体重身高
        changePersonalInfo({ commit, state, dispatch, getters }, payload) {
            // l.w('changePersonalInfo')
            state.taskQueue.push({
                //设置个人信息(身高体重)
                name: 'setPersonalInfo',
                isExec: false
            })
        },
        //更改女性生理周期
        changeHolidayReminder({ commit, state, dispatch, getters }, payload) {
            console.error('已添加设置女性生理周期【添加命令】')
            state.taskQueue.push({
                //设置女性生理周期
                name: 'setHolidayReminder',
                isExec: false
            })
        },
        //设置来电提醒
        setAddCall({ commit, state, dispatch, getters }, payload) {
            let { status } = payload;
            commit('saveFlagObj', { callStatus: status })
            if (status) {
                commit('saveSetCallNum', '01')
                console.error('打开来电提醒')
            } else {
                commit('saveSetCallNum', '02')
                console.error('关闭来电提醒')
            }
            dispatch('setCall', {})
        },
        addSetSedentary({ commit, state, dispatch, getters }, payload) {
            console.error('添加设置久坐【设置】')
            state.taskQueue.push({
                //设置来电提醒
                name: 'setSedentary',
                isExec: false
            })
        },
        addSetyShock({ commit, state, dispatch, getters }, payload) {
            console.error('添加设置久坐【开关】')
            state.taskQueue.push({
                //设置来电提醒
                name: 'setyShock',
                isExec: false
            })
        },
        getDynamicHeartRate({ commit, state, dispatch, getters }, payload) {
            let { taskQueue, runCommandStatus } = state
            let { connectState } = state.deviceInfo

            if (connectState == false) {
                toast({ msg: '设备已断开链接，请稍后再试！' })
                return
            }

            if (runCommandStatus === false) {
                commit('setDynamicHeartRate', { status: 1 })
                dispatch('SendCmd', { cmd: Cmd.dynamicHeartRate, data: '01' });
            } else {
                confirm({ title: '任务执行被关闭请联系开发人员...', msg: ' ' }).then((res) => {

                })
            }
        },
        closeDynamicHeartRate({ commit, state, dispatch, getters }, payload) {
            let { taskQueue, dynamicHeartRate } = state

            if (connectState == false) {
                toast({ msg: '设备已断开链接，请稍后再试！' })
                return
            }

            if (dynamicHeartRate.status == 3) {
                return
            } else {
                if (dynamicHeartRate.heartRateTimer) {
                    clearInterval(dynamicHeartRate.heartRateTimer)
                }
                setTimeout(() => {
                    commit('setDynamicHeartRate', { status: 3 })
                    dispatch('SendCmd', { cmd: Cmd.dynamicHeartRate, data: '03' });
                }, 1000)
            }
        },
        pushDynamicHeartRate({ commit, state, dispatch, getters }, payload) {
            let { taskQueue } = state
            commit('setDynamicHeartRate', { status: 2 })
            dispatch('SendCmd', { cmd: Cmd.dynamicHeartRate, data: '02' });
        },
        loopClockListInquire({ commit, state, dispatch, getters }, payload) {

            let clockListIndex = state.clockListIndex
            console.error(
                `
                查询中请稍后...
                当前查询闹钟的序号：【${clockListIndex}】
            `
            )
            if (clockListIndex < 11) {
                dispatch('SendCmd', { cmd: Cmd.alarmClock, data: '02' + bytesToHex([clockListIndex]) });
                commit('saveClockListIndex', clockListIndex += 1)
            } else {
                console.error(`查询完毕序号为：【${clockListIndex}】`)
                dispatch('taskQueueExec', { QueueName: 'loopClockListInquire' })
            }

        },
        addClock({ commit, state, dispatch, getters }, payload) {

            // {
            //     index: 1,
            //     status: true,
            //     repeatByte: [0,1,0,1,0,1,0,1],
            //     time: [11,40,0]
            // },

            // postData: {
            //     time: [0,0,0],
            //     repeatByte: [0,0,0,0,0,0,0,0]
            // },

            const { index, time, repeatByte, status } = payload;

            let clockList = state.clockList
                // 循环闹钟列表设置为设置的闹钟;
            if (index) {

                let indexs = index - 1;
                console.error(`【关闭、删除、编辑】的数组序列号【${indexs}】闹钟列号【${index}】`)

                // 改变列表上的数据
                commit('changeClock', {
                    index: indexs,
                    data: {
                        index: index,
                        status: status,
                        repeatByte: repeatByte,
                        time: time
                    }
                })

                // 发起设置手环命令
                dispatch('setClock', {
                    index: index,
                    status: status,
                    repeatByte: repeatByte,
                    time: time
                })
            } else {

                ClockFor: for (let i = 0; i < clockList.length; i++) {
                    let indexs = i;
                    if (clockList[i].status == null) {

                        // 改变列表上的数据
                        commit('changeClock', {
                                index: i,
                                data: {
                                    index: (indexs + 1),
                                    status: status,
                                    repeatByte: repeatByte,
                                    time: time
                                }
                            })
                            // 发起设置手环命令
                        dispatch('setClock', {
                            index: (indexs + 1),
                            status: status,
                            repeatByte: repeatByte,
                            time: time
                        })
                        break ClockFor;

                    }

                    // let taskLen = taskQueue.length;

                    // if((taskLen - 1) == task){

                    // }
                }

            }
        },
        setClock({ commit, state, dispatch, getters }, payload) {

            let statusType = [true, false, null]

            const {
                index,
                status,
                repeatByte,
                time,
            } = payload
            console.log(
                    `
                设置的手环
                闹钟序号【${index}】
                闹钟状态【${(statusType.indexOf(status)+1)}】
                闹钟重复【${Number(`0b${repeatByte.join('')}`)}】
                时【${time[0]}】
                分【${time[1]}】
                秒【${time[2]}】
            `
        )
        dispatch('SendCmd', { cmd: Cmd.alarmClock, data: '01' + bytesToHex([index, (statusType.indexOf(status)+1), Number(`0b${repeatByte.join('')}`), time[0], time[1], time[2] ]) });
    },
    delClock({ commit, state, dispatch, getters }, payload){

    },
    //设置久坐提醒
    setSedentary({ commit, state, dispatch, getters }, payload) {
        let { 
            repeatByte,
            startTime,
            endTime,
        } = state;

        console.log(
            `
                设置久坐提醒
                闹钟重复【${Number(`0b${repeatByte.join('')}`)}】
                开始时【${startTime[0]}】
                开始分【${startTime[1]}】
                结束时【${endTime[0]}】
                结束分【${endTime[1]}】
            `
        )

        dispatch('SendCmd', { cmd: Cmd.setSedentary, data: '01' + bytesToHex([ Number(`0b${repeatByte.join('')}`), startTime[0], startTime[1], endTime[0], endTime[1] ]) });
    
    },
}

const getters = {

}

export default {
    state,
    mutations,
    getters,
    actions
}