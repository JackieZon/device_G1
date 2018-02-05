import axiosApi from './../utils/axios.js'
import { apiUrl,base_url } from './../utils/subei_config.js'


export const getMemberInfo  = async (param) => {
    let userId = window.localStorage.userId;
    return await axiosApi(`${apiUrl}user/getUser.wxhtml?userId=${userId}`, "get", param);
}

/**
*模拟登录
*@param {number} Id 用户Id
*/
export const simulationLogin  = async (param) => {
    
    return await axiosApi(`${apiUrl}WeiXinUser/TestLogin?Id=${param.Id}`, "post", param);

}


/**
 * 编辑个人信息 
 * @param {object} 
 */
export const userInfoEdit  = async (param) => {
    return await axiosApi(`${apiUrl}user/updateUser.wxhtml`, "post", param);
}


/**
 * 获取用户重要日期提醒
 * user/getImportantDateRemind.wxhtml
 */
export const getImportantDateRemind = async (param) => {
    let userId = window.localStorage.userId;
    return await axiosApi(`${apiUrl}user/getImportantDateRemind.wxhtml?userId=${userId}`, "get", {});
}


/**
 * 提交用户重要日期提醒
 * user/saveOrUpdateImportantDateRemind.wxhtml
 */
export const saveOrUpdateImportantDateRemind = async (param) => {
    return await axiosApi(`${apiUrl}user/saveOrUpdateImportantDateRemind.wxhtml`, "post", param);
}

/**
 * 健康历史 
 * @param {object} deviceId 设备ID 
 */
export const getHistoryData = async (time) => {
    console.error(`Api 方法 getHistoryData：${time}`)
    let userId = window.localStorage.userId;
    return await axiosApi(`${apiUrl}healthRecord/queryHealthHty.wxhtml?deviceType=1&belongDate=${time}&userId=${userId}`, "get", {deviceType: 1, belongDate: time});
}

/**
 * 根据序列号获取设备信息 
 * @param {object} SnMac 设备sn/mac 
 */

export const getDeciceInfoBySnMac = async (param) => {
    return await axiosApi(`${apiUrl}device/getMyDeviceRrticket.jhtml?deviceType=${param.deviceType}&deviceNo=${param.deviceNo}`, "get", {});
}


/**
 * 获取设备信息
 * 无参数
 */

 export const getDeciceInfo = async (param) => {
    let userId = window.localStorage.userId;
    return await axiosApi(`${apiUrl}device/getMyDevice.wxhtml?userId=${userId}`, "get", param);
 }

/**
 * 获取设备信息接口
 */
export const getUserSet = async (param) => {
    let userId = window.localStorage.userId;
    return await axiosApi(`${apiUrl}user/getUserSet.wxhtml?deviceType=1&userId=${userId}`, "get", param);
}

 /**
 * 设置设备功能
 * 
 */

export const setDeciceSetInfo = async (param) => {
    console.log('设置设备功能')
    console.log(param)
    return await axiosApi(`${apiUrl}user/updateSet.wxhtml`, "post", param);
}


 /**
 * 解绑设备
 * @param {object} deviceId 设备ID 
 */

export const deviceUnBind = async (deviceId) => {
    return await axiosApi(`${apiUrl}device/unbandDevice.wxhtml?deviceId=${deviceId}`, "get", {});
}

/**
 * 提交睡眠历史数据
 * @param {object} param 设备ID和DataList
 */
export const addDeviceDataSleep = async (param) => {
    console.error('执行saveSleep.wxhtml')
    console.error(param.dataList)
    return await axiosApi(`${apiUrl}uploadData/saveSleep.wxhtml`, "postDataList", param.dataList);
}

/**
 * 提交运动历史数据
 * @param {object} param 设备ID和DataList
 */
export const addDeviceDataSport = async (param) => {
    console.error('执行saveSport.wxhtml')
    console.error(param.dataList)
    return await axiosApi(`${apiUrl}uploadData/saveSport.wxhtml`, "postDataList", param.dataList);
}

/**
 * 提交脉搏历史数据
 * @param {object} param 设备ID和DataList
 */
export const addDeviceDataPulse = async (param) => {
    return await axiosApi(`${apiUrl}uploadData/saveHeartRate.wxhtml`, "postDataList", param.dataList);
}

/**
 * 提交温湿度历史数据
 * @param {object} param 设备ID和DataList
 */
export const addDeviceDataTempRHPress = async (param) => {
    return await axiosApi(`${apiUrl}uploadData/saveEnvi.wxhtml`, "postDataList", param.dataList);
}

/**
 * 提交温湿度历史数据
 * @param {object} param 设备ID和DataList
 */
export const postSaveHeartRate = async (param) => {
    return await axiosApi(`${apiUrl}uploadData/saveHeartRate.wxhtml`, "postDataList", param);
}

/**
 * 获取心率数据列表
 */
export const getHeartRateList = async (param) => {
    let userId = window.localStorage.userId;
    return await axiosApi(`${apiUrl}dynamicHr/getHeartRateList?userId=${userId}&measureType=5&deviceType=1&date=${param.date}`, "get", param);
}

// http://test.hesvit.com/wx/dynamicHr/delete

/**
 * 删除心率数据列表
 */
export const getHeartRateDelete = async (param) => {
    let userId = window.localStorage.userId;
    let { id } = param
    console.error('在Api文件里的ID')
    console.error(param)
    return await axiosApi(`${apiUrl}dynamicHr/delete?id=${id}`, "delete", {});
}

// http://test.hesvit.com/wx/dynamicHr/getDynamicHeartRateDetail

/**
 * 获取心率详情数据
 */
export const getDynamicHeartRateDetail = async (param) => {
    let userId = window.localStorage.userId;
    let { id } = param
    return await axiosApi(`${apiUrl}dynamicHr/getDynamicHeartRateDetail?heartRateId=${id}`, "get", param);
}