import Message from "../models/message.model.js";

export const getChatHistory = async (req, res) => {
  const me = req.user.sub;
  const other = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { from: me, to: other },
        { from: other, to: me },
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching chat" });
  }
};
