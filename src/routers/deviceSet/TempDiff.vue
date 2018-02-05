<template>
  <div id="TempDiff">
    <div class="head-notice">
      正常情况下，手表皮温度与腕部温度相差不会超过4°，当手表皮温度与腕部温度相差一定数值时，手环屏幕会闪烁提醒，相差温度数值可选择设置。
    </div>
    <div class="setting-steps">
      <div class="heart-rate">
        <yd-cell-item>
          <span slot="left" class="setting-name">温差提醒</span>
          <span slot="right">
            <yd-switch v-model="temperatureDifferenceRemind" @click.native="toastShow()"></yd-switch>
          </span>
        </yd-cell-item>
      </div>
      <div class="heart-rate">
        <div class="divs"></div>
        <yd-cell-item>
          <span slot="left" class="setting-name">温差设置</span>
          <yd-spinner slot="right" min="4" max="6" unit="1" v-model="postData.temperatureDifferenceValue"></yd-spinner>
          <span slot="right">&nbsp;&nbsp;℃</span>
        </yd-cell-item>
      </div>
      <!-- <p class="body-notice">测量频率变小会影响手环续航时间变短</p>
      <div class="heart-rate">
        <yd-cell-item>
          <span slot="left" class="setting-name">检测频率</span>
          <yd-spinner slot="right" min="1" max="60" unit="1" v-model="tempDiffData.tempDiffDate"></yd-spinner>
          <span slot="right">&nbsp;&nbsp;分钟</span>
        </yd-cell-item>
      </div> -->
    </div>
  </div>
</template>
<script>
import { mapActions, mapState, mapMutations } from 'vuex'
import { setDeciceSetInfo } from "./../../sverse/api.js"
import {Spinner} from 'vue-ydui/dist/lib.rem/spinner';
import { toast } from '../../utils/toast';
export default {
  components:{
    Spinner
  },
  data(){
    return {
      temperatureDifferenceRemind: false,
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
  computed : {
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
  mounted () {
    this.temperatureDifferenceRemind = (this.deviceInfoSeting.temperatureDifferenceRemind==1?true:false)
    this.postData = {...this.postData, ...this.deviceInfoSeting}
    $('input').attr('readonly',true)
  },
  // destroyed () {
  //   l.w('TempDiff.destroyed')
  //   this.changeDeviceInfo()
  // },
  methods: {
    ...mapActions([
      'changeDeviceInfo',
      'taskQueueExec'
    ]),
    ...mapMutations([
        'deviceInfoSetingSet',
        'deviceInfoSet'
    ]),
    setDeciceSetInfo () {
      setDeciceSetInfo(this.postData).then((res)=>{
        this.deviceInfoSetingSet(this.postData);
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
  watch: {
    temperatureDifferenceRemind (val,vals) {
      this.postData.temperatureDifferenceRemind = (val?1:0);
      
        if(this.deviceConnectState){
            this.setDeciceSetInfo()
        }else{
            toast({msg: '手环已断开连接，请稍后再试！'})
        }

    },
    'postData.temperatureDifferenceValue':{
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
<style lang="less" scoped>
    #TempDiff {
      height: 100%;
      background-color: rgb(235, 235, 235);
      .head-notice{
        font-size: .32rem;
        color: #333;
        text-indent:2em;
        padding: .3rem .4rem;
      }
      .body-notice{
        font-size: .32rem;
        color: #333;
        padding: .3rem .4rem;
      }
      .heart-rate{
        background-color: #fff;
        position: relative;
        .divs{
            position: absolute;
            right: .579rem*2;
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


