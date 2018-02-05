<template>
    <div id="history">
        测试页面
        <picker class="picker" v-model="visible" :data-items="items" @change="onValuesChange">
            <TitleCom slot="top-content" title="最低心率" v-on:cancel="visible=false" v-on:confirm="confirm"></TitleCom>
        </picker>
    </div>
</template>
<script>
    import TitleCom from './../../common/TitleCom.vue'
    import picker from 'vue-3d-picker';
    import { mapState } from 'vuex'
    export default {
        data() {
            return {
                visible: true,
                items: [
                    {
                        values: ['2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007'],
                    }
                ]
            }
        },

        mounted() {
        },
        computed: {
            ...mapState({
                deviceId(state){
                    return state.main.deviceInfo.deviceId
                }
            })
        },
        watch: {
        },
        methods: {
            confirm(){
                console.log('确认')
                this.visible = false;
            },
            onValuesChange(result1) {
                console.log(result1);
            }
        },
        components:{
            [picker.name]: picker,
            TitleCom,
        }
    }
</script>
<style lang="less" scoped>
#history{
    .picker{
        overflow: hidden;
    }
}
</style>