'use strict';
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   lastName: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */ 
    const hash = await bcrypt.hash('Password123!', 10);
    await queryInterface.bulkInsert('Users', [
      {
        firstName: "Alice",
        lastName: "Dupont",
        email: "alice.dupont@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Bob",
        lastName: "Martin",
        email: "bob.martin@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Caroline",
        lastName: "Petit",
        email: "caroline.petit@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "David",
        lastName: "Leroy",
        email: "david.leroy@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Emma",
        lastName: "Moreau",
        email: "emma.moreau@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "François",
        lastName: "Rousseau",
        email: "francois.rousseau@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Gabriel",
        lastName: "Laurent",
        email: "gabriel.laurent@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Hélène",
        lastName: "Dubois",
        email: "helene.dubois@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Isabelle",
        lastName: "Faure",
        email: "isabelle.faure@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        firstName: "Julien",
        lastName: "Garnier",
        email: "julien.garnier@example.com",
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], { });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
    */
    await queryInterface.bulkDelete('User', null, {});
  }
};
