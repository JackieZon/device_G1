<template>
    <div id="feMaleDetile">
        <div class="items">
            <div class="item color1">
                月经期
            </div>
            <div class="item color2">
                预测经期
            </div>
            <div class="item color3">
                安全期
            </div>
            <div class="item color4">
                排卵期
            </div>
        </div>
        <div class="infos">
            <div class="infos-items">
                <div class="item">
                    <div class="typeColor color1"></div>
                    <div class="text">月经期</div>
                </div>
                <p>女性月经来潮至月经结束这一段时间，一般为期3-7天，各人因体质不同，略有差异。</p>
            </div>
            <div class="infos-items">
                <div class="item">
                    <div class="typeColor color2"></div>
                    <div class="text">预测经期</div>
                </div>
                <p>根据用户所设置以及记录的相关信息推算出下一次月经来潮的日期。</p>
            </div>
            <div class="infos-items">
                <div class="item">
                    <div class="typeColor color3"></div>
                    <div class="text">安全期</div>
                </div>
                <p>安全期是指女性月经前7天和月经后8天，是多数人用来避孕的一种计算方法。</p>
            </div>
            <div class="infos-items">
                <div class="item">
                    <div class="typeColor color4"></div>
                    <div class="text">排卵期</div>
                </div>
                <p>女性的排卵日期一般在下次月经来潮前12-16天左右。</p>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data () {
            return {
            }
        },
        watch:{
        },
        mounted () {
        },
        methods:{
        },
        computed:{
        }

    }
</script>
<style lang="less">
    #feMaleDetile{
        .items{
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: .14*2rem;
            padding: .25*2rem .15*2rem;
            .item{
                width: 1.3*2rem;
                line-height: .30*2rem;
                text-align: center;
                color: #333;
            }
            .color1{
                border-bottom: .07*2rem solid #ff99cc;
            }
            .color2{
                border-bottom: .07*2rem solid #86ff86;
            }
            .color3{
                border-bottom: .07*2rem solid #ffcc99;
            }
            .color4{
                border-bottom: .07*2rem solid #ffd2e9;
            }
        }
        .infos{
            .infos-items{
                display: flex;
                justify-content: flex-start;
                align-items: center;
                flex-direction: column;
                font-size: .32rem;
                padding: .35rem .2rem;
                color: #333;
                p{
                    text-indent: 2em;
                }
                .item{
                    margin-bottom: .15rem;
                    margin-left: .5rem;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    font-size: .14*2rem;
                    margin-right: .1*2rem;
                    width: 100%;
                    .text{
                        line-height: 100%;
                    }
                    .typeColor{
                        width: .18*2rem;
                        height: .18*2rem;
                        margin-right: .02*2rem;
                    }
                    .color1{
                        background: #ff99cc;
                    }
                    .color2{
                        background: #86ff86;
                    }
                    .color3{
                        background: #ffcc99;
                    }
                    .color4{
                        background: #ffd2e9;
                    }
                }
            }
        }
    }
</style>