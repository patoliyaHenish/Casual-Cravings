export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipe', {
      recipe_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'recipe_category',
          key: 'category_id'
        },
        onDelete: 'SET NULL'
      },
      sub_category_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'recipe_sub_category',
          key: 'sub_category_id'
        },
        onDelete: 'SET NULL'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      video_url: {
        type: Sequelize.STRING
      },
      image_url: {
        type: Sequelize.STRING
      },
      prep_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cook_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      serving_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      recipe_instructions: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: []
      },
      added_by_user: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      added_by_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      admin_approved_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'approved', 'rejected']]
        }
      },
      public_approved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edited_by_user: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      edited_by_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_edited_by_user_id: {
        type: Sequelize.INTEGER
      },
      last_edited_by_admin: {
        type: Sequelize.DATE
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('recipe');
  }
};