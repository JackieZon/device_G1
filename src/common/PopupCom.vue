<template>
    <div id="PopupCom">
        <div class="content">

        </div>
    </div>
</template>
<script>
    export default {
        props: [ 'status' ],
        data() {
            return {};
        },
        watch:{
            status(val, vals){
                alert(val)
            }
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
    #PopupCom {
    }
</style>
