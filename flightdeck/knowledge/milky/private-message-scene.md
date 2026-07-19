# Milky private message scene checklist
SUMMARY: Always derive a private message's Milky scene from the bot self ID and the message's actual peer, never from the user currently selected in the UI.
READ WHEN: before changing any private message creation or Milky `message_receive` conversion.

---

For a private message, identify the peer relative to the Milky bot:

- when the sender is `self_id`, the peer is the receiver;
- otherwise, the peer is the sender.

Query the friendship as `[self_id, peer_id]`. The currently selected UI user is unrelated to
the transport payload: an API call can send a private message to a different user while the
UI remains on the current conversation.

Use `message_scene: friend` only when that bot-to-peer friendship exists. A non-friend private
message, including a temporary chat opened through a shared group, uses `message_scene: temp`.
