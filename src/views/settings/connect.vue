<route lang="yaml">
meta:
  isSettings: true
  title: 连接
  description: 配置 Milky 服务连接信息
  position: 2
</route>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { FormField } from '~/components/ui/form'

const connect = useConnectSettingsStore()

const generalFormSchema = toTypedSchema(
  z.object({
    host: z.string().min(1, '监听地址不能为空'),
    port: z
      .number()
      .int()
      .min(1, '端口必须大于 0')
      .max(6_5535, '端口不能超过 65535'),
    accessToken: z.string().optional(),
    postSelfEvents: z.boolean(),
  }),
)

const { handleSubmit, values, resetForm } = useForm({
  validationSchema: generalFormSchema,
  initialValues: connect.$state as unknown as Record<string, unknown>,
})

const adapter = useAdapterStore()

const rebootConnect = useDebounceFn(async () => {
  await adapter.bot.reboot()
}, 1000)

const onSubmit = handleSubmit(async (values) => {
  connect.$patch(values)
  await rebootConnect()
})

watchDebounced(
  values,
  async () => {
    await onSubmit()
  },
  { deep: true, debounce: 250, maxWait: 1000 },
)

defineExpose({ resetForm })
</script>

<template>
  <form class="mb-8 space-y-5">
    <div class="max-w-100 flex gap-3">
      <FormField v-slot="{ componentField }" name="host">
        <FormItem class="min-w-0 flex-1">
          <FormLabel>监听地址</FormLabel>
          <FormControl>
            <Input type="text" v-bind="componentField" class="h-9" />
          </FormControl>
          <FormDescription>Milky 服务监听的网络地址</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="port">
        <FormItem class="w-32">
          <FormLabel>端口</FormLabel>
          <FormControl>
            <Input type="number" v-bind="componentField" class="h-9" />
          </FormControl>
          <FormDescription>服务端口</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <FormField v-slot="{ componentField }" name="accessToken">
      <FormItem>
        <FormLabel>访问令牌</FormLabel>
        <FormControl>
          <Input type="text" v-bind="componentField" class="h-9 max-w-100" />
        </FormControl>
        <FormDescription>Milky 通信鉴权使用的访问令牌</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ value, handleChange }" name="postSelfEvents">
      <FormItem class="max-w-120 flex flex-row items-center justify-between rounded-lg">
        <div class="space-y-0.5">
          <FormLabel>推送自身事件</FormLabel>
          <FormDescription>是否推送机器人自身事件</FormDescription>
        </div>
        <FormControl>
          <Switch :checked="value" aria-readonly @update:checked="handleChange" />
        </FormControl>
      </FormItem>
    </FormField>
  </form>
</template>
