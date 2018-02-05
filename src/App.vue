<template>
  <div id="app">
    <div class="msg" v-if="tooltipInfo">
        {{tooltipInfo}}
    </div>
    <router-view/>
  </div>
</template>

<script>
import { getMemberInfo, getDeciceInfo, getUserSet } from "./../src/sverse/api.js"
import { mapActions, mapState, mapMutations } from 'vuex'
import { alert } from './utils/toast'
export default {
  name: 'app',
  created(){

    /**公众号按钮跳转 */
    // let route = window.localStorage.getItem('route')
    // console.log(`正在前往路由:${route||'暂无'}`)
    // if(route){
    //   this.$route.push({name:route ,params:{}})
    // }

  },
  mounted () {
    this.getMemberInfo();
  },
  computed: {
      ...mapState({
          tooltipInfo: (state) => {
              return state.main.tooltipInfo
          }
      })
  },
  watch:{
      '$route' (to, from) {
        console.log(to)
        if(to.name=='DeviceSet'){
          $('title').html('我的设备')
        }
        if(to.name=='Home'){
          this.clearHeartRateList();
          $('title').html('健康信息')
        }
        if(to.name=='HealthHistory'){
          $('title').html('健康历史')
        }
        if(to.name=='RelationDevice'){
          $('title').html('绑定设备')
        }
        if(to.name=='StepSettings'){
          $('title').html('步数提醒')
        }
        if(to.name=='HeartRate'){
          $('title').html('心率提醒')
        }
        if(to.name=='TempDiff'){
          $('title').html('温差提醒')
        }
        if(to.name=='My'){
          $('title').html('个人信息')
        }

        // 暂停蓝牙命令执行
        if(to.name=="Dynamic"){
          $('title').html('动态心率')
        }
      },
  },
  methods:{
    ...mapMutations([
      'changeRunCommand',
      'deviceInfoSetingSet',
      'clearHeartRateList',
    ]),
    ...mapActions([
      "userInfoSet",
      "deviceInfoSet",
      'getSport'
    ]),
    /**
    *获取个人信息
    *无参数
    */
    getMemberInfo () {
      var t_data = this;
      getMemberInfo().then((res) => {
        console.log('个人信息'+JSON.stringify(res))
        console.log(res)
          if(res.data.status){

              window.localStorage.setItem('userId',res.data.info.userId)
              window.localStorage.setItem('sex',res.data.info.sex)
              
              t_data.userInfoSet(res.data.info)
              t_data.getDeciceInfo();
              t_data.getUserSet();
              if(res.data.info.DeviceId == 0){
                  t_data.$router.push({name: "RelationDevice", params:{}})
              }
          }
      })
    },
    /**
    *获取设备详情
    *无参数
    */
     getDeciceInfo () {
        var t_data = this;
        getDeciceInfo({}).then((res) => {
          let info = res.data.info

          if(res.data.status){

            info.qrticket = ('http://pan.baidu.com/share/qrcode?w=150&h=150&url=' + res.data.info.qrticket)
            if(!info.deviceId){
              t_data.$router.replace({name: "RelationDevice",params:{}})
            }
            if(info.isOldBracelet){
              alert({msg: `该手环不支持蓝牙通讯功能！`})
            }
            console.log(`成功获取设备信息`)
            console.log(info)
            this.deviceInfoSet(info)
          }

      })
    },
    getUserSet () {
      let t_data = this
      let userId = window.localStorage.userId
      getUserSet({userId}).then((res) => {
          if(res.data.status){
            t_data.deviceInfoSet(res.data.info)
            t_data.deviceInfoSetingSet(res.data.info)
          }
      })
    }
  }
}
</script>

<style lang="less">
#app {
  height: 100%;
  .msg{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: rgba(40,40,40,.8);
    line-height: 24px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    z-index: 2000;
  }
}
#inputText{
  input{
    text-align: right;
  }
}
// .yd-cell-right .yd-datetime-input, .yd-cell-right input[type=date], .yd-cell-right input[type=datetime-local], .yd-cell-right input[type=email], .yd-cell-right input[type=number]:not(.yd-spinner-input), .yd-cell-right input[type=password], .yd-cell-right input[type=tel], .yd-cell-right input[type=text], .yd-cell-right input[type=time], .yd-cell-right input[type=url]{text-align: right;}
</style>
