const Sequelize = require('sequelize');
const db = require('../database');

const RaidParticipants = db.define('raid_participants', {
	raidId: {
		type: Sequelize.TEXT,
		allowNull: false,
		primaryKey: true,
		references: {
			model: 'raids',
			key: 'raidId',
		},
	},
	userId: {
		type: Sequelize.TEXT,
		allowNull: false,
		primaryKey: true,
	},
	roomNumber: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
	},
	description: {
		type: Sequelize.TEXT,
	},
	isPocketed: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	isBoss: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
}, { timestamps: false });

module.exports = RaidParticipants;