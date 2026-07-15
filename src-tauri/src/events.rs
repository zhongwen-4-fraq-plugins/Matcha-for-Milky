use serde_json::{Value, json};

use crate::{
    models::{MessageEventDraft, MessageScene},
    state::unix_time,
};

pub fn build_message_event(self_id: u64, message_seq: u64, draft: &MessageEventDraft) -> Value {
    let mut data = json!({
        "message_scene": draft.scene.as_str(),
        "peer_id": draft.peer_id,
        "message_seq": message_seq,
        "sender_id": draft.sender_id,
        "time": unix_time(),
        "segments": [{
            "type": "text",
            "data": { "text": draft.text }
        }]
    });

    match draft.scene {
        MessageScene::Friend => {
            data["friend"] = json!({
                "user_id": draft.sender_id,
                "nickname": "Test User",
                "sex": "unknown",
                "qid": "",
                "remark": "",
                "category": {
                    "category_id": 0,
                    "category_name": "Default"
                }
            });
        }
        MessageScene::Group => {
            data["group"] = json!({
                "group_id": draft.peer_id,
                "group_name": "Fraq Test Group",
                "member_count": 2,
                "max_member_count": 200,
                "remark": "",
                "created_time": unix_time(),
                "description": "",
                "question": "",
                "announcement": ""
            });
            data["group_member"] = json!({
                "user_id": draft.sender_id,
                "nickname": "Test User",
                "sex": "unknown",
                "group_id": draft.peer_id,
                "card": "",
                "title": "",
                "level": 1,
                "role": "member",
                "join_time": unix_time(),
                "last_sent_time": unix_time()
            });
        }
        MessageScene::Temp => {}
    }

    json!({
        "time": unix_time(),
        "self_id": self_id,
        "event_type": "message_receive",
        "data": data
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_group_message_event() {
        let event = build_message_event(
            10001,
            7,
            &MessageEventDraft {
                scene: MessageScene::Group,
                peer_id: 123456,
                sender_id: 10002,
                text: "echo hello".into(),
            },
        );

        assert_eq!(event["event_type"], "message_receive");
        assert_eq!(event["data"]["message_scene"], "group");
        assert_eq!(event["data"]["segments"][0]["data"]["text"], "echo hello");
        assert_eq!(event["data"]["group_member"]["user_id"], 10002);
    }
}
