<template>
    <div id="home">
        <div class="information">
            <div class="head">
                <div class="portrait" @click="openPages('My',{})">
                    <img v-if="userGetInfo.imagePathUrl" :src="userGetInfo.imagePathUrl" alt="">
                    <img v-else src="./../../assets/images/head.jpg" alt="">
                </div>
                <div class="user_info">
                    <div class="user_name" @click="openPages('My',{})">
                        <p>{{userGetInfo.nickName || '暂无'}}</p>
                        <!-- <span>修改资料</span> -->
                        <!-- <div @click="openPrompt()" class="prompt_icon">？</div> -->
                    </div>
                    <div class="user_device">
                        <div class="device_status">
                            <p>{{ deviceInfo.deviceName || '暂无'}}</p> <span :style="{color: (deviceInfo.connectState?'#50c647':'red')}">({{deviceInfo.connectState?'已连接':'未连接'}})</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="device_info" @click="openDeviceSet">
                <div class="set"><img src="./../../assets/images/set.png" alt="" srcset=""><div class="span">提醒设置</div></div>
            </div>
        </div>
        <div class="health">
            <yd-cell-item arrow @click.native="openPages('HealthHistory',{})">
                <span slot="left">健康历史</span>
            </yd-cell-item>
            <!-- <yd-cell-item arrow @click.native="openPages('Dynamic',{})">
                <span slot="left">动态心率</span>
            </yd-cell-item> -->
        </div>

        <!-- <div class="healthItem">
            <div class="item">健康历史</div>
            <div class="item">动态心率</div>
        </div> -->

        <div class="device_options">
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_02.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.sportstep}}</span>步</p>
                    <p>步数</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_03.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{deviceInfo.km}}</span>千米</p>
                    <p>里程</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_04.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.calorie}}</span>大卡</p>
                    <p>卡里路</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_05.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.sleephour}}</span>小时</p>
                    <p>睡眠</p>
                </div>
            </div>
        </div>

        <div class="device_options">
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_06.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{((Number(LCDDisplayData.heartrate)<30||Number(LCDDisplayData.heartrate)>200)?'F':Number(LCDDisplayData.heartrate))}}</span>次/分钟</p>
                    <p>心率</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_07.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{((Number(LCDDisplayData.bodysurfacetemp)<30||Number(LCDDisplayData.bodysurfacetemp)>200)?'F':Number(LCDDisplayData.bodysurfacetemp))}}</span>℃</p>
                    <p>手表皮温度</p>
                </div>
            </div>
        </div>

        <!-- <div class="device_options">
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_08.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.humidity}}</span>%</p>
                    <p>腕部湿度</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_09.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.temperature}}</span>℃</p>
                    <p>腕部温度</p>
                </div>
            </div>
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_10.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{LCDDisplayData.pressure}}</span>mb</p>
                    <p>海拔</p>
                </div>
            </div> 
            <div class="option">
                <div class="option_img">
                    <img src="./../../assets/images/health_icon_11.png" alt="">
                </div>
                <div class="option_content">
                    <p><span>{{deviceInfo.nextremind}}</span>天</p>
                    <p>距离下次提醒天数</p>
                </div>
            </div>
        </div> -->
        <div v-if="prompt" class="prompt_content" @click.self="openPrompt()">
            <div class="content">
                <div class="title">操作说明</div>
                <div class="prompt">
                    <p>这里将显示本app的操作说明，这里暂时使用文字进行填充显示效果</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import battery1 from './../../assets/icon/battery1.svg'
    import battery2 from './../../assets/icon/battery2.svg'
    import battery3 from './../../assets/icon/battery3.svg'
    import battery4 from './../../assets/icon/battery4.svg'
    import battery5 from './../../assets/icon/battery5.svg'
    import { mapState } from 'vuex'
    import { simulationLogin,userInfoEdit } from "./../../sverse/api.js"
    import { l } from './../../utils/base.js'
    export default {
        data () {
            return {
                userInfo:{},
                prompt: false,//用于操作说明的开关
                battery: [battery1, battery2, battery3, battery4, battery5]
            }
        },
        mounted () {
            this.userInfo = {...this.userInfo,...this.userGetInfo}
        },

        computed: {
            ...mapState({
                LCDDisplayData: (state)=>{
                    return state.main.LCDDisplayData
                },
                deviceInfo: (state)=>{
                    return state.main.deviceInfo
                },
                userGetInfo: (state) => {
                    return state.main.userInfo
                },
                tooltipInfo: (state) => {
                    return state.main.tooltipInfo
                },
                braceletVal: (state) =>{
                    return state.main.deviceInfo.bracelet
                }
            })
        },
        watch:{
            // 'LCDDisplayData.heartrate'(val, vals){
            //     console.error(`心率值：${val}`)
            //     const valx = Number(val);
            //     if(valx < 30) return 'F';
            //     if(valx > 200) return 'F';
            //     return valx
            // },
            tooltipInfo(val, vals){
                // l.e('******我是观察属性(tooltipInfo)******')
                // l.e(val)
            }
        },
        methods:{
            openPages (name,param) {
                param = (JSON.stringify(param) == "{}" ? {} : param);
                this.$router.push({name: name, params: param});
            },
            openPrompt (){
                switch(this.prompt) {
                    case false:
                        this.prompt = true;
                        break;
                    case true:
                        this.prompt = false;
                        break;
                }
            },
            openDeviceSet(){
                window.localStorage.setItem('pageType',1);
                this.openPages('DeviceSet',{});
            }
        },
        // watch: {
        //     // selectedDate: function (newDate, oldDate) {
        //     //     //如果选择的日期等于当天日期，则禁用前进一天的按钮
        //     //     if (this.selectedDate == this.nowDate) {
        //     //         this.btnStatus = true;
        //     //     } else {
        //     //         this.btnStatus = false;
        //     //     }

        //     //     this.getHealthHistorData(this.deviceInfo.deviceId, newDate);
        //     // }
        // },
    }
</script>
<style lang="less" scoped>
    #home {
        padding-top: .15rem;//解决外边距溢出
        .information{

            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            background: white;
            padding: 0 .2rem;

            .head {
                flex: 1;
                display: flex;
                .portrait {
                    width: .95rem;
                    height: .95rem;
                    border-radius: 50%;
                    overflow: hidden;
                    img{
                        width: 100%;
                        height: 100%;
                    }
                }

                .user_info {
                    flex: 1;
                    padding: 0 .1rem 0 .3rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    .user_name {
                        font-size: .33rem;
                        display: flex;
                        align-items: center;
                        span { 
                            font-size: .25rem;
                            color: #1296db;
                            margin-left: .2rem;
                        }

                        .prompt_icon {
                            width:.35rem;
                            height:.35rem;
                            background: #0086ec;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: .28rem;
                            margin-left: .2rem;
                            text-align: center;
                            line-height: normal;
                        }
                    }

                    .user_device {
                        font-size: .32rem;
                        display: flex;
                        align-items: center;
                        img {
                            width: .4rem;
                            height: .4rem;
                            margin-right: .1rem;
                        }
                        .device_status{
                            font-size: 14px;
                            p{
                                color:#333;
                                display: inline-block;
                            }
                            span { color: red; }
                        }
                    }

                    .hisrory{
                        display: inline;
                        line-height: .28rem;
                        padding: .1rem .35rem;
                        border: 1px solid #0c9b8e;
                        border-radius: .28rem;
                        width: .9rem*2;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-top: .1rem;
                    }
                }
            }
            
            .device_info {
                height: 1.4rem;
                display: flex;
                align-items: center;
                justify-content: center;
                .set{
                    background: #50c647;
                    color: #fff;
                    height: .33rem*2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0 .2rem*2;
                    border-radius: .33rem*2;
                    img{
                        width: .18rem*2;
                        height: .18rem*2;
                        margin-right: .05rem*2;
                    }
                    .span{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        line-height: 100%;
                    }
                }
            }

            .history {
                width: 100%;
                padding-right: .2rem;
                button {
                    margin-top: .3rem;
                    height: .6rem;
                    font-size: .28rem;
                }
            }
        }
        .health{
            background: #fff;
            margin-bottom: .15rem;
            .yd-cell-item{
                height: .4rem*2;
            }
        }
        .healthItem{
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fff;
            border-top: 1px solid #ebebeb;
            border-bottom: 1px solid #ebebeb;
            line-height: .5rem*2;
            position: relative;
            margin-bottom: .15rem*2;
            &::before{
                position: absolute;
                display: inline-block;
                height: .5rem*2;
                width: 1px;
                left: 50%;
                content: ' ';
                background: #ebebeb;
            }
            .item{
                flex: 1;
                text-align: center;
                font-size: .14rem*2;
                color: #666;
            }
        }
        .device_options {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            margin-bottom: .15rem;

            .option {
                width: 100%;
                padding: .38rem 0 .38rem .2rem;
                border: 1px solid #ebebeb;
                background: white;
                display: flex;
                align-items: center;
                .option_img {
                    width: .66rem;
                    height: .66rem;
                    display: flex;
                    align-items: center;
                    img {
                        width: 100%;
                    }
                }
                .option_content {
                    box-sizing: border-box;
                    padding-left: .2rem;
                    height: .76rem;
                    p{
                        line-height: .4rem;
                        font-size: .28rem;
                    }

                    p:nth-child(1){
                        span {
                            font-size: .48rem;
                            color: #222;
                            font-weight: 600;
                        }
                    }

                    p:nth-child(2){
                        color: #929292;
                    }
                }
            }
        }

        .prompt_content {
            position: absolute;
            top: 0;
            display: flex;
            height: 100%;
            padding: 0 .8rem;
            align-items: center;
            z-index: 99;
            width: 100%;
            background: rgba(0,0,0,0.5);

            .content {
                width: 100%;
                border-radius: .2rem;
                background: white;
                text-align: center;
                padding: .4rem .3rem; 
                .title{
                    font-size: .35rem;
                }
                .prompt {
                    text-align: left;
                    margin-top: .3rem;
                    font-size: .28rem;
                    line-height: .5rem;
                }

            }

        }
        
    }
</style>