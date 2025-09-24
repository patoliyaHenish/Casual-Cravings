export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipe_ingredient', {
      recipe_ingredient_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'recipe',
          key: 'recipe_id'
        },
        onDelete: 'CASCADE'
      },
      ingredient_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ingredient',
          key: 'ingredient_id'
        },
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity_display: {
        type: Sequelize.STRING
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    await queryInterface.addConstraint('recipe_ingredient', {
      fields: ['recipe_id', 'ingredient_id'],
      type: 'unique',
      name: 'unique_recipe_ingredient'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recipe_ingredient');
  }
};