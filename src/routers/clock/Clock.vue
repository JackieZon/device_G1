<template>
    <div id="clock">
        <div class="clockList" v-if="listStatus">
            <RightStroke :stylesx="{height: '1.45rem'}" v-for="(item, index) in clockList" v-if="typeof(item.status)=='boolean'" v-on:increment="delClock(item)" :key="`${index}s`">
                <div class="recordList">
                    <div class="clockContent" @click="openPages('AddClock',{itemIndex: index})">
                        <div class="time">{{ countTime(item.time) }}</div>
                        <div class="text">{{ countDay(item.repeatByte)?countDay(item.repeatByte):'只响一次' }}</div>
                    </div>
                    <div class="right">
                        <yd-switch v-model="item.status" @click="closeClock(item)"></yd-switch>
                    </div>
                </div>
            </RightStroke>
        </div>
        
        <div class="isOk" v-if="clockStatus">
            <div class="btn" @click="openClockPage">添加</div>
        </div>
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
                day: [' ','周六','周五','周四','周三','周二','周一','周日',],
                chooseDay: '',
                cycleFlag: true,
                listStatus: true,
            }
        },
        created(){
        },
        mounted () {

            let now = new Date();
            let nowtimebytes = [now.getFullYear(), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
            let month = Number(now.getMonth());

            // this.list[0].date = `${now.getFullYear()}-${ (month + 1)<10? '0'+(month + 1):(month + 1) }`
            // this.list[1].date = `${now.getFullYear()}-${(month==0?12:month)<10? '0'+month:(month==0?12:month)}`
            
            // this.getRateList(this.list[0].date);
        },
        computed:{
            ...mapState({
                clockList: state => {
                    console.log(state.main.clockList)
                    return state.main.clockList
                },
                clockStatus: state => {
                    let arr = state.main.clockList;
                    let statusArr=[];
                    arr.map((i)=>{
                        if(i.status==true){
                            statusArr.push(i.index)
                        }
                    })
                    console.error(statusArr.length)
                    return (statusArr.length<10?true:false);
                }
            })
        },
        watch:{
            clockList(val, vals){
                console.log(val)
            }
        },
        methods: {
             ...mapActions([
                "userInfoSet",
                'changePersonalInfo',
                'addClock'
            ]),
            countFlag(status){
            },
            delClock(item){
                let { index, status, repeatByte, time } = item

                confirm({title:' ', msg: '删除后，该记录将无法恢复，确定删除吗？'}).then((res)=>{
                    if(res){
                        this.listStatus = false
                        this.addClock({index: index, status: null, repeatByte: [0,0,0,0,0,0,0,0], time: [0,0,0]})
                        toast({msg: '删除成功！'})
                        this.listStatus = true
                    }else{
                        console.log('取消！')
                    }
                })

            },
            closeClock(item){
                let { index, status, repeatByte, time } = item;
                this.addClock({index: index, status: false, repeatByte: repeatByte, time: time})
            },
            countTime(arr){
                let arrs = arr.map((i)=>{
                    return (i<10?`0${i}`:i)
                })
                return arrs.join(':')
            },
            countDay(arr){
                console.log(this.clockList)
                let counts = [];
                arr.map((item, index)=>{
                    if(item==1){
                        counts.push(this.day[index])
                    }
                })
                return (arr[0]==1?'每天':counts.join(','))
            },
            openPages (name,param) {
                param = (JSON.stringify(param) == "{}" ? {} : param);
                this.$router.push({name: name, params: param});
            },
            open(name) {

            },
            openClockPage(){
                this.openPages('AddClock',{itemIndex:-1})
            }
        }
    }
</script>
<style lang="less" scoped>
    #clock{
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