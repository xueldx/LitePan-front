<template>
  <div>
    <Dialog
      :show="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="600px"
      :showCancel="true"
      @close="dialogConfig.show = false"
    >
      <div class="navigation-panel">
        <!--导航-->
        <Navigation
          ref="navigationRef"
          @navChange="navChange"
          :watchPath="false"
        ></Navigation>
      </div>
      <div class="folder-list" v-if="folderList.length > 0">
        <div
          class="folder-item"
          v-for="(item, index) in folderList"
          :key="index"
          @click="selectFolder(item)"
        >
          <Icon :fileType="0" />
          <div class="file-name">{{ item.fileName }}</div>
        </div>
      </div>
      <div v-else class="tips">
        移动到 <span>{{ currentFolder.fileName }}</span
        >文件夹
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
const { proxy } = getCurrentInstance();
const api = {
  loadAllFolder: "/file/loadAllFolder",
};

const dialogConfig = ref({
  show: false,
  title: "移动到",
  buttons: [
    {
      type: "primary",
      text: "移动到此",
      click: (e) => {
        folderSelect();
      },
    },
  ],
});

const navigationRef = ref();
//根据点击的父级目录加载其下的各级目录
const filePid = ref("0");
const currentFileIds = ref({}); //过滤掉当前选中文件所在的目录（本就在此，不用再移到此）
const currentFolder = ref({});
const folderList = ref([]);
const loadAllFolder = async () => {
  let result = await proxy.Request({
    url: api.loadAllFolder,
    params: {
      filePid: filePid.value,
      currentFileIds: currentFileIds.value,
    },
  });
  if (!result) {
    return;
  }
  folderList.value = result.data;
};

const close = () => {
  dialogConfig.value.show = false;
};
//不过滤当前目录版
const showFolderDialog = () => {
  dialogConfig.value.show = true;
  loadAllFolder();
};
//过滤版
// const showFolderDialog = (curFolderId) => {
//   dialogConfig.value.show = true;
//   currentFileIds.value = curFolderId;
//   loadAllFolder();
// };
defineExpose({ showFolderDialog, close });

const emit = defineEmits(["folderSelect"]);
//点击确认，在父级组件中移动到目标文件夹
const folderSelect = () => {
  emit("folderSelect", filePid.value); //把移动到的目标文件夹的id传递给父级组件
};
//文件夹被选择
const selectFolder = (data) => {
  navigationRef.value.openFolder(data);
  currentFolder.value = data;
};

//接收到当前被选择的文件夹，加载对应文件夹下的文件夹
const navChange = (data) => {
  const { curFolder } = data;
  filePid.value = curFolder.fileId;
  loadAllFolder();
};
</script>

<style lang="scss" scoped>
.navigation-panel {
  padding-left: 10px;
  background: #f1f1f1;
}
.folder-list {
  .folder-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 10px;
    .file-name {
      display: inline-block;
      margin-left: 10px;
    }
    &:hover {
      background: #f8f8f8;
    }
  }
  max-height: calc(100vh - 200px);
  min-height: 200px;
}
.tips {
  text-align: center;
  line-height: 200px;
  span {
    color: #0e5bff;
  }
}
</style>

