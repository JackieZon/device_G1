<template>
    <div id="DynamicInfo">
        <div class="upper">
            <div v-if="comStatus">
                <ve-line :data="chartData" :settings="chartSettings" :extend="extend" :height="'6rem'"></ve-line>
            </div>
        </div>
        <div class="lower">
            <div class="list">
                <div class="item">
                    <div class="time">时间</div>
                    <div class="val">心率(次/分)</div>
                </div>
                <div class="item" v-for="(item, index) in chartData.rows" :key="index">
                    <div class="time">{{item.testTime.split(' ')[1]}}</div>
                    <div class="val">{{item.hrCount}}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import VeLine from 'v-charts/lib/line'
import { apiUrl } from "./../../utils/subei_config.js"
import { Toast, Loading, Confirm } from 'vue-ydui/dist/lib.rem/dialog';
import { mapState, mapActions } from 'vuex'
import { getMemberInfo,simulationLogin,userInfoEdit, getDynamicHeartRateDetail } from "./../../sverse/api.js"
import { success } from './../../utils/toast.js'
    export default {
        components:{
            [VeLine.name]: VeLine
        },
        data () {
            return {
                comStatus: true,
                chartData: {
                    columns: ['testTime', 'hrCount'],
                    rows: [
                        { 'testTime': "2016-12-25 18:00:00", 'hrCount': 75 }
                    ]
                },
                chartSettings: {
                    labelMap: {
                        hrCount: '心率'
                    },
                    yAxisName: ['次/分钟']
                },
                extend: {
                    legend:{
                        data:['']
                    },
                    yAxis:{
                        min: 40
                    },
                    xAxis:{
                        show: false
                    }
                }
            }
        },
        created(){
            console.log('组件初始化完成！')
        },
        mounted () {
            console.log(this.$route.params.id)
            let id = this.$route.params.id;
            this.getData(id)
        },
        computed:{
            ...mapState({})
        },

        methods: {
             ...mapActions([
                "userInfoSet",
                'changePersonalInfo'
            ]),
            openPages (name,param) {
                param = (JSON.stringify(param) == "{}" ? {} : param);
                this.$router.push({name: name, params: param});
            },
            getData(id){
                getDynamicHeartRateDetail({id: id}).then((res)=>{
                    this.comStatus = false;
                    this.chartData.rows = JSON.parse(res.data.info.hrCountRecords).reverse();
                    setTimeout(()=>{
                        this.comStatus = true;
                    }, 50)
                })
            }
        }
    }
</script>
<style lang="less" scoped>
    #DynamicInfo{
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
            background: #eee;
            flex: 1;
            .list{
                width: 100%;
                .item:nth-child(1) .time{
                    background: #dcf4da;
                }
                .item:nth-child(1) .val{
                    background: #dcf4da;
                }
                .item{
                    font-size: .16rem*2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    line-height: .45rem*2;
                    border-bottom: 1px solid #e5e5e5;
                    .time{
                        width: 25%;
                        background: #fff;
                        text-align: center;
                        border-right: 1px solid #e5e5e5;
                    }
                    .val{
                        flex: 1;
                        text-align: center;
                        background: #fff;
                    }
                }
            }
        }
    }
</style>