<template>
    <div id="addClock">

        <yd-cell-group>
            <yd-cell-item arrow>
                <span slot="left">时间</span>
                <span slot="right">
                    <yd-datetime type="time" v-model="chooseTime"></yd-datetime>
                </span>
            </yd-cell-item>
            <!-- <yd-cell-item>
                <span slot="left">经期结束</span>
                <span slot="right">
                    <yd-switch v-model="female.maleEnd"></yd-switch>
                </span>
            </yd-cell-item> -->
            <yd-cell-item arrow>
                <span slot="left">周期</span>

                <span slot="right">
                    <select v-model="chooseType" dir="rtl">
                        <option value="00000000">只响一次</option>
                        <option value="00111110">周一到周五</option>
                        <option value="11111111">每天</option>
                        <option value="2">{{ (chooseType=='2'?countDay(postData.repeatByte):'自定义')  }}</option>
                    </select>
                </span>

            </yd-cell-item>
        </yd-cell-group>

        <div class="isOk">
            <div class="btn" @click="saveClock">保存</div>
        </div>

        <yd-popup id="selectDay" v-model="chooseDay" position="bottom" height="70%">

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
            <div class="btn">
                <yd-button size="large" type="hollow" @click.native="chooseDay=false">取消</yd-button>
                <yd-button size="large" type="hollow" @click.native="chooseDay=false">确定</yd-button>
            </div>
        </yd-popup>

    </div>
</template>
<script>
import RightStroke from './../../common/RightStroke'
import { CellSwipe } from 'mint-ui'
import { apiUrl } from "./../../utils/subei_config.js"
import { Toast, Loading, Confirm } from 'vue-ydui/dist/lib.rem/dialog'
import {Accordion, AccordionItem} from 'vue-ydui/dist/lib.rem/accordion'
import { mapState, mapActions } from 'vuex'
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
                dayType: [' ','周六','周五','周四','周三','周二','周一','周日',],
                chooseDayType: '',
                chooseDay: false,
                chooseType: '00000000',
                chooseTime: '',
                postData: {
                    time: [0,0,0],
                    repeatByte: [0,0,0,0,0,0,0,0],
                    status: true,
                    index: 0
                },
                days: [false,false,false,false,false,false,false,false],
                daysText: []
            }
        },
        created(){
        },
        mounted () {
            
            let now = new Date();
            let nowtimebytes = [now.getFullYear(), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
            let month = Number(now.getMonth());
            this.chooseTime = `${now.getHours()}:${now.getMinutes()}`
            console.log(this.$route.params.itemIndex)
            let itemIndex = this.$route.params.itemIndex

            if(itemIndex!==-1){
                console.log(this.clockList[itemIndex])
                let obj = this.clockList[itemIndex];
                this.chooseTime = `${obj.time[0]}:${obj.time[1]}`
                this.postData.index = obj.index
                let repeatStr = obj.repeatByte.join('')
                if(repeatStr=='00000000'){
                    this.chooseType = '00000000'
                }else if(repeatStr=='00111110'){
                    this.chooseType = '00111110'
                }else if(repeatStr=='11111111'){
                    this.chooseType = '11111111'
                }else{
                    this.chooseType = '2'
                    this.postData.repeatByte = obj.repeatByte

                    let typeArrs = obj.repeatByte.map((item, index)=>{
                        return Boolean(item)
                    })
                    this.days = typeArrs;
                    setTimeout(()=>{
                        this.chooseDay = false;
                    }, 20)
                }
            }else{
                this.postData.index = 0;
            }

        },
        computed:{
            ...mapState({
                clockList: state => {
                    return state.main.clockList
                }
            })
        },
        watch:{
            chooseType(val, vals){
                if(val=='2'){
                    this.chooseDay = true;

                    let typeArrs = this.days.map((item, index)=>{
                        return Number(item)
                    })
                    this.postData.repeatByte = typeArrs;

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
            chooseTime(val,vals){
                let time = val.split(':');
                this.postData.time[0] = Number(time[0]);
                this.postData.time[1] = Number(time[1]);
                console.log(this.postData.time)
            },
        },
        methods: {
            ...mapActions([
                "userInfoSet",
                'changePersonalInfo',
                'addClock',
            ]),
            countFlag(status){
            },
            saveClock(){
                if(!this.chooseTime){
                    toast({msg: '请选择时间！'})
                    return
                }

                if(!this.chooseType){
                    toast({msg: '请选择重复次数！'})
                    return
                }
                this.addClock(this.postData)
                
                setTimeout(()=>{
                    this.$router.back();
                },1000)
            },
            countDay(arr){

                let counts = [];
                arr.map((item, index)=>{
                    if(item==1){
                        counts.push(this.dayType[index])
                    }
                })
                return (counts.length==0?'自定义':counts.reverse().join(','))

            },
        }
    }
</script>
<style lang="less" scoped>

    .yd-popup-content > div{
        height: 100%;
    }
    .btn{
        box-sizing: border-box;
        padding: 0 15px;
        button{
            margin-top: .2rem;
        }
    }
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
        .yd-popup-content>div{
            height: 100%;
        }
        .btn{
            display: flex;
            justify-content: space-between;
            button{
                width: 48%;
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