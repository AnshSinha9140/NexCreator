const Pusher = require('pusher-js');

async function run() {
  const channelId = "58688"; // myzothehero
  console.log(`Connecting to Pusher for channelId ${channelId}...`);

  const pusher = new Pusher('32cbd69e4b950bf97679', {
    cluster: 'us2',
    forceTLS: true,
  });

  const channelName = `channel.${channelId}`;
  const channel = pusher.subscribe(channelName);
  
  channel.bind('pusher:subscription_succeeded', () => {
    console.log(`✅ Subscribed to ${channelName}`);
  });
  
  channel.bind_global((eventName, data) => {
    console.log(`🔥 CHANNEL EVENT on ${channelName}: ${eventName}`, data);
  });
}

run();
