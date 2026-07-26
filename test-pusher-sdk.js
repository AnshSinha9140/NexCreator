const Pusher = require('pusher-js');

async function run() {
  const chatroomId = "16783"; // fang, 46k viewers
  console.log(`Connecting to Pusher for chatroomId ${chatroomId}...`);

  const pusher = new Pusher('32cbd69e4b950bf97679', {
    cluster: 'us2',
    forceTLS: true,
  });

  pusher.connection.bind('connected', () => {
    console.log('✅ Pusher connected');
  });

  const permutations = [
    `chatrooms.${chatroomId}.v2`,
    `chatrooms.${chatroomId}.v3`,
    `channel.${chatroomId}`,
    `chatrooms.${chatroomId}`,
    `chatrooms.fang.v2`,
    `chatrooms.fang`,
    `chatrooms.${chatroomId}.v4`
  ];

  permutations.forEach(channelName => {
    const channel = pusher.subscribe(channelName);
    channel.bind('pusher:subscription_succeeded', () => {
      console.log(`✅ Subscribed to ${channelName}`);
    });
    channel.bind_global((eventName, data) => {
      console.log(`🔥 CHANNEL EVENT on ${channelName}: ${eventName}`, data);
    });
  });

  pusher.bind_global((eventName, data) => {
    // Only log if it's not subscription succeeded to avoid spam
    if (eventName !== 'pusher_internal:subscription_succeeded') {
      console.log(`🌐 GLOBAL EVENT: ${eventName}`, data);
    }
  });
}

run();
