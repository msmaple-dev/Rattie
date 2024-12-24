const Sequelize = require('sequelize');
const { database, user, password } = require('../config.json');
const path = require('node:path');

console.log('Where the DB Actually Is:', __dirname);
console.log('Where it\'s running From:', process.cwd());
console.log('Where it\'s trying to make the DB To:', path.resolve('database.sqlite'));

const db = new Sequelize(database, user, password, {
	host: 'localhost',
	dialect: 'sqlite',
	logging: (text => console.log(text)),
	storage: 'database.sqlite',
});

module.exports = db;