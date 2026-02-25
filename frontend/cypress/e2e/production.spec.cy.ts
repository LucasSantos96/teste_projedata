/// <reference types="cypress" />
export {}

const API_BASE_URL = 'http://localhost:8080'

describe('Production', () => {
  it('loads production suggestions and summary', () => {
    cy.intercept('GET', `${API_BASE_URL}/production/suggestions`, {
      statusCode: 200,
      body: {
        suggestions: [
          {
            productId: 1,
            productCode: 'PRD-001',
            productName: 'Mouse Gamer',
            productPrice: 149.97,
            maxProducibleQuantity: 2,
            totalValue: 299.94,
          },
          {
            productId: 2,
            productCode: 'PRD-002',
            productName: 'Industrial Sensor',
            productPrice: 240.03,
            maxProducibleQuantity: 2,
            totalValue: 480.06,
          },
        ],
        grandTotalValue: 780,
        totalProductsAnalyzed: 5,
      },
    }).as('getProduction')

    cy.visit('/production')
    cy.wait('@getProduction')

    cy.contains('h1', 'Production').should('be.visible')
    cy.get('tbody').should('contain.text', 'Mouse Gamer')
    cy.get('tbody').should('contain.text', 'Industrial Sensor')
    cy.contains(/R\$\s*780,00/).should('be.visible')
    cy.contains('h3', 'Products Analyzed').parent().contains('5').should('be.visible')
  })

  it('shows empty state when there are no production suggestions', () => {
    cy.intercept('GET', `${API_BASE_URL}/production/suggestions`, {
      statusCode: 200,
      body: {
        suggestions: [],
        grandTotalValue: 0,
        totalProductsAnalyzed: 0,
      },
    }).as('getProduction')

    cy.visit('/production')
    cy.wait('@getProduction')

    cy.contains('h3', 'No production suggestions available').should('be.visible')
    cy.contains(/R\$\s*0,00/).should('be.visible')
    cy.contains('h3', 'Products Analyzed').parent().contains('0').should('be.visible')
  })

  it('retries after an error response', () => {
    let shouldFail = true

    cy.intercept('GET', `${API_BASE_URL}/production/suggestions`, (request) => {
      if (shouldFail) {
        shouldFail = false
        request.reply({
          statusCode: 500,
          body: { message: 'Temporary production error.' },
        })
        return
      }

      request.reply({
        statusCode: 200,
        body: {
          suggestions: [
            {
              productId: 1,
              productCode: 'PRD-001',
              productName: 'Mouse Gamer',
              productPrice: 149.97,
              maxProducibleQuantity: 2,
              totalValue: 299.94,
            },
          ],
          grandTotalValue: 299.94,
          totalProductsAnalyzed: 1,
        },
      })
    }).as('getProduction')

    cy.visit('/production')
    cy.wait('@getProduction')
    cy.contains('Temporary production error.').should('be.visible')

    cy.contains('button', 'Retry').click()
    cy.wait('@getProduction')

    cy.contains('Temporary production error.').should('not.exist')
    cy.get('tbody').should('contain.text', 'Mouse Gamer')
    cy.contains(/R\$\s*299,94/).should('be.visible')
  })
})
