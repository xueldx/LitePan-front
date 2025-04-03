<template>
  <div>登录中，请勿刷新页面</div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
const { proxy } = getCurrentInstance();
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const api = {
  logincallback: "/qqlogin/callback",
};
const login = async () => {
  let result = await proxy.Request({
    url: api.logincallback,
    params: router.currentRoute.value.query,
    errorCallback: () => {
      router.push("/");
    },
  });
  if (!result) {
    return;
  }
  const redirectUrl = result.data.errorCallback || "/";
  if (redirectUrl == "/longin") {
    redirectUrl = "/";
  }
  proxy.VueCookies.set("userInfo", result.data.userInfo, 0);
  router.push(redirectUrl);
};
login();
</script>

<style lang="scss" scoped>
</style>
