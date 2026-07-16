import type { StrKeyObject } from '~/adapter/typed'

export interface MilkyResponse<D = unknown> {
  status: 'ok' | 'failed'
  retcode: number
  data: D | null
  message?: string
}

export interface Friend extends StrKeyObject {
  user_id: number
  nickname: string
  sex: 'male' | 'female' | 'unknown'
  qid: string
  remark: string
  category: {
    category_id: number
    category_name: string
  }
}

export interface Group extends StrKeyObject {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
  remark: string
  created_time: number
  description: string
  question: string
  announcement: string
}

export interface GroupMember extends StrKeyObject {
  user_id: number
  nickname: string
  sex: 'male' | 'female' | 'unknown'
  group_id: number
  card: string
  title: string
  level: number
  role: 'owner' | 'admin' | 'member'
  join_time: number
  last_sent_time: number
  shut_up_end_time: number
}

export function response<D>(data: D): MilkyResponse<D>
export function response(): MilkyResponse<null>
export function response<D>(data?: D): MilkyResponse<D | null> {
  return {
    status: 'ok',
    retcode: 0,
    // eslint-disable-next-line unicorn/no-null
    data: data ?? null,
  }
}

export function failure(retcode: number, message: string): MilkyResponse<never> {
  return {
    status: 'failed',
    retcode,
    // eslint-disable-next-line unicorn/no-null
    data: null,
    message,
  }
}
