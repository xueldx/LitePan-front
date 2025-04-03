<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="500px"
      :showCancel="true"
      @close="closeDialog"
    >
      <el-form
        :model="formData"
        ref="formDataRef"
        label-width="80px"
        @submit.prevent
      >
        <!--弹窗表单-->
        <el-form-item label="昵称">
          {{ formData.nickName }}
        </el-form-item>
        <el-form-item label="头像" prop="">
          <!-- 当在自定义组件上使用v-model时，默认会：
            (1) 绑定一个名为modelValue的prop
             (2)监听一个名为update:modelValue的事件
             等价于：<AvatarUpload 
              :modelValue="formData.avatar"  //父传子  
               @update:modelValue="formData.avatar = $event"    //子传父  双向流动数据
                   >
             -->
          <AvatarUpload v-model="formData.avatar" ref="AvatarUploadRef">
          </AvatarUpload>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import AvatarUpload from "@/components/AvatarUpload.vue";
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
const { proxy } = getCurrentInstance();

const api = {
  updateUserAvatar: "/updateUserAvatar",
};

const formData = ref({ nickName: "" });
const formDataRef = ref();
const emit = defineEmits();

const dialogConfig = ref({
  show: false,
  title: "修改头像",
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
//接收到framework传递过来的用户信息
const show = (data) => {
  formData.value = Object.assign({}, data); //当前form就可以用nickName了
  formData.value.avatar = { userId: data.userId, qqAvatar: data.avatar };
  dialogConfig.value.show = true;
};
defineExpose({ show }); //暴露出去，让组件实例在外部也能调用自己的show方法展示自己，敬业的打工人

const AvatarUploadRef = ref();
const closeDialog = () => {
  //没点击确认直接关闭or取消，则清掉本次上传的local信息
  AvatarUploadRef.value.clearLocalFile(); //清除缓存，否则下次打开头像上传处还是展示上次缓存
  dialogConfig.value.show = false;
};

const submitForm = async () => {
  AvatarUploadRef.value.clearLocalFile(); //清除缓存，否则下次打开头像上传处还是展示上次缓存
  if (!formData.value.avatar instanceof File) {
    //用户没有新上传头像，直接关闭
    dialogConfig.value.show = false;
    return;
  }
  let result = await proxy.Request({
    url: api.updateUserAvatar,
    params: {
      avatar: formData.value.avatar,
    },
  });
  if (!result) return;
  //上传头像成功
  dialogConfig.value.show = false;
  //更新cookie
  let cookieInfo = proxy.VueCookies.get("userInfo");
  delete cookieInfo.avatar; //删除旧的头像缓存
  proxy.VueCookies.set("userInfo", cookieInfo, 0);
  //通知framework组件更新头像信息
  emit("reloadAvatar");
};
</script>

<style lang="scss" scoped>
</style>
