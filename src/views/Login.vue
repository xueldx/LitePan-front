<template>
  <div class="login-body">
    <div class="bg"></div>
    <div class="login-panel">
      <el-form
        class="login-register"
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        @submit.prevent
      >
        <div class="login-title">easy云盘</div>
        <!--输入邮箱-->
        <el-form-item prop="email">
          <!--//prop="email"应用rules中email数据对应的校验规则 -->
          <el-input
            size="large"
            clearable
            v-model.trim="formData.email"
            placeholder="请输入邮箱账号"
            maxLength="150"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>
        <!--登录密码框(1)-->
        <el-form-item prop="password" v-if="opType == 1">
          <el-input
            size="large"
            show-password
            v-model.trim="formData.password"
            placeholder="请输入密码"
            type="password"
            maxLength="150"
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>

        <!--注册页和找回密码页-->
        <div v-if="opType == 0 || opType == 2">
          <!--邮箱验证码-->
          <el-form-item prop="emailCode">
            <div class="send-email-panel">
              <el-input
                clearable
                size="large"
                placeholder="请输入邮箱验证码"
                v-model.trim="formData.emailCode"
              >
                <template #prefix>
                  <span class="iconfont icon-checkcode"></span>
                </template>
              </el-input>
              <el-button
                type="primary"
                size="large"
                class="send-mail-btn"
                @click="sendMailCode"
                >获取验证码</el-button
              >
            </div>
            <el-popover placement="left" :width="500" trigger="click">
              <div>
                <p>1、在垃圾箱中查找邮箱验证码</p>
                <br />
                <p>2、在邮箱中头像）设置->反垃圾->白名单->设置邮件地址白名单</p>
                <br />
                <p>3、将邮箱[xueldx@foxmail.com]添加到白名单</p>
                <br />
                <a
                  href="https://service.mail.qq.com/detail/0/473"
                  target="_blank"
                  class="a-link"
                  >不知道怎么设置?</a
                >
              </div>
              <template #reference>
                <span class="a-link" :style="{ 'font-size': '14px' }"
                  >未收到邮箱验证码？</span
                >
              </template></el-popover
            >
          </el-form-item>

          <!--  注册昵称(0)   -->
          <el-form-item prop="nickName" v-if="opType == 0">
            <el-input
              size="large"
              v-model.trim="formData.nickName"
              placeholder="请输入昵称"
              maxLength="20"
            >
              <template #prefix>
                <span class="iconfont icon-account"></span>
              </template>
            </el-input>
          </el-form-item>

          <!-- 注册密码 -->
          <el-form-item prop="registerPassword">
            <el-input
              size="large"
              show-password
              v-model.trim="formData.registerPassword"
              placeholder="请输入密码"
              type="password"
              maxLength="150"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
          <!-- 再次确认密码 -->
          <el-form-item prop="reRegisterPassword">
            <el-input
              size="large"
              show-password
              v-model.trim="formData.reRegisterPassword"
              placeholder="请再次输入密码"
              type="password"
              maxLength="150"
            >
              <template #prefix>
                <span class="iconfont icon-password"></span>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!--图片验证码-->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input
              clearable
              size="large"
              placeholder="请输入验证码"
              maxLength="6"
              v-model="formData.checkCode"
              @keyup.enter="doSubmit"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrl"
              alt=""
              class="check-code"
              @click="changeCheckCode(0)"
            />
          </div>
        </el-form-item>
        <!-- 登录页提示 -->
        <el-form-item v-if="opType == 1">
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberMe">记住我</el-checkbox>
          </div>
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(2)"
              >忘记密码？</a
            >
            <a href="javascript:void(0)" class="a-link" @click="showPanel(0)"
              >没有账号？</a
            >
          </div>
        </el-form-item>
        <!-- 忘记密码页提示 -->
        <el-form-item v-if="opType == 2">
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(1)"
              >去登录？</a
            >
          </div>
        </el-form-item>
        <!-- 注册页提示 -->
        <el-form-item v-if="opType == 0">
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(1)"
              >已有账号？</a
            >
          </div>
        </el-form-item>
        <!--登录按钮-->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="op-btn"
            @click="doSubmit"
          >
            <span v-if="opType == 0">注册</span>
            <span v-if="opType == 1">登录</span>
            <span v-if="opType == 2">重置密码</span>
          </el-button>
        </el-form-item>
        <div class="login-btn-qq" v-if="opType == 1">
          快捷登录
          <img src="@/assets/qq.png" alt="" @click="qqLogin" />
        </div>
      </el-form>
    </div>
    <Dialog
      :show="dialogConfigSendMailCode.show"
      :title="dialogConfigSendMailCode.title"
      :buttons="dialogConfigSendMailCode.buttons"
      width="450px"
      :showCancel="false"
      @close="dialogConfigSendMailCode.show = false"
    >
      <el-form
        :model="formDataSendMailCode"
        :rules="rules"
        ref="formDataSendMailCodeRef"
        label-width="80px"
        @submit.prevent
      >
        <!--邮箱-->
        <el-form-item label="邮箱">
          {{ formData.email }}
        </el-form-item>

        <!--图片验证码-->
        <el-form-item prop="checkCode" label="验证码">
          <div class="checkAgain-code-panel">
            <el-input
              clearable
              size="large"
              placeholder="请输入验证码"
              maxLength="6"
              v-model="formDataSendMailCode.checkCode"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
              :src="checkCodeUrlSendMailCode"
              alt=""
              class="checkAgain-code"
              @click="changeCheckCode(1)"
            />
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template> 
        

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
const { proxy } = getCurrentInstance();
import md5 from "js-md5";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const api = {
  checkCodeUrl: "/api/checkCode",
  sendEmailCodeUrl: "/sendEmailCode",
  register: "/register",
  login: "/login",
  resetPwd: "/resetPwd",
  qqlogin: "/qqlogin",
};
const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.registerPassword) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};

const checkCodeUrl = ref(api.checkCodeUrl);
const checkCodeUrlSendMailCode = ref(api.checkCodeUrl);
const changeCheckCode = (type) => {
  if (type == 0) {
    checkCodeUrl.value =
      api.checkCodeUrl + "?type=" + type + "&time=" + new Date().getTime();
  } else {
    checkCodeUrlSendMailCode.value =
      api.checkCodeUrl + "?type=" + type + "&time=" + new Date().getTime();
  }
};

// 0:注册 1：登录  2：重置密码
const opType = ref(1);
const showPanel = (type) => {
  opType.value = type;
  resetForm();
};

onMounted(() => {
  showPanel(1);
});

const formData = ref({
  email: "",
  password: "",
  checkCode: "",
  rememberMe: "",
  emailCode: "",
  nickName: "",
  registerPassword: "",
  reRegisterPassword: "",
});
const formDataRef = ref();
const rules = reactive({
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      validator: proxy.Verify.email,
      message: "请输入正确的邮箱",
      trigger: "blur",
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  emailCode: [{ required: true, message: "请输入邮箱验证码" }],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  registerPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      validator: proxy.Verify.password,
      message: "密码只能是数字, 字母, 特殊字符8-18位",
      trigger: "blur",
    },
  ],
  reRegisterPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    { validator: checkRePassword, message: "两次密码不一致", trigger: "blur" },
  ],
  checkCode: [{ required: true, message: "请输入图片验证码" }],
});

const formDataSendMailCode = ref({
  checkCode: "",
  email: "",
});
const formDataSendMailCodeRef = ref();

const dialogConfigSendMailCode = reactive({
  show: false,
  title: "发送邮箱验证码",
  buttons: [
    {
      type: "primary",
      text: "发送验证码",
      click: (e) => {
        getEmailCode();
      },
    },
  ],
});

const sendMailCode = () => {
  formDataRef.value.validateField("email", (valid) => {
    if (valid) {
      dialogConfigSendMailCode.show = true;
      nextTick(() => {
        changeCheckCode(1); //图片验证码换新
        formDataSendMailCodeRef.value.resetFields();
        formDataSendMailCode.value.email = formData.value.email;
      });
    } else {
      return false;
    }
  });
};
const resetForm = () => {
  formDataRef.value.resetFields();
  changeCheckCode(0);
  formData.value = {
    email: "",
    password: "",
    checkCode: "",
    rememberMe: "",
    emailCode: "",
    nickName: "",
    registerPassword: "",
    reRegisterPassword: "",
  };
  //如果是登录页，尝试取cookie中的登录信息并显示到页面上，实现记住我的功能
  if (opType.value == 1) {
    let cookieLoginInfo = proxy.VueCookies.get("loginInfo");
    if (cookieLoginInfo) {
      formData.value.email = cookieLoginInfo.email;
      formData.value.password = cookieLoginInfo.password;
      formData.value.rememberMe = cookieLoginInfo.rememberMe;
    }
  }
};

const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    if (opType.value == 0 || opType.value == 2) {
      params.password = params.registerPassword;
      delete params.registerPassword;
      delete params.reRegisterPassword;
    }
    if (opType.value == 1) {
      let cookieLoginInfo = proxy.VueCookies.get("loginInfo");
      let cookiePassword = cookieLoginInfo ? cookieLoginInfo.password : null;
      if (params.password != cookiePassword) {
        params.password = md5(params.password);
      }
    }
    let url = null;
    if (opType.value == 0) {
      url = api.register; //注册
    } else if (opType.value == 1) {
      url = api.login; //登录
    } else if (opType.value == 2) {
      url = api.resetPwd; //重置密码
    }
    let result = await proxy.Request({
      url: url,
      params: params,
      errorCallback: () => {
        changeCheckCode(0);
      },
    });
    if (!result) {
      return;
    }
    if (opType.value == 0) {
      proxy.Message.success("注册成功,请登录");
      showPanel(1);
    } else if (opType.value == 1) {
      proxy.Message.success("登录成功");
      proxy.VueCookies.set("userInfo", result.data, 0);
      if (params.rememberMe) {
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe,
        };
        proxy.VueCookies.set("loginInfo", loginInfo, 7);
      } else {
        proxy.VueCookies.remove("loginInfo");
      }

      //跳转到原来的页面
      const redirectUrl = route.query.redirectUrl || "/";
      router.push(decodeURI(redirectUrl));
    } else if (opType.value == 2) {
      proxy.Message.success("密码重置成功,请登录");
      showPanel(1);
    }
  });
};

const getEmailCode = () => {
  formDataSendMailCodeRef.value.validate(async (valid) => {
    if (!valid) {
      return false;
    }
    let params = Object.assign({}, formDataSendMailCode.value);
    if (opType.value == 1) {
      params.type = 0;
    } else if (opType.value == 2) {
      params.type = 1;
    }

    let result = await proxy.Request({
      url: api.sendEmailCodeUrl,
      params: params,
      errorCallback: () => {
        changeCheckCode(1);
      },
    });
    // console.log(result);

    if (!result) {
      return;
    }
    proxy.Message.success("验证码发送成功,请登录你的邮箱查看");
    dialogConfigSendMailCode.show = false;
  });
};

//qq登录
const qqLogin = async () => {
  let result = await proxy.Request({
    url: api.qqlogin,
    params: {
      callbackUrl: route.query.redirectUrl || "", //地址没有中文也可以不解码
    },
  });
  if (!result) {
    return;
  }
  //使用新的认证信息：登录成功之后，应用程序可能会使用新的认证机制（例如令牌）来管理用户会话，
  // 而不是继续依赖 cookie 中的 userInfo。删除旧的 userInfo 可以避免新旧认证信息之间出现冲突。
  proxy.VueCookies.remove("userInfo");
  document.location.href = result.data;
};
</script>

<style lang="scss" scoped>
.login-body {
  height: 100vh;
  background-size: cover;
  // background-color: rgb(231, 226, 226);
  background-color: rgb(234, 241, 254); //填充周围
  display: flex;
  .bg {
    flex: 1;
    background-size: 800px;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url("../assets/login_img.jpg");
    // margin-bottom: 100px;
  }

  .login-panel {
    width: 360px;
    margin-right: 15%;
    margin-top: calc((100vh - 500px) / 2);
    // background-color: pink;

    .login-register {
      padding: 25px;
      background: #fff;
      border-radius: 5px;

      .login-title {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .send-email-panel {
        display: flex;
        width: 100%;
        justify-content: space-between;
        .send-mail-btn {
          margin-left: 5px;
        }
      }
      .rememberme-panel {
        width: 100%;
      }
      .no-account {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .op-btn {
        width: 100%;
      }
      .login-btn-qq {
        width: 100%;
        text-align: center;
        font-size: 14px;
        color: gray;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          height: 24px;
          margin-left: 10px;
          cursor: pointer;
        }
      }
    }
  }
  .check-code-panel {
    width: 100%;
    display: flex;
    .check-code {
      margin-left: 5px;
      cursor: pointer;
      // height: 40px;
      height: 100%;
    }
  }
}
.el-link .el-icon--right.el-icon {
  vertical-align: text-bottom;
}
.checkAgain-code-panel {
  width: 100%;
  display: flex;
  .checkAgain-code {
    margin-left: 5px;
    cursor: pointer;
    // height: 40px;
    height: 100%;
  }
}
</style>
