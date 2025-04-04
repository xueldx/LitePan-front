<template>
  <div ref="player" id="player"></div>
</template>

<script setup>
import DPlayer from "dplayer";
import { nextTick, onMounted, ref, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
  },
});

const videoInfo = ref({
  video: null,
});

const player = ref();
const initPlayer = () => {
  // theme	'#b7daff'	主题色
  // screenshot	false	开启截图，如果开启，视频和视频封面需要允许跨域
  // video	-	视频信息
  // video.url	-	视频链接
  // video.type	'auto'	可选值: 'auto', 'hls', 'flv', 'dash', 'webtorrent', 'normal' 或其他自定义类型,
  // video.customType	-	自定义类型
  // 创建DPlayer播放器实例
  const dp = new DPlayer({
    // 播放器挂载的DOM元素
    element: player.value,
    // 播放器主题颜色
    theme: "#b7daff",
    // 启用截图功能
    screenshot: true,
    // 视频配置
    video: {
      // 视频源地址，通过props.url传入，并添加/api前缀
      url: `/api${props.url}`,
      // 使用自定义的HLS流媒体类型
      type: "customHls",
      // 自定义类型处理器
      customType: {
        // 自定义HLS处理函数
        customHls: function (video, player) {
          // 创建HLS.js实例
          const hls = new Hls();
          // 加载视频源（即请求得到的m3u8文件）
          hls.loadSource(video.src);
          // 将HLS播放器附加到video元素上
          hls.attachMedia(video);
          /*
          首先解析 m3u8 文件
          识别出所有的 .ts 分片文件路径
          根据播放进度，自动请求需要的 .ts 分片
          将获取到的分片解码并送入播放器缓冲区
          DPlayer 只负责界面交互和播放控制
          HLS.js 负责底层的流媒体传输和解码工作
          */
        },
      },
    },
  });
};

onMounted(() => {
  initPlayer();
});
</script>

<style lang="scss" scoped>
#player {
  width: 100%;
  :deep .dplayer-video-wrap {
    text-align: center;
    .dplayer-video {
      margin: 0px auto;
      max-height: calc(100vh - 41px);
    }
  }
}
</style>
