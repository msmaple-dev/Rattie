const Sequelize = require('sequelize');
const db = require('../database')

module.exports = db.define('tags', {
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
	isPrivate: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		primaryKey: true,
	},
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
}, {timestamps: false});