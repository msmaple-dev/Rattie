const Sequelize = require('sequelize');
const db = require('../database')

module.exports = db.define('reminders', {
	ownerId:  {
		type: Sequelize.TEXT,
	},
	content:  {
		type: Sequelize.TEXT,
	},
	messageId:  {
		type: Sequelize.STRING,
	},
	channelId:  {
		type: Sequelize.STRING,
	},
	endTime: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
}, {timestamps: false});