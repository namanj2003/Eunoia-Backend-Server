const { ChatMessage, ChatSession } = require("../models/Chat");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

// Generate unique session ID
const generateSessionId = () => {
  return crypto.randomBytes(16).toString("hex");
};

const getChatSessions = async (req, res) => {
  try {
    const { userId } = req.user;

    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50);

    console.log(`Found ${sessions.length} chat sessions for user`);

    // Try to decrypt each session individually
    const validSessions = [];
    for (const session of sessions) {
      try {
        const sessionObj = session.toObject();
        console.log(`Successfully decrypted session: ${sessionObj._id}`);
        validSessions.push(sessionObj);
      } catch (error) {
        console.error(
          `Failed to decrypt session ${session._id}:`,
          error.message
        );
        // Skip this corrupted session
        continue;
      }
    }

    res.json({
      success: true,
      sessions: validSessions,
      skipped: sessions.length - validSessions.length,
    });
  } catch (error) {
    console.error("Get chat sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [session, messages] = await Promise.all([
      ChatSession.findOne({
        sessionId,
        userId: req.user._id,
      }),
      ChatMessage.find({
        sessionId,
        userId: req.user._id,
      })
        .select("role content timestamp")
        .sort({ timestamp: 1 }),
    ]);

    // Convert to plain objects after decryption
    const sessionObj = session ? session.toObject() : null;
    const messagesArr = messages.map((msg) => msg.toObject());

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    res.json({
      success: true,
      data: {
        session: sessionObj,
        messages: messagesArr,
      },
    });
  } catch (error) {
    console.error("Get chat session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const createChatSession = async (req, res) => {
  try {
    console.log("Creating chat session:", {
      userId: req.user._id,
      title: req.body.title,
    });
    const { title } = req.body;
    const sessionId = generateSessionId();

    const session = await ChatSession.create({
      userId: req.user._id,
      sessionId,
      title: title || "New Chat",
    });

    console.log("Chat session created:", {
      sessionId,
      title: session.title,
    });
    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("❌ Create chat session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const addChatMessage = async (req, res) => {
  try {
    console.log("Adding message to session:", {
      sessionId: req.params.sessionId,
      role: req.body.role,
      userId: req.user._id,
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const { role, content } = req.body;

    // Verify session exists and belongs to user
    const session = await ChatSession.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!session) {
      console.error("Session not found:", {
        sessionId,
        userId: req.user._id,
      });
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    console.log("Session found, creating message...");
    // Create message
    const message = await ChatMessage.create({
      userId: req.user._id,
      sessionId,
      role,
      content,
    });

    // Update session's last message time
    session.lastMessageAt = Date.now();
    await session.save();

    console.log("✅ Message saved successfully:", {
      messageId: message._id,
      role,
    });
    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Add chat message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    const session = await ChatSession.findOneAndUpdate(
      {
        sessionId,
        userId: req.user._id,
      },
      { title },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Update chat session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatSession.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    // Delete all messages associated with this session
    const messageDeleteResult = await ChatMessage.deleteMany({
      sessionId,
      userId: req.user._id,
    });

    // Hard delete the session itself
    await ChatSession.deleteOne({
      sessionId,
      userId: req.user._id,
    });

    console.log(
      `Deleted session ${sessionId} and ${messageDeleteResult.deletedCount} messages`
    );

    res.json({
      success: true,
      message: "Chat session and all messages deleted successfully",
      deletedMessages: messageDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Delete chat session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify session belongs to user
    const session = await ChatSession.findOne({
      sessionId,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat session not found",
      });
    }

    let query = {
      sessionId,
      userId: req.user._id,
    };

    //get messages before a certain timestamp
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getMindfulnessStreak = async (req, res) => {
  try {
    // Get all user messages sorted by date
    const messages = await ChatMessage.find({
      userId: req.user._id,
      role: "user",
    })
      .select("timestamp")
      .sort({ timestamp: -1 })
      .lean();

    if (messages.length === 0) {
      return res.json({
        success: true,
        data: { streak: 0, totalDays: 0 },
      });
    }

    // Get unique days with AI chat usage
    const uniqueDaysSet = new Set();
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp);
      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      uniqueDaysSet.add(dateStr);
    });

    const uniqueDays = Array.from(uniqueDaysSet)
      .map((dateStr) => {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
      })
      .sort((a, b) => b.getTime() - a.getTime()); // Most recent first

    // Calculate consecutive daily streak
    const today = new Date();
    const todayNoon = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0,
      0
    );

    let currentStreak = 0;
    let checkDate = new Date(todayNoon);

    const mostRecentChat = uniqueDays[0];
    const daysSinceLastChat = Math.round(
      (todayNoon.getTime() - mostRecentChat.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If last chat is more than 1 day ago, streak is broken
    if (daysSinceLastChat > 1) {
      return res.json({
        success: true,
        data: { streak: 0, totalDays: uniqueDays.length },
      });
    }

    // If last chat was yesterday, start checking from yesterday
    if (daysSinceLastChat === 1) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Count consecutive days
    for (const chatDate of uniqueDays) {
      const daysApart = Math.round(
        (checkDate.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysApart === 0) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    res.json({
      success: true,
      data: {
        streak: currentStreak,
        totalDays: uniqueDays.length,
      },
    });
  } catch (error) {
    console.error("Get mindfulness streak error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getChatSessions,
  getChatSession,
  createChatSession,
  addChatMessage,
  updateChatSession,
  deleteChatSession,
  getChatMessages,
  getMindfulnessStreak,
};
