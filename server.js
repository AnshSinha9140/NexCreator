// server.js — Custom Next.js + Socket.io server with Kick Pusher Bridge
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const PusherModule = require("pusher-js");
const Pusher = PusherModule.Pusher || PusherModule.default || PusherModule;
global.WebSocket = require("ws");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Track active Kick Pusher bridge connections
// Map: chatroomId -> { pusher: Pusher, socketId: string }
const bridges = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socketio",
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Frontend connected: ${socket.id}`);

    // Frontend clicks "Queue Deep Scan" → emits 'subscribe_kick'
    socket.on("subscribe_kick", ({ chatroomId, username }) => {
      const id = String(chatroomId);
      console.log(`[Bridge] Starting Kick Pusher bridge for chatroom: ${id}`);

      // Clean up any existing bridge for this chatroom
      if (bridges.has(id)) {
        try { bridges.get(id).pusher.disconnect(); } catch (e) {}
        bridges.delete(id);
      }

      // Initialize pusher-js with Kick's exact public key and us2 cluster
      const pusher = new Pusher("32cbd69e4b950bf97679", {
        cluster: "us2",
        forceTLS: true,
      });

      const channelName = `chatrooms.${id}.v2`;
      console.log(`[Bridge] Subscribing to channel ${channelName}...`);
      const channel = pusher.subscribe(channelName);

      pusher.connection.bind("connected", () => {
        console.log(`[Bridge] Pusher connected for chatroom ${id}`);
        socket.emit("kick_status", { status: "connected", chatroomId: id });
      });

      channel.bind("pusher:subscription_succeeded", () => {
        console.log(`[Bridge] Subscribed to ${channelName} ✅`);
        socket.emit("kick_status", { status: "subscribed", chatroomId: id });
      });

      pusher.connection.bind("error", (err) => {
        console.error(`[Bridge] Pusher connection error for chatroom ${id}:`, err);
        socket.emit("kick_status", { status: "error", error: err?.message || "Pusher error" });
      });

      // Direct binding to exact escaped event name: App\Events\ChatMessageEvent
      channel.bind("App\\Events\\ChatMessageEvent", (data) => {
        console.log("[KICK CHAT EVENT DETECTED]", data);
        io.emit("kick_chat_message", data);
      });

      // Bind to ALL events globally on the Pusher instance as secondary listener
      pusher.bind_global((eventName, data) => {
        console.log("[KICK GLOBAL EVENT]", eventName);

        // Forward to socket.io if it is a chat event and not already handled
        if (eventName.includes('ChatMessage') && eventName !== "App\\Events\\ChatMessageEvent") {
          io.emit('kick_chat_message', data);
        }
      });

      bridges.set(id, { pusher, socketId: socket.id });
    });

    // Frontend clicks "Stop Listening" → emits 'unsubscribe_kick'
    socket.on("unsubscribe_kick", ({ chatroomId }) => {
      const id = String(chatroomId);
      if (bridges.has(id)) {
        console.log(`[Bridge] Closing Pusher bridge for chatroom ${id}`);
        try { bridges.get(id).pusher.disconnect(); } catch (e) {}
        bridges.delete(id);
      }
    });

    // Clean up when frontend disconnects (e.g. page refresh)
    socket.on("disconnect", () => {
      console.log(`[Socket.io] Frontend disconnected: ${socket.id}`);
      for (const [id, conn] of bridges.entries()) {
        if (conn.socketId === socket.id) {
          try { conn.pusher.disconnect(); } catch (e) {}
          bridges.delete(id);
          console.log(`[Bridge] Cleaned up bridge for chatroom ${id}`);
        }
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`\n✅ NexCreator running on http://localhost:${PORT}`);
    console.log(`✅ Socket.io bridge active on /api/socketio\n`);
  });
});
