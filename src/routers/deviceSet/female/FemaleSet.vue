<template>
    <div id="male">
        <div class="enter" v-if="showPage">
            <yd-cell-group>
                <yd-cell-item arrow>
                    <span slot="left">上次行经时间</span>
                    <yd-datetime type="date" :start-date="startDate" :end-date="endDate" v-model="postData.lastMenstruationDate" slot="right"></yd-datetime>
                </yd-cell-item>
                <!-- <yd-cell-item>
                    <span slot="left">经期结束</span>
                    <span slot="right">
                        <yd-switch v-model="female.maleEnd"></yd-switch>
                    </span>
                </yd-cell-item> -->
                <yd-cell-item arrow>
                    <span slot="left">行经周期</span>
                    <select slot="right" v-model="userInfos.menstruationCycle">
                        <option value="21">21天</option>
                        <option value="22">22天</option>
                        <option value="23">23天</option>
                        <option value="24">24天</option>
                        <option value="25">25天</option>
                        <option value="26">26天</option>
                        <option value="27">27天</option>
                        <option value="28">28天</option>
                        <option value="29">29天</option>
                        <option value="30">30天</option>
                    </select>
                </yd-cell-item>
            </yd-cell-group>
            <div class="isOk">
                <div class="btn" @click="userInfoEdit">确定</div>
            </div>
        </div>
    </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { deviceUnBind, getImportantDateRemind, saveOrUpdateImportantDateRemind, userInfoEdit } from './../../../sverse/api.js'
import { DateTime } from 'vue-ydui/dist/lib.rem/datetime'
import { success } from './../../../utils/toast.js'
import { getStorage } from './../../../utils/device/DataHandler.js'
import { alert, toast } from './../../../utils/toast'
    export default {
        data () {
            return {
                startDate: '',
                endDate: '',
                showPage: false,
                postData:{
                    lastMenstruationDate: '2018-01-01',
                    menstruationDays: 5,
                    menstruationCycle: 28,
                }
            }
        },
        watch:{
            'female.maleStart'(val, vals){
                console.log(val)
                console.log(this.female)
                this.femaleSet({maleStart: val})
            },
            'female.maleEnd'(val, vals){
                console.log(val)
                this.femaleSet({maleEnd: val})
            },
            'postData.lastMenstruationDate'(val, vals){
                console.log(val)

                let menstruationCycle = Number(this.userInfos.menstruationCycle) // 月经周期

                let nowDate = new Date() // 今天的日期
                let year = Number(nowDate.getFullYear());
                let month = Number(nowDate.getMonth()+1);
                let date = Number(nowDate.getDate());

                let selectYear = Number(val.slice(0,4)) // 选择的开始的月份
                let selectMonth = Number(val.slice(5,7)) // 选择的开始的月份
                let selectDay = Number(val.slice(8,10)) // 选择的开始的日期

                let countDate = ''

                if(selectMonth == (month) && year==selectYear){
                    countDate = menstruationCycle - (date-selectDay)
                }else{
                    let lastDate = new Date(selectYear,selectMonth,0)
                    let getDate = (lastDate.getDate()-selectDay);

                    let nextDate = menstruationCycle - (getDate+date);
                    countDate = (nextDate<0?(menstruationCycle+nextDate): nextDate)
                }

                console.log(`距离下一次天数【${countDate}】`)
                this.userInfoSet({menstruationDays: Number(countDate)})

                // let countMenstruation = (this.userInfos.menstruationCycle-selectDay)
                // this.userInfoSet({menstruationDays: Number(val)})

                this.userInfoSet({lastMenstruationDate: val})
            },
            // 'userInfos.menstruationDays'(val, vals){
            //     this.userInfoSet({menstruationDays: Number(val)})
            // },
            'userInfos.menstruationCycle'(val, vals){
                this.userInfoSet({menstruationCycle: Number(val)})
            },
        },
        created(){
        },
        mounted () {
            this.postData = {...this.postData,...this.userInfos}

            // 设置时间段
            let nowDates = new Date();
            let year = Number(nowDates.getFullYear());
            let month = Number(nowDates.getMonth()+1);
            let date = Number(nowDates.getDate());
            this.startDate = `${year-1}-01-01`;
            this.endDate = `${year}-${(month<10?'0'+month:month)}-${ (date<10?'0'+date:date)}`;
            this.showPage = true;
        },
        methods:{
            ...mapActions([
                'userInfoSet'
            ]),
            ...mapMutations([
                'femaleSet'
            ]),
            
            userInfoEdit (){
                userInfoEdit(this.userInfos).then((res) => {
                    success({msg: '提交成功！'})
                    this.$router.go(-1)
                    console.log(JSON.stringify(res))
                })
            },
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
                userInfos: state => {
                    return state.main.userInfo
                },
                female: state => {
                    return state.main.female
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
            text-align: right;
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