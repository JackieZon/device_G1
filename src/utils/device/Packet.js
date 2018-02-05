import { hexToBytes } from './HexUtils'
import { LCDDisplayDataHandler } from './DataHandler'
/**
a)	《本帧编号》位定义：
    本帧编号位	D7	D6	D5	D4	D3	D2	D1	D0
    D7 D6 D5 D4参考《数据域》定义
    D3：应答要求 1：必须应答 0：无须应答
    D2 D1 D0：发送帧次数，由1开始，最大7次

b)	《数据域》定义：
表征含义	D7	D6	D5	D4	数据域内容
请求帧	    0	0	0	0	无数据域
第一帧	    0	0	0	1	第一帧数据帧
第二帧	    0	0	1	0
… …	… …	… …
第十帧	    1	0	1	0	最后一帧数据帧，下一帧再从1开始循环
发送完成	1	0	1	1	无数据域
接收错误	1	1	0	0	数据域为《错误代码》
接收正确	1	1	0	1	无数据域
允许发送	1	1	1	0	无数据域
数据总长度	1	1	1	1	数据域为《数据长度》


c)	《错误代码》定义：
    帧编号	错误类型	注释
    表征含义	D7	D6	D5	D4	D3	D2	D1	D0	高4位表示帧编号，低4位表示错误类型
        保留	0	0	0	0	0	0	0	0	保留
        第一帧	0	0	0	1		0	0	1	校验错误
        第二帧	0	0	1	0		0	1	0	帧编号错误
                        … …		0	1	1	超时无应答
                                    1	0	0	数据未传完
        第十帧	1	0	1	0		1	0	1	传输中断
                            无		1	1	0	未定义
                                                未定义

**/


/**
*  指令定义
**/
export let Cmd = {
    /**
    *  运动
    **/
    sports: 0xC1,
    /**
    *  睡眠
    **/
    sleep: 0xC2,
    /**
    *  微信运动
    **/
    WeChatSports: 0xC3,
    /**
    *  温湿度气压
    **/
    Temphumpres: 0xC5,
    /**
    *  固件升级(手机对APP)
    **/
    firmwareupdate: 0xC6,
    /**
    *  脉搏
    **/
    pulse: 0xC7,
    /**
    *  删除手环相关（约定）数据
    **/
    deleteBraceletData: 0xC8,
    /**
    *  手环电量查询
    **/
    bracelet: 0xC9,
    /**
    *  设置时间同步
    **/
    setTime: 0xCA,
    /**
    *  运动状态
    **/
    sportStatus: 0xCB,
    /**
    *  历史脉搏值
    **/
    historicalPulse: 0xCC,
    /**
    *  夜间测心率状态
    **/
    nightHeartRateStatus: 0xCE,
    /**
    *  请求升级(手机对BL)
    **/
    requestUpgradePhoneToBL: 0xA1,
    /**
    *  查询手环工作状态
    **/
    braceletWorkStatus: 0xA2,
    /**
    *  查询bootloader版本(手机对APP，BL)
    **/
    bootloaderVer: 0xA3,
    /**
    *  查询User Code版本（手机对APP）
    **/
    userCodeVer: 0xA4,
    /**
    *  查询蓝牙版本
    **/
    bluetoothVer: 0xA5,
    /**
    *  LCD屏测试（工装）
    **/
    LCDTest: 0xA6,
    /**
    *  心率测试（工装
    **/
    HeartRateTest: 0xA7,
    /**
    *  修正温、湿、气压
    **/
    CorrectionTemphumpres: 0xA8,
    /**
    *  查询实时时间(工装)
    **/
    getRealTime: 0xA9,
    /**
    *  检测温湿气压体表温度（工装）
    **/
    testTemphumpressurface: 0xAA,
    /**
    *  加速度传感器值(工装)
    **/
    accelerationSensor: 0xAB,
    /**
    *  强制进入应用层程序
    **/
    toApplicationLayerPrograms: 0xAD,
    /**
    *  系统重启
    **/
    reboot: 0xAE,
    /**
    *  手环停在bootloader
    **/
    stopAtBootloader: 0xAF,
    /**
    *  女性周期/ 节日提醒
    **/
    holidayReminder: 0xB1,
    /**
    *  个人信息
    **/
    personalInfo: 0xB2,
    /**
    *  单位显示
    **/
    unitDisplay: 0xB3,
    /**
    *  生成密钥
    **/
    generateKey: 0xB4,
    /**
    *  验证密钥
    **/
    authenticationKey: 0xB5,
    /**
    *  电量查询（工装）
    **/
    PowerInquiryTooling: 0xB6,
    /**
    *  LCD显示数据
    **/
    LCDDisplayData: 0xB7,
    /**
    *  LCD显示数据New
    **/
    LCDDisplayDataNew: 0xBE,
    /**
    *  海拔气压显示
    **/
    altitudeAirPressure: 0xB8,
    /**
    *  设置闪烁条件(心率、温度)
    **/
    SetFlashingConditions: 0xB9,
    /**
    *  蓝牙连接间隔
    **/
    bluetoothConnectionInterval: 0xBA,
    /**
    *  设置步长
    **/
    setStepSize: 0x91,
    /**
    *  闪动提醒阀值
    **/
    FlashingWarningThreshold: 0x92,
    /**
    *  基础代谢
    **/
    basalMetabolism: 0x93,
    /**
    *  动态心率
    **/
    dynamicHeartRate: 0x80,
    /**
    *  闹钟提醒
    **/
    alarmClock: 0x98,
    /**
    *  来电提醒
    **/
    setCall: 0x97,
    /**
    *  久坐提醒
    **/
    setSedentary: 0x9A,
    /**
    *  震动提醒
    **/
    setShock:0x95,
};

/**
* 获取本帧编号
* @Param needreply 是否需要回复bool
* @Param sendcount 重试次数
* @Param datadomain 数据域定义
* @return 本帧编号（number）
**/
export function GetFrameNum(needreply, sendcount, datadomain) {

    if (typeof datadomain == "undefined") {
        datadomain = 0;
    }

    //数据域定义
    var datadomainStr = Number(datadomain).toString(2).PadLeft(4);
    //是否必须回复
    var needreplyStr = Number(needreply) + '';
    //重试次数
    var sendcountStr = Number(sendcount).toString(2).PadLeft(3);

    return parseInt(datadomainStr + needreplyStr + sendcountStr, 2);
}
/*
帧编号	错误类型	注释
表征含义	D7	D6	D5	D4	D3	D2	D1	D0	高4位表示帧编号，低4位表示错误类型
保留	    0	0	0	0	0	0	0	0	保留 
第一帧	    0	0	0	1		0	0	1	校验错误 1
第二帧	    0	0	1	0		0	1	0	帧编号错误 2
                    … …		0	1	1	超时无应答 3
                                1	0	0	数据未传完 4
第十帧	    1	0	1	0		1	0	1	传输中断 5
无		                        1	1	0	未定义 6
*/

/**
*  获取错误代码
* @Param dataFrameNum 数据帧号(1-10)
* @Param errtype 错误类型（0保留，1校验错误，2帧编号错误，3超时无应答，4数据未传完，5传输中断，6未定义
* @return 错误代码（number）
**/
export function GetErrorCode(dataFrameNum, errtype) {

    //数据帧编号
    var dataFrameNumStr = Number(dataFrameNum).toString(2).PadLeft(4);
    //错误类型
    var errtypeStr = Number(errtype).toString(2).PadLeft(4);

    return parseInt(dataFrameNumStr + errtypeStr, 2);
}

/**
*  解码本帧编号
* @Param framenum 本帧编号
* @return {datadomain,needreply,sendcount}
**/
export function DecodeFrameNum(framenum) {
    /*请求帧	0	0	0	0	无数据域
   1 第一帧	    0	0	0	1	第一帧数据帧
   2 第二帧	    0	0	1	0
   .. … …	    … …	… …
  10 第十帧	    1	0	1	0	最后一帧数据帧，下一帧再从1开始循环
 11 发送完成	1	0	1	1	无数据域
12  接收错误	1	1	0	0	数据域为《错误代码》
13  接收正确	1	1	0	1	无数据域
14  允许发送	1	1	1	0	无数据域
15  数据总长度	1	1	1	1	数据域为《数据长度》
    */

    // 本帧编号为一个字节，转换成8位二进制数据
    var FrameNumStr = Number(framenum).toString(2).PadLeft(8);
    var datadomain = parseInt(FrameNumStr.slice(0, 4), 2);
    var needreply = parseInt(FrameNumStr.slice(4, 5), 2);
    var sendcount = parseInt(FrameNumStr.slice(5, 8), 2);
    return { datadomain: datadomain, needreply: needreply, sendcount: sendcount, }
}



/**
*  获取封包字节数组
* @Param cmd 指令
* @Param hexstr 数据（16进制字符串）
* @return 封包字节数组
**/
export function EncodePacket(cmd, hexstr, frameNum) {
    if (typeof hexstr == "undefined") {
        hexstr = '';
    }
    //去除空格
    hexstr = hexstr.replace(/ /g, '');

    //帧头
    var packetStartBytes = [0x55, 0xAA];

    //本帧编号
    var frameNumBytes;
    if (typeof frameNum == "undefined"){
        frameNumBytes = [GetFrameNum(true, 1)];
    }
    else{
        frameNumBytes = [frameNum]
    }

    //指令字节
    var cmdBytes = [cmd];

    //子命令字节
    var dataBytes = hexToBytes(hexstr);

    //数据长度字节
    var packetLenBytes = [frameNumBytes.length + cmdBytes.length + dataBytes.length];

    //校验和
    var CheckSumBytes = [GetCheckSum(packetLenBytes.concat(frameNumBytes, cmdBytes, dataBytes))];

    return packetStartBytes.concat(packetLenBytes, frameNumBytes, cmdBytes, dataBytes, CheckSumBytes);
}




var PacketLenConfig =
    {
        /**
        *  帧头 （2字节）
        **/
        PacketStartLen: 2,
        /**
        *  数据长度 （1字节）
        **/
        DataLenLen: 1,
        /**
        *  本帧编号 （1字节）
        **/
        FrameNumLen: 1,
        /**
        *  命令 （1字节）
        **/
        CmdLen: 1,
        /**
        *  校验 （1字节）
        **/
        CheckSumLen: 1,
    }


export function Packet(bytes) {
    //包最小长度 >=    帧头 （2字节） 数据长度 （1字节）	本帧编号 （1字节）	命令 （1字节）	数据 （n字节）	校验 （1字节）
    if (bytes.length < (PacketLenConfig.PacketStartLen + PacketLenConfig.DataLenLen + PacketLenConfig.FrameNumLen + PacketLenConfig.CmdLen + PacketLenConfig.CheckSumLen)) {
        l.e("解析失败，包长度太小，" + bytes.length + "字节");
        return false;
    }

    // 当前对应字节的10进制数组
    this.RawHex = bytes;

    // 截取数据长度字节  得到返回数据对应位置的数据长度 【 DataLenLen 】
    this.DataLen = bytes.slice(PacketLenConfig.PacketStartLen, PacketLenConfig.PacketStartLen + PacketLenConfig.DataLenLen)[0];
    
    // 截取本帧编号字节(1) 截取（帧头+数据位置）到本帧编号的位置的 
    var FrameNumindex = PacketLenConfig.PacketStartLen + PacketLenConfig.DataLenLen;
    this.FrameNum = DecodeFrameNum(bytes.slice(FrameNumindex, FrameNumindex + PacketLenConfig.FrameNumLen)[0]);

    // 截取命令字节(1)
    var Cmdindex = PacketLenConfig.PacketStartLen + PacketLenConfig.DataLenLen + PacketLenConfig.FrameNumLen;
    this.Cmd = bytes.slice(Cmdindex, Cmdindex + PacketLenConfig.CmdLen)[0];

    if(Cmd.dynamicHeartRate == this.Cmd){

        this.Cmd = bytes.slice(Cmdindex, Cmdindex + PacketLenConfig.CmdLen)[0];
        this.Cmdx = bytes.slice(Cmdindex, (Cmdindex + PacketLenConfig.CmdLen +1))[1]
        console.log(`
            现在是动态心率
            主命令字节【 ${this.Cmd} 】
            子命令字节【 ${this.Cmdx} 】
        `)

    }

    // 截取传输的数据的长度（ 总长度 - 本帧编号长度 - 命令长度 ）
    var Dataindex = Cmdindex + PacketLenConfig.CmdLen;
    this.Data = bytes.slice(Dataindex, Dataindex + this.DataLen - PacketLenConfig.FrameNumLen - PacketLenConfig.CmdLen);

    if (this.Data.length != (this.DataLen - (PacketLenConfig.FrameNumLen+PacketLenConfig.CmdLen)) ) {
        l.e("解析失败，包长度错误，实际" + this.Data.length + "字节，声明" + (this.DataLen - 2) + "字节");
        return false;
    }

    if (typeof Packet._initialized == "undefined") {
        Packet.prototype.DecodePacket = function () {
            switch (this.Cmd) {
                //l)LCD显示数据
                /*   运动步数	卡路里	睡眠	心率值	体表温度	湿度	环境温度	气压
                    4个字节	2个字节	1个字节	1个字节	2个字节	   1个字节	1个字节	   2个字节
                    低……高				            低……高			           低……高

                   说明：睡眠时间＝ 睡眠 / 10，当睡眠时间为10.5小时，其值为69
                   体表温度 = 体表温度值 / 10, 用两个字节表示，当温度为36.1度时，其值为 69 01
                   湿度，一个字节表示，当湿度为70 % 时，其值为 46
                   环境温度, 一个字节表示，当温度为28度时，其值 1C
                   气压值 = 气压 / 10 mbar，2个字节表示，当气压值为1000.5mbar，其值 15 27
                   举例：
                   APP：  55 AA 02 09 B7 CS
                   手环：  AA 55 10 D1 B7 2E 16 00 00 64 F6 00 3C 69 01 50 1C 15 27 CS   步数：5678, 卡路里：246，睡眠：10.0h心率值：60，体表温度：36.1度，湿度：80 %，环境温度：28度，气压值：1000.5mbar
                   */
                case Cmd.LCDDisplayData:
                    {
                        l.i('Cmd.LCDDisplayData')
                        // if (!(typeof lcdDisplayDataHandler == "undefined")){
                            this.QueueName = 'getLCDDisplayData'
                            lcdDisplayDataHandler.DecodePacket(this);
                        // }else{
                            // l.e('Cmd.LCDDisplayData')
                        // }
                        break;
                    }
                case Cmd.sports:
                    {
                        l.i('Cmd.sports')
                        console.log(typeof sportDataHandler)
                        console.log(window.sportDataHandler)
                        // if (!(typeof sportDataHandler == "undefined")){
                            this.QueueName = 'getSport'
                            sportDataHandler.DecodePacket(this);
                        // }else{
                            // l.e('Cmd.sports')
                        // }
                        break;
                    }
                case Cmd.sleep:
                    {
                        l.i('Cmd.sleep')
                        // if (!(typeof sleepDataHandler == "undefined")){
                            this.QueueName = 'getSleep'
                            sleepDataHandler.DecodePacket(this);
                        // }else{
                            // l.e('Cmd.sleep')
                        // }
                        break;
                    }
                case Cmd.Temphumpres:
                    {
                        l.i('Cmd.Temphumpres')
                        // if (!(typeof tempRHPressDataHandler == "undefined")){
                            this.QueueName = 'getTempRHPress'
                            tempRHPressDataHandler.DecodePacket(this);
                        // }else{
                            // l.e('Cmd.Temphumpres')
                        // }
                        break;
                    }
                case Cmd.historicalPulse:
                    {
                        l.i('Cmd.historicalPulse')
                        // if (!(typeof pulseDataHandler == "undefined")){
                            this.QueueName = 'getHistoricalPulse'
                            pulseDataHandler.DecodePacket(this);
                        // }else{
                            // l.e('Cmd.historicalPulse')
                        // }
                        break;
                    }
                default:
                    {
                        // if (!(typeof dataHandler == "undefined")){
                            dataHandler.DecodePacket(this);
                        // }else{
                            // l.e('dataHandler')
                        // }
                        break;
                    }
            }
        };
        Packet._initialized = true;
    }
    ///解码成功标志
    this.Decode = true;
}

/**
*  计算校验和
* @Param dataBytes 数据bytes
* @return number校验和
**/
export function GetCheckSum(dataBytes) {
    var checksum = 0;
    for (var i = 0; i < dataBytes.length; i++) {
        checksum += dataBytes[i];
    }
    checksum = checksum % 256;

    console.log(`
        计算校验和
        计算过程:
        var checksum = 0;
        for (var i = 0; i < dataBytes.length; i++) {
            checksum += dataBytes[i];
        }
        checksum: ${checksum}
        checksum = checksum % 256;
        checksum: ${checksum}
    `)

    return checksum;
}