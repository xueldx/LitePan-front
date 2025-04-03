<template>
  <!-- 导航 -->
  <div class="top-navigation">
    <template v-if="folderList.length > 0">
      <span class="back link" @click="backParent">返回上一级</span>
      <el-divider direction="vertical" />
    </template>
    <span v-if="folderList.length == 0" class="all-file">全部文件</span>
    <span
      class="link"
      v-if="folderList.length > 0"
      @click="setCurrentFolder(-1)"
      >全部文件</span
    >
    <template v-for="(item, index) in folderList" :key="index">
      <span class="iconfont icon-right"></span>
      <span
        class="link"
        v-if="index < folderList.length - 1"
        @click="setCurrentFolder(index)"
        >{{ item.fileName }}</span
      >
      <span class="text" v-if="index == folderList.length - 1">{{
        item.fileName
      }}</span>
    </template>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  nextTick,
  onMounted,
  watch,
} from "vue";
const { proxy } = getCurrentInstance();
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const props = defineProps({
  watchPath: {
    type: Boolean,
    default: true,
  },
  shareId: {
    type: String,
  },
  adminShow: {
    type: Boolean,
    default: false,
  },
});

const category = ref();
const api = {
  // 首页 获取当前目录 获取列表 参数（path：完整路径）
  getFolderInfo: "/file/getFolderInfo",
  // 外部分享 获取目录信息 参数（shareId：分享id / path：完整路径）
  getFolderInfo4Share: "/showShare/getFolderInfo",
  // 管理员 获取当前目录 参数（path：完整路径）
  getFolderInfo4Admin: "/admin/getFolderInfo",
};
//目录集合
const folderList = ref([]);
// 当前目录
const currentFolder = ref({ fileId: "0" });

const openFolder = (data) => {
  const { fileId, fileName } = data;
  const folder = { fileId, fileName };
  folderList.value.push(folder);
  currentFolder.value = folder;

  setPath();
};

defineExpose({ openFolder });

// 初始化
const init = () => {
  folderList.value = [];
  currentFolder.value = { fileId: "0" };
  doCallback();
};
//改变页面路由查询参数
const setPath = () => {
  if (!props.watchPath) {
    doCallback();
    return;
  }
  const pathArray = [];
  folderList.value.forEach((item) => {
    pathArray.push(item.fileId);
  });
  router.push({
    path: route.path,
    query: pathArray.length == 0 ? "" : { path: pathArray.join("/") },
  });
};

const getNavigationFolder = async (path) => {
  let url = api.getFolderInfo;
  if (props.shareId) url = api.getFolderInfo4Share;
  if (props.adminShow) url = api.getFolderInfo4Admin;
  let result = await proxy.Request({
    url: url,
    showLoading: false,
    params: {
      path: path,
      shareId: props.shareId,
    },
  });
  if (!result) return;
  folderList.value = result.data;
};

// 回调 将当前的参数传递给父组件 Main,根据新的分类和当前目录去请求新的数据
const emit = defineEmits(["navChange"]);
const doCallback = () => {
  emit("navChange", {
    categoryId: category.value,
    curFolder: currentFolder.value,
  });
};
//监听文件夹切换路由，加载对应页面
watch(
  () => route,
  (newVal, oldVal) => {
    if (!props.watchPath) return;
    //当不处于全部页，也不需要监听文件夹切换（详细分类里没有文件夹）
    if (newVal.path.indexOf("/main") === -1) return;
    //否则取出查询参数和分类，请求后端接口
    const path = newVal.query.path;
    category.value = newVal.params.category;
    if (path == undefined) {
      init();
    } else {
      getNavigationFolder(path);
      let pathArray = path.split("/");
      currentFolder.value = { fileId: pathArray[pathArray.length - 1] };
      doCallback();
    }
  },
  { immediate: true, deep: true }
);

const setCurrentFolder = (index) => {
  if (index == -1) {
    folderList.value = [];
    currentFolder.value = { fileId: "0" };
  } else {
    // folderList.value = folderList.value.slice(0, index + 1);
    //效果一样，但splice方法直接改变原数组，而slice方法不会改变原数组
    //如果不需要保留原数组：使用 splice 方法更合适。
    // 因为 splice 方法直接在原数组上进行修改，不会额外创建新的数组，节省了内存空间
    folderList.value.splice(index + 1, folderList.value.length);
    currentFolder.value = folderList.value[index];
  }
  setPath();
};

//返回上一级
const backParent = () => {
  setCurrentFolder(folderList.value.length - 2);
};
</script>

<style lang="scss" scoped>
.top-navigation {
  font-size: 13px;
  display: flex;
  align-items: center;
  line-height: 40px;
  .all-file {
    font-weight: bold;
  }
  .link {
    color: #06a7ff;
    cursor: pointer;
  }
  .icon-right {
    color: #06a7ff;
    padding: 0px 5px;
    font-size: 13px;
  }
}
</style>
