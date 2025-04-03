<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      :showCancel="true"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formDataRef"
        label-width="80px"
        @submit.prevent
      >
        <!--修改密码form-->
        <el-form-item label="新密码" prop="password">
          <el-input
            clearable
            size="large"
            type="password"
            show-password
            placeholder="请输入密码"
            v-model.trim="formData.password"
          >
            <template #prefix>
              <span class="iconfont icon-password"> </span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="rePassword">
          <el-input
            clearable
            size="large"
            type="password"
            show-password
            placeholder="请再次输入密码"
            v-model.trim="formData.rePassword"
          >
            <template #prefix>
              <span class="iconfont icon-password"> </span>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
const { proxy } = getCurrentInstance();
const api = {
  updatePassword: "/updatePassword",
};
const formData = ref({
  password: "",
  rePassword: "",
});
const formDataRef = ref();

const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};
const rules = {
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      validator: proxy.Verify.password,
      message: "密码只能是数字, 字母, 特殊字符8-18位",
      trigger: "blur",
    },
  ],
  rePassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    { validator: checkRePassword, message: "两次密码不一致", trigger: "blur" },
  ],
};

const dialogConfig = ref({
  show: false,
  title: "修改密码",
  buttons: [
    {
      type: "primary",
      text: "确定",
      click: (e) => {
        submitForm();
      },
    },
  ],
});

const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.updatePassword,
      params: {
        password: formData.value.password,
      },
    });
    if (!result) return;
    dialogConfig.value.show = false;
    proxy.Message.success("密码修改成功");
  });
};

const show = () => {
  dialogConfig.value.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = {
      password: "",
      rePassword: "",
    };
  });
};
defineExpose({ show });
</script>

<style lang="scss" scoped>
</style>
