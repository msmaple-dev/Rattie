const Keyv = require('keyv');

const raid_keyv = new Keyv('sqlite://database.sqlite', { table: 'raid_init', busyTimeout: 10000 });
raid_keyv.on('error', err => console.error('Keyv connection error:', err));

module.exports = raid_keyv;