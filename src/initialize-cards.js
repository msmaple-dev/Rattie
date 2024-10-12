
const colors = require('./tables/colors');
const cards = require('./tables/cards');
const tarot = require('./tables/tarot');
const { colors_data, base_deck_data, tarot_data } = require('./components/constants');

(async () => {
	try {
		// await colors.destroy({ where: { deckType: ['slash', 'pierce', 'bash', 'rend', 'shock', 'burn', 'hollow'] } });
		// await colors.bulkCreate(colors_data).then(res => console.log(`Reloaded ${res.length} Colors!`));
		await cards.destroy({ where: { ownerId: 0 } });
		await cards.bulkCreate(base_deck_data).then(res => console.log(`Reloaded ${res.length} Status Cards!`));
		// await tarot.destroy({where: {}});
		// await tarot.bulkCreate(tarot_data).then(res => console.log(`Reloaded ${res.length} Tarot Cards!`));
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();