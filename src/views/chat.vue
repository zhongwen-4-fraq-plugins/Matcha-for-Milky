<route lang="yaml">
meta:
  navDisplay: true
  title: 消息列表
  position: 0
  icon: chat.svg
  activeIcon: chat-active.svg
</route>

<script lang="ts">
const state = useStateStore()

export default defineComponent({
  beforeRouteEnter: (to) => {
    if (to.path === '/chat' && state.chatTarget) {
      return `/chat/${state.chatTarget.type}/${state.chatTarget.id}`
    }
  },
})
</script>

<template>
  <main class="flex">
    <ChatContacts />
    <RouterView class="flex-1" />
  </main>
</template>
