const Keyv = require('keyv');

const init_keyv = new Keyv('sqlite://database.sqlite', {table: "init", busyTimeout: 10000});
init_keyv.on('error', err => console.error('Keyv connection error:', err));

module.exports = init_keyv;