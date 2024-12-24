const Sequelize = require('sequelize');
const db = require('../database');

const DPR = db.define('dpr', {
	encounterId: {
		type: Sequelize.TEXT,
		allowNull: false,
		primaryKey: true,
		references: {
			model: 'encounters',
			key: 'encounterId',
		},
	},
	round: {
		type: Sequelize.INTEGER,
		allowNull: false,
		primaryKey: true,
	},
	damage: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
}, { timestamps: false });

module.exports = DPR;