var isIos = false;
var base_url = "http://test.hesvit.com/wx/";
var app_id = "wxd3660e6a9eafba17";
var key = "";
var pagesize = 10;

/**
*  字符串左侧补零
* @Param len 长度
* @return 字符串（number）
**/
String.prototype.PadLeft = function (len) {
    return ('000000000' + this).slice(-len)
}
function addCookie(){

    //所创建的cookie有效期默认到用户关闭浏览器为止  
    $.cookie('the_cookie', '五颜六色千变万化');  
    //创建一个cookie并设置 cookie的有效路径：   
    $.cookie('the_cookie_expires_07', '世界是座魔方大厦', {  
        expires: 7  
    });  
    //读取cookie  
    var value = $.cookie('the_cookie');  
    var value_07 = $.cookie('the_cookie_expires_07');  
    $('p').html('读取cookie的值：' + value + '<br />' + '读取cookie存在7天的值：' + value_07);  

}

//清除所有cookie函数  
function clearAllCookie() {  
    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);  
    if(keys) {  
        for(var i = keys.length; i--;)  
            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()  
    }  
}

var l = {
    i: function (desc, obj, line, theadname, objvalue) {
        console.log(
            new Date().format('yyyy-MM-dd hh:mm:ss:S') +
            "\t" +
            (desc ? JSON.stringify(desc) : '') +
            "\t" +
            (obj ? JSON.stringify(obj) : '') +
            "\t" +
            (theadname ? JSON.stringify(theadname) : '') +
            "\t" +
            (line ? JSON.stringify(line) : '') +
            "\t" +
            (objvalue ? JSON.stringify(objvalue) : '')
        );
    },
    e: function (desc, obj, line, theadname, objvalue) {
        console.error(
            new Date().format('yyyy-MM-dd hh:mm:ss:S') +
            "\t" +
            (desc ? JSON.stringify(desc) : '') +
            "\t" +
            (obj ? JSON.stringify(obj) : '') +
            "\t" +
            (theadname ? JSON.stringify(theadname) : '') +
            "\t" +
            (line ? JSON.stringify(line) : '') +
            "\t" +
            (objvalue ? JSON.stringify(objvalue) : '')
        );
    },
    l: function (desc, obj, line, theadname, objvalue) {
        console.info(
            new Date().format('yyyy-MM-dd hh:mm:ss:S') +
            "\t" +
            (desc ? JSON.stringify(desc) : '') +
            "\t" +
            (obj ? JSON.stringify(obj) : '') +
            "\t" +
            (theadname ? JSON.stringify(theadname) : '') +
            "\t" +
            (line ? JSON.stringify(line) : '') +
            "\t" +
            (objvalue ? JSON.stringify(objvalue) : '')
        );
    },
    w: function (desc, obj, line, theadname, objvalue) {
        console.warn(
            new Date().format('yyyy-MM-dd hh:mm:ss:S') +
            "\t" +
            (desc ? JSON.stringify(desc) : '') +
            "\t" +
            (obj ? JSON.stringify(obj) : '') +
            "\t" +
            (theadname ? JSON.stringify(theadname) : '') +
            "\t" +
            (line ? JSON.stringify(line) : '') +
            "\t" +
            (objvalue ? JSON.stringify(objvalue) : '')
        );
    },
}

function getMathRand() {
    var Num = "";
    for (var i = 0; i < 6; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    return Num;
}
function get_time() {
    var time = window.localStorage.getItem("time")
    if (time == null) time = GetDate(new Date());
    return time;
}
function get_wxopenid() {

    var wxopenid = window.localStorage.getItem("wxopenid")
    if (wxopenid == null) wxopenid = "";

    if (wxopenid != "") {

        $.ajax({
            type: "post",
            async: false,
            url: "/WebService.asmx/_MemberWx",
            data: { key: key, id: get_uid(), openid: wxopenid },
            success: function (data) {

                var b = $(data).find("boolean").text();
                if (b == "false") {
                    wxopenid = "";
                    window.localStorage.setItem("key", "");
                    window.localStorage.setItem("uid", "0");
                    window.localStorage.setItem("phone", "");
                    window.localStorage.setItem("pwd", "");
                    window.localStorage.setItem("wxopenid", "");
                }
                else {
                    if (get_uid() == 0) { ologin(); }
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log("---------wxOauto------>" + textStatus + '--' + errorThrown);
            }
        })
    }
    else {
        if (get_uid() == 0) { ologin(); }
    }

    return wxopenid;
}
function get_wxPhoto() {
    var wxphoto = window.localStorage.getItem("wxphoto")
    if (wxphoto == null) wxphoto = "";

    if (wxopenid != "") {
        $.ajax({
            type: "post",
            async: false,
            url: "/WebService.asmx/_MemberWx",
            data: { key: key, openid: wxopenid },
            success: function (data) {

                var b = $(data).find("boolean").text();
                if (b == "false") {
                    wxopenid = "";
                    window.localStorage.setItem("key", "");
                    window.localStorage.setItem("uid", "0");
                    window.localStorage.setItem("phone", "");
                    window.localStorage.setItem("pwd", "");
                    window.localStorage.setItem("wxopenid", "");
                }
                return;

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {

                console.log("---------wxOauto------>" + textStatus + '--' + errorThrown);

                hideLoader();
                toastShow('微信登录失败', 3000);
                return;
            }
        })
    }

    return wxphoto;
}
function get_wxName() {
    var wxname = window.localStorage.getItem("wxname")
    if (wxname == null) wxname = "";
    return wxname;
}

function get_fid() {
    var fid = window.localStorage.getItem("fid")
    if (fid == null) fid = 0;
    return fid;
}
function get_uid() {

    var uid = window.localStorage.getItem("uid")
    if (uid == null) uid = 0;

    return uid;
}
function get_uname() {
    return window.localStorage.getItem("uname")
}
function get_uphone() {
    return window.localStorage.getItem("phone")
}
function get_upwd() {
    return window.localStorage.getItem("pwd")
}
function get_redirect_url() {
    var url = window.localStorage.getItem("redirect_url");
    if (url == null) url = "";
    if (url == 'login.html') url = '';
    return url;
}

function oauth() {
    if (window.location.href.lastIndexOf("_oauto.html") == -1) {
        window.localStorage.setItem("redirect_url", window.location.href);
        var url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx69d5dea876ff3ddb&redirect_uri=" + base_url + "/app_wx/_oauto.html&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect";
        window.location.href = url;
    }
}
function ologin() {
    var url = window.location.href;
    if (url.lastIndexOf("login_index.html") == -1 && url.lastIndexOf("login.html") == -1 && url.lastIndexOf("register.html") == -1 && url.lastIndexOf("_auto.html") == -1) {
        window.localStorage.setItem("redirect_url", window.location.href);
        window.location.href = "login_index.html";
    }
}

// 获取 URL 中的参数
function getUrlParam(name) {
    // 构造一个含有目标参数的正则表达式对象、匹配目标参数
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var param = window.location.search.substr(1).match(reg);

    // 返回参数值
    if (param !== null) {
        return decodeURI(param[2]);
    } else {
        return null;
    }
}
// 微信登录获取openId
function anotherOAuth() {
    var openId = sessionStorage.getItem('openId')
    var memberId = sessionStorage.getItem('memberId')
    var code = getUrlParam('code');
    var state = getUrlParam('state');

    if (!openId || !memberId) {
    if (!code) {
        window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+app_id+'&redirect_uri='+encodeURIComponent(window.location.href)+'&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect';
    } else {
        ajaxPost_Json('http://wx-smartwatch.subei88.com:8080/api/Weixin/wx_Oauto?oAuth_Code='+code+'&oAuth_State='+state, {}, function (b, data) {
            console.log('获取登录信息成功')
            console.log(JSON.stringify(data))
            if (!data.status) {
                console.log(data.info);
                return;
            }

            setTimeout(function(){
                return window.location.reload();
            }, 200)

        })

        // axiosApi(`${apiUrl}Weixin/wx_Oauto?oAuth_Code=${code}&oAuth_State=${state}`,'get').then(v => {

        //     sessionStorage.serverUrl = JSON.stringify(v);
        //     sessionStorage.setItem('openId', v.info[0].openid);
        //     sessionStorage.setItem('memberId', v.info[0].Member.ID);
        //     sessionStorage.setItem('memberName', v.info[0].Member.MemberName);

        //     sessionStorage.setItem('memberType', v.info[0].Member.MemberType);
        //     sessionStorage.setItem('memberEmpid', v.info[0].Member.MemberEmpid);
        //     sessionStorage.setItem('memberGrpid', v.info[0].Member.MemberGrpid);

        //     sessionStorage.setItem('memberAvatar', v.info[0].Member.MemberPhotoHead);

        //     // setTimeout(()=>{
        //     //     window.location.reload();
        //     // }, 200)

        // });

    }
    }

}

//转换html
function GetHtml(text) {

    var strReturn = "";
    var ss = text.replaceAll("\n", "|").split('|');

    for (i = 0; i < ss.length; i++) {
        if (ss[i] != "") strReturn += "<p>" + ss[i] + "</p>";
    }

    return strReturn;
}
//转换html
function GetHtmlBr(text) {

    var strReturn = "";
    var ss = text.replaceAll("\n", "|").split('|');

    for (i = 0; i < ss.length; i++) {
        if (ss[i] != "") strReturn += "<p>" + ss[i] + "</p>";
    }

    return strReturn;
}

function GetDate(date) {
    date = new Date(date.replaceAll("-", "/").replace("T", " "));
    return date.format("yyyy-MM-dd");
}
function GetDateMinute(date) {
    date = new Date(date.replaceAll("-", "/").replace("T", " "));
    return date.format("yyyy-MM-dd hh:mm:ss");
}
function GetDateDiff(date) {

    date = new Date(date.replaceAll("-", "/").replace("T", " "));
    var d_minutes, d_hours, d_days;
    var timeNow = parseInt(new Date().getTime() / 1000);
    var timeDate = parseInt(date.getTime() / 1000);

    var d = timeNow - timeDate;
    d_days = parseInt(d / 86400);
    d_hours = parseInt(d / 3600);
    d_minutes = parseInt(d / 60);

    if (d_days > 0 && d_days < 4) {
        return d_days + "天前";
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + "小时前";
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + "分钟前";
    }
    else if (d_minutes <= 0) {
        return "刚刚";
    } else {
        return (s.getMonth() + 1) + "月" + s.getDate() + "日";
    }
}


Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份   
        "d+": this.getDate(),                    //日   
        "h+": this.getHours(),                   //小时   
        "m+": this.getMinutes(),                 //分   
        "s+": this.getSeconds(),                 //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}


function toastShow(showInfo, length) {
    $("div.pupInfo").remove(); $("div.pupBg").remove();
    $("body").append("<div class='pupBg' style='display:block;background:10px'></div><div class='pupInfo'>" + showInfo + "</div>");
    setTimeout(hideLoader, length);
}
function confirmShow(infoConfirm, infoCancel, callback) {

    $("div.pupBg").remove(); $("div.pupConfirm").remove();
    var info = '<div class="pupBg"></div><div class="pupConfirm"><p>提交审核后内容不可修改，请再次确认是否提交？</p><a href="javascript:void(0);" class="lnkConfirm option"></a><a href="javascript:void(0);" class="lnkCancel option"></a></div>';
    $("body").append(info);

    $(".pupConfirm").find(".lnkConfirm").html(infoConfirm);
    $(".pupConfirm").find(".lnkCancel").html(infoCancel);
    $(".pupConfirm").show();
    $(".pupBg").show();

    $(".pupConfirm .lnkConfirm").unbind("click");
    $(".pupConfirm .lnkConfirm").click(function () {
        $(".pupConfirm").hide(); $(".pupBg").hide();
        callback();
    })

    $(".pupConfirm .lnkCancel").unbind("click");
    $(".pupConfirm .lnkCancel").click(function () {
        $(".pupConfirm").hide(); $(".pupBg").hide();
    })
}

//页面为空的提示
function showTips(type, intro, callback) {

    if (type == "") type = 1;
    if (intro == "") intro = "加载中...";

    var strHtml = "";
    strHtml += '<section class="tips tips' + type + '">';
    strHtml += '<i class="tip-img aui-iconfont aui-icon-info"></i>';
    strHtml += '<div class="tip-content">' + intro + '</div>';
    strHtml += '<a class="lnkHome">去逛逛</a>';
    strHtml += '</section>';

    $("section.tips").remove();
    $("body").append(strHtml);

    $("section.tips").click(function () {
        if (is_define(callback)) {
            callback()
        }
    })
}
//页面为空的提示的清空
function hideTips() {
    $("section.tips").remove();
}
//下一页时拉取的效果
function showLoadUp(callback) {

    var strHtml = "";
    strHtml += '<section class="loadUp">';
    strHtml += '<div class="tip-content">努力拉取中...</div>';
    strHtml += '<a>点我加载</a>';
    strHtml += '</section>';

    $("section.loadUp").remove();
    $("body").addClass("loadUp");
    $("body").append(strHtml);

    $("section.loadUp").click(function () {
        if (is_define(callback)) {
            callback()
        }
    })
}
//下一页时拉取的效果的清除
function hideLoadUp() {
    $("body").removeClass("loadUp");
    $("section.loadUp").remove();
}

function showLoaderPay() {
    $("div.pupInfo").remove(); $("div.pupBg").remove();
    $("body").append("<div class='pupBg' style='display:block'></div><div class='pupInfo'>支付中...</div>");
    $("div.pupInfo").addClass("pupLoading");
}
function showLoaderSave() {
    $("div.pupInfo").remove(); $("div.pupBg").remove();
    $("body").append("<div class='pupBg' style='display:block'><div class='pupInfo'>保存中...</div>");
    $("div.pupInfo").addClass("pupLoading");
}
function showLoaderInfo(info) {
    $("div.pupInfo").remove(); $("div.pupBg").remove();
    $("body").append("<div class='pupBg' style='display:block'></div><div class='pupInfo'>" + info + "...</div>");
    $("div.pupInfo").addClass("pupLoading");
}
function showLoader() {
    $("div.pupInfo").remove(); $("div.pupBg").remove();
    $("body").append("<div class='pupBg' style='display:block'><div class='pupInfo'>加载中...</div>");
    $("div.pupInfo").addClass("pupLoading");
}
function hideLoader() {
    $("div.pupInfo").remove(); $("div.pupBg").remove();
}

//ajax调用数据 返回json
function ajaxGet_Json(url, data, callback) {

    $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        data: data,
        success: function (data) {
            if (is_define(callback)) {
                callback(true, data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            let res = XMLHttpRequest;
            console.log('***XMLHttpRequest***')
            console.log(XMLHttpRequest)
            // if (res.status >= 200 && res.status < 300) {
            //     if (res.data.status) {
            //         resolve({data: res.data})
            //     } else {
            //         resolve({data: res.data})
            //         alert({msg: res.data.info})
            //         if (res.data.infocode === -3000 || res.data.infocode === '-3000' || res.data.infocode === '-1') {
            //         goBack()
            //         }
            //     }
            // } else {
            //     alert({msg: '请求失败'})
            // }
            if (is_define(callback)) {
                callback(false, url + "?op=" + data.op + "加载失败" + textStatus + errorThrown);
            }
        }
    });
}
//ajax调用数据 返回json
function ajaxPost_Json(url, data, callback) {

    $.ajax({
        type: "post",
        url: url,
        dataType: "json",
        data: data,
        success: function (data) {
            if (is_define(callback)) {
                callback(true, data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (is_define(callback)) {
                callback(false, url + "?op=" + data.op + "加载失败" + textStatus + errorThrown);
            }
        }
    });
}

function ajaxPost_Json(url, data, callback) {

    $.ajax({
        type: "post",
        url: url,
        dataType: "json",
        data: data,
        success: function (data) {
            if (is_define(callback)) {
                callback(true, data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (is_define(callback)) {
                callback(false, url + "?op=" + data.op + "加载失败" + textStatus + errorThrown);
            }
        }
    });
}

function ajaxPostJson_Json(url, data, callback) {

    $.ajax({
        type: "post",
        url: url,
        dataType: "json",
        data: JSON.stringify(data), 
        contentType: "application/json;charset=utf-8",
        success: function (data) {
            if (is_define(callback)) {
                callback(true, data);
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (is_define(callback)) {
                callback(false, url + "?op=" + data.op + "加载失败" + textStatus + errorThrown);
            }
        }
    });
}

//ajax调用数据 返回xml
function ajaxPost_Xml(url, data, callback) {

    $.ajax({
        type: "post",
        url: url,
        dataType: "xml",
        data: data,
        success: function (data) {
            callback(true, data);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (is_define(callback)) {
                callback(false, "加载失败");
            }
        }
    });
}

//判断是否是空 
function is_define(value) {
    if (value == null || value == "" || value == "undefined" || value == undefined || value == "null" || value == "(null)" || value == 'NULL' || typeof (value) == 'undefined') {
        return false;
    }
    else {
        value = value + "";
        value = value.replace(/\s/g, "");
        if (value == "") {
            return false;
        }
        return true;
    }
}
//写日志到服务器上
function sb_Writelog(info) {

    var param = { op: "WriteLog", memberid: get_uid(), info: escape(info) }
    ajaxPost_Json("../App_Ashx/ajax_common.ashx", param, function (b, data) {
        if (b) {

        }
    })
}
//滚动到页面底部
function sb_scrollToBottom(time) {
    $('body').animate({ scrollTop: $(document).height() }, time);
}
//添加分享记录
function sb_addSharelog(shareType, shareObject, shareObjectId, shareObjectIntro) {
    var param = { op: "AddShareLog", memberid: get_uid(), shareType: shareType, shareObject: shareObject, shareObjectId: shareObjectId, shareObjectIntro: shareObjectIntro }
    ajaxPost_Json("../App_Ashx/ajax_common.ashx", param, function (b, data) {
        if (b) {
            sb_Writelog(JSON.stringify(data));
        }
    })
}
//添加浏览记录
function sb_addViewlog(viewObject, viewObjectId, viewObjectIntro) {
    var param = { op: "AddViewLog", memberid: get_uid(), viewObject: viewObject, viewObjectId: viewObjectId, viewObjectIntro: viewObjectIntro }
    ajaxPost_Json("../App_Ashx/ajax_common.ashx", param, function (b, data) {
        if (b) {
            sb_Writelog(JSON.stringify(data));
        }
    })
}

// //微信config（必须先执行它）
// function wx_config(callback) {

//     ajaxGet_Json("/wx/server/getJsApiSign", {}, function (b, data) {
//         console.log('执行获取config配置')
//         console.log(data)
//         var data = {"info":{"jsapi_ticket":"kgt8ON7yVITDhtdwci0qeSniGLDHxf23E2twHy5vdE1fLbkjhZ1GRL8rHQQmYMHJV1flD0nC0ESDBfWvKaP_8w","jsapi_appId":"wxd3660e6a9eafba17","jsapi_timestamp":"1511596074","jsapi_nonceStr":"dcb452eae1b44546","jsapi_signature":"55407a2ee34e72c2e811ee35a8d8df96d0c8f3ca"},"status":true}
//         if (b) {
//             if (!data.status) {
//                 toastShow(data.info, 1000);
//                 return;
//             }

//             wx.config({
//                 beta: true,
//                 debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//                 appId: data.info.jsapi_appId, // 必填，公众号的唯一标识
//                 timestamp: data.info.jsapi_timestamp, // 必填，生成签名的时间戳
//                 nonceStr: data.info.jsapi_nonceStr, // 必填，生成签名的随机串
//                 signature: data.info.jsapi_signature,// 必填，签名，见附录1
//                 jsApiList: [
//                     'openWXDeviceLib',
//                     'closeWXDeviceLib',
//                     'getWXDeviceInfos',
//                     'getWXDeviceBindTicket',
//                     'getWXDeviceUnbindTicket',
//                     'startScanWXDevice',
//                     'stopScanWXDevice',
//                     'connectWXDevice',
//                     'disconnectWXDevice',
//                     'sendDataToWXDevice',
//                     'onWXDeviceBindStateChange',
//                     'onWXDeviceStateChange',
//                     'onScanWXDeviceResult',
//                     'onReceiveDataFromWXDevice',
//                     'onWXDeviceBluetoothStateChange',
//                     'checkJsApi',
//                     'onMenuShareTimeline',
//                     'onMenuShareAppMessage',
//                     'onMenuShareQQ',
//                     'onMenuShareWeibo',
//                     'onMenuShareQZone',
//                     'hideMenuItems',
//                     'showMenuItems',
//                     'hideAllNonBaseMenuItem',
//                     'showAllNonBaseMenuItem',
//                     'translateVoice',
//                     'startRecord',
//                     'stopRecord',
//                     'onVoiceRecordEnd',
//                     'playVoice',
//                     'onVoicePlayEnd',
//                     'pauseVoice',
//                     'stopVoice',
//                     'uploadVoice',
//                     'downloadVoice',
//                     'chooseImage',
//                     'previewImage',
//                     'uploadImage',
//                     'downloadImage',
//                     'getNetworkType',
//                     'openLocation',
//                     'getLocation',
//                     'hideOptionMenu',
//                     'showOptionMenu',
//                     'closeWindow',
//                     'scanQRCode',
//                     'chooseWXPay',
//                     'openProductSpecificView',
//                     'addCard',
//                     'chooseCard',
//                     'openCard'
//                 ]
//             });

//             wx.ready(function () {
//                 toastShow("初始化成功！", 3000);
//                 console.log('微信配置初始化成功！')
//                 callback();
//             })

//             wx.error(function (res) {
//                 alert('wx.error:' + JSON.stringify(res));
//             });

//         }
//     })

// }

//微信支付-order
function wx_pay(orderid, callback) {

    showLoaderPay();

    $.ajax({
        type: "post",
        url: "/App_Ashx/wxPay.ashx",
        data: { url: window.location.href, orderid: orderid, openid: get_wxopenid() },
        success: function (data) {

            if (data.indexOf("error") > -1) {
                toastShow(data.replaceAll("error:", ""), 1000);
                return;
            }

            var d = data.split('|');
            var jsapi_appId = d[0];
            var jsapi_timestamp = d[1];
            var jsapi_nonceStr = d[2];
            var jsapi_signature = d[3];
            var paypackage = d[4];
            var paySign = d[5];

            wx.chooseWXPay({
                timestamp: jsapi_timestamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: jsapi_nonceStr, // 支付签名随机串，不长于 32 位
                package: paypackage, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: paySign, // 支付签名
                success: function (res) {
                    // 支付成功后的回调函数
                    //toastShow("谢谢你的购买！", 1000);
                    callback(orderid)
                },
                fail: function (res) {
                    toastShow("支付失败！请检查微信配置", 1000);
                    alert(JSON.stringify(res));
                },
                cancel: function (res) {

                    //支付取消
                    hideLoader();
                    //toastShow("确定要取消吗！", 2000);
                }
            });

        }
    })
}
//微信扫描
function wx_scanQRCode(callback) {
    wx.scanQRCode({
        needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
        scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
        success: function (res) {
            var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
            callback(result);
        }
    });
}
//预览微信图片
function wx_previewPhoto(imgDefault, imgArray) {
    wx.previewImage({
        current: imgDefault,
        urls: imgArray
    });
}
//上传微信图片（单张）
function wx_uploadPhoto(objImg, callback) {

    wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {

            //得到选择后的图片ID
            var localId = res.localIds[0];
            sb_Writelog(JSON.stringify(res));

            wx.uploadImage({
                localId: localId.toString(),
                success: function (res) {
                    sb_Writelog(JSON.stringify(res));
                    objImg.attr("src", localId);
                    objImg.attr("data", res.serverId);
                    objImg.attr("serverId", res.serverId);
                    if (is_define(callback)) callback(objImg);
                },
                fail: function (res) {
                    alert(JSON.stringify(res));
                }
            });
        }
    });
}
//上传微信图片（多张）
function wxUploadPhoto1(objDiv) {

    wx.chooseImage({
        count: 9, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {

            //得到选择后的图片ID
            var localIds = res.localIds;
            var imgs = ""; var i = 0;

            function upload() {

                wx.uploadImage({
                    localId: localIds[i],
                    success: function (res) {

                        objDiv.append("<img src='" + localIds[i] + "' serverId='" + res.serverId + "' >")
                        i++; if (i < localIds.length) { upload(); }

                    },
                    fail: function (res) {
                        alert(JSON.stringify(res));
                    }
                });
            }

            upload();
        }
    });
}
//分享到朋友圈
function wxShareTimeline(title, link, imgUrl, callback) {
    wx.onMenuShareTimeline({
        title: title, // 分享标题
        link: link, // 分享链接
        imgUrl: imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
            if (is_define(callback)) callback(true);
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
            if (is_define(callback)) callback(false);
        }
    });
}
//分享到微信好友
function wxShareAppMessage(title, desc, link, imgUrl, type, dataUrl, callback) {
    wx.onMenuShareAppMessage({
        title: title, // 分享标题
        desc: desc, // 分享描述
        link: link, // 分享链接
        imgUrl: imgUrl, // 分享图标
        type: type, // 分享类型,music、video或link，不填默认为link
        dataUrl: dataUrl, // 如果type是music或video，则要提供数据链接，默认为空
        success: function () {
            // 用户确认分享后执行的回调函数
            if (is_define(callback)) callback(true);
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
            if (is_define(callback)) callback(false);
        }
    });
}
//分享到QQ空间
function wxShareQzone(title, desc, link, imgUrl, callback) {
    wx.onMenuShareQZone({
        title: title, // 分享标题
        desc: desc, // 分享描述
        link: link, // 分享链接
        imgUrl: imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
            if (is_define(callback)) callback(true);
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
            if (is_define(callback)) callback(true);
        }
    });
}
//分享到QQ
function wxShareQQ(title, desc, link, imgUrl, callback) {
    wx.onMenuShareQQ({
        title: title, // 分享标题
        desc: desc, // 分享描述
        link: link, // 分享链接
        imgUrl: imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
            if (is_define(callback)) callback(true);
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
            if (is_define(callback)) callback(false);
        }
    });
}
//得到地置位置
function wxGetLocation(callback) {
    wx.getLocation({
        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
        success: function (res) {
            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
            var speed = res.speed; // 速度，以米/每秒计
            var accuracy = res.accuracy; // 位置精度
            if (is_define(callback)) callback(latitude, longitude);
        }
    });
}
//打开地图
function wxOpenLocation(latitude, longitude, name, address, infoUrl) {
    wx.openLocation({
        latitude: 0, // 纬度，浮点数，范围为90 ~ -90
        longitude: 0, // 经度，浮点数，范围为180 ~ -180。
        name: '', // 位置名
        address: '', // 地址详情说明
        scale: 1, // 地图缩放级别,整形值,范围从1~28。默认为最大
        infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
    });
}


//格式化代码函数
function formatJson(json, options) {

    try
    {
        var _json = JSON.parse(json);
    }
    catch(e)
    {
        return json;
    }

    var reg = null,
        formatted = '',
        pad = 0,
        PADDING = '    ';
    options = options || {};
    options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
    options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
    if (typeof json !== 'string') {
        json = JSON.stringify(json);
    } else {
        json = JSON.parse(json);
        json = JSON.stringify(json);
    }
    reg = /([\{\}])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /([\[\]])/g;
    json = json.replace(reg, '\r\n$1\r\n');
    reg = /(\,)/g;
    json = json.replace(reg, '$1\r\n');
    reg = /(\r\n\r\n)/g;
    json = json.replace(reg, '\r\n');
    reg = /\r\n\,/g;
    json = json.replace(reg, ',');
    if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
        reg = /\:\r\n\{/g;
        json = json.replace(reg, ':{');
        reg = /\:\r\n\[/g;
        json = json.replace(reg, ':[');
    }
    if (options.spaceAfterColon) {
        reg = /\:/g;
        json = json.replace(reg, ':');
    }
    (json.split('\r\n')).forEach(function (node, index) {
        var i = 0,
            indent = 0,
            padding = '';

        if (node.match(/\{$/) || node.match(/\[$/)) {
            indent = 1;
        } else if (node.match(/\}/) || node.match(/\]/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else {
            indent = 0;
        }

        for (i = 0; i < pad; i++) {
            padding += PADDING;
        }

        formatted += padding + node + '\r\n';
        pad += indent;
    }
    );
    return formatted;
};