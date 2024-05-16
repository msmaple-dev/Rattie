const Sequelize = require('sequelize');
const db = require('../database')

module.exports = db.define('privateTags', {
	name: {
		type: Sequelize.TEXT,
		primaryKey: true,
	},
	ownerId:  {
		type: Sequelize.INTEGER,
		primaryKey: true,
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
}, {timestamps: false});