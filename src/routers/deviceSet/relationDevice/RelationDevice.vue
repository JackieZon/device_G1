<template>
    <div id="device">
        <div class="prompt">
            <div class="prompt_content">
                <p>方式一：</p><br/>
                <p style="text-indent:.5rem">扫描包装盒上的设备二维码进行设备绑定</p>
            </div>
        </div>
        <div class="but">
            <yd-button @click.native="scanCode" slot="right" size="large" type="primary">扫描二维码</yd-button>
        </div>
        <div class="prompt">
            <div class="prompt_content">
                <p>方式二：</p><br/>
                <p style="text-indent:.5rem;">输入设备序列号，【获取二维码】 绑定设备。</p>
            </div>
        </div>
        <div class="but">
            <yd-cell-item>
                <!-- <yd-input style="height: .8rem; background: white;" slot="right" placeholder="设备类型">
                </yd-input> -->
                <span slot="right" class="yd-input">
                    <select v-model="deviceType">
                        <option value="1">G1</option>
                        <option value="2">S3</option>
                        <option value="3">S4</option>
                    </select>
                </span>
                <!-- <yd-cell-item arrow>
                    <span slot="left">
                        <select v-model="chooseType" dir="rtl">
                            <option value="00000000">只响一次</option>
                            <option value="00111110">周一到周五</option>
                            <option value="11111111">每天</option>
                            <option value="2">{{ (chooseType=='2'?countDay(postData.repeatByte):'自定义')  }}</option>
                        </select>
                    </span>
                </yd-cell-item> -->
                <yd-input style="height: .8rem; background: white;" slot="right" v-model="deviceSnMac" placeholder="序列号"></yd-input>
            </yd-cell-item>
        </div>
        <div class="but">
            <yd-button slot="right" size="large" type="primary" @click.native="getDeciceInfoBySnMac()">查询</yd-button>
        </div>
        <div class="device_info" v-if="deviceInfoStatus">
            <div class="qr_ticketUrl">
                <img :src="deviceInfo" alt="">
            </div>
            <p>温馨提示：长按识别二维码。</p>
        </div>
    </div>
</template>
<script>
    import { getDeciceInfoBySnMac, getMemberInfo } from "./../../../sverse/api.js"
    import { Toast } from 'vue-ydui/dist/lib.rem/dialog';
    import { base_url } from './../../../utils/subei_config.js';
    import { wxScanQRCodes,wxGetLocation, getStrParam } from "./../../../utils/weixin.js"
    import { alert } from './../../../utils/toast.js'
    export default {
        data () {
            return {
                deviceType: 1,
                deviceSnMac:"",
                deviceInfoStatus: false,
                deviceInfo:'',
                apiUrl: base_url
            }
        },

        mounted () {
            // this.setInterval();
        },

        methods:{
            getDeciceInfoBySnMac () {
                let t_data = this;
                if(t_data.deviceSnMac.length!==7){
                    alert({msg:'请输入7位设备序列号！'})
                    return
                }
                if(t_data.deviceType==0){
                    alert({msg:'请选择手环类型！'})
                    return
                }
                
                getDeciceInfoBySnMac({deviceType: t_data.deviceType, deviceNo: t_data.deviceSnMac}).then((res) => {
                    console.log('搜索设备编号获取二维码')
                    console.log(res)
                    if(res.data.status){
                        t_data.deviceInfo = `http://pan.baidu.com/share/qrcode?w=150&h=150&url=${res.data.info}`
                        t_data.deviceInfoStatus = true
                    }else{
                        alert({msg:'请检查序列号是否正确或请联系客服。'})
                        t_data.deviceInfoStatus = false
                    }
                })
            },
            scanCode () {
                // this.scanQRCode({$this: this})
                wx.scanQRCode({
                    needResult: 0,                             // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                    scanType: ["qrCode"],                     // 可以指定扫二维码还是一维码，默认二者都有
                    success: function (ret) {
                        console.log(`扫码成功:${ret}`)
                    }
                });
            },

            // setInterval () {
            //     var t_data = this;
            //     var testingDevice = window.setInterval(() => {
            //         getMemberInfo().then((res) => {
            //             console.log('我是设备绑定的个人信息****************************************'+JSON.stringify(res))
            //             if(res.data.info.DeviceDeviceId){
            //                 Toast({mes:'设备绑定成功，请返回微信主界面重新进入公众号即可正常使用！', timeout: 4000});
            //                 window.clearInterval(testingDevice); 
            //                 return
            //             }
            //         })
            //     },4500); 
            // }
        }
    }
</script>
<style lang="less" scoped>
    #device {
        .prompt {
            padding: .8rem .3rem .0rem .3rem;
            display: flex;
            align-items: center;
            justify-content: center;

            .prompt_content {
                width: 82%;
                p{
                    font-size: .33rem;
                    color: #696969;
                }
            }

        }
        
        .but {
            padding: 0 .5rem;
            margin-top: .4rem;
            display: flex;
            align-items: center;
            button {
                height: .8rem;
                border-radius: .5rem;
                margin-top: 0rem;
            }

            .yd-cell-item:not(:last-child):after {
                border-bottom: 0;
            }

            .yd-input {
                background: #fff;
                width: 12rem;
                height: 0.8rem;
                padding: 0 .2rem;
                border: 1px solid #666;
                border-radius: .4rem;
                margin-left: 5px;
            }
        }

        .device_info {
            width: 100%;
            margin-top: .2rem;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            padding: .4rem 0;
            .qr_ticketUrl {
                width: 3rem;
                height: 3rem;
                img {
                    width: 100%;
                    height: 100%;
                }
            }
            p{
                width: 100%;
                text-align: center;
                font-size: .32rem;
                line-height: .5rem;
                margin-top: .2rem;
                color: #696969;
            }
        }
    }
</style>