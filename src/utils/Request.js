import axios from "axios";
import Message from "./Message";
import { ElLoading } from "element-plus";
import router from '@/router'

const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson = "application/json"
const responseTypeJson = "json"
let loading = null;

const instance = axios.create({
    baseURL: "/api",
    timeout: 10 * 1000,
});

//请求拦截器
instance.interceptors.request.use(
    (config) => {
        if (config.showLoading) {
            loading = ElLoading.service({
                lock: true,
                text: "加载中……",
                background: 'rgba(0,0,0,0.7)'
            })
        }
        return config;

    }, (error) => {
        if (error.config.showLoading && loading) {
            loading.close();

        }
        Message.error("请求失败");
        return Promise.reject("请求发送失败");

    }

);
//响应拦截器
instance.interceptors.response.use(
    (response) => {
        const { showLoading, errorCallback, showError, responseType } = response.config;
        // console.log(showLoading, loading);

        if (showLoading && loading) {
            loading.close();

        }
        let responseData = response.data;



        // 非json格式数据响应成功也要返回

        if (responseType == "arraybuffer" || responseType == "blob") {
            return responseData;
        }
        if (responseData.code == 200) {
            return responseData;
        } else if (responseData.code == 901) {

            //直接访问需要登录的页面但是没有登录或者登陆超时  （后端实现：session或者cookie）
            //将用户重定向到登录页面，并且携带当前页面的路径信息，方便用户登录成功后能回到之前访问的页面
            //实现方法：跳转到登录页时，把当前路由的路径作为查询参数传递给登录页
            router.push("/login?redirectUrl=" + encodeURI(router.currentRoute.value.path));
            return Promise.reject({ showError: false, msg: "登录超时" });
        }
        else {
            if (errorCallback) {
                errorCallback(responseData.info);
            }
            return Promise.reject({ showError: showError, msg: responseData.info });

        }
    },
    (error) => {
        if (error.config.showLoading && loading) {
            loading.close();
            loading = null;
        }
        //响应失败
        return Promise.reject({ showError: true, msg: "网络异常" });
    }
);

const request = (config) => {
    const { url, params, dataType, showLoading = true, responseType = responseTypeJson, errorCallback, showError = true } = config;
    let contentType = contentTypeForm;
    let formData = new FormData();
    if (dataType != null && dataType === "json") {
        contentType = contentTypeJson;
    }
    if (params != null) {
        for (let key in params) {
            formData.append(key, params[key] == undefined ? "" : params[key]);
        }
    }
    let headers = {
        'Content-type': contentType,
        'X-Requested-With': 'XMLHttpRequest'
    }
    return instance.post(url, formData, {
        /*
        浏览器触发事件：当使用 FormData 上传文件时，浏览器会自动计算上传进度且会定期触发 progress 事件，包含loaded: 已上传的字节数
        axios（基于XHR）执行事件回调：当配置了 onUploadProgress 时，axios 会监听上传进度事件，每次进度更新时，会调用我们传入的回调函数
        */
        onUploadProgress: (event) => {
            if (config.uploadProgressCallback) {
                config.uploadProgressCallback(event);
            }
        },//上传进度

        headers: headers,
        showLoading: showLoading,
        errorCallback: errorCallback,
        showError: showError,
        responseType: responseType
    }).catch(error => {
        // console.log(error);

        if (error.showError) {
            Message.error(error.msg);
        }
        return null;
    })

};

export default request;
