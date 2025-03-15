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
}, { timestamps: false });

module.exports = RaidParticipants;