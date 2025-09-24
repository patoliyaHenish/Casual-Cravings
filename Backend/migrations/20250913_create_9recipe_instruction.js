export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipe_instruction', {
      instruction_id: {
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
      step_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      instruction_text: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recipe_instruction');
  }
};