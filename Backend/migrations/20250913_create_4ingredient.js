export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingredient', {
      ingredient_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ingredient');
  }
};