const WebSocket = require('ws');

const url = 'wss://chat.longapp.site/chat/chat';
const room = 'test-room-from-client-123';

console.log('Connecting to', url);
const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('OPEN');
  const create = { action: 'onchat', data: { event: 'CREATE_ROOM', data: { name: room } } };
  console.log('Send CREATE_ROOM ->', JSON.stringify(create));
  ws.send(JSON.stringify(create));

  setTimeout(() => {
    const join = { action: 'onchat', data: { event: 'JOIN_ROOM', data: { name: room } } };
    console.log('Send JOIN_ROOM ->', JSON.stringify(join));
    ws.send(JSON.stringify(join));
  }, 1000);

  // close after 6s
  setTimeout(() => {
    console.log('Closing');
    ws.close();
  }, 6000);
});

ws.on('message', (msg) => {
  console.log('RECV:', msg.toString());
});

ws.on('error', (err) => {
  console.error('ERROR', err && err.message ? err.message : err);
});

ws.on('close', () => {
  console.log('CLOSED');
});
