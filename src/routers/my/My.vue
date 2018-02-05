<template>
    <div id="my">
        <div class="head">
            <div class="head_img">
                <img v-if="userInfo.imagePathUrl" :src="(userInfo.imagePathUrl ? userInfo.imagePathUrl : './../../assets/images/head.jpg')" alt="">
                <img v-else src="" alt="">
            </div>
            <p>{{ userInfo.mobile }}</p>
        </div>
        <div class="user_info">
            <yd-cell-item>
                <span slot="left">昵称：</span>
                <input slot="right" type="text" disabled v-model="userInfo.nickName" placeholder="请输入昵称">
            </yd-cell-item>
            <yd-cell-item type="label">
                <span slot="left">性别：</span>

                <select class="select" slot="right" v-model="userInfo.sex">
                    <option value="1">男</option>
                    <option value="0">女</option>
                </select>

            </yd-cell-item>
            <yd-cell-item arrow type="label">
                <span slot="left">生日：</span>
                <yd-datetime start-date="1890-01-01" end-date="2018-01-01" type="date" v-model="userInfo.birthday" slot="right"></yd-datetime>
            </yd-cell-item>
            <yd-cell-item type="label">
                <span slot="left">身高：</span>
                <input slot="right" type="number" v-model="userInfo.height" placeholder="请输入身高">
                <span slot="right">cm</span>
            </yd-cell-item>
            <yd-cell-item type="label">
                <span slot="left">体重：</span>
                <input slot="right" maxlength="2" v-model="userInfo.weight" type="number" placeholder="请选择体重">
                <span slot="right">kg</span>
            </yd-cell-item>
            <yd-cell-item type="label">
                <span slot="left">手机：</span>
                <input slot="right" maxlength="11" type="number" :disabled="(userPhone.mobile?true:false)" v-model="userPhone.mobile" placeholder="请输入手机号">
            </yd-cell-item>
        </div>
        <div class="confirm">
            <yd-button size="large" type="primary" @click.native="userInfoEdit()">确认</yd-button>
        </div>
    </div>
</template>
<script>
import { apiUrl } from "./../../utils/subei_config.js"
import { Toast, Loading, Confirm } from 'vue-ydui/dist/lib.rem/dialog';
import { mapState, mapActions } from 'vuex'
import { getMemberInfo,simulationLogin,userInfoEdit } from "./../../sverse/api.js"
import { success } from './../../utils/toast.js'
    export default {
        data () {
            return {
                userPhone:{
                    "mobile":""
                },
                userInfo:{
                    "height":0,
                    "weight":0,
                    "mobile":"",
                    "nickName":"",
                    "birthday":"",
                    "sex":""
                }
            }
        },
        mounted () {
            console.log(`userAgent===`)
            console.log(navigator.userAgent)
            console.log('个人信息初始化页面++++++++++++++++++++++++' + JSON.stringify(this.userGetInfo))
            if(navigator.userAgent.indexOf('MicroMessenger') != -1){
                // this.getMemberInfo();
            }else{
                this.simulationLogin();
            }
    
            this.userInfo = {...this.userInfo,...this.userGetInfo}
            this.userInfo.birthday = this.userInfo.birthday.split("T")[0];
            this.userInfo.height > 0 ? this.userInfo.height : this.userInfo.height = 172;
            this.userPhone.mobile = this.userInfo.mobile;
        },
        watch: {
            'userInfo.sex'(val, vals){
                window.localStorage.setItem('sex',val)
            },
        },
        destroyed () {
                l.w('My.destroyed')
            this.changePersonalInfo()
        },
        computed:{
            ...mapState({
                userGetInfo: state => {
                    console.log('个人信息页面')
                    console.log(state.main.userInfo)
                    return state.main.userInfo
                }
            })
        },

        methods: {
             ...mapActions([
                "userInfoSet",
                'changePersonalInfo'
            ]),

            /**
            *模拟登录
            *@param {number} Id 用户Id
            */
            simulationLogin () {
                var t_data = this;
                simulationLogin({Id: 12}).then((res) => {
                    // t_data.getMemberInfo();
                })
         
            },

            /**
            *提交用户修改
            *@param {} 
             */
            userInfoEdit (){
                var t_data = this;
                var heightReg = /^[1-2][0-9]{0,2}$/;
                var weightReg = /^[1-9][0-9]{0,2}$/;
                var phoneReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

                if(!heightReg.test(this.userInfo.height)){
                    Toast({mes:'请输入正确的身高！', timeout: 2000})
                    return
                }
                
                if(!(this.userInfo.weight>5&&this.userInfo.weight<200)){
                    Toast({mes:'请入正确的体重！', timeout: 2000})
                    return
                }

                if(!phoneReg.test(this.userPhone.mobile)){
                    Toast({mes:'请输入正确的手机号码！', timeout: 2000})
                    return
                }

                this.$dialog.confirm({
                    // title: '',
                    mes: '您确认修改吗？',
                    opts: [
                        {
                            txt: '取消',
                            color: false,
                            callback: () => {
                            }
                        },              
                        {
                            txt: '确定',
                            color: true,
                            callback: () => {
                                // alert(JSON.stringify(t_data.userInfo))
                                this.userInfo.mobile = this.userPhone.mobile;
                                this.userInfoSet(t_data.userInfo);
                                console.log(`提交前:${JSON.stringify(t_data.userInfo)}`)
                                userInfoEdit(t_data.userInfo).then((res) => {
                                    success({msg: '提交成功！'})
                                    t_data.$router.push({name:"Home",params:{}})
                                    console.log(JSON.stringify(res))
                                })
                            }
                        }
                    ]
                });
            }
        }
    }
</script>
<style lang="less" scoped>
    #my{
        .select{
            margin-left: 5px;
            color: #333;
        }
        .head {
            padding: .3rem 0;
            margin-top: .5rem;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-content: center;
            .head_img {
                width: 1.6rem;
                height: 1.6rem;
                border-radius: 50%;
                overflow: hidden;
                img {
                    width: 100%;
                }
            }
            p {
                width: 100%;
                text-align: center;
                margin-top: .2rem;
                font-size: .32rem;
                color: #b0b0b0;
            }
        }

        .user_info {
            background: white;
            input{
                text-align: right!important;
            }
            .yd-datetime-input{
                justify-content: flex-end!important;
            }
            select{
                direction: rtl;
            }
        }
        .confirm {
            padding: 0 .2rem;
            button {
                height: .8rem;
            }
        }
    }
</style>