/**
 * @author Wicramachine Sergio
 * Seeder pour créer des articles de démonstration
 */
'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Créer des utilisateurs de test
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await queryInterface.bulkInsert('Users', [
      {
        username: 'wicramachine',
        email: 'sergio@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'demo_user',
        email: 'demo@example.com',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Récupérer les IDs des utilisateurs créés
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Créer des articles de démonstration
    await queryInterface.bulkInsert('Articles', [
      {
        title: 'Bienvenue sur le Blog Wicramachine',
        content: 'Ceci est le premier article de notre blog. Nous allons partager des tutoriels, des astuces et des actualités sur le développement web. Restez connectés pour plus de contenu intéressant !',
        userId: users[0].id,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01')
      },
      {
        title: 'Introduction à Node.js et Express',
        content: 'Node.js est un environnement d\'exécution JavaScript côté serveur. Express est un framework web minimaliste qui facilite la création d\'applications web et d\'API. Dans cet article, nous allons explorer les bases de ces technologies et comment les utiliser ensemble pour créer des applications puissantes.',
        userId: users[0].id,
        createdAt: new Date('2026-01-05'),
        updatedAt: new Date('2026-01-05')
      },
      {
        title: 'Sécurité des applications web avec JWT',
        content: 'Les JSON Web Tokens (JWT) sont une méthode sécurisée pour transmettre des informations entre parties. Dans le contexte des applications web, ils sont souvent utilisés pour l\'authentification et l\'autorisation. Nous allons voir comment implémenter JWT dans une application Express avec bcrypt pour le hashage des mots de passe.',
        userId: users[1].id,
        createdAt: new Date('2026-01-08'),
        updatedAt: new Date('2026-01-08')
      },
      {
        title: 'Sequelize : L\'ORM pour Node.js',
        content: 'Sequelize est un ORM (Object-Relational Mapping) puissant pour Node.js qui supporte PostgreSQL, MySQL, MariaDB, SQLite et Microsoft SQL Server. Il permet de manipuler des bases de données relationnelles en utilisant du JavaScript plutôt que du SQL brut. Les migrations et les seeders facilitent la gestion du schéma de la base de données.',
        userId: users[0].id,
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-10')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Articles', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
