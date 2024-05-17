const Sequelize = require('sequelize');
const db = require('../database')

module.exports = db.define('reminders', {
	ownerId:  {
		type: Sequelize.INTEGER,
	},
	content:  {
		type: Sequelize.TEXT,
	},
	messageId:  {
		type: Sequelize.INTEGER,
	},
	channelId:  {
		type: Sequelize.INTEGER,
	},
	endTime: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
}, {timestamps: false});