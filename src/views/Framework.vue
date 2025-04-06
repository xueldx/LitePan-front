<template>
  <div class="framework">
    <div class="header">
      <div class="logo">
        <div class="iconfont icon-pan"></div>
        <div class="name">Easy云盘</div>
      </div>
      <div class="right-panel">
        <el-popover
          :width="800"
          trigger="click"
          v-model:visible="showUploader"
          :offset="20"
          transition="none"
          :hide-after="0"
          :popper-style="{
            padding: '0px',
          }"
        >
          <template #reference>
            <div class="iconfont icon-transfer"></div>
          </template>
          <template #default>
            <Uploader
              ref="uploaderRef"
              @uploadCallback="uploadCallbackHandler"
            ></Uploader>
          </template>
        </el-popover>
        <el-dropdown>
          <div class="user-info">
            <!--:avatar="userInfo.avatar"   被删了无法获取头像了 -->
            <div class="avatar">
              <Avatar
                :userId="userInfo.userId"
                :avatar="userInfo.avatar"
                :width="46"
                :timestamp="timestamp"
              >
              </Avatar>
            </div>
            <span class="nick-name">
              {{ userInfo.nickName }}
            </span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="showUpdateAvatar">
                修改头像
              </el-dropdown-item>
              <el-dropdown-item @click="showUpdatePassword">
                修改密码
              </el-dropdown-item>
              <el-dropdown-item @click="logout"> 退出登录 </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="body">
      <div class="left-sider">
        <div class="menu-list">
          <div
            @click="jump(item)"
            :class="[
              'menu-item',
              item.menuCode == currentMenu.menuCode ? 'active' : '',
            ]"
            v-for="item in filteredMenus"
            :key="item.menuCode"
          >
            <div :class="['iconfont', 'icon-' + item.icon]"></div>
            <div class="text">{{ item.name }}</div>
          </div>
        </div>
        <div class="menu-sub-list">
          <div
            @click="jump(sub)"
            :class="['menu-item-sub', sub.path == currentPath ? 'active' : '']"
            v-for="sub in currentMenu.children"
            :key="sub.name"
          >
            <span
              :class="['iconfont', 'icon-' + sub.icon]"
              v-if="sub.icon"
            ></span>
            <span class="text">{{ sub.name }}</span>
          </div>
          <div class="tips" v-if="currentMenu && currentMenu.tips">
            {{ currentMenu.tips }}
          </div>
          <div class="space-info">
            <div>空间使用</div>
            <div class="percent">
              <el-progress
                :percentage="
                  Math.floor(
                    (useSpaceInfo.useSpace / useSpaceInfo.totalSpace) * 10000
                  ) / 100
                "
                color="#409eff"
              />
            </div>

            <div class="space-use">
              <div class="use">
                {{ proxy.Utils.size2Str(useSpaceInfo.useSpace) }}/
                {{ proxy.Utils.size2Str(useSpaceInfo.totalSpace) }}
              </div>
              <div
                :class="[
                  'iconfont',
                  'icon-refresh',
                  isRotating ? 'rotate' : '',
                ]"
                @click="
                  deBouncedGetUseSpace();
                  isRotating = true;
                "
                @animationend="isRotating = false"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="body-content">
        <!-- v-slot="{ Component } 解构插槽 -->
        <!-- -view的插槽内容解构为Component -->
        <!-- 这样做的目的是为了让router-view的插槽能够访问到子组件中的数据 -->
        <!-- 这里访问到的数据就是Component -->
        <router-view v-slot="{ Component }">
          <!-- 这里通过调用Main子组件，将Main组件中的数据传递到Framework组件中 -->
          <!-- @addFile="addFile" 是一个事件监听器，当子组件触发addFile事件时，会调用Framework组件中的addFile方法 -->
          <!-- ref="routerViewRef" 是给这个组件实例一个引用名称，方便在其他地方通过this.$refs.routerViewRef来访问这个组件实例 -->
          <!-- :is="Component" 是动态组件的用法，根据Component的值来渲染不同的组件 -->
          <component @addFile="addFile" ref="routerViewRef" :is="Component" />
        </router-view>
      </div>
    </div>
    <UpdateAvatar ref="UpdateAvatarRef" @reloadAvatar="reloadAvatar">
    </UpdateAvatar>
    <UpdatePassword ref="UpdatePasswordRef"> </UpdatePassword>
  </div>
</template> 

<script setup>
import { isAdmin } from "@/config/admin";
import UpdateAvatar from "./UpdateAvatar.vue";
import UpdatePassword from "./UpdatePassword.vue";
import Uploader from "@/views/main/Uploader.vue";
import {
  ref,
  reactive,
  getCurrentInstance,
  nextTick,
  onMounted,
  watch,
  computed,
} from "vue";
const { proxy } = getCurrentInstance();
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const api = {
  logout: "/logout",
  getUseSpace: "/getUseSpace",
};

const timestamp = ref(0);
const userInfo = ref(proxy.VueCookies.get("userInfo") || { nickName: "" });
const currentMenu = ref({});
const currentPath = ref();

const showUploader = ref(false);
const uploaderRef = ref();
// 上传文件
const addFile = (data) => {
  const { file, filePid } = data;
  showUploader.value = true;
  // 调用子组件 Uploader中暴露的 addFile函数,并将参数传递给子组件
  uploaderRef.value.addFile(file, filePid);
};

const routerViewRef = ref();

const uploadCallbackHandler = () => {
  //关注放在nextTick的原因
  nextTick(() => {
    //上传文件结束后需要刷新列表
    routerViewRef.value.reload();
    //更新空间
    getUseSpace();
  });
};

// 菜单栏
const menus = [
  {
    icon: "cloude",
    name: "首页",
    menuCode: "main",
    path: "/main/all",
    allShow: true,
    children: [
      {
        icon: "all",
        name: "全部",
        category: "all",
        path: "/main/all",
      },
      {
        icon: "video",
        name: "视频",
        category: "video",
        path: "/main/video",
      },
      {
        icon: "music",
        name: "音频",
        category: "music",
        path: "/main/music",
      },
      {
        icon: "image",
        name: "图片",
        category: "image",
        path: "/main/image",
      },
      {
        icon: "doc",
        name: "文档",
        category: "doc",
        path: "/main/doc",
      },
      {
        icon: "more",
        name: "其他",
        category: "others",
        path: "/main/others",
      },
    ],
  },
  {
    path: "/myshare",
    icon: "share",
    name: "分享",
    menuCode: "share",
    allShow: true,
    children: [
      {
        name: "分享记录",
        path: "/myshare",
      },
    ],
  },
  {
    path: "/recycle",
    icon: "del",
    name: "回收站",
    menuCode: "recycle",
    tips: "回收站为你保存10天内删除的文件",
    allShow: true,
    children: [
      {
        name: "删除的文件",
        path: "/recycle",
      },
    ],
  },
  {
    path: "/settings/fileList",
    icon: "settings",
    name: "设置",
    menuCode: "settings",
    allShow: false,
    children: [
      {
        name: "用户文件",
        path: "/settings/fileList",
      },
      {
        name: "用户管理",
        path: "/settings/userList",
      },
      {
        path: "/settings/sysSetting",
        name: "系统设置",
      },
    ],
  },
];

// 计算属性：过滤后的菜单（只有超级管理员们能看到设置菜单）

const filteredMenus = computed(() => {
  return menus.filter(
    (menu) =>
      menu.allShow ||
      (menu.menuCode === "settings" && isAdmin(userInfo.value.userId))
  );
});
// 菜单栏选项跳转
const jump = (data) => {
  if (!data.path || data.menuCode == currentMenu.value.menuCode) {
    return;
  }
  router.push(data.path);
};

// 设置当前菜单栏
const setMenu = (menuCode, path) => {
  const menu = menus.find((item) => {
    return item.menuCode === menuCode;
  });
  currentMenu.value = menu;
  currentPath.value = path;
};
//监听路由变化，设置当前菜单
watch(
  () => route,
  (newVal, oldVal) => {
    if (newVal.meta.menuCode) {
      setMenu(newVal.meta.menuCode, newVal.path);
    }
  },
  { immediate: true, deep: true }
);

const UpdateAvatarRef = ref();
const showUpdateAvatar = () => {
  UpdateAvatarRef.value.show(userInfo.value);
};
const UpdatePasswordRef = ref();
const showUpdatePassword = () => {
  UpdatePasswordRef.value.show();
};

const reloadAvatar = () => {
  //取出更新后的cookie，并赋值给userInfo  没有了avatar  头像只能自己发请求(给一个新的时间戳)
  userInfo.value = proxy.VueCookies.get("userInfo");
  timestamp.value = new Date().getTime();
};

const logout = async () => {
  proxy.Confirm("你确定要退出登录吗？", async () => {
    let result = await proxy.Request({
      url: api.logout,
    });
    if (!result) return;
    proxy.VueCookies.remove("userInfo");
    router.push("/login");
  });
};

// 使用空间
const useSpaceInfo = ref({ useSpace: 0, totalSpace: 1 });

const getUseSpace = async () => {
  let result = await proxy.Request({
    url: api.getUseSpace,
    showLoading: false,
  });
  if (!result) {
    return;
  }
  useSpaceInfo.value = result.data;
};
//对获取空间做防抖处理，连续点击只执行最后一次
// （如果多次使用可以单独封装在js工具文件中再导入）
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
      timer = null;
    }, delay);
  };
};
//考虑到click中要执行多个函数（非表达式要加括号），所以单独把deBouncedgetUseSpace先提取出来
const deBouncedGetUseSpace = debounce(getUseSpace, 500);
onMounted(() => {
  getUseSpace();
});
//控制刷新图标是否旋转
const isRotating = ref(false);
</script>

<style lang="scss" scoped>
.framework {
  height: 100%;
}
.header {
  box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
  height: 56px;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;
    .icon-pan {
      font-size: 40px;
      color: #1296db;
    }
    .name {
      font-weight: bold;
      margin-left: 5px;
      font-size: 25px;
      color: #05a1f5;
    }
  }
  .right-panel {
    display: flex;
    align-items: center;
    .icon-transfer {
      cursor: pointer;
    }
    .user-info {
      margin-right: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;
      // 头像
      .avatar {
        margin: 0px 5px 0px 15px;
      }
      // 昵称
      .nick-name {
        color: #05a1f5;
      }
    }
  }
}
.body {
  display: flex;
  .left-sider {
    border-right: 1px solid #f1f2f4;
    display: flex;
    .menu-list {
      height: calc(100vh - 56px);
      width: 80px;
      box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
      border-right: 1px solid #f1f2f4;
      .menu-item {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        padding: 20px 0px;
        cursor: pointer;
        &:hover {
          background: #f3f3f3;
        }
        .iconfont {
          font-weight: normal;
          font-size: 28px;
        }
        .text {
          margin-top: 5px;
          font-size: 14px;
        }
      }
      .active {
        .iconfont {
          color: #06a7ff;
        }
        .text {
          color: #06a7ff;
        }
      }
    }
    .menu-sub-list {
      width: 200px;
      padding: 20px 10px 0px;
      position: relative;
      .menu-item-sub {
        // display: flex;
        // flex-direction: column;
        // align-items: center;
        text-align: center;
        // justify-content: space-around;

        line-height: 40px;
        border-radius: 5px;
        cursor: pointer;
        &:hover {
          background: #f3f3f3;
        }
        .iconfont {
          font-size: 14px;
          margin-right: 20px;
        }
        .text {
          font-size: 13px;
        }
      }
      .active {
        background: #eef9fe;
        .iconfont {
          color: #05a1f5;
        }
        .text {
          color: #05a1f5;
        }
      }

      .tips {
        margin-top: 10px;
        color: #888888;
        font-size: 13px;
      }

      .space-info {
        position: absolute;
        bottom: 10px;
        width: 100%;
        padding: 0px 5px;
        .percent {
          padding-right: 10px;
        }
        .space-use {
          margin-top: 5px;
          color: #7e7e7e;
          display: flex;
          justify-content: space-around;
          .use {
            flex: 1;
          }
          .iconfont {
            cursor: pointer;
            margin-right: 20px;
            color: #05a1f5;
            transition: transform 0.5s ease;
          }
          @keyframes rotateAnimation {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .rotate {
            animation: rotateAnimation 0.5s ease;
          }
        }
      }
    }
  }
  .body-content {
    flex: 1;
    width: 0;
    padding-left: 20px;
  }
}
</style>
