<template>
  <div class="not-found">
    <div class="content">
      <div class="iconfont icon-error"></div>
      <div class="text">404 - 页面未找到</div>
      <div class="desc">抱歉，您访问的页面不存在</div>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<style lang="scss" scoped>
.not-found {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;

  .content {
    text-align: center;

    .iconfont {
      font-size: 100px;
      color: #909399;
    }

    .text {
      font-size: 24px;
      color: #303133;
      margin: 20px 0;
    }

    .desc {
      font-size: 16px;
      color: #606266;
      margin-bottom: 20px;
    }
  }
}
</style> 