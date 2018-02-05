<template>
    <div id="male">
        <div class="enter" v-if="showPage">
            <yd-cell-group>
                <yd-cell-item arrow>
                    <span slot="left">时间</span>
                    <yd-datetime type="date" v-model="postData.remindDate" slot="right"></yd-datetime>
                </yd-cell-item>
                <yd-cell-item arrow>
                    <span slot="left">循环</span>
                    <select slot="right" v-model="postData.cycleType">
                        <option value="0">仅一次</option>
                        <option value="1">每周</option>
                        <option value="2">每月</option>
                    </select>
                </yd-cell-item>
                <yd-cell-item arrow>
                    <span slot="left">内容</span>
                    <span class="span_color" slot="right"></span>
                    <yd-input slot="right" id="inputText" v-model="postData.content" required style="text-align: right;" :max="10" :show-success-icon="false" :show-clear-icon="false" :show-required-icon="false" :show-error-icon="false" placeholder="1-10字符"></yd-input>
                    <!-- <input slot="right" type="text" placeholder="1-10字符"> -->
                </yd-cell-item>
            </yd-cell-group>
            <div class="isOk">
                <div class="btn" @click="saveOrUpdateImportantDateRemind">完成</div>
            </div>
        </div>
        <div class="contentx" v-if="!showPage">
            <div class="list" @click="showPage=true">
                <div class="item">
                    <div class="type">
                        <div class="name">{{postData.content}}</div>
                        <div class="name">{{cycleType[postData.cycleType] || '暂无'}}</div>
                    </div>
                    <div class="time">
                        <div class="days">{{ countTime }}</div>
                        <div class="day">{{ postData.remindDate }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import { deviceUnBind, getImportantDateRemind, saveOrUpdateImportantDateRemind } from './../../../sverse/api.js'
import { DateTime } from 'vue-ydui/dist/lib.rem/datetime'
import { success } from './../../../utils/toast.js'
import { getStorage } from './../../../utils/device/DataHandler.js'
import { alert, toast } from './../../../utils/toast'
    export default {
        data () {
            return {
                showPage: true,
                cycleType: ['仅此一次','每周','每月'],
                postData:{
                    remindDate: '',
                    cycleType: 0,
                    content: ''
                }
            }
        },
        watch:{
            'postData.remindDate'(val, vals){
                console.log(val)
            }
        },
        mounted () {

            this.getImportantDateRemind()

        },
        methods:{
            defaultTime(){
                var date = new Date();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                month = month < 10 ? ('0' + month) : month;
                day = day < 10 ? ('0' + day) : day;
                this.postData.remindDate = [date.getFullYear(), month, day].join('-');
            },
            returnThisTime(){
                let date = new Date();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                month = month < 10 ? ('0' + month) : month;
                day = day < 10 ? ('0' + day) : day;
                return [date.getFullYear(), month, day].join('-');
            },
            getImportantDateRemind(){
                getImportantDateRemind().then((res)=>{
                    if(res.data.status){
                        if(res.data.info.content){
                            this.showPage = false
                        }
                        if(!res.data.info.remindDate){
                            this.defaultTime()
                        }
                        console.error(this.countTime)
                        this.postData = { ...this.postData, ...res.data.info }
                    }
                })
            },
            saveOrUpdateImportantDateRemind(){
                const { remindDate, cycleType, content } = this.postData
                if(content==''){
                    alert({msg: '请填写提醒内容'})
                    return
                }
                let param = {
                    remindDate,
                    cycleType,
                    content
                }
                saveOrUpdateImportantDateRemind(param).then((res)=>{
                    if(res.data.status){
                        toast({msg: '提交成功！'})
                        this.showPage = false
                    }
                })
            }
        },
        computed:{
            ...mapState({
                deviceGetInfo: state => {
                    return state.main.deviceInfo
                },
                deviceInfoSeting: state => {
                    return state.main.deviceInfoSeting
                }
            }),
            countTime(){
                function formatDuring(mss) {
                    var days = mss / (1000 * 60 * 60 * 24);
                    var hours = (mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
                    var minutes = (mss % (1000 * 60 * 60)) / (1000 * 60);
                    var seconds = (mss % (1000 * 60)) / 1000;
                    return `${(days<0?days*-1:days)}天${(days<0?'前':'后')}`  + "";
                }
                if(this.postData.remindDate){

                    let getTime = this.postData.remindDate
                    let nowTime = this.returnThisTime()
                    
                    let countTime = (new Date(getTime) - new Date(nowTime))
                    return formatDuring(countTime)
                }
            },
        }

    }
</script>
<style lang="less" scoped>
    #male {
        input{
            text-align: right!important;
            color: #666;
        }
        select{
            direction: rtl;
            color: #666;
        }
        .yd-datetime-input{
            color: #666;
        }
        .enter{
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
        .contentx{
            .list{
                box-sizing: border-box;
                padding-top: .1rem*2;
                .item{
                    box-sizing: border-box;
                    padding: .25rem*2 .2rem*2;
                    background: #fff;
                    font-size: .16rem*2;
                    color: #333;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #dbdbdb;
                    border-bottom: 1px solid #dbdbdb;
                    .type{
                        line-height: .32rem*2;
                    }
                    .time{
                        line-height: .32rem*2;
                        text-align: right;
                        .day{
                            font-size: .14rem*2;
                            color: #666;
                        }
                    }
                }
            }
        }
        .yd-datetime-input{
            justify-content: flex-end;
        }
    }
</style>