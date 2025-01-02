const Sequelize = require('sequelize');
const db = require('../database');

module.exports = db.define('scales', {
	userId: {
		type: Sequelize.TEXT,
		allowNull: false,
		primaryKey: true,
	},
	scale: {
		type: Sequelize.INTEGER,
		allowNull: false,
		defaultValue: 1,
	},
}, { timestamps: false });