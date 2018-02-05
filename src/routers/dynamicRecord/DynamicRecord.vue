<template>
    <div id="DynamicRecord">
        <yd-accordion>
            <yd-accordion-item :ref="'accordion'+index" v-for="(item, index) in list" :title="index==0?'本月':(item.date.split('-')[1])+'月'" :key="index" @click.native="getRateList(item.date)">
                
                <RightStroke v-if="htmlStatus" :stylesx="{height: '1.5rem'}" v-for="(items, index) in item.list" v-on:increment="delThat(items.id,item.date)" :key="`${index}s`">
                    <div class="recordList" @click="openPages('DynamicInfo',{id: items.id})">
                        <div class="time">{{ items.testTime }}</div>
                        <div class="text">本次最高心率<span class="val">{{ items.hrCount }}</span>次分钟，点击查看详情。</div>
                    </div>
                </RightStroke>
            </yd-accordion-item>
        </yd-accordion>
    </div>
</template>
<script>
import RightStroke from './../../common/RightStroke'
import { CellSwipe } from 'mint-ui'
import { apiUrl } from "./../../utils/subei_config.js"
import { Toast, Loading, Confirm } from 'vue-ydui/dist/lib.rem/dialog'
import {Accordion, AccordionItem} from 'vue-ydui/dist/lib.rem/accordion'
import { mapState, mapActions } from 'vuex'
import { getMemberInfo,simulationLogin,userInfoEdit, getHeartRateList, getHeartRateDelete } from "./../../sverse/api.js"
import { success, confirm, toast } from './../../utils/toast.js'
    export default {
        components:{
            [Accordion.name]: Accordion,
            [AccordionItem.name]: AccordionItem,
            [CellSwipe.name]: CellSwipe,
            RightStroke
        },
        data () {
            return {
                htmlStatus: false,
                tabStatus:{
                    accordion0: false,
                    accordion1: false
                },
                delStatus: false,
                list:[
                    {
                        date: '',
                        list: []
                    },
                    {
                        date: '',
                        list: []
                    },
                ],
            }
        },
        created(){
        },
        mounted () {
            let now = new Date();
            let nowtimebytes = [now.getFullYear(), (now.getMonth() + 1), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()];
            let month = Number(now.getMonth());
            this.list[0].date = `${now.getFullYear()}-${ (month + 1)<10? '0'+(month + 1):(month + 1) }`
            this.list[1].date = `${now.getFullYear()}-${(month==0?12:month)<10? '0'+month:(month==0?12:month)}`
            
            this.getRateList(this.list[0].date);
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
            delThat(id, date){
                confirm({title:' ', msg: '删除后，该记录将无法恢复，确定删除吗？'}).then((res)=>{
                    if(res){
                        
                        console.error('删除前的ID')
                        console.error(id)
                        getHeartRateDelete({id: id}).then((res)=>{

                            console.error('删除心率数据列表')
                            console.error(res)

                            if(res.data.status){
                                toast({msg: '删除成功！'})
                                this.htmlStatus = false;
                                this.getRateList(date);

                            }else{
                                toast({msg: '删除失败！'})
                            }

                        })

                        console.log('删除成功！')
                    }else{
                        console.log('取消！')
                    }
                })

            },
            getRateList(date){
                

                getHeartRateList({date: date}).then((res)=>{

                    console.error('获取心率数据列表')
                    console.error(res)

                    if(date==this.list[0].date){
                        this.list[0].list = res.data.info
                    }else if(date==this.list[1].date){
                        this.list[1].list = res.data.info
                    }

                    this.htmlStatus = true;
                })
            },
            open(name) {

                // this.tabStatus[name] = !this.tabStatus[name];

                // if (this.tabStatus[name]) {
                //     console.log('执行打开')
                //     this.$refs[name][0].openItem();
                // } else {
                //     console.log('执行关闭')
                //     this.$refs[name][0].closeItem();
                // }
                // if(name == 'accordion0'){
                //     this.tabStatus['accordion1'] = false;
                //     this.$refs['accordion1'][0].closeItem();
                // }else{
                //     this.tabStatus['accordion0'] = false;
                //     this.$refs['accordion0'][0].closeItem();
                // }
            }
        }
    }
</script>
<style lang="less" scoped>
    #DynamicRecord{
        .yd-accordion {
            background: #ebebeb!important;
        }
        .recordList{
            height: 100%;
            padding: .15rem*2 .10rem*2;
            display: flex;
            flex-direction: column;
            border-bottom: 1px solid #eee;
            justify-content: space-between;
            .time{
                text-align: right;
                font-size: .12rem*2;
                color: #666;
            }
            .text{
                font-size: .16rem*2;
                color: #333;
                .val{
                    color: #33a62a;
                    font-size: .24rem*2;
                }
            }
        }
    }
</style>