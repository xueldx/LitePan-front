<template>
  <div>
    <el-dialog
      :title="title"
      :model-value="show"
      :draggable="true"
      :show-close="showColse"
      :width="width"
      :center="center"
      @close="close"
      :close-on-click-modal="false"
      :append-to-body="true"
      class="cust-dialog"
      align-center
    >
      <div
        class="dialog-body"
        :style="{ padding: padding + 'px ' + paddinglr + 'px' }"
      >
        <slot></slot>
        <!-- 外层的自定义内容就往插槽里面放 -->
      </div>
      <template v-if="(buttons && buttons.length > 0) || showCancel">
        <div class="dialog-footer">
          <el-button @click="close" v-if="showCancel" plain round>
            取消
          </el-button>
          <template v-for="(btn, index) in buttons" :key="index">
            <el-button
              v-if="btn.isShow == undefined ? true : btn.isShow"
              :type="btn.type || 'primary'"
              round
              @click="btn.click"
            >
              {{ btn.text }}
            </el-button>
          </template>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: "",
  },
  showColse: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: "30%",
  },
  buttons: {
    type: Array,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  padding: {
    type: Number,
    default: 15,
  },
  paddinglr: {
    type: Number,
    default: 20,
  },
  center: {
    type: Boolean,
    default: false,
  },
});

// const maxHeight = (window.innerHeight = props.top - 100)

const emit = defineEmits();

const close = () => {
  emit("close");
};
</script>
<style lang="scss">
.cust-dialog {
  margin-top: 100px;
  max-height: calc(100vh - 100px);
  border-radius: 12px;
  // margin: 30px auto 10px !important;
  .el-dialog__body {
    padding: 0px;
  }
  .dialog-body {
    min-height: 80px;
    overflow: auto;
    border-bottom: 1px solid #e0e0e0;
    border-top: 1px solid #e0e0e0;
  }
  .dialog-footer {
    text-align: right;
    padding: 20px 0px 5px 5px;
  }
}
</style>
