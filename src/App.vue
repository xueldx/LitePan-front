<template>
  <!-- element-plus 全局配置 显示中文 -->
  <el-config-provider :locale="locale" :message="config">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import { reactive } from "vue";
// 导入element-plus中文语言包
import zhCn from "element-plus/es/locale/lang/zh-cn";
// 设置中文语言
const locale = zhCn;
const config = reactive({
  max: 1, // 最大显示消息数量
});
</script>

<style lang="scss" scoped>
</style>
