const Sequelize = require('sequelize');
const db = require('../database')

const Encounters = db.define('encounters', {
	encounterId:  {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true,
	},
	channelId: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	rounds:  {
		type: Sequelize.INTEGER,
	},
	startTime: {
		type: Sequelize.INTEGER,
	},
	endTime: {
		type: Sequelize.INTEGER,
	},
	monster: {
		type: Sequelize.TEXT,
	},
	status: {
		type: Sequelize.ENUM('Active', 'Finished', 'Lost', 'Conceded', 'Invalid'),
		defaultValue: 'Active',
		allowNull: false,
	},
	modifiersApplied: {
		type: Sequelize.INTEGER,
	},
}, {timestamps: false});

module.exports = Encounters