<template>
  <!-- 没有数据/文件的显示 -->
  <div class="no-data">
    <Icon :width="100" iconName="no_data1"></Icon>
    <div class="msg">{{ msg }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  msg: {
    type: String,
  },
});
</script>

<style lang="scss" scoped>
.no-data {
  margin-top: 10px;
  text-align: center;
  padding: 10px 0px;

  .msg {
    margin-top: 10px;
    color: #909399;
    font-size: 14px;
  }
}
</style>