const Sequelize = require('sequelize');
const db = require('../database')

module.exports = db.define('tarots', {
	cardName: {
		type: Sequelize.TEXT,
		allowNull: false
	},
	originalTarot:  {
		type: Sequelize.TEXT,
	},
	majorTarot:  {
		type: Sequelize.TEXT,
	},
	upright:  {
		type: Sequelize.TEXT,
	},
	reverse:  {
		type: Sequelize.TEXT,
	},
	description:  {
		type: Sequelize.TEXT,
	},
	explanation:  {
		type: Sequelize.TEXT,
	},
}, {timestamps: false});