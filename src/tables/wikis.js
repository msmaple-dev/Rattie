const Sequelize = require('sequelize');
const db = require('../database')

module.exports = db.define('wikis', {
	ownerId:  {
		type: Sequelize.INTEGER
	},
	name: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	warlockName: {
		type: Sequelize.TEXT,
	},
	quote:  {
		type: Sequelize.TEXT,
	},
	about:  {
		type: Sequelize.TEXT,
	},
	age: {
		type: Sequelize.TEXT,
	},
	scale: {
		type: Sequelize.TEXT,
	},
	faction:  {
		type: Sequelize.TEXT,
	},
	appearance:  {
		type: Sequelize.TEXT,
	},
	image:  {
		type: Sequelize.TEXT,
	},
	source:  {
		type: Sequelize.TEXT,
	},
	icon:  {
		type: Sequelize.TEXT,
	},
	abilities:  {
		type: Sequelize.TEXT,
	},
	color:  {
		type: Sequelize.TEXT,
	},
	pronouns: {
		type: Sequelize.TEXT,
	}
}, {timestamps: false});