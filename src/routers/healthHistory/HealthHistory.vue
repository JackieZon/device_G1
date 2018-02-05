<template>
    <div id="history">
        <div class="main-head">
            <div class="date-back">
                <img src="../../assets/icon/dateLeft.png"  @click="increaseDecrease(-1)"/>
            </div>
            <div>
                <yd-datetime class="historyData" type="date" :end-date="nowDate" v-model="selectedDate"></yd-datetime>
            </div>
            <div class="date-forward">
                <img src="../../assets/icon/dateRight.png" @click="increaseDecrease(1)" :class="{ btnDisabled: btnStatus }"/>
            </div>
        </div>

        <div class="main_data">
            <div class="motion_data">
                <div class="head_name">
                    <div class="head_img">
                        <img src="./../../assets/images/health_icon_step@2x.png" alt="">
                    </div>
                    <span>运动数据</span>
                </div>

                <div class="head_data">
                    <div class="item">
                        <p>{{sportStepCount}}</p>
                        <p>运动步数</p>
                    </div>
                    <div class="item">
                        <p>{{sportMileage}}</p>
                        <p>里程</p>
                    </div>
                    <div class="item">
                        <p>{{sportCalorie}}</p>
                        <p>卡路里</p>
                    </div>
                </div>
            </div>
            <div class="motion_data">
                <div class="head_name">
                    <div class="head_img">
                        <img style="width: .55rem; height: .55rem;" src="./../../assets/images/health_icon_sleep@2x.png" alt="">
                    </div>
                    <span>睡眠质量</span>
                </div>

                <div class="head_data">
                    <div class="item">
                        <p>{{getSleepData(time1)}}</p>
                        <p>深睡</p>
                    </div>
                    <div class="item">
                        <p>{{getSleepData(time2)}}</p>
                        <p>浅睡</p>
                    </div>
                    <div class="item">
                        <p>{{getSleepData(time3)}}</p>
                        <p>清醒</p>
                    </div>
                </div>
            </div>

            <div class="motion_data">
                <div class="head_name">
                    <div class="head_img">
                        <img style="width: .55rem; height: .55rem;" src="./../../assets/images/health_icon_heart@2x.png" alt="">
                    </div>
                    <span>心率检测</span>
                </div>

                <div class="chart">
                    <div id="heartRate" style="width: 100%;height:4rem;"></div>
                </div>
            </div>

            <div class="motion_data">
                <div class="head_name">
                    <div class="head_img">
                        <img src="./../../assets/images/health_icon_temperature@2x.png" alt="">
                    </div>
                    <span>手表皮温度</span>
                </div>

                <div class="chart">
                    <div id="hand" style="width: 100%;height:4rem;"></div>
                </div>
            </div>

            <div class="motion_data">
                <div class="head_name">
                    <div class="head_img">
                        <img src="./../../assets/images/health_icon_sun@2x.png" alt="">
                    </div>
                    <span>腕部温湿度</span>
                </div>

                <div class="chart">
                    <div id="temperature" style="width: 100%;height:4rem;"></div>
                </div>
            </div>

            <div class="motion_data">
                <div class="head_name">
                    <div class="head_img">
                        <img src="./../../assets/images/health_icon_air@2x.png" alt="">
                    </div>
                    <span>气压</span>
                </div>

                <div class="chart">
                    <div id="altitude" style="width: 100%;height:4rem;"></div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    let echarts = require('echarts/lib/echarts')
    require('echarts/lib/chart/line')
    require('echarts/lib/component/tooltip')
    require('echarts/lib/component/title')
    import { getHistoryData } from "./../../sverse/api.js"
    import { mapState } from 'vuex'
    import { unique } from './../../utils/base'
    export default {
        data() {
            return {
                nowDate: '',                //当前日期
                selectedDate: '',           //选中的日期
                btnStatus: 'false',         //日期选择按钮状态
                sportCalorie: '',           //卡路里
                sportStepCount: '',         //步数
                sportMileage: '',           //里程
                time1: '',                  //深睡
                time2: '',                  //浅睡
                time3: '',                  //清醒
                dataHeartRate: [],          //心率数据
                dataHandSkinTemp: [],       //手表皮温度数据
                dataWristTemperature: [],   //腕部温度数据
                dataWristHumidity: [],      //腕部湿度数据
                dataPressure: [],           //气压数据
            }
        },

        mounted() {
            this.getNowDate();
        },
        computed: {
            ...mapState({
                deviceId(state){
                    return state.main.deviceInfo.deviceId
                }
            })
        },
        watch: {
            selectedDate: function(newDate, oldDate){
                //如果选择的日期等于当天日期，则禁用前进一天的按钮
                if (this.selectedDate == this.nowDate) {
                    this.btnStatus = true;
                } else {
                    this.btnStatus = false;
                }

                this.getHistoryData(newDate);
            }
        },

        methods: {
            //获取当前时间，拼接为符合ydui日期的格式
            getNowDate: function () {
                var t_data = this;

                if (t_data.selectedDate != '') {
                    t_data.getHistoryData(t_data.selectedDate);
                    return;
                }

                var date = new Date();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                month = month < 10 ? ('0' + month) : month;
                day = day < 10 ? ('0' + day) : day;
                t_data.selectedDate = t_data.nowDate = [date.getFullYear(), month, day].join('-');
            },
            getHistoryData (selectedDate) {
                var t_data = this;
                var anchor = [
                    { name: selectedDate + ' 00:00:00', value: [selectedDate + ' 00:00:00', 0] },
                    { name: selectedDate + ' 23:59:59', value: [selectedDate + ' 23:59:59', 0] }
                ]

                t_data.dataHeartRate = [];
                t_data.dataHandSkinTemp = [];
                t_data.dataWristTemperature = [];
                t_data.dataWristHumidity = [];
                t_data.dataPressure = [];

                var dataParam = {
                    selectedDate: selectedDate
                };
                getHistoryData(selectedDate).then((res) => {
                    console.error('getHistoryData方法：')
                    console.error(res)
                    if (!res.data.status) {
                        return;
                    }

                    var data = res.data.info;

                    t_data.time1 = data.sleepMap.deepSleep;
                    t_data.time2 = data.sleepMap.lightSleep;
                    t_data.time3 = data.sleepMap.sober;

                    t_data.sportCalorie = data.sportMap.caloric;
                    t_data.sportStepCount = (Number(data.sportMap.runNum) + Number(data.sportMap.walkNum));
                    t_data.sportMileage = data.sportMap.mileage;

                    // data['hrMap'] = {
                    //     "hrValueList": [75,106,70,70],
                    //     "surfaceTemList": [30.8,31.8,32.4,32.5],
                    //     "hrX": ["\"09:00\"","\"16:11\"", "\"17:00\"","\"18:00\""]
                    // }
                    
                    /**@augments 心率 */

                    if(typeof(data.hrMap)=='object'){

                        let hrX = data.hrMap.hrX.map((i)=>{
                            return JSON.parse(i)
                        })

                        hrX = unique(hrX)
                        data.hrMap.hrValueList = unique(data.hrMap.hrValueList)

                        hrX.map((item,index)=>{
                            t_data.dataHeartRate.push({name: item,value: [selectedDate+' '+item, data.hrMap.hrValueList[index]]});
                        })

                        // data.ListDeviceDataPulse.forEach(function(item,index){
                        //     var date = item.RecordTime.replace('T',' ');
                        //     var time = item.RecordTime.slice(11,16);

                        //     t_data.dataHeartRate.push({name: time,value: [selectedDate, item.Pulse]});
                        //     t_data.dataHandSkinTemp.push({name: time,value: [selectedDate, item.BodySurfaceTemp/10]});

                        // });

                    }
                    
                    if(typeof(data.stMap)=='object'){

                        let stX = data.stMap.stX.map((i)=>{
                            return JSON.parse(i)
                        })

                        stX = unique(stX)
                        data.stMap.surfaceTemList = unique(data.stMap.surfaceTemList)

                        stX.map((item,index)=>{
                            t_data.dataHandSkinTemp.push({name: item, value:[selectedDate+' '+item, data.stMap.surfaceTemList[index]]})
                        })

                    }

                    if(typeof(data.enviMap)=='object'){

                        let enviX = data.enviMap.enviX.map((i)=>{
                            return JSON.parse(i)
                        })

                        enviX = unique(enviX)
                        data.enviMap.temperatureList = unique(data.enviMap.temperatureList)
                        data.enviMap.humidityList = unique(data.enviMap.humidityList)
                        data.enviMap.pressList = unique(data.enviMap.pressList)

                        enviX.map((item,index)=>{

                            t_data.dataWristTemperature.push({name: item,value: [selectedDate+' '+item, data.enviMap.temperatureList[index]]});
                            t_data.dataWristHumidity.push({name: item,value: [selectedDate+' '+item, data.enviMap.humidityList[index]]});
                            t_data.dataPressure.push({name: item,value: [selectedDate+' '+item, data.enviMap.pressList[index]]});
                        })
                    }

                    // data.ListDeviceDataTempRHPress.forEach(function(item,index){
                    //     var date = item.RecordTime.replace('T',' ');
                    //     var time = item.RecordTime.slice(11,16);
                    //     t_data.dataWristTemperature.push({name: time,value: [date, item.Temp]});
                    //     t_data.dataWristHumidity.push({name: time,value: [date, item.RH]});
                    //     t_data.dataPressure.push({name: time,value: [date, item.Press]});
                    // })

                    t_data.chartHeartRate(anchor);
                    t_data.chartHandSkinTemp(anchor);
                    t_data.chartWristHumidity(anchor);
                    t_data.chartPressure(anchor);
                })
            },

            /*
            * 加减日期
            * day加减的天数，为负数，后退一天；为正数，前进一天
            * */
            increaseDecrease: function (day) {
                var t_data = this;
                var date = new Date(t_data.selectedDate);
                date.setDate(date.getDate() + day);
                var month = date.getMonth() + 1;
                var day = date.getDate();
                month = month < 10 ? ('0' + month) : month;
                day = day < 10 ? ('0' + day) : day;
                t_data.selectedDate = [date.getFullYear(), month, day].join('-');
            },

            //获取睡眠状态时间
            getSleepData: function (val) {
                // var t_data = this;
                // if (Date.parse(val) <= Date.parse("2001/1/1")) {
                //     return val = '--';
                // }
                // var date = val.slice(11, 16);
                return val;
            },

            //绘制心率图表
            chartHeartRate(anchor) {
                var t_data = this;
                t_data.chartSingleLine('heartRate', anchor, '次/分钟', [0, '100%'], '#ff1432', t_data.dataHeartRate, '心率', { min: 40 , max: 140, interval: 20 });
            },
            //绘制手表皮温度图表
            chartHandSkinTemp(anchor) {
                var t_data = this;
                t_data.chartSingleLine( 'hand', anchor, '℃', [0, '100%'], '#59c2ff', t_data.dataHandSkinTemp, '表皮温度', { min: 15 , max: 45, interval: 10 });

            },
            //绘制腕部温度湿度图表
            chartWristHumidity(anchor) {
                var t_data = this;
                var elID = 'temperature';
                var yAxisNameArr = ['℃','%'];
                var boundaryGapArr = [[0, '100%'],[0, '100%']];
                var seriesNameArr = ['温度','湿度'];
                var seriesColorArr = ['#ff1432','#59c2ff'];
                var seriesDataArr = [t_data.dataWristTemperature,t_data.dataWristHumidity];
                t_data.chartDoubleLine( elID, anchor, yAxisNameArr, boundaryGapArr, seriesNameArr, seriesColorArr, seriesDataArr, '温湿度', [{ min: 20 , max: 40, interval: 10 }, { min: 20, max: 100, interval: 20 }]);
            },
            //绘制气压图表
            chartPressure(anchor) {
                var t_data = this;
                t_data.chartSingleLine('altitude',anchor,'mb',[0, '100%'],'#006934',t_data.dataPressure, '气压', { min: 700 , max: 1200, interval: 100 });
            },

            /*
            * 绘图公共方法
            * */
            //绘制单线图表
            chartSingleLine(elID,anchorDateArr,yAxisName,boundaryGap,seriesColor,seriesData, typeName, yAxisVal) {
                //如果dom上已经存在画图实例，则只需要从DOM上获取实例方法，如果不存在画图实例，就初始化实例
                var myChart = echarts.getInstanceByDom(document.getElementById(elID)) || echarts.init(document.getElementById(elID));
                var anchor = anchorDateArr;

                var option = {
                grid: {
                    top: '16%',
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'time',
                    data: ['00:00', '06:00', '12:00', '18:00', '23:59'],
                    splitLine: {
                        show: false
                    },
                    nameTextStyle: {
                        color: '#777',
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#777'
                        }
                    }
                },
                yAxis: {
                    ...yAxisVal,
                    name: yAxisName,
                    type: 'value',
                    boundaryGap: boundaryGap,
                    splitLine: {
                        show: true
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#777'
                        }
                    }
                },
                visualMap: {
                    show: false,
                    dimension: 0,
                    pieces: [{
                        lte: 0,
                        color: seriesColor
                    },{
                        lte: 6,
                        color: seriesColor
                    }
                    ]
                },
                series: [{
                    name: typeName,
                    type: 'line',
                    // lineStyle: {
                    //     normal: {
                    //         color: seriesColor,
                    //     }
                    // },
                    showSymbol: true,
                    showAllSymbol: false,
                    hoverAnimation: false,
                    data: seriesData
                },
                {
                    name: typeName,
                    type: 'line',
                    showSymbol: true,
                    showAllSymbol: false,
                    data: anchor,
                    itemStyle: {normal: {opacity: 0}},
                    lineStyle: {normal: {opacity: 0}}
                }
                ],
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option);
            },

            //绘制双线图表
            chartDoubleLine(elID,anchorDateArr,yAxisNameArr,boundaryGapArr,seriesNameArr,seriesColorArr,seriesDataArr, typeName, yAxisVal){
                //如果dom上已经存在画图实例，则只需要从DOM上获取实例方法，如果不存在画图实例，就初始化实例
                var myChart =  echarts.getInstanceByDom(document.getElementById(elID)) || echarts.init(document.getElementById(elID));
                var anchor = anchorDateArr;

                var option = {
                    grid: {
                        top: '16%',
                    },
                    legend: {
                        data:seriesNameArr
                    },
                    tooltip: {
                        trigger: 'axis'
                    },
                    xAxis: {
                        type: 'time',
                        data: ['00:00', '06:00', '12:00', '18:00', '23:59'],
                        splitLine: {
                        show: false
                        },
                        nameTextStyle: {
                        color: '#777',
                        },
                        axisLine: {
                        lineStyle: {
                            color: '#777'
                        }
                        },
                    },
                    yAxis: [
                        {
                            ...yAxisVal[0],
                            name: yAxisNameArr[0],
                            type: 'value',
                            boundaryGap: boundaryGapArr[0],
                            splitLine: {
                                show: true
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#777'
                                }
                            }
                        },
                        {
                            ...yAxisVal[1],
                            name: yAxisNameArr[1],
                            type: 'value',
                            boundaryGap: boundaryGapArr[1],
                            splitLine: {
                                show: false
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#777'
                                }
                            }
                        }
                    ],
                    // visualMap: {
                    //     show: false,
                    //     dimension: 0,
                    //     pieces: [{
                    //         lte: 0,
                    //         color: 'green'
                    //     },{
                    //         lte: 24,
                    //         color: 'green'
                    //     }
                    //     ]
                    // },
                    series: [
                        {
                            name: seriesNameArr[0],
                            type: 'line',
                            // lineStyle: {
                            //     // normal: {
                            //     //     color: seriesColorArr[0],
                            //     // }
                            // },
                            showSymbol: true,
                            showAllSymbol: false,
                            hoverAnimation: false,
                            data: seriesDataArr[0]
                        },
                        {
                            name:seriesNameArr[1],
                            type:'line',
                            yAxisIndex:1,
                            showSymbol: true,
                            showAllSymbol: false,
                            hoverAnimation: false,
                            // lineStyle: {
                            //     // normal: {
                            //     //     color: seriesColorArr[1],
                            //     // }
                            // },
                            data: seriesDataArr[1]
                        },
                        {
                            name: typeName,
                            type: 'line',
                            showSymbol: true,
                            showAllSymbol: false,
                            data: anchor,
                            itemStyle: {normal: {opacity: 0}},
                            lineStyle: {normal: {opacity: 0}}
                        }
                    ]
                };
                // 使用刚指定的配置项和数据显示图表。
                myChart.setOption(option);
            }

        }
    }
</script>
<style lang="less" scoped>
    .defalutDiv{
        color: '#ff1432';
        color: '#59c2ff';
        color: '#ff1432';
        color: '#59c2ff';
        color: '#006934';
    }
    #history {
        .main-head {
            background-color: #fff;
            padding: .2rem 0;
            padding-top: .45rem;
            text-align: center;
            display: -webkit-flex;
            display: inline-flex;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            position: fixed;
            top: 0;
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

        .main_data {
            margin-top: 1.75rem;

            .motion_data {
                padding: .15rem;
                margin: .3rem 0;
                background: white;
                .head_name {
                    border-bottom: 1px solid #ebebeb;
                    display: flex;
                    align-items: center;
                    .head_img {
                        width: .9rem;
                        height: 1.02rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        img {
                            width: .6rem;
                            height: .6rem;
                        }
                    }
                    span {
                        font-size: .28rem;
                    }

                }

                .chart {
                    width: 100%;
                    height: 4rem;
                }

                .head_data {
                    display: -webkit-flex;
                    display: flex;
                    padding-top: .2rem;
                    .item {
                        flex-grow: 1;
                        text-align: center;
                        p {
                            line-height: .5rem;
                            font-size: .4rem;
                            color: #444;
                        }

                        p:nth-child(2) {
                            font-size: .28rem;
                            color: #929292;
                        }
                    }
                }
            }

        }

    }
</style>