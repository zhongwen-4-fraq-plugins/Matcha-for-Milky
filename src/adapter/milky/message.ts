/* eslint-disable camelcase */
import { createContent } from '~/adapter/content'
import { AdapterMessageHandler } from '~/adapter/message'

import type {
  AudioContent,
  ContentMapping,
  FaceContent,
  FileContent,
  ImageContent,
  LinkContent,
  MentionContent,
  ReplyContent,
  TextContent,
  VideoContent,
} from '~/adapter/content'
import type { Message, MessageBuildStrategy, MessageParseStrategy } from '~/adapter/message'
import type { ValueOf } from '~/adapter/typed'

interface MilkyMessage<T extends string = string, D extends Record<string, unknown> = Record<string, unknown>> extends Message {
  type: T
  data: D
}

type TextMessage = MilkyMessage<'text', { text: string }>
type MentionMessage = MilkyMessage<'mention', { user_id: number, name?: string }>
type MentionAllMessage = MilkyMessage<'mention_all'>
type FaceMessage = MilkyMessage<'face', { face_id: string, is_large?: boolean }>
type ReplyMessage = MilkyMessage<'reply', { message_seq: number, sender_id?: number, time?: number, segments?: Messages[] }>
type ImageMessage = MilkyMessage<'image', { uri?: string, resource_id?: string, temp_url?: string, width?: number, height?: number, summary?: string, sub_type?: string }>
type RecordMessage = MilkyMessage<'record', { uri?: string, resource_id?: string, temp_url?: string, duration?: number }>
type VideoMessage = MilkyMessage<'video', { uri?: string, resource_id?: string, temp_url?: string, width?: number, height?: number, duration?: number }>
type FileMessage = MilkyMessage<'file', { file_id: string, file_name?: string, file_size?: number }>
type LightAppMessage = MilkyMessage<'light_app', { json_payload: string }>
interface ForwardedMessage {
  user_id: number
  sender_name: string
  time?: number
  segments: Messages[]
}
type ForwardMessage = MilkyMessage<'forward', {
  messages: ForwardedMessage[]
  title?: string
  preview?: string[]
  summary?: string
  prompt?: string
}>

interface MessageMapping {
  text: TextMessage
  mention: MentionMessage
  mention_all: MentionAllMessage
  face: FaceMessage
  reply: ReplyMessage
  image: ImageMessage
  record: RecordMessage
  video: VideoMessage
  file: FileMessage
  light_app: LightAppMessage
  forward: ForwardMessage
}

export type Messages = ValueOf<MessageMapping>

function createMessage<T extends keyof MessageMapping>(
  type: T,
  data: MessageMapping[T]['data'] = {} as MessageMapping[T]['data'],
): MessageMapping[T] {
  return { type, data } as MessageMapping[T]
}

const messageBuildStrategy: MessageBuildStrategy<ContentMapping> = {
  text: (content: TextContent) => createMessage('text', content.data),
  mention: async (content: MentionContent) => {
    return content.data.target === 'all'
      ? createMessage('mention_all')
      : createMessage('mention', {
          user_id: Number(content.data.target),
          name: await getUserNickname(content.data.target),
        })
  },
  face: (content: FaceContent) => createMessage('face', {
    face_id: content.data.id.toString(),
    is_large: false,
  }),
  reply: (content: ReplyContent) => {
    const message = useChatStore().getMessage(content.data.message_id)
    return createMessage('reply', {
      message_seq: Number(content.data.message_id),
      sender_id: Number(content.data.user_id ?? message?.scene.user_id ?? 0),
      time: message?.scene.time ?? 0,
      segments: [],
    })
  },
  image: (content: ImageContent) => createMessage('image', {
    resource_id: content.data.id,
    temp_url: content.data.url,
    width: 0,
    height: 0,
    summary: '[图片]',
    sub_type: content.data.sub_type === 'emoji' ? 'sticker' : 'normal',
  }),
  audio: (content: AudioContent) => createMessage('record', {
    resource_id: content.data.id,
    temp_url: content.data.url,
    duration: 0,
  }),
  video: (content: VideoContent) => createMessage('video', {
    resource_id: content.data.id,
    temp_url: content.data.url,
    width: 0,
    height: 0,
    duration: 0,
  }),
  file: async (content: FileContent) => {
    const file = await db.files.get(content.data.id)
    return createMessage('file', {
      file_id: content.data.id,
      file_name: file?.name ?? content.data.id,
      file_size: file?.size ?? 0,
    })
  },
  link: (content: LinkContent) => createMessage('text', { text: content.data.url }),
}

const messageParseStrategy: MessageParseStrategy<MessageMapping> = {
  text: (message: TextMessage) => createContent('text', message.data),
  mention: (message: MentionMessage) => createContent('mention', {
    target: message.data.user_id.toString(),
  }),
  mention_all: () => createContent('mention', { target: 'all' }),
  face: (message: FaceMessage) => createContent('face', {
    id: Number(message.data.face_id) || 0,
    name: message.data.face_id,
  }),
  reply: (message: ReplyMessage) => createContent('reply', {
    message_id: message.data.message_seq.toString(),
  }),
  image: (message: ImageMessage) => {
    const url = message.data.uri ?? message.data.temp_url ?? ''
    return createContent('image', {
      id: message.data.resource_id ?? url,
      url,
      sub_type: message.data.sub_type === 'sticker' ? 'emoji' : 'normal',
    })
  },
  record: (message: RecordMessage) => {
    const url = message.data.uri ?? message.data.temp_url ?? ''
    return createContent('audio', { id: message.data.resource_id ?? url, url })
  },
  video: (message: VideoMessage) => {
    const url = message.data.uri ?? message.data.temp_url ?? ''
    return createContent('video', { id: message.data.resource_id ?? url, url })
  },
  file: (message: FileMessage) => createContent('file', {
    id: message.data.file_id,
    url: '',
  }),
  light_app: (message: LightAppMessage) => createContent('text', {
    text: message.data.json_payload,
  }),
  forward: async (message: ForwardMessage) => createContent('forward', {
    content: await Promise.all(message.data.messages.map(async node => createContent('node', {
      user_id: node.user_id.toString(),
      user_name: node.sender_name,
      message: await new MessageHandler().parse(node.segments),
      time: node.time ?? 0,
    }))),
    title: message.data.title,
    preview: message.data.preview,
    summary: message.data.summary,
    prompt: message.data.prompt,
  }),
}

export class MessageHandler extends AdapterMessageHandler<Messages> {
  readonly buildStrategy = messageBuildStrategy
  readonly parseStrategy = messageParseStrategy
}
