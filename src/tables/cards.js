const Sequelize = require('sequelize');
const db = require('../database');

module.exports = db.define('cards', {
	ownerId:  {
		type: Sequelize.INTEGER,
	},
	cardName: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	deckType:  {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	severity: {
		type: Sequelize.ENUM('lesser', 'moderate', 'severe'),
		defaultValue: 'lesser',
		allowNull: false,
	},
	cardText: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
}, { timestamps: false });