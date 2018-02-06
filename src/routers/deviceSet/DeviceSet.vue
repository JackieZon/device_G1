<template>
    <div id="device_set">
        <div class="pageType1" v-if="pageType==2">
            <yd-cell-group>
                <yd-cell-item href="#" type="link">
                    <div class="title" slot="left">
                        <span>{{ deviceGetInfo.deviceName }}</span>
                        <span>({{ deviceGetInfo.userCodeVer}})</span>
                    </div>
                    <div slot="right" class="but" style="width: 100%; display: flex; flex-direction: row-reverse;">
                        <yd-button size="large" @click.native="relieveDevice" type="danger">解除绑定</yd-button>
                    </div>
                </yd-cell-item>
                <yd-cell-item arrow href="#" type="link" @click.native="openPages('DeviceInfo',{})">
                    <span slot="left">设备信息</span>
                    <div class="code" slot="right" >
                        <img src="./../../assets/icon/code.svg" alt="">
                    </div>
                </yd-cell-item>
            </yd-cell-group>
        </div>
        <div class="pageType2" v-if="pageType==1">
            <yd-cell-group>
                    <yd-cell-item arrow type="a" @click.native="openPages('StepSettings',{})">
                        <span slot="left">步数提醒</span>
                        <span class="span_color" slot="right">{{ deviceInfoSeting.sportTargetRemind == 1 ? deviceInfoSeting.sportTarget + " 步" : "未设置"}}</span>
                    </yd-cell-item>
                    <yd-cell-item arrow type="a" @click.native="openPages('HeartRate',{})">
                        <span slot="left">心率提醒</span>
                        <span class="span_color" slot="right">{{ deviceInfoSeting.heartRateRemind == 1 ? deviceInfoSeting.heartRateCountRemind + " bpm": "未设置"}}</span>
                    </yd-cell-item>
                    <!-- <yd-cell-item arrow type="a" @click.native="openPages('TempDiff',{})">
                        <span slot="left">温差提醒</span>
                        <span class="span_color" slot="right">{{ deviceInfoSeting.temperatureDifferenceRemind == 1 ? deviceInfoSeting.temperatureDifferenceValue  + " ℃" : "未设置"}}</span>
                    </yd-cell-item> -->
                    <!-- <yd-cell-item arrow type="a" @click.native="openPages('RelationDevice',{})">
                        <span slot="left">测试设备绑定</span>
                        <span class="span_color" slot="right">未设置</span>
                    </yd-cell-item> -->
            </yd-cell-group>
 <!-- v-if="sex==0" -->
            <!--<yd-cell-group v-if="sex==0">
                <yd-cell-item>
                    <span slot="left" class="setting-name">女性生理期</span>
                    <span slot="right">
                        <yd-switch v-model="cycleFlag" @click.native="setCycleFlag"></yd-switch>
                    </span>
                </yd-cell-item>
                <yd-cell-item arrow type="a" @click.native="openPages('FemaleSet',{})">
                    <span slot="left">女性生理期设置</span>
                </yd-cell-item>
            </yd-cell-group>
            <yd-cell-group v-if="sex==1">
                <yd-cell-item arrow type="a" @click.native="openPages('Male',{})">
                    <span slot="left">重要日期提醒</span>
                </yd-cell-item>
            </yd-cell-group>-->

            <yd-cell-group>
                <yd-cell-item arrow type="a" @click.native="openPages('Clock',{})">
                    <span slot="left">闹钟提醒</span>
                </yd-cell-item>
                <yd-cell-item>
                    <span slot="left" class="setting-name">来电提醒</span>
                    <span slot="right">
                        <yd-switch v-model="setCall" @click.native="carriedSetCall"></yd-switch>
                    </span>
                </yd-cell-item>
                <yd-cell-item arrow type="a" @click.native="openPages('Sedentary',{})">
                    <span slot="left">久坐提醒</span>
                </yd-cell-item>
            </yd-cell-group>
        </div>
    </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import { deviceUnBind } from './../../sverse/api.js'
import { Toast, Loading, Confirm } from 'vue-ydui/dist/lib.rem/dialog';
import { success, toast } from './../../utils/toast.js'
import { getStorage } from './../../utils/device/DataHandler.js'
    export default {
        data () {
            return {
                userId: 0,
                sex: 0,
                deviceSetInfo: {},
                cycleFlag: false,
                setCall: false,
                pageType: 1,
            }
        },
        mounted () {

            this.userId = window.localStorage.userId;
            this.sex = Number(window.localStorage.sex);
            this.deviceSetInfo = {...this.deviceSetInfo, ...this.deviceGetInfo};
            this.pageType = window.localStorage.pageType;
            this.setCall = this.callStatus;

            console.error(this.pageType)

            if(this.remindonstate == 1){
                this.cycleFlag = true;
            }else{
                this.cycleFlag = false;
            }

        },
        methods:{
            ...mapActions([
                'changeHolidayReminder',
                'setAddCall',
                'taskQueueExec',
                'changeGetHolidayReminder'
            ]),
            ...mapMutations([
                'deviceInfoSet',
                'saveFlagObj'
            ]),
            openPages (name,param) {
                if(!name) return
                param = (JSON.stringify(param) == "{}" ? {} : param);
                if(this.deviceConnectState){
                    this.$router.push({name: name, params: param});
                }else{
                    toast({msg: '手环已断开连接，请稍后再试！'})
                }
            },
            relieveDevice (){
                var t_data = this;
                this.$dialog.confirm({
                    // title: '',
                    mes: '您确定解除绑定吗？',
                    opts: [
                        {
                            txt: '取消',
                            color: false,
                            callback: () => {
                            }
                        },
                        {
                            txt: '确定',
                            color: true,
                            callback: () => {
                                
                                // if(this.deviceConnectState){
                                    deviceUnBind(t_data.deviceGetInfo.deviceId).then((res) => {
                                        success({msg: '解绑成功！'})
                                        t_data.$router.replace({name: "RelationDevice",params:{}})
                                    })
                                // }else{
                                //     toast({msg: '手环已断开连接，请稍后再试！'})
                                // }

                            }
                        }
                    ]
                });
            },
            setCycleFlag(){
                setTimeout(()=>{
                    // 设置女性生理周期
                    this.changeHolidayReminder()
                    // 读取女性生理周期
                    this.changeGetHolidayReminder()
                    // 立即执行任务
                    this.taskQueueExec({})
                },500)
            },
            carriedSetCall(){

                if(this.deviceConnectState){
                    
                    setTimeout(()=>{
                        this.setAddCall({status: this.setCall});
                        this.taskQueueExec({})
                    }, 500)

                }else{
                    toast({msg: '手环已断开连接，请稍后再试！'})
                }
                
            },
        },
        computed:{
            ...mapState({
                deviceGetInfo: state => {
                    return state.main.deviceInfo
                },
                remindonstate: state => {
                    return state.main.deviceInfo.remindonstate;
                },
                deviceInfoSeting: state => {
                    return state.main.deviceInfoSeting
                },
                userGetInfo: state => {
                    return state.main.userInfo
                },
                deviceConnectState: state =>{
                    return state.main.deviceInfo.connectState
                },
                callStatus: state =>{
                    return state.main.flagObj.callStatus
                },
            })
        },
        watch:{
            remindonstate(val, vals){
                console.error(`女性生理周期开关【${val}】`)
                if(val == 1){
                    this.cycleFlag = true;
                }else{
                    this.cycleFlag = false;
                }
            },
            callStatus(val, vals){
                console.error(`来电提醒开关值改变【${val}】`)
                this.setCall = val;
            },
            deviceInfoSeting(val, vals){
                console.error('设备信息')
                console.error(val)
            },
            cycleFlag(val, vals){
                console.log(val)
                // cycle 【行经周期】
                // nextremind 【行经天数】
                
                if(this.deviceConnectState){

                    if(val==true){
                        // 打开
                        this.deviceInfoSet({remindonstate: 1, cycle: this.userGetInfo.menstruationCycle, nextremind: this.userGetInfo.menstruationDays})
                    }else{
                        // 关闭
                        this.deviceInfoSet({remindonstate: 2, cycle: this.userGetInfo.menstruationCycle, nextremind: this.userGetInfo.menstruationDays})
                    }

                }else{
                    toast({msg: '手环已断开连接，请稍后再试！'})
                }

            },
        }
    }
</script>
<style lang="less" scoped>
    #device_set {

        .yd-cell-box {
            margin-top: .35rem;
        }

        .title {
            width: 80%;
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            span:nth-child(2){
                font-size: .28rem;
                margin-top: .05rem;
                color: #888;
            }
        }

        button {
            width: 2rem;
            height: .5rem;
            margin-top: 0;
            font-size: .3rem;
            border-radius: .5rem;
            background: #c0da30;
        }

        .code {
            width: .45rem;
            height: .45rem;

            img {
                width: 100%;
                height: 100%;
            }
        }

        .span_color {
            color: #999;
        }
    }
</style>