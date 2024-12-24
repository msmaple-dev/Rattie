const Sequelize = require('sequelize');
const db = require('../database');

module.exports = db.define('colors', {
	ownerId: {
		type: Sequelize.INTEGER,
	},
	deckType:  {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	color: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
}, { timestamps: false });