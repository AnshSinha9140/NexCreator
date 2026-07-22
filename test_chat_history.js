const channel = '8bit_rusherwow';
const url = `https://kick.com/api/v2/channels/${channel}/messages`;

fetch(url, { headers: { 'Accept': 'application/json' } })
  .then(res => {
    console.log("Status:", res.status);
    return res.text();
  })
  .then(text => console.log("Response:", text.substring(0, 300)))
  .catch(console.error);
