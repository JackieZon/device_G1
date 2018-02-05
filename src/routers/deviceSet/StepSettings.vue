<template>
    <div id="step">
        <div class="head_prompt">
            <p>专家建议：</p>
            <p>保证每天运动10,000步，是积极健康的生活方式。</p>
        </div>
        <div class="setting-steps">
            
            <div class="heart-rate">
                <yd-cell-item>
                    <span slot="left" class="setting-name">步数提醒：</span>
                    <span slot="right">
                        <yd-switch v-model="sportTargetRemind" @click.native="toastShow()"></yd-switch>
                    </span>
                </yd-cell-item>
            </div>

            <div class="heart-rate">
                <div class="divs"></div>
                <yd-cell-item>
                    <span slot="left" class="setting-text">步数设置</span>
                    <yd-spinner slot="right" min="2000" max="20000" unit="1000" v-model="postData.sportTarget" :longpress="false" class="step-number"></yd-spinner>
                    <span slot="right">&nbsp;&nbsp;步</span>
                </yd-cell-item>
            </div>
            
        </div>
        <!-- 
        <div class="but">
            <yd-button size="large" type="primary">保存</yd-button>
        </div> -->
    </div>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { setDeciceSetInfo } from "./../../sverse/api.js"
import { toast } from './../../utils/toast'
export default {
    data () {
        return {
            sportTargetRemind: false,
            postData: {
                deviceType: 2,
                heartRateCountRemind: 0,
                heartRateRemind: 0,
                sportTarget: 0,
                sportTargetRemind: 1,
                temperatureDifferenceRemind: 0,
                temperatureDifferenceValue: 0,
                lowHeartRateValue: 0,
                basalMetabolism: 60
            }
        }
    },
    mounted () {
        this.sportTargetRemind = (this.deviceInfoSeting.sportTargetRemind==1?true:false)
        this.postData = {...this.postData, ...this.deviceInfoSeting}
        $('input').attr('readonly',true)
    },
    // destroyed () {
    //     l.w('StepSettings.destroyed')
    //     this.changeDeviceInfo()
    // },
    computed:{
        ...mapState({
            deviceGetInfo: state => {
                return state.main.deviceInfo
            },
            deviceInfoSeting: state => {
                return state.main.deviceInfoSeting
            },
            deviceConnectState: state =>{
                return state.main.deviceInfo.connectState
            },
        })
    },
    methods:{
        ...mapActions([
            'changeDeviceInfo',
            'taskQueueExec'
        ]),
        ...mapMutations([
            'deviceInfoSetingSet',
            'deviceInfoSet'
        ]),
        setDeciceSetInfo () {
            setDeciceSetInfo(this.postData).then((res) => {
                this.deviceInfoSetingSet(this.postData)
                this.deviceInfoSet(this.postData)
                l.w('HeartRate.destroyed')
                this.changeDeviceInfo()
                this.taskQueueExec({})
            })
        },
        toastShow(){
            toast({msg: '设置成功!'})
        }
    },
    watch:{
        sportTargetRemind (val,vals) {
            
            if(this.deviceConnectState){

                this.postData.sportTargetRemind = (val?1:0)
                this.setDeciceSetInfo()

            }else{
                toast({msg: '手环已断开连接，请稍后再试！'})
            }
        },
        'postData.sportTarget':{
            handler:function (val,oldVal) {
                
                if(this.deviceConnectState){

                    this.setDeciceSetInfo()

                }else{
                    toast({msg: '手环已断开连接，请稍后再试！'})
                }   
                
            },
            deep:true
        }
    }
}
</script>
<style scoped lang="less">
    
    #step {
        height: 100%;
        background-color: rgb(235, 235, 235);
        .head_prompt {
            padding: .3rem .4rem .3rem .3rem;
            background: #ebebeb;
            p:nth-child(2){
                text-indent: 2em;
            }
            p {
                font-size: .32rem;
                color: #333;
            }
        }
        .setting-steps {
            background-color: #fff;
            .step-number {
                width: 3rem !important;
                border: 0;
            }
            .setting-name{
                font-size: .3rem;
            }
            .heart-rate{
                position: relative;
                .divs{
                    position: absolute;
                    right: .69rem*2;
                    top: 0;
                    width: .75rem*2;
                    height: .30rem*2;
                    background: rgba(255, 255, 255, 0.1);
                    top: 50%;
                    margin-top: -(.15rem*2);
                    z-index: 999;
                }
            }
        }
        .setting-text {
            font-size: .3rem;
            color: #2a2a2a;
        }
        .but {
            padding: 0 .2rem;
            button {
                height: .8rem;
                border-radius: .5rem;
            }
        }
    }
</style>