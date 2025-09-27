import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true }, // user ID from other service
  to: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 7 * 24 * 60 * 60 } } // 1 week TTL
});

messageSchema.index({ from: 1, to: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
