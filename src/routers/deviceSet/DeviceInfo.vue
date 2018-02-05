<template>
    <div id="device">
        <div class="device_info">
            <div class="device_code">
                <img v-if="deviceInfo.qrticket" :src="(deviceInfo.qrticket.indexOf('http://') < 0 ? base_url + deviceInfo.qrticket : deviceInfo.qrticket)" alt="">
            </div>
            <div class="content">
                <p>序列号： {{ deviceInfo.deviceNo ? deviceInfo.deviceNo : '暂无' }}</p>
                <p>设备名称：{{ deviceInfo.deviceName ? deviceInfo.deviceName : '暂无' }}</p>
            </div>
            
        </div>
    </div>
</template>
<script>
import { getDeciceInfo } from "./../../sverse/api.js"
import { base_url } from "./../../utils/subei_config.js"
import { mapActions, mapState } from 'vuex'
    export default {
        data () {
            return {
                deviceInfo: {},
                base_url: base_url
            }
        },
        mounted () {
            this.deviceInfo = { ...this.deviceInfo,...this.deviceInfos }
        },
        methods: {
           
        },
        computed:{
            ...mapState({
                deviceInfos: (state)=>{
                    return state.main.deviceInfo
                }
            })
        }
    }
</script>
<style lang="less" scoped>
     body {
        background: #ebebeb;
      }
    #device {
        .device_info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            text-align: center;
            padding-top: 2rem;
            .device_code {
                width: 3rem;
                height: 3rem;

                img {
                    width: 100%;
                }
            }
            .content {
                width: 100%;
                margin-top: .25rem;
                font-size: .3rem;
                line-height: .45rem;
                color: #696969;
            }
        }
    }
</style>