export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('file_storage', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      table_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      table_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'CASCADE'
      },
      filename: {
        type: Sequelize.STRING
      },
      mime_type: {
        type: Sequelize.STRING
      },
      image_data: {
        type: Sequelize.BLOB
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('file_storage');
  }
};