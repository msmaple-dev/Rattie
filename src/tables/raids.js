const Sequelize = require('sequelize');
const db = require('../database');

const Raids = db.define('raids', {
	raidId:  {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
		autoIncrement: true,
	},
	channelId: {
		type: Sequelize.TEXT,
		allowNull: false,
	},
	rooms:  {
		type: Sequelize.INTEGER,
	},
	startTime: {
		type: Sequelize.INTEGER,
	},
	endTime: {
		type: Sequelize.INTEGER,
	},
	raidType: {
		type: Sequelize.TEXT,
	},
	status: {
		type: Sequelize.ENUM('Active', 'Finished', 'Lost/Conceded', 'Invalid'),
		defaultValue: 'Active',
		allowNull: false,
	},
}, { timestamps: false });

module.exports = Raids;