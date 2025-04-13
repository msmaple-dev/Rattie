const Sequelize = require('sequelize');
const db = require('../database');

const Wikis = db.define('wikis', {
	ownerId:  {
		type: Sequelize.TEXT,
	},
	name: {
		type: Sequelize.TEXT,
		allowNull: false,
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
	pneumaAppearance:  {
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
	},
	scent: {
		type: Sequelize.TEXT,
	},
	renown: {
		type: Sequelize.TEXT,
	},
	showcaseUses: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	showcaseEnabled: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
}, { timestamps: false });

module.exports = Wikis;