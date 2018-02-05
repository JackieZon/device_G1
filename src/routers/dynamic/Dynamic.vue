<template>
    <div id="Dynamic">
        <div class="upper">
            <div class="startBtn">
                <div class="item">
                    <div class="btn" @click="openDynamicHeartRate">
                        {{dynamicHeartRateStatus==3?'开始':'结束'}}
                    </div>
                </div>
            </div>
            <div class="dynamicVal">
                <div class="val" ref="dynamicVal">{{heartRateList.length?heartRateList[heartRateList.length-1].hrCount:'--'}}</div>
                <div class="label">次/分钟</div>
            </div>
        </div>
        <div class="lower" v-if="veLineStatus">
            <ve-line :data="chartData" :settings="chartSettings" :extend="extend" :height="'6rem'"></ve-line>
        </div>
        <div class="record" @click="openRecord">
            <img src="./../../assets/images/record.png" alt="" srcset="">
        </div>
    </div>
</template>
<script>
import VeLine from 'v-charts/lib/line'
import { apiUrl } from "./../../utils/subei_config.js"
import { Toast, Loading, Confirm } from 'vue-ydui/dist/lib.rem/dialog';
import { mapState, mapActions, mapMutations } from 'vuex'
import { getMemberInfo,simulationLogin,userInfoEdit, postSaveHeartRate } from "./../../sverse/api.js"
import { success, toast } from './../../utils/toast.js'
    export default {
        components:{
            [VeLine.name]: VeLine
        },
        data () {
            return {
                setintervalNum: 0,
                veLineStatus: true,
                chartData: {
                    columns: ['testTime', 'hrCount'],
                    rows: [
                        {
                            testTime: '2018-01-01 00:00:00',
                            hrCount: 90
                        }
                    ]
                },
                chartSettings: {
                    labelMap: {
                        hrCount: '心率'
                    }
                },
                extend: {
                    legend:{
                        data:['']
                    },
                    yAxis:{
                        min: 50
                    },
                    xAxis:{
                        show: false
                    }
                }
            }
        },
        created(){
            console.log('组件初始化完成！')
            this.clearHeartRateList();
            // 关闭任务列表执行状态
            this.changeRunCommand({status: false})
            this.tooltipInfoSet('')
        },
        beforeDestroy(){
            this.setDynamicHeartRate({ status: 3 })
            this.closeDynamicHeartRate()
            // 清除循环闪动
            clearInterval(this.setintervalNum);
            // 打开任务列表执行状态
            this.changeRunCommand({status: true})
            this.taskQueueExec({})
        },
        mounted () {
        },
        watch:{
            heartRateList(val,vals){
                console.error(`观察心率列表数据的长度【${val.length}】`)
                if(val.length){
                    this.veLineStatus = false;
                    this.chartData.rows = val;
                    this.veLineStatus = true;
                }
            }
        },
        computed:{
            ...mapState({
                dynamicHeartRateStatus: state => {
                    return state.main.dynamicHeartRate.status
                },
                heartRateList: state => {
                    return state.main.dynamicHeartRate.heartRateList
                },
                deviceInfo: state => {
                    return state.main.deviceInfo
                },
            })
        },

        methods: {
            ...mapMutations([
                'setDynamicHeartRate',
                'clearHeartRateList',
                'changeRunCommand',
                'tooltipInfoSet',
            ]),
            ...mapActions([
                'userInfoSet',
                'changePersonalInfo',
                'getDynamicHeartRate',
                'closeDynamicHeartRate',
                'taskQueueExec'
            ]),
            setintervalCount(){
                if(this.setintervalNum==0){
                    this.setintervalNum = setInterval(()=>{

                        if(this.heartRateList.length!==0){
                            clearInterval(this.setintervalNum)
                            this.$refs.dynamicVal.style.color = '#333'
                            return
                        }

                        this.$refs.dynamicVal.style.color = '#fff'
                        setTimeout(()=>{
                            this.$refs.dynamicVal.style.color = '#333'
                        },750)
                    }, 1500)
                }
            },
            openRecord(){
                this.setDynamicHeartRate({ status: 3 })
                this.openPages('DynamicRecord',{})
            },
            openPages (name,param) {
                param = (JSON.stringify(param) == "{}" ? {} : param);
                this.$router.push({name: name, params: param});
            },
            openDynamicHeartRate(){
                // 执行闪动
                this.setintervalCount();
                if(this.dynamicHeartRateStatus==3){
                    this.getDynamicHeartRate()
                }else{
                    this.postData();
                    this.closeDynamicHeartRate()
                }
            },
            postData(){

                if(!this.heartRateList.length){
                    return;
                }

                // [
                //     {
                //     "hrCount": 95,       //心率值，如果是动态心率，则该值为动态心率最高值
                //     "deviceType": 0,   //设备类型 0:h1,1:G1,2:S3,3:S4
                //     "type": 0,           //所处状态：0 静止、1动态,默认0
                //     "measureType": 1,  //检测模式 1：手动 2：自动,3:未带手环,4：整点测量，5：动态心率
                //     "surfaceTem": 37.5,//体表温度：摄氏度
                //     "testTime": "2016-12-25 18:00:00", //测试时间：yyyy-MM-dd HH:mm:ss，如果为动态心率，则为开始时间
                //     "wecDeviceId": "gh_c70e01bb5e4c_162c4d198b356f86"      //微信设备id必填项
                //     "hrCountRecords": "[{\"testTime\": \"2016-12-2518: 00: 00\", \"hrCount": 60},{ \"testTime\": \"2016-12-2518: 00: 01\",  \"hrCount\": 60 }]",//每次动态心率详细数据
                //     "minHeartRate": 60,//如果是动态心率，则为该动态心率的最小值
                //     "avgHeartRate": 90//如果是动态心率，则为该动态心率的平均值
                //     }
                // ]

                let allHrCount = []; //所有心率值
                this.heartRateList.map((item, index)=>{
                    allHrCount.push(item.hrCount)
                })
                allHrCount.sort();
                let allHrCountLen = allHrCount.length;

                let allHrCountPlus = allHrCount.reduce((x, y)=>{
                    return x + y;
                })
                let avgHeartRate = (allHrCountPlus/allHrCountLen);

                let param = [
                    {
                        hrCount: Number(allHrCount[allHrCountLen-1]),
                        deviceType: 3,
                        measureType: 5,
                        surfaceTem: 28,
                        testTime: this.heartRateList[0].testTime,
                        wecDeviceId: this.deviceInfo.wecDeviceId,
                        hrCountRecords: JSON.stringify(this.heartRateList),
                        minHeartRate: Number(allHrCount[0]),
                        avgHeartRate: Math.floor(avgHeartRate)
                    }
                ]

                console.error('****动态心率提交数据↓***')
                console.error(param)

                postSaveHeartRate(param).then((res) => {
                    console.error(res)

                    if (res.data.status) {
                        toast({msg: '动态心率提交成功'})
                    }
                    
                    setTimeout(()=>{
                        this.$router.push({name: 'DynamicInfo', params: {id: res.data.info.heartRateId}});
                    }, 2000)

                    console.error('执行清空心率数据')
                    this.setDynamicHeartRate({ status: 3 })
                })
            }
        }
    }
</script>
<style lang="less" scoped>
    @font-face {
        font-family: Dorsa; 
        src: url('./../../assets/ttf/Dorsa-Regular.ttf'); 
    }
    #Dynamic{
        position: relative;
        background: #ffffff;
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        .record{
            position: absolute;
            top: .15rem*2;
            right: .15rem*2;
            width: .35rem*2;
            height: .35rem*2;
            img{
                width: 100%;
            }
        }
        .upper{
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            .startBtn{
                flex: 1;
                box-sizing: border-box;
                display: flex;
                justify-content: center;
                align-items: center;
                .item{
                    width: 3rem;
                    height: 3rem;
                    border: 1px solid #e5e5e5;
                    border-radius: 50%;
                    overflow: hidden;
                    box-sizing: border-box;
                    padding: .08rem*2;
                    .btn{
                        border-radius: 50%;
                        height: 100%;
                        width: 100%;
                        background: #ff6969;
                        font-size: .18rem*2;
                        color: #fff;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        box-shadow: 0px 0px .1rem*2 #999;
                    }
                }
            }
            .dynamicVal{
                .val{
                    text-align: center;
                    visibility: visible;
                    font-family: "Dorsa";
                    font-size: 60px;
                    font-style: normal;
                    font-weight: 800;
                    letter-spacing: .03rem*2;
                }
                .label{
                    font-size: .16rem*2;
                    color: #666;
                    text-align: center;
                }
            }
        }
        .lower{
            background: #fff;
        }
    }
</style>