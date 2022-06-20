const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://cypress.vivifyscrum-stage.com",
    env: {
      VALID_USER_EMAIL: "UROS.LETIC00@GMAIL.COM",
      VALID_USER_PASSWORD: "12345678",
    },

    // implement node event listeners here
  },
  defaultCommandTimeout: 6000,
});
