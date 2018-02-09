<template>
  <div id="heartRate">
    <div class="head-notice">
      心率：正常情况下，心率一般不会超过100次/分钟，当心率超过一定数值时，手环屏幕会闪烁提醒，超过心率数值可选择设置。
    </div>
    <div class="setting-steps">
      <div class="heart-rate">
        <yd-cell-item>
          <span slot="left" class="setting-name">心率提醒</span>
          <span slot="right">
            <yd-switch v-model="heartRateRemind" @click.native="toastShow()"></yd-switch>
          </span>
        </yd-cell-item>
      </div>
      <div class="heart-rate">
        <yd-cell-item arrow>
          <span slot="left" class="setting-name">心率提醒设置</span>
          <span slot="right" @click="heartRateMax.visible=true">{{postData.heartRateCountRemind}}次/分钟</span>
        </yd-cell-item>
      </div>
      <!-- <div class="heart-rate">
        <yd-cell-item arrow>
          <span slot="left" class="setting-name">低心率提醒</span>
          <span slot="right" @click="heartRateMin.visible=true">{{postData.lowHeartRateValue}}次/分钟</span>
        </yd-cell-item>
      </div> -->
      <!-- <div class="heart-rate">
        <div class="divs"></div>
        <yd-cell-item>
          <span slot="left" class="setting-name">心率设置</span>
          <yd-spinner slot="right" min="80" max="150" unit="5" v-model="postData.heartRateCountRemind"></yd-spinner>
          <span style="margin-left: .2rem;" slot="right"></span>
        </yd-cell-item>
      </div> -->
      <div class="heart-rate" style="margin-top: 15px;">
        <yd-cell-item>
          <span slot="left" class="setting-name">整点心率</span>
          <span slot="right">
            <yd-switch v-model="heartRateGaugeData.status" @click.native="openSetFrequencyData"></yd-switch>
          </span>
        </yd-cell-item>
      </div>
      <div class="heart-rate" v-if="hiedDiv">
        <yd-cell-item arrow>
          <span slot="left" class="setting-name">测量频率</span>
          <span slot="right" @click="heartRateGauge.visible=true">{{(heartRateGaugeData.value==null||heartRateGaugeData.value=='null')?0:heartRateGaugeData.value}}分钟</span>
        </yd-cell-item>
      </div>
      <p class="body-notice">测量频率变小会影响手环续航时间变短</p>
    </div>

    <picker class="picker" v-model="heartRateMax.visible" :data-items="heartRateMax.items" @change="heartRateMaxChange">
        <TitleCom slot="top-content" title="心率提醒" v-on:cancel="heartRateMax.visible=false" v-on:confirm="heartRateMaxConfirm"></TitleCom>
    </picker>
    <picker class="picker" v-model="heartRateMin.visible" :data-items="heartRateMin.items" @change="heartRateMinChange">
        <TitleCom slot="top-content" title="心率提醒" v-on:cancel="heartRateMin.visible=false" v-on:confirm="heartRateMinConfirm"></TitleCom>
    </picker>
    <picker class="picker" v-model="heartRateGauge.visible" :data-items="heartRateGauge.items" @change="heartRateGaugeChange">
        <TitleCom slot="top-content" title="测量频率" v-on:cancel="heartRateGauge.visible=false" v-on:confirm="heartRateGaugeConfirm"></TitleCom>
    </picker>

  </div>
</template>
<script>
import TitleCom from './../../common/TitleCom.vue'
import picker from 'vue-3d-picker'
import { mapActions, mapState, mapMutations } from 'vuex'
import { setDeciceSetInfo } from "./../../sverse/api.js"
import { toast } from '../../utils/toast'
export default {
  data(){
    return {
      heartRateMax:{
        chooseVal: 100,
        visible: false,
        items: [
            {
                values: ['80', '85', '90', '95', '100', '105', '110', '115', '120', '125', '130', '135', '140', '145', '150'],
            }
        ]
      },
      heartRateMin:{
        chooseVal: 100,
        visible: false,
        items: [
            {
                values: ['30', '35', '40', '45', '50', '55', '60'],
            }
        ]
      },
      heartRateGauge:{
        chooseVal: 100,
        visible: false,
        items: [
            {
                values: ['5', '10', '15', '20', '30', '60'],
            }
        ]
      },
      a:1,
      hiedDiv: false,
      heartRateRemind: false,
      heartRateGaugeData: {
        status: false,
        value: 60,
      },
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
  components:{
      [picker.name]: picker,
      TitleCom,
  },
  mounted () {

    this.heartRateRemind = (this.deviceInfoSeting.heartRateRemind==1?true:false)
    this.postData = {...this.postData, ...this.deviceInfoSeting}

    if(localStorage.getItem('heartRateGaugeStatus')=='null'||localStorage.getItem('heartRateGaugeStatus')==null){
      this.heartRateGaugeData.status = false
      this.hiedDiv = false
    }else{
      if(localStorage.getItem('heartRateGaugeStatus')=='true'){
        this.heartRateGaugeData.status = true;
        this.hiedDiv = true;
      }else{
        this.heartRateGaugeData.status = false;
        this.hiedDiv = false;
      }
    }

    this.heartRateGaugeData.value = localStorage.getItem('heartRateGaugeValue')
  },
  // destroyed () {
  //   l.w('HeartRate.destroyed')
  //   this.changeDeviceInfo()
  // },
  computed:{
    ...mapState({
      deviceGetInfo: state => {
        return state.main.deviceInfo
      },
      deviceConnectState: state =>{
        return state.main.deviceInfo.connectState
      },
      deviceInfoSeting: state => {
        return state.main.deviceInfoSeting
      }
    })
  },
  methods: {
    ...mapActions([
      'changeDeviceInfo',
      'taskQueueExec',
      'addSetFrequencyData'
    ]),
    ...mapMutations([
      'deviceInfoSetingSet',
      'deviceInfoSet'
    ]),
    setDeciceSetInfo () {

      console.error('提交前的数据')
      console.error(this.postData)

      setDeciceSetInfo(this.postData).then((res)=>{
        this.deviceInfoSetingSet(this.postData)
        this.deviceInfoSet(this.postData)
        l.w('HeartRate.destroyed')
        this.changeDeviceInfo()
        this.taskQueueExec({})
      })

    },
    openSetFrequencyData(){

      if(this.deviceConnectState){

        localStorage.setItem('heartRateGaugeToast',1)
        setTimeout(()=>{
          if(this.heartRateGaugeData.status){
            localStorage.setItem('heartRateGaugeValue',this.heartRateGaugeData.value)
            this.addSetFrequencyData()
          }else{
            localStorage.setItem('heartRateGaugeValue',0)
            this.addSetFrequencyData()
          }
          this.taskQueueExec({})
        },100)

      }else{
        toast({msg: '手环已断开连接，请稍后再试！'})
      }

    },
    toastShow(){
      toast({msg: '设置成功!'})
    },

    heartRateMaxChange(val){
      this.heartRateMax.chooseVal = val;
    },
    heartRateMaxConfirm(){
      this.postData.heartRateCountRemind = this.heartRateMax.chooseVal;
      this.heartRateMax.visible = false;
    },

    heartRateMinChange(val){
      this.heartRateMin.chooseVal = val;
    },
    heartRateMinConfirm(){
      this.postData.lowHeartRateValue = this.heartRateMin.chooseVal;
      this.heartRateMin.visible = false;
    },

    heartRateGaugeChange(val){
      this.heartRateGauge.chooseVal = val;
    },
    heartRateGaugeConfirm(){
      this.heartRateGaugeData.value = this.heartRateGauge.chooseVal;
      this.heartRateGauge.visible = false;
    }
    
  },
  watch: {
    'heartRateRemind':{
        handler:function (val,oldVal) {
          this.postData.heartRateRemind = (val?1:0)
          if(this.deviceConnectState){
            this.setDeciceSetInfo();
          }else{
            toast({msg: '手环已断开连接，请稍后再试！'})
          }
        },
        deep:true
    },
    'postData.heartRateCountRemind':{
      handler:function (val,oldVal) {
        if(this.deviceConnectState){
          this.setDeciceSetInfo();
        }else{
          toast({msg: '手环已断开连接，请稍后再试！'})
        }
      },
      deep:true
    },
    'postData.lowHeartRateValue':{
      handler:function (val,oldVal) {
        if(this.deviceConnectState){
          this.setDeciceSetInfo();
        }else{
          toast({msg: '手环已断开连接，请稍后再试！'})
        }
      },
      deep:true
    },
    'heartRateGaugeData.status'(val, vals){
      localStorage.setItem('heartRateGaugeStatus', val)
      this.hiedDiv = val
    },
    'heartRateGaugeData.value'(val, vals){
      localStorage.setItem('heartRateGaugeValue', val)
      localStorage.setItem('heartRateGaugeToast',0)
      if(this.deviceConnectState){
        this.addSetFrequencyData()
        this.taskQueueExec({})
      }else{
        toast({msg: '手环已断开连接，请稍后再试！'})
      }

    },
    
  }
}
</script>
<style lang="less" scoped>
    #heartRate {
      .picker{
          overflow: hidden;
      }
      height: 100%;
      background-color: rgb(235, 235, 235);
      .head-notice{
        font-size: .32rem;
        color: #333;
        text-indent:2em;
        padding: .3rem .4rem;
      }
      .body-notice{
        font-size: .14rem*2;
        color: #333;
        padding: .2rem .2rem;
      }
      .heart-rate{
        background-color: #fff;
        position: relative;
        .divs{
            position: absolute;
            right: .38rem*2;
            top: 0;
            width: .49rem*2;
            height: .30rem*2;
            background: rgba(255, 255, 255, 0.1);
            top: 50%;
            margin-top: -(.15rem*2);
            z-index: 999;
        }
      }
      .setting-name {
        font-size: .3rem;
        color: #2a2a2a;
        
      }
      .setting-left {
        font-size: .3rem;
        color: #2a2a2a;
      }

      .setting-right {
        font-size: .34rem;
        color: #929292;
      }
  }
    
  </style>


