const Sequelize = require('sequelize');
const db = require('../database')

const Participants = db.define('participants', {
	encounterId: {
		type: Sequelize.TEXT,
		allowNull: false,
		primaryKey: true,
		references: {
			model: 'encounters',
			key: 'encounterId'
		}
	},
	userId: {
		type: Sequelize.TEXT,
		allowNull: false,
		primaryKey: true,
	},
	endHP: {
		type: Sequelize.INTEGER,
		allowNull: true,
	}
}, {timestamps: false});

module.exports = Participants