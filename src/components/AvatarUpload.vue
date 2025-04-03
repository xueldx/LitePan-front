<template>
  <!-- 头像上传 -->
  <div class="avatar-upload">
    <div class="avatar-show">
      <template v-if="localFile">
        <img :src="localFile" />
      </template>
      <template v-else>
        <!-- 
        <img
          :src="`${modelValue.qqAvatar}`"
          v-if="modelValue && modelValue.qqAvatar"
        />
        -->
        <img
          :src="`${proxy.globalInfo.avatarUrl}${
            modelValue.userId
          }?${new Date().getTime()}`"
          v-if="modelValue && modelValue.userId"
        />
      </template>
    </div>
    <div class="select-btn">
      <el-upload
        name="file"
        :show-file-list="false"
        accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
        :multiple="false"
        :http-request="uploadImage"
      >
        <el-button type="primary">选择</el-button>
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { useRouter, useRoute } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const timestamp = ref("");

// defineProps是一个函数 定义后props可直接在模板中使用，或者在setup其他地方使用
const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

// 本地图片
const localFile = ref(null);
// 子组件向父组件传值
const emit = defineEmits();
// 上传图片
const uploadImage = async (file) => {
  file = file.file; // 获取上传文件对象
  let img = new FileReader(); // 创建FileReader实例用于读取文件
  img.readAsDataURL(file); // 将文件读取为DataURL格式（base64编码）
  img.onload = ({ target }) => {
    // 文件读取完成后的回调函数
    localFile.value = target.result; // 将读取的base64图片数据赋值给localFile变量用于预览
  };
  emit("update:modelValue", file);
};

const clearLocalFile = () => {
  localFile.value = null;
  //不从本地取头像
};
defineExpose({
  clearLocalFile,
});
</script>

<style lang="scss">
.avatar-upload {
  display: flex;
  justify-content: center;
  align-items: end;
  .avatar-show {
    background: rgb(245, 245, 245);
    width: 150px;
    height: 150px;
    // border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    .iconfont {
      font-size: 50px;
      color: #ddd;
    }
    img {
      height: 100%;
      width: 100%;
      object-fit: cover; //保持等比例不失真
    }
    .op {
      position: absolute;
      color: #0e8aef;
      top: 80px;
    }
  }
  .select-btn {
    margin-left: 10px;
    vertical-align: bottom;
  }
}
</style>