fetch('http://localhost:3000/api/analysis?kickChannel=8bit_rusherwow')
  .then(res => res.json())
  .then(data => console.log('Resolved Chatroom ID:', data))
  .catch(console.error);
