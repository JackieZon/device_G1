<template>
    <div id="feMale">
        <div class="main-head">
            <div class="date-back">
                <img src="./../../../assets/icon/dateLeft.png"  @click="increaseDecrease(-1)"/>
            </div>
            <div>
                <yd-datetime class="historyData" type="date" v-model="postData.lastMenstruationDate"></yd-datetime>
            </div>
            <div class="date-forward">
                <img src="./../../../assets/icon/dateRight.png" @click="increaseDecrease(1)"/>
            </div>
        </div>
        <input style="display: none" id="nowElement" type="hidden"/>
        <div class="wrapper">
            <div class="main">
                <div class="mod_2b">
                    <div class="health clearfix">
                        <div class="mod_1b mod_safe">
                            <div class="time_lag clearfix" style="display: none;">
                                <span>平常两次月经大概相隔：</span>
                                <a class="minus" onclick='female.fallOff();'></a>
                                <input type="text" id='minMensesPriod' readonly value="28" />
                                <input type='hidden' id="minMensesing" class="circleCss" value="5"/>
                                <a onclick='female.increase();' class="plus"></a>
                                <a onclick='female.creset();' id='acrest' class="again" style="display:none">重新测试</a>
                            </div>
                            <div class="safe_detail" id='womensafeDateCon'>
                                <div class="safe_calendar" id='chosecal'>
                                    <ul class="date_detail" id='leftTable'>
                                        <li class="week">日</li>
                                        <li class="week">一</li>
                                        <li class="week">二</li>
                                        <li class="week">三</li>
                                        <li class="week">四</li>
                                        <li class="week">五</li>
                                        <li class="week">六</li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <li></li>
                                        <div class="clear"></div>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="items">
            
            <yd-cell-group>
                <yd-cell-item arrow  @click.native="openPages('FemaleDetile',{})">
                    <span slot="left">
                        <div class="item">
                            <div class="typeColor color1"></div>
                            <div class="text">月经期</div>
                        </div>
                    </span>
                    <span slot="left">
                        <div class="item">
                            <div class="typeColor color2"></div>
                            <div class="text">预测经期</div>
                        </div>
                    </span>
                    <span slot="left">
                        <div class="item">
                            <div class="typeColor color3"></div>
                            <div class="text">安全期</div>
                        </div>
                    </span>
                    <span slot="left">
                        <div class="item">
                            <div class="typeColor color4"></div>
                            <div class="text">排卵期</div>
                        </div>
                    </span>
                </yd-cell-item>
                <yd-cell-item>
                    <span slot="left">
                        您目前处于
                    </span>
                    <span slot="right">
                        {{femaleVal}}
                    </span>
                </yd-cell-item>
                <yd-cell-item @click.native="openPages('FemaleSet',{})">
                    <span slot="left">
                        离下次月经还有
                    </span>
                    <span slot="right">
                        {{countDay}}天
                    </span>
                </yd-cell-item>
            </yd-cell-group>
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
import { controlData } from './../../../utils/newfemale'
    export default {
        data () {
            return {
                femaleType:['月经期', '安全期', '排卵期'],
                femaleCalss: ['aYellow', 'aGreen', 'aRed'],
                femaleVal:'',
                newDate: 1,
                femaleDay: 1,
                selectDate: 0,
                postData:{
                    lastMenstruationDate: '',
                    menstruationDays: 5,
                    menstruationCycle: 28
                }
            }
        },
        watch:{
            'postData.lastMenstruationDate'(val, vals){
                console.log(val)
                let date = new Date(val)
                let year = Number(date.getFullYear())
                let month = Number(date.getMonth())
                let day = Number(date.getDate())
                this.femaleDay = day
                console.log(year, month, day)
                controlData(year, month, day, this.postData.menstruationCycle, (res)=>{
                    this.selectDate = res
                })
            }
        },
        mounted () {
            this.defaultTime()
        },
        methods:{
            openPages (name,param) {
                if(!name) return
                param = (JSON.stringify(param) == "{}" ? {} : param);
                this.$router.push({name: name, params: param});
            },
            defaultTime(){
                var date = new Date();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                month = month < 10 ? ('0' + month) : month;
                day = day < 10 ? ('0' + day) : day;
                this.newDate = Number(day)
                this.postData.lastMenstruationDate = [date.getFullYear(), month, day].join('-');
            },
                        /*
            * 加减日期
            * day加减的天数，为负数，后退一天；为正数，前进一天
            * */
            increaseDecrease: function (day) {
                var date = new Date(this.postData.lastMenstruationDate);
                date.setDate(date.getDate() + day);
                var month = date.getMonth() + 1;
                var day = date.getDate();
                month = month < 10 ? ('0' + month) : month;
                day = day < 10 ? ('0' + day) : day;
                this.postData.lastMenstruationDate = [date.getFullYear(), month, day].join('-');
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
            countDay(){
                console.error(this.postData.menstruationCycle-this.femaleDay)
                
                try{
                    let classText = $(`li .${this.newDate}`).attr('class')
                    console.log(`今天的class${classText}`)
                    let type = classText.split(' ')[0]
                    this.femaleCalss.indexOf(type)
                    console.log(this.femaleType[this.femaleCalss.indexOf(type)])
                    this.femaleVal = this.femaleType[this.femaleCalss.indexOf(type)]
                }catch(e){}

                return this.postData.menstruationCycle-(this.femaleDay-this.selectDate)
            }
        }

    }
</script>
<style lang="less">
    #feMale{
        .items{
            .item{
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: .14*2rem;
                margin-right: .1*2rem;
                .text{
                    line-height: 100%;
                }
                .typeColor{
                    width: .18*2rem;
                    height: .18*2rem;
                    margin-right: .02*2rem;
                }
                .color1{
                    background: #ff99cc;
                }
                .color2{
                    background: #ffd2e9;
                }
                .color3{
                    background: #86ff86;
                }
                .color4{
                    background: #ffcc99;
                }
            }
        }
        .main-head {
            background-color: #fff;
            padding: .2rem 0;
            text-align: center;
            display: -webkit-flex;
            display: inline-flex;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            z-index: 1000;
            border-bottom: 1px solid #ebebeb;
            &>div{
                flex: 1;
            }
            img {
                height: .4rem;
            }
            .date-back {
                height: .4rem;
                text-align: right;
            }
            .date-forward {
                height: .4rem;
                text-align: left;
                img.btnDisabled {
                    display: none;
                }
            }
            .historyData {
                width: 3rem;
                color: #666;
                font-size: .36rem;
                padding: .15rem 0;
                margin: 0 .2rem;
                border: 1px solid #ccc;
                border-radius: .2rem;
            }
        }

        body{ background:#eee;}
        .main{ background:#fff;}
        /* menu_xy */
        a{color:#333;}
        a:hover{text-decoration:none;}

        .time_lag{height:27/100*2rem;padding: 23/100*2rem 32/100*2rem;border-bottom:1/100*2rem dashed #a2cdea;}
        .time_lag span, .time_lag input, .time_lag a{float:left;margin-top:4/100*2rem;}
        .time_lag a.minus, .time_lag a.plus{width:25/100*2rem;height:22/100*2rem; cursor:pointer}
        .time_lag a.again{float:left;width:85/100*2rem;height:27/100*2rem;line-height:27/100*2rem;margin:0 0 0 25/100*2rem;font-size:12/100*2rem;color:#fff;font-weight:100;text-align:center; cursor:pointer;}
        .time_lag input{width:44/100*2rem;height:20/100*2rem;border-width:1/100*2rem 0;border-style:solid;border-color:#8ec4e8;color:#348bcf;font:bold 14/100*2rem/20/100*2rem Arial;text-align:center;background:#fff;}
        .safe_calendar{width: 100%;}
        .date_detail li{float:left; width:53.4/100*2rem;height:45/100*2rem;line-height:45/100*2rem;text-align:center;border-bottom: 1/100*2rem solid #eee;border-right: 1/100*2rem solid #eee;}
        .date_detail{display: flex;flex-wrap: wrap;justify-content: center;}
        .date_detail li:nth-child(1){border-left: 1/100*2rem solid #eee;}
        .date_detail li:nth-child(8){border-left: 1/100*2rem solid #eee;}
        .date_detail li:nth-child(15){border-left: 1/100*2rem solid #eee;}
        .date_detail li:nth-child(22){border-left: 1/100*2rem solid #eee;}
        .date_detail li:nth-child(29){border-left: 1/100*2rem solid #eee;}
        .date_detail li:nth-child(36){border-left: 1/100*2rem solid #eee;}
        .date_detail li:nth-child(43){border-left: 1/100*2rem solid #eee;}
        .date_detail li .clear{ clear: both;}
        .date_detail li.week{height:29/100*2rem;line-height:29/100*2rem;font-size:12/100*2rem;border-top: 1/100*2rem solid #eee;}
        .date_detail li a{display:block;height:45/100*2rem;font-size:16/100*2rem;font-family:Arial; box-sizing: border-box;}
        
        .date_detail li a.aRed, .date_detail li a:hover.aRed{ border-bottom: 3/100*2rem solid #ffcc99; }
        .date_detail li a.aGreen, .date_detail li a:hover.aGreen{ border-bottom: 3/100*2rem solid #86ff86;}
        .date_detail li a.aBlue, .date_detail li a:hover.aBlue{ border-bottom: 3/100*2rem solid #3FA4FE;}
        .date_detail li a.aYellow, .date_detail li a:hover.aYellow{ border-bottom: 3/100*2rem solid #ff99cc;}
        .date_detail li a em{display:none;}
        
    }
</style>