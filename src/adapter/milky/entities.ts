/* eslint-disable camelcase */
import type { Friend, Group, GroupMember } from './typed'

export async function getFriend(userId: string, friendId: string): Promise<Friend> {
  const [friend, user] = await Promise.all([
    db.friends.get([userId, friendId]),
    db.users.get(friendId),
  ])
  if (!friend || !user) {
    throw new Error(`好友 ${friendId} 不存在`)
  }
  return {
    user_id: Number(user.id),
    nickname: user.name,
    sex: user.sex,
    qid: user.qid,
    remark: friend.remark,
    category: {
      category_id: 0,
      category_name: '默认分组',
    },
  }
}

export async function getGroup(groupId: string): Promise<Group> {
  const group = await db.groups.get(groupId)
  if (!group) {
    throw new Error(`群聊 ${groupId} 不存在`)
  }
  return {
    group_id: Number(group.id),
    group_name: group.name,
    member_count: group.memberCount,
    max_member_count: group.maxMemberCount,
    remark: '',
    created_time: group.time,
    description: group.intro,
    question: '',
    announcement: '',
  }
}

export async function getGroupMember(groupId: string, userId: string): Promise<GroupMember> {
  const [member, user] = await Promise.all([
    db.members.get([groupId, userId]),
    db.users.get(userId),
  ])
  if (!member || !user) {
    throw new Error(`群成员 ${userId} 不存在`)
  }
  return {
    user_id: Number(user.id),
    nickname: user.name,
    sex: user.sex,
    group_id: Number(groupId),
    card: member.card,
    title: member.title,
    level: member.level,
    role: member.role,
    join_time: member.joinTime,
    last_sent_time: user.lastUseTime,
    shut_up_end_time: member.banExpireTime,
  }
}

export async function getUserProfile(userId: string) {
  const user = await db.users.get(userId)
  if (!user) {
    throw new Error(`用户 ${userId} 不存在`)
  }
  const state = useStateStore()
  const friend = await db.friends.get([state.bot!.id, userId])
  return {
    nickname: user.name,
    qid: user.qid,
    age: user.birthdate ? getUserAge(user.birthdate) : 0,
    sex: user.sex,
    remark: friend?.remark ?? '',
    bio: user.sign,
    level: user.level,
    country: user.hometown,
    city: user.location,
    school: '',
  }
}
