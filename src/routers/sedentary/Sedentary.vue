<template>
    <div id="addClock">

        <yd-cell-group>
            <yd-cell-item>
                <span slot="left" class="setting-name">久坐提醒</span>
                <span slot="right">
                    <yd-switch v-model="postData.status" @click.native="changeSedentary"></yd-switch>
                </span>
            </yd-cell-item>
            <yd-cell-item arrow @click.native="timePeriod.visible=true">
                <span slot="left">提醒周期</span>
                <span slot="right">{{timePeriodShow}}</span>
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
                <TitleCom slot="top-content" title="提醒次数" v-on:cancel="chooseDay=false" v-on:confirm="chooseDay=false"></TitleCom>
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

        <picker class="picker" v-model="timePeriod.visible" :data-items="timePeriod.items" @change="timePeriodChange">
            <TitleCom slot="top-content" title="提醒次数" v-on:cancel="timePeriod.visible=false" v-on:confirm="timePeriodConfirm"></TitleCom>
        </picker>

    </div>
</template>
<script>

    // sedentaryData:{
    //     status: false,
    //     repeatByte: [0,0,0,0,0,0,0,0],
    //     startTime: [],
    //     endTime: [],
    // }
import picker from 'vue-3d-picker'
import TitleCom from './../../common/TitleCom.vue'
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
            [picker.name]: picker,
            TitleCom
        },
        data () {
            return {
                timePeriodShow: '每天',
                timePeriodType: [
                    {
                        text: '每天',
                        code: '11111111'
                    },
                    {
                        text: '周一到周五',
                        code: '00111110'
                    },
                    {
                        text: '自定义',
                        code: '2'
                    },
                ],
                timePeriod:{
                    chooseVal: 100,
                    visible: false,
                    items: [
                        {
                            values: ['每天', '周一到周五', '自定义'],
                        }
                    ]
                },
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
            if(this.postData.startTime[0]==0&&this.postData.endTime[0]==0){
                this.saveSedentary({ startTime: [9, 0], endTime: [17,0], repeatByte: this.postData.repeatByte, status: this.postData.status })
            }else{
                this.saveSedentary(this.postData)
            }
            this.addSetSedentary()
        },
        mounted () {
            
            // let now = new Date();
            // let nowtimebytes = [now.getFullYear(), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
            // let month = Number(now.getMonth());

            // this.startTime = `${9}:${0}`
            // this.endTime = `${17}:${0}`

            this.countSedentaryData()
            this.postData.repeatByte = this.sedentaryData.repeatByte

            console.error(`久坐数据`)
            console.error(this.sedentaryData)
            if(this.sedentaryData.startTime[0]==0&&this.sedentaryData.endTime[0]==0){
                this.startTime = `${9}:${0}`
                this.endTime = `${17}:${0}`
                this.postData.startTime = [9,0]
                this.postData.endTime = [17,0]
            }else{
                this.startTime = this.sedentaryData.startTime.join(':')
                this.endTime = this.sedentaryData.endTime.join(':')
                this.postData = {...this.postData, ...this.sedentaryData } 
            }

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
                this.postData.status = val;
            },
            days(val,vals){
                let typeArrs = val.map((item, index)=>{
                    return Number(item)
                })
                typeArrs[0] = 0
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
            // 'sedentaryData.startTime'(val, vals){

            //     let repeatByte = this.sedentaryData.repeatByte;

            //     let repeatByteStr = repeatByte.join('');
            //     if(repeatByteStr=='11111111'){
            //         this.timePeriodShow = '每天'
            //     }else if(repeatByteStr=='00111110'){
            //         this.timePeriodShow = '周一到周五'
            //     }else{
            //         this.timePeriodShow = '自定义'
            //     }
            //     this.days = this.countDays(repeatByte)

            // },
            // 'sedentaryData.repeatByte'(val, vals){

            //     let repeatByte = val;

            //     let repeatByteStr = repeatByte.join('');
            //     if(repeatByteStr=='11111111'){
            //         this.timePeriodShow = '每天'
            //     }else if(repeatByteStr=='00111110'){
            //         this.timePeriodShow = '周一到周五'
            //     }else{
            //         this.timePeriodShow = '自定义'
            //     }
            //     this.days = this.countDays(repeatByte)

            // },
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
            timePeriodChange(val){
                this.timePeriod.chooseVal = val;
            },
            timePeriodConfirm(){
                this.timePeriodShow = this.timePeriod.chooseVal;
                let chosoeType = this.timePeriodType.filter((item)=>{
                    return item.text == this.timePeriod.chooseVal;
                })
                if(chosoeType[0].code=='2'&&chosoeType.length){
                    this.chooseDay = true
                }else{
                    
                    let typeArr = chosoeType[0].code.split('')
                    let typeArrs = typeArr.map((item, index)=>{
                        return Number(item)
                    })
                    this.postData.repeatByte = typeArrs;
                    console.log(typeArrs)

                }
                // this.postData.heartRateCountRemind = this.timePeriod.chooseVal;
                this.timePeriod.visible = false;
            },
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
                if(repeatByteStr=='11111111'){
                    this.timePeriodShow = '每天'
                }else if(repeatByteStr=='00111110'){
                    this.timePeriodShow = '周一到周五'
                }else{
                    this.timePeriodShow = '自定义'
                }
                this.days = this.countDays(repeatByte)

            },
            countDays(val){
                let typeArrs = val.map((item, index)=>{
                    return Boolean(item)
                })
                return typeArrs;
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

        }
    }
</script>
<style lang="less" scoped>
    #addClock{
        .box{
            .yd-cell-box{
                margin: 0!important;
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
        .btn{
            display: flex;
            justify-content: space-between;
            button{
                width: 48%;
                margin: 0!important;
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