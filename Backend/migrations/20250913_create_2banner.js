export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('banner', {
      banner_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      button_text: {
        type: Sequelize.STRING,
        allowNull: false
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      is_hero: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });

    await queryInterface.addIndex('banner', ['is_hero'], {
      unique: true,
      where: {
        is_hero: true
      },
      name: 'unique_hero_banner'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('banner');
  }
};