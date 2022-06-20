/// <reference types="Cypress" />

import { login } from "../page_objects/login";
import { createOrganization } from "../page_objects/createOrganization";
import { edit } from "../page_objects/edit";
import { profile } from "../page_objects/profile";
import { deleteOrg } from "../page_objects/deleteOrg";

const faker = require("faker");

describe("Login test", () => {
  let loginData = {
    email: "uros.letic04@gmail.com",
    password: "9214AZrQc",
    newPassword: "9214AZrQc2",
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  };
  let organizationData = {
    name: faker.name.firstName(),
    newName: faker.name.firstName(),
    projectName: faker.name.lastName(),
  };
  let boardId;
  let orgId;
  let boardType = 0;

  beforeEach("visit login page", () => {
    cy.visit("/login");
    cy.url().should("include", "/login");
  });

  it("valid login", () => {
    cy.intercept({
      method: "POST",
      url: "https://cypress-api.vivifyscrum-stage.com/api/v2/login",
    }).as("login");
    login.login(loginData.email, loginData.password);
    cy.wait("@login").then((interception) => {
      cy.url().should("not.include", "/login");
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.token).to.exist;
      expect(interception.response.body.user.id).to.exist;
    });
  });

  it("Organization creation without image", () => {
    cy.intercept({
      method: "POST",
      url: "https://cypress-api.vivifyscrum-stage.com/api/v2/organizations",
    }).as("create");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit("/my-organizations");
    createOrganization.create(organizationData.name);
    cy.wait("@create").then((interception) => {
      orgId = interception.response.body.id;
      expect(interception.response.body.status).eq("active");
      expect(interception.response.statusCode).eq(201);
      expect(interception.response.body.id).to.exist;
      expect(interception.response.body.name).to.eq(organizationData.name);
      cy.url().should("include", "/boards");
    });
  });

  it("Add a board", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/boards`,
    }).as("addBoard");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);

    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/boards`
    );
    edit.addBoard(boardType, organizationData.projectName);
    cy.wait(3000);
    cy.wait("@addBoard").then((interception) => {
      boardId = interception.response.body.id;
      expect(interception.response.statusCode).eq(201);
      expect(interception.response.body.name).eq(organizationData.projectName);
      expect(interception.response.body.status).eq("active");
      expect(interception.response.body.type).eq("scrum_board");
      cy.url().should("include", `/boards/${boardId}`);
    });
  });

  it("delete the board", () => {
    cy.intercept({
      method: "DELETE",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/boards/${boardId}`,
    }).as("deleteBoard");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);

    cy.visit(`https://cypress.vivifyscrum-stage.com/boards/${boardId}`);
    edit.deleteBoard();
    cy.wait(3000);
    cy.wait("@deleteBoard").then((interception) => {
      expect(interception.response.statusCode).eq(200);
      expect(interception.response.body.id).eq(boardId);
    });
  });

  it("Delete the organization", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/organizations/${orgId}`,
    }).as("deleteOrg");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(
      `https://cypress.vivifyscrum-stage.com/organizations/${orgId}/settings`
    );
    deleteOrg.delete();
    cy.wait("@deleteOrg").then((interception) => {
      expect(interception.response.statusCode).eq(201);
      cy.url().should("not.include", `organizations/${orgId}/settings`);
    });
  });

  it("Logout", () => {
    cy.intercept({
      method: "POST",
      url: `https://cypress-api.vivifyscrum-stage.com/api/v2/logout`,
    }).as("logout");
    login.login(loginData.email, loginData.password);
    cy.wait(3000);
    cy.visit(`https://cypress.vivifyscrum-stage.com/account/settings`);
    cy.wait(2000);
    profile.logout();
    cy.wait("@logout").then((interception) => {
      expect(interception.response.statusCode).eq(201);
      expect(interception.response.body.message).eq("Successfully logged out");
    });
  });
});
