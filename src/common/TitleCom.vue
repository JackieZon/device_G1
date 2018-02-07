<template>
     <div id="TitleCom">
         <div class="content">
             <div class="cancel" v-on:click="cancel">取消</div>
             <div class="title">{{ title || '标题' }}</div>
             <div class="confirm" v-on:click="confirm">确定</div>
         </div>
     </div>
</template>
<script>
    export default {
        props: [ 'title' ],
        data() {
            return {};
        },
        watch:{
        },
        mounted(){
        },
        methods: {
            confirm(){
                this.$emit('confirm');
            },
            cancel(){
                this.$emit('cancel');
            }
        }
    };
</script>
<style scoped lang="less" scoped>
    #TitleCom {
        .content{
            height: .45rem*2;
            background: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
            font-size: .14rem*2;
            .cancel{
                display: flex;
                justify-content: center;
                align-items: center;
                height: .45rem*2;
                padding: 0 .3rem;
            }
            .confirm{
                display: flex;
                justify-content: center;
                align-items: center;
                height: .45rem*2;
                padding: 0 .3rem;
                color: #38f;
            }
        }
    }
</style>
