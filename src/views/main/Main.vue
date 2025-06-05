<template>
  <div>
    <div class="top">
      <div class="top-op">
        <div class="btn">
          <!-- show-file-list	是否显示已上传文件列表 -->
          <!-- with-credentials	支持发送 cookie 凭证信息 -->
          <!-- multiple	是否支持多选文件 -->
          <!-- http-request	覆盖默认的 Xhr 行为，允许自行实现上传文件的请求 -->
          <!-- accept	接受上传的文件类型 -->
          <el-upload
            :show-file-list="false"
            :with-credentials="true"
            :multiple="true"
            :http-request="addFile"
            :accept="fileAccept"
          >
            <el-button type="primary">
              <span class="iconfont icon-upload"></span>
              上传
            </el-button>
          </el-upload>
        </div>
        <el-button type="success" @click="newFolder">
          <span class="iconfont icon-folder-add"></span>
          新建文件夹
        </el-button>
        <el-button
          type="danger"
          :disabled="selectFileIdList.length == 0"
          @click="delFileBatch"
        >
          <span class="iconfont icon-del"></span>
          批量删除
        </el-button>
        <el-button
          type="warning"
          :disabled="selectFileIdList.length == 0"
          @click="moveFolderBatch"
        >
          <span class="iconfont icon-move"></span>
          批量移动
        </el-button>
        <div class="search-panel">
          <el-input
            clearable
            placeholder="搜索当前目录下的文件"
            v-model.trim="fileNameFuzzy"
            @keyup.enter="search"
          >
            <template #suffix>
              <i
                style="cursor: pointer"
                class="iconfont icon-search"
                @click="search"
              ></i> </template
          ></el-input>
        </div>
        <div
          :class="['iconfont', 'icon-refresh', isRotating ? 'rotate' : '']"
          @click="
            loadDataList();
            isRotating = true;
          "
          @animationend="isRotating = false"
        ></div>
      </div>
      <!--导航-->
      <Navigation ref="navigationRef" @navChange="navChange"></Navigation>
    </div>
    <!--文件列表-->
    <div class="file-list" v-if="tableData.list && tableData.list.length > 0">
      <Table
        ref="dataTableRef"
        :columns="columns"
        :dataSource="tableData"
        :fetch="loadDataList"
        :initFetch="false"
        :options="tableOptions"
        @rowSelected="rowSelected"
      >
        <template #fileName="{ index, row }">
          <div
            class="file-item"
            @mouseenter="showOp(row)"
            @mouseleave="cancelShowOp(row)"
          >
            <!-- 显示文件图标 -->
            <template
              v-if="(row.fileType == 3 || row.fileType == 1) && row.status == 2"
            >
              <!-- 如果文件类型是图片或者视频,且已经成功转码,则执行 Icon中的cover -->
              <Icon :cover="row.fileCover" :width="32"></Icon>
            </template>
            <template v-else>
              <!-- 如果文件类型是具体文件,则文件类型是该文件类型 -->
              <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
              <!-- 如果文件类型是目录,则文件类型就是目录0 -->
              <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
            </template>

            <!-- 显示文件名称 -->
            <!-- v-if="!row.showEdit" 如果该行文件没有编辑 -->
            <span class="file-name" :title="row.fileName" v-if="!row.showEdit">
              <span @click="preview(row)">{{ row.fileName }}</span>
              <span v-if="row.status == 0" class="transfer-status">转码中</span>
              <span v-if="row.status == 1" class="transfer-status transfer-fail"
                >转码失败</span
              >
            </span>

            <!-- 点击新建文件夹时或点击重命名时显示行 -->
            <div class="edit-panel" v-if="row.showEdit">
              <el-input
                v-model.trim="row.fileNameReal"
                ref="editNameRef"
                :maxLength="190"
                @keyup.enter="saveNameEdit(index)"
              >
                <template #suffix>{{ row.fileSuffix }}</template>
              </el-input>

              <!-- 对号 确定 -->
              <span
                :class="[
                  'iconfont icon-right1',
                  row.fileNameReal ? '' : 'not-allow',
                ]"
                @click="saveNameEdit(index)"
              ></span>

              <!-- 叉号 取消 -->
              <span
                class="iconfont icon-error"
                @click="cancelNameEdit(index)"
              ></span>
            </div>

            <!-- 当鼠标放在当前行时显示 -->
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1" @click="share(row)">
                  分享
                </span>
                <!-- 是文件时才可下载,文件夹不能下载 -->
                <span
                  class="iconfont icon-download"
                  v-if="row.folderType == 0"
                  @click="download(row)"
                >
                  下载
                </span>
                <span class="iconfont icon-del" @click="delFile(row)">
                  删除
                </span>
                <span class="iconfont icon-edit" @click="editFileName(index)">
                  重命名
                </span>
                <span class="iconfont icon-move" @click="moveFolder(row)">
                  移动
                </span>
              </template>
            </span>
          </div>
        </template>
        <!-- 文件大小 -->
        <template #fileSize="{ index, row }">
          <span v-if="row.fileSize">
            {{ proxy.Utils.size2Str(row.fileSize) }}</span
          >
        </template>
      </Table>
    </div>
    <div class="no-data" v-else>
      <div class="no-data-inner">
        <Icon iconName="no_data" :width="120" fit="fill"></Icon>
        <div class="tips">当前目录为空，上传你的第一个文件吧</div>
        <div class="op-list">
          <el-upload
            :show-file-list="false"
            :with-credentials="true"
            :multiple="true"
            :http-request="addFile"
            :accept="fileAccept"
          >
            <div class="op-item">
              <Icon iconName="file" :width="60"></Icon>
              <div>上传文件</div>
            </div>
          </el-upload>
          <div class="op-item" v-if="category == 'all'" @click="newFolder">
            <Icon iconName="folder" :width="60"></Icon>
            <div>新建目录</div>
          </div>
        </div>
      </div>
    </div>
    <FolderSelect
      ref="folderSelectRef"
      @folderSelect="moveFolderDone"
    ></FolderSelect>
    <!--预览-->
    <Preview ref="previewRef"> </Preview>
    <!--分享-->
    <ShareFile ref="shareFileRef"> </ShareFile>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  getCurrentInstance,
  nextTick,
  onMounted,
  computed,
} from "vue";
import CategoryInfo from "@/js/CategoryInfo.js";
import ShareFile from "./ShareFile.vue";

import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

const folderSelectRef = ref();
// 实现上传文件的请求
// 将Main子组件页面的数据(上传的文件和它对应的所在目录信息)传递给Framwork父组件
const emit = defineEmits(["addFile"]);
const addFile = async (fileData) => {
  emit("addFile", { file: fileData.file, filePid: currentFolder.value.fileId });
};

const api = {
  loadDataList: "/file/loadDataList",
  rename: "/file/rename",
  newFoloder: "/file/newFoloder",
  getFolderInfo: "/file/getFolderInfo",
  delFile: "/file/delFile",
  changeFileFolder: "/file/changeFileFolder",
  createDownloadUrl: "/file/createDownloadUrl",
  download: "/api/file/download",
};
const dataTableRef = ref();
const fileAccept = computed(() => {
  const categoryItem = CategoryInfo[category.value];
  return categoryItem ? categoryItem.accept : "*";
});
//列表头信息
const columns = ref([
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "修改时间",
    prop: "lastUpdateTime",
    width: 200,
  },
  {
    label: "文件大小",
    prop: "fileSize",
    scopedSlots: "fileSize",
    width: 200,
  },
]);

const tableData = ref({});
// 表格选项
const tableOptions = {
  extHeight: 50,
  selectType: "checkbox",
};
// 搜索的模糊文件名
const fileNameFuzzy = ref();

const showLoading = ref(true);
// 分类
const category = ref();
// 当前文件夹，fileId: 0  代表根目录
const currentFolder = ref({ fileId: 0 });

// 获得数据;
const loadDataList = async () => {
  let params = {
    // 页码
    pageNo: tableData.value.pageNo,
    // 分页大小
    pageSize: tableData.value.pageSize,
    // 文件名（模糊）
    fileNameFuzzy: fileNameFuzzy.value,
    // 分类
    category: category.value,
    // 文件父id
    filePid: currentFolder.value.fileId,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }
  let result = await proxy.Request({
    url: api.loadDataList,
    showLoading: showLoading.value,
    params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
  // editing.value = false;
};
const reload = () => {
  showLoading.value = false;
  loadDataList();
};
defineExpose({ reload });

//当前目录搜索文件
const search = () => {
  showLoading.value = true;
  loadDataList();
};
//控制刷新Icon动画效果是否开启
const isRotating = ref(false);

// 当鼠标放在当前行时,分享下载等图标出现
const showOp = (row) => {
  // 关闭所有的显示
  tableData.value.list.forEach((element) => {
    element.showOp = false;
  });
  // 只开启当前显示
  row.showOp = true;
};

const cancelShowOp = (row) => {
  row.showOp = false;
};

// 编辑行(新建文件夹时编辑行)
// 当前编辑行状态
const editing = ref(false);
// 新建文件夹行内填充的内容绑定
const editNameRef = ref();

// 新建文件夹
const newFolder = () => {
  // 如果当前编辑行存在,则再次点击新建文件夹按钮时不起作用
  if (editing.value) {
    return;
  }
  // 让其他行都不允许编辑
  tableData.value.list.forEach((element) => {
    element.showEdit = false;
  });
  editing.value = true;
  tableData.value.list.unshift({
    showEdit: true,
    fileType: 0,
    fileId: "",
    filePid: currentFolder.value.fileId,
  });
  nextTick(() => {
    editNameRef.value.focus();
  });
};

// 取消新建文件夹操作
const cancelNameEdit = (index) => {
  const fileData = tableData.value.list[index];
  // 如果存在这个文件的话,说明此处是重命名操作,那么可以直接将编辑行关闭
  if (fileData.fileId) {
    fileData.showEdit = false;
  } else {
    // 如果不存在的话,则说明取消新建文件夹，那么直接将此行删除
    tableData.value.list.splice(index, 1);
  }
  // 当前编辑行状态为:未编辑
  editing.value = false;
};

// 确定新建文件夹操作
const saveNameEdit = async (index) => {
  const { fileId, filePid, fileNameReal } = tableData.value.list[index];
  if (fileNameReal == "" || fileNameReal.indexOf("/") != -1) {
    proxy.Message.warning("文件名不能为空且不能含有斜杠");
    return;
  }
  // 重命名
  let url = api.rename;
  if (fileId == "") {
    // 当文件ID不存在时,新建目录
    url = api.newFoloder;
  }
  let result = await proxy.Request({
    url: url,
    params: {
      fileId,
      filePid: filePid,
      fileName: fileNameReal,
    },
  });
  if (!result) {
    return;
  }
  tableData.value.list[index] = result.data;
  editing.value = false;
};

// 重命名 编辑文件名
const editFileName = (index) => {
  // 如果现在有新建文件夹的编辑行,那么先将其删除,并且将序号减一
  if (tableData.value.list[0].fileId == "") {
    tableData.value.list.splice(0, 1);
    index = index - 1;
  }
  tableData.value.list.forEach((element) => {
    element.showEdit = false;
  });
  let cureentData = tableData.value.list[index];
  cureentData.showEdit = true;

  //编辑文件
  if (cureentData.folderType == 0) {
    cureentData.fileNameReal = cureentData.fileName.substring(
      0,
      cureentData.fileName.indexOf(".")
    );
    cureentData.fileSuffix = cureentData.fileName.substring(
      cureentData.fileName.indexOf(".")
    );
  } else {
    cureentData.fileNameReal = cureentData.fileName;
    cureentData.fileSuffix = "";
  }

  // 当前编辑行状态为true
  editing.value = true;
  nextTick(() => {
    editNameRef.value.focus();
  });
};

const selectFileIdList = ref([]);
//行选中
const rowSelected = (rows) => {
  selectFileIdList.value = []; //清空上一次的
  rows.forEach((item) => {
    selectFileIdList.value.push(item.fileId);
  });
  columns.value[0].label =
    selectFileIdList.value.length == 0
      ? "文件名"
      : `已选中${selectFileIdList.value.length}个文件/文件夹`;
};

const delFile = (row) => {
  //开始删除单个文件操作
  proxy.Confirm(
    `你确定要删除【${row.fileName}】吗？被删除的文件10天内可在回收站还原`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIds: row.fileId,
        },
      });
      if (!result) return;
      //刷新页面
      loadDataList();
    }
  );
};
const delFileBatch = () => {
  if (selectFileIdList.value.length == 0) return;
  //开始删除操作
  proxy.Confirm(
    `你确定要删除这些文件吗？被删除的文件10天内可在回收站还原`,
    async () => {
      let result = await proxy.Request({
        url: api.delFile,
        params: {
          fileIds: selectFileIdList.value.join(","),
        },
      });
      if (!result) return;
      //刷新页面
      loadDataList();
    }
  );
};

const currentMoveFile = ref({});
const moveFolder = (data) => {
  currentMoveFile.value = data;
  //不过滤当前目录，因为可能要移到当前目录下的文件夹，过滤掉当前目录了就找不到目标文件夹了
  folderSelectRef.value.showFolderDialog();
  // folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
};
const moveFolderBatch = () => {
  currentMoveFile.value = {};
  //不过滤当前目录，因为可能要移到当前目录下的文件夹
  folderSelectRef.value.showFolderDialog();
  // folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
};

//参数就是想要移动到的文件夹id
const moveFolderDone = async (folderId) => {
  if (folderId == currentFolder.value.fileId) {
    proxy.Message.warning("文件正在当前目录，无需移动");
    return;
  }
  let fileIdsArray = [];
  if (currentMoveFile.value.fileId) {
    //单个文件移动
    fileIdsArray.push(currentMoveFile.value.fileId);
  } else {
    //多个文件移动
    fileIdsArray = fileIdsArray.concat(selectFileIdList.value);
    // fileIdsArray = selectFileIdList.value;
  }
  let result = await proxy.Request({
    url: api.changeFileFolder,
    params: {
      fileIds: fileIdsArray.join(","),
      filePid: folderId,
    },
  });
  if (!result) return;
  // 调用子组件暴露的close方法，实现当前弹出框页面的关闭
  folderSelectRef.value.close();
  //如果成功，刷新数据
  loadDataList();
};

const navigationRef = ref();
const previewRef = ref();
const preview = (data) => {
  //点击的是文件夹
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data);
    return;
  }
  if (data.status != 2) {
    proxy.Message.warning("文件正在转码中，无法预览，请刷新重试");
    return;
  }
  previewRef.value.showPreview(data, 0);
};
const navChange = (data) => {
  const { categoryId, curFolder } = data;
  category.value = categoryId;
  showLoading.value = true;
  currentFolder.value = curFolder;
  loadDataList();
};
// 下载文件
const download = async (row) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + row.fileId,
  });

  if (!result) {
    return;
  }

  window.location.href = api.download + "/" + result.data;
};
//分享
const shareFileRef = ref();
const share = (row) => {
  shareFileRef.value.show(row);
};
</script>

<style lang="scss" scoped>
@import "@/assets/file.list.scss";
</style>     
