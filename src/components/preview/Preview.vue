<template>
  <PreviewImage
    ref="imageViewRef"
    :imageList="[imageUrl]"
    v-if="fileInfo.fileCategory == 3"
  ></PreviewImage>
  <Window
    :show="windowShow"
    @close="windowShow = false"
    :width="fileInfo.fileCategory == 1 ? 1300 : 900"
    :title="fileInfo.fileName"
    :align="fileInfo.fileCategory == 1 ? 'center' : 'flex-start'"
    v-else
  >
    <!--  `file_type` 1:视频 2:音频  3:图片 4:pdf 5:doc 6:excel 7:txt 8:code 9:zip 10:其他', -->
    <PreviewVideo :url="url" v-if="fileInfo.fileCategory == 1"> </PreviewVideo>
    <PreviewDoc :url="url" v-if="fileInfo.fileType == 5"> </PreviewDoc>
    <PreviewExcel :url="url" v-if="fileInfo.fileType == 6"> </PreviewExcel>
    <PreviewPdf :url="url" v-if="fileInfo.fileType == 4"> </PreviewPdf>
    <PreviewTxt
      :url="url"
      v-if="fileInfo.fileType == 7 || fileInfo.fileType == 8"
    >
    </PreviewTxt>
    <PreviewMusic
      :url="url"
      :fileName="fileInfo.fileName"
      v-if="fileInfo.fileCategory == 2"
    >
    </PreviewMusic>
    <PreviewDownload
      :createDownloadUrl="createDownloadUrl"
      :downloadUrl="downloadUrl"
      :fileInfo="fileInfo"
      v-if="fileInfo.fileCategory == 5 && fileInfo.fileType != 8"
    >
    </PreviewDownload>
  </Window>
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
import PreviewImage from "./PreviewImage.vue";
import PreviewVideo from "./PreviewVideo.vue";
import PreviewDoc from "./PreviewDoc.vue";
import PreviewExcel from "./PreviewExcel.vue";
import PreviewPdf from "./PreviewPdf.vue";
import PreviewTxt from "./PreviewTxt.vue";
import PreviewMusic from "./PreviewMusic.vue";
import PreviewDownload from "./PreviewDownload.vue";

const { proxy } = getCurrentInstance();

const FILE_URL_MAP = {
  0: {
    fileUrl: "/file/getFile",
    videoUrl: "/file/ts/getVideoInfo",
    createDownloadUrl: "/file/createDownloadUrl",
    downloadUrl: "/api/file/download",
  },
  1: {
    fileUrl: "/admin/getFile",
    videoUrl: "/admin/ts/getVideoInfo",
    createDownloadUrl: "/admin/createDownloadUrl",
    downloadUrl: "/api/admin/download",
  },
  2: {
    fileUrl: "/showShare/getFile",
    videoUrl: "/showShare/ts/getVideoInfo",
    createDownloadUrl: "/showShare/createDownloadUrl",
    downloadUrl: "/api/showShare/download",
  },
};
const imageViewRef = ref();
const fileInfo = ref({});
//文件地址
const url = ref(null);
// 下载地址
const createDownloadUrl = ref(null);
const downloadUrl = ref(null);

const windowShow = ref(false);

const imageUrl = computed(() => {
  return (
    proxy.globalInfo.imageUrl + fileInfo.value.fileCover.replaceAll("_.", ".")
  );
});
const showPreview = (data, showPart) => {
  fileInfo.value = data;
  // `file_category`  '1:视频 2:音频  3:图片 4:文档 5:其他',
  if (data.fileCategory == 3) {
    nextTick(() => {
      imageViewRef.value.show(0);
    });
  } else {
    windowShow.value = true;
    let _url = FILE_URL_MAP[showPart].fileUrl;
    // 视频地址单独处理
    if (data.fileCategory == 1) {
      _url = FILE_URL_MAP[showPart].videoUrl;
    }
    // 文件下载
    let _createDownloadUrl = FILE_URL_MAP[showPart].createDownloadUrl;
    let _downloadUrl = FILE_URL_MAP[showPart].downloadUrl;

    if (showPart == 0) {
      _url = _url + "/" + data.fileId;
      _createDownloadUrl = _createDownloadUrl + "/" + data.fileId;
    } else if (showPart == 1) {
      //todo Check uerId? userId
      _url = _url + "/" + data.userId + "/" + data.fileId;
      _createDownloadUrl =
        _createDownloadUrl + "/" + data.userId + "/" + data.fileId;
    } else if (showPart == 2) {
      _url = _url + "/" + data.shareId + "/" + data.fileId;
      _createDownloadUrl =
        _createDownloadUrl + "/" + data.shareId + "/" + data.fileId;
    }
    url.value = _url;
    createDownloadUrl.value = _createDownloadUrl;
    downloadUrl.value = _downloadUrl;
  }
};

defineExpose({ showPreview });
</script>

<style lang="scss" scoped>
</style>
