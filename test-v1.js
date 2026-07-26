const Pusher = require('pusher-js');

async function run() {
  const chatroomId = "58686"; // myzothehero true chatroom ID
  console.log(`Connecting to Pusher for chatroomId ${chatroomId}...`);

  const pusher = new Pusher('32cbd69e4b950bf97679', {
    cluster: 'us2',
    forceTLS: true,
  });

  pusher.connection.bind('connected', () => {
    console.log('✅ Pusher connected');
  });

  const channelName = `chatrooms.${chatroomId}.v2`;
  const channel = pusher.subscribe(channelName);
  
  channel.bind('pusher:subscription_succeeded', () => {
    console.log(`✅ Subscribed to ${channelName}`);
  });
  
  channel.bind_global((eventName, data) => {
    console.log(`🔥 CHANNEL EVENT on ${channelName}: ${eventName}`, data);
  });
}

run();
