<template>
    <div id="addClock">

        <yd-cell-group>
            <!-- <yd-cell-item>
                <span slot="left">经期结束</span>
                <span slot="right">
                    <yd-switch v-model="female.maleEnd"></yd-switch>
                </span>
            </yd-cell-item> -->
            <yd-cell-item>
                <span slot="left" class="setting-name">久坐提醒</span>
                <span slot="right">
                    <yd-switch v-model="postData.status" @click.native="changeSedentary"></yd-switch>
                </span>
            </yd-cell-item>
            <yd-cell-item arrow>
                <span slot="left">提醒周期</span>

                <span slot="right">
                    <select v-model="chooseType" dir="rtl">
                        <option value="00000000">只响一次</option>
                        <option value="00111110">周一到周五</option>
                        <option value="2">自定义</option>
                    </select>
                </span>

            </yd-cell-item>
            <yd-cell-item arrow>
                <span slot="left">开始时间</span>
                <span slot="right">
                    <yd-datetime type="time" v-model="startTime"></yd-datetime>
                </span>
            </yd-cell-item>
            <yd-cell-item arrow>
                <span slot="left">结束时间</span>
                <span slot="right">
                    <yd-datetime type="time" v-model="endTime"></yd-datetime>
                </span>
            </yd-cell-item>
        </yd-cell-group>

        <yd-popup v-model="chooseDay" position="bottom" height="60%">

            <div class="box">
                <yd-cell-group>
                    <yd-cell-item>
                        <span slot="left" class="setting-name">周一</span>
                        <yd-checkbox slot="right" v-model="days[6]">&nbsp;</yd-checkbox>
                    </yd-cell-item>
                    <yd-cell-item>
                        <span slot="left" class="setting-name">周二</span>
                        <yd-checkbox slot="right" v-model="days[5]">&nbsp;</yd-checkbox>
                    </yd-cell-item>
                    <yd-cell-item>
                        <span slot="left" class="setting-name">周三</span>
                        <yd-checkbox slot="right" v-model="days[4]">&nbsp;</yd-checkbox>
                    </yd-cell-item>
                    <yd-cell-item>
                        <span slot="left" class="setting-name">周四</span>
                        <yd-checkbox slot="right" v-model="days[3]">&nbsp;</yd-checkbox>
                    </yd-cell-item>
                    <yd-cell-item>
                        <span slot="left" class="setting-name">周五</span>
                        <yd-checkbox slot="right" v-model="days[2]">&nbsp;</yd-checkbox>
                    </yd-cell-item>
                    <yd-cell-item>
                        <span slot="left" class="setting-name">周六</span>
                        <yd-checkbox slot="right" v-model="days[1]">&nbsp;</yd-checkbox>
                    </yd-cell-item>
                    <yd-cell-item>
                        <span slot="left" class="setting-name">周日</span>
                        <yd-checkbox slot="right" v-model="days[7]">&nbsp;</yd-checkbox>
                    </yd-cell-item>
                </yd-cell-group>
            </div>

        </yd-popup>

    </div>
</template>
<script>

    // sedentaryData:{
    //     status: false,
    //     repeatByte: [0,0,0,0,0,0,0,0],
    //     startTime: [],
    //     endTime: [],
    // }

import RightStroke from './../../common/RightStroke'
import { CellSwipe } from 'mint-ui'
import { apiUrl } from "./../../utils/subei_config.js"
import { Toast, Loading, Confirm } from 'vue-ydui/dist/lib.rem/dialog'
import {Accordion, AccordionItem} from 'vue-ydui/dist/lib.rem/accordion'
import { mapState, mapActions, mapMutations } from 'vuex'
import { getMemberInfo,simulationLogin,userInfoEdit, getHeartRateList, getHeartRateDelete } from "./../../sverse/api.js"
import { success, confirm, toast } from './../../utils/toast.js'
    export default {
        components:{
            [Accordion.name]: Accordion,
            [AccordionItem.name]: AccordionItem,
            [CellSwipe.name]: CellSwipe,
            RightStroke
        },
        data () {
            return {
                chooseDay: false,
                chooseType: '00000000',
                startTime: '',
                endTime: '',
                postData: {
                    startTime: [0,0],
                    endTime: [0,0],
                    repeatByte: [0,0,0,0,0,0,0,0],
                    status: false
                },
                days: [false,false,false,false,false,false,false,false]
            }
        },
        destroyed () {
            this.saveClock()
            this.addSetSedentary()
        },
        mounted () {
            
            let now = new Date();
            let nowtimebytes = [now.getFullYear(), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
            let month = Number(now.getMonth());

            this.startTime = `${9}:${0}`
            this.endTime = `${17}:${0}`

            this.countSedentaryData()
            this.postData = {...this.sedentaryData}
            this.postData.status = this.sedentaryStatus;

        },
        computed:{
            ...mapState({
                sedentaryData: state => {
                    return state.main.sedentaryData
                },
                sedentaryStatus: state =>{
                    return state.main.flagObj.sedentaryStatus
                },
            })
        },
        watch:{
            sedentaryStatus(val, vals){
                console.error(`开关值改变【${val}】`)
                this.postData.status = val;
            },
            chooseType(val, vals){
                if(val=='2'){
                    this.chooseDay = true;
                }else{
                    let typeArr = val.split('')
                    let typeArrs = typeArr.map((item, index)=>{
                        return Number(item)
                    })
                    this.postData.repeatByte = typeArrs;
                    console.log(typeArrs)
                }
            },
            days(val,vals){
                let typeArrs = val.map((item, index)=>{
                    return Number(item)
                })
                this.postData.repeatByte = typeArrs;
                console.log(typeArrs)
            },
            startTime(val,vals){
                let time = val.split(':');
                this.postData.startTime[0] = Number(time[0]);
                this.postData.startTime[1] = Number(time[1]);
                console.log(this.postData.startTime)
            },
            endTime(val,vals){
                let time = val.split(':');
                this.postData.endTime[0] = Number(time[0]);
                this.postData.endTime[1] = Number(time[1]);
                console.log(this.postData.endTime)
            },
            'postData.status'(val, vals){
                this.saveFlagObj({sedentaryStatus: val})
            },
            'sedentaryData.startTime'(val, vals){

                let repeatByte = this.sedentaryData.repeatByte;

                let repeatByteStr = repeatByte.join('');
                if(repeatByteStr=='00000000'){
                    this.chooseType = '00000000'
                }else if(repeatByteStr=='00111110'){
                    this.chooseType = '00111110'
                }else{
                    this.chooseType = '2'
                }
                this.days = this.countDays(repeatByte)
            }
        },
        methods: {
            ...mapActions([
                "userInfoSet",
                'changePersonalInfo',
                'addClock',
                'addSetSedentary',
                'addSetyShock',
                'taskQueueExec',
            ]),
            ...mapMutations([
                'saveSedentary',
                'saveFlagObj'
            ]),
            changeSedentary(){
                setTimeout(()=>{
                    // 保存久坐提醒数据
                    this.saveSedentary(this.postData)
                    // 设置久坐提醒开关
                    this.addSetyShock()
                    // 设置久坐时间数据
                    this.addSetSedentary()
                    // 立即执行任务
                    this.taskQueueExec({})
                }, 500)
            },
            countSedentaryData(){

                let repeatByte = this.sedentaryData.repeatByte;

                let repeatByteStr = repeatByte.join('');
                if(repeatByteStr=='00000000'){
                    this.chooseType = '00000000'
                }else if(repeatByteStr=='00111110'){
                    this.chooseType = '00111110'
                }else{
                    this.chooseType = '2'
                    setTimeout(()=>{
                        this.chooseDay = false
                    },100)
                }
                this.days = this.countDays(repeatByte)

            },
            countFlag(status){
            },
            countDays(val){
                let typeArrs = val.map((item, index)=>{
                    return Boolean(item)
                })
                return typeArrs;
                console.log(typeArrs)
            },
            countDay(arr){
                console.log(this.clockList)
                let counts = [];
                arr.map((item, index)=>{
                    if(item==1){
                        counts.push(this.day[index])
                    }
                })
                return counts.join(',')
            },
            saveClock(){

                this.saveSedentary(this.postData)

                // setTimeout(()=>{
                //     this.$router.back();
                // },1000)
            },

        }
    }
</script>
<style lang="less" scoped>
    #addClock{
        .box{
            .yd-cell-box{
                .yd-cell{
                    .yd-cell-item{
                        .yd-cell-right{
                            .yd-checkbox{
                                .yd-checkbox-text{
                                    display: none!important;
                                }
                            }
                        }
                    }
                }
            }
        }
        select{
            color: #333!important;
        }
        .yd-accordion {
            background: #ebebeb!important;
        }
        .recordList{
            height: 100%;
            display: flex;
            border-bottom: 1px solid #eee;
            justify-content: space-between;
            align-items: center;
            padding: 0 .3rem;
            .right{
                box-sizing: border-box;
            }
            .time{
                text-align: left;
                font-size: .22rem*2;
                color: #666;
            }
            .text{
                font-size: .16rem*2;
                color: #333;
            }
        }
        .isOk{
            box-sizing: border-box;
            padding: 0.2rem .3rem;
            .btn{
                background: #38f;
                color: #fff;
                line-height: .8rem;
                border-radius: .8rem;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: .28rem;
            }
        }
    }
</style>