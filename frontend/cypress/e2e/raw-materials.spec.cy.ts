/// <reference types="cypress" />
export {}

const API_BASE_URL = 'http://localhost:8080'

interface RawMaterialMock {
  id: number
  code: string
  name: string
  stockQuantity: number
}

function clickModalPrimaryButton() {
  cy.get('.border-t > .flex > .bg-blue-600').click()
}

describe('Raw Materials', () => {
  it('validates required fields before creating a raw material', () => {
    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: [],
    }).as('getRawMaterials')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.contains('button', 'New Raw Material').click()
    clickModalPrimaryButton()

    cy.contains('Raw material code is required.').should('be.visible')
    cy.contains('Raw material name is required.').should('be.visible')
    cy.contains('Stock quantity is required.').should('be.visible')
  })

  it('validates invalid stock quantity before creating a raw material', () => {
    let createCalled = false

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: [],
    }).as('getRawMaterials')

    cy.intercept('POST', `${API_BASE_URL}/raw-materials`, () => {
      createCalled = true
    }).as('createRawMaterial')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.contains('button', 'New Raw Material').click()
    cy.contains('label', 'Raw Material Code').parent().find('input').clear().type('RM-900')
    cy.contains('label', 'Raw Material Name').parent().find('input').clear().type('Invalid Raw Material')
    cy.contains('label', 'Stock Quantity').parent().find('input').clear().type('-10')
    clickModalPrimaryButton()

    cy.contains('Stock quantity must be a valid number greater than or equal to zero.').should('be.visible')
    cy.then(() => {
      expect(createCalled).to.eq(false)
    })
  })

  it('shows empty state and opens create modal from empty state action', () => {
    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: [],
    }).as('getRawMaterials')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.contains('h3', 'No raw materials available').should('be.visible')
    cy.contains('button', 'Create Raw Material').click()
    cy.contains('h2', 'Create Raw Material').should('be.visible')
  })

  it('sorts raw materials by code ascending', () => {
    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: [
        { id: 10, code: 'RM-010', name: 'Item 10', stockQuantity: 10 },
        { id: 2, code: 'RM-002', name: 'Item 2', stockQuantity: 2 },
      ],
    }).as('getRawMaterials')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.get('tbody tr').eq(0).should('contain.text', 'RM-002')
    cy.get('tbody tr').eq(1).should('contain.text', 'RM-010')
  })

  it('shows load error and retries successfully', () => {
    let shouldFail = true

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, (request) => {
      if (shouldFail) {
        shouldFail = false
        request.reply({
          statusCode: 500,
          body: { message: 'Temporary raw materials error.' },
        })
        return
      }

      request.reply({
        statusCode: 200,
        body: [{ id: 1, code: 'RM-001', name: 'Recovered Raw Material', stockQuantity: 120 }],
      })
    }).as('getRawMaterials')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')
    cy.contains('Temporary raw materials error.').should('be.visible')

    cy.contains('button', 'Retry').click()
    cy.wait('@getRawMaterials')

    cy.contains('Temporary raw materials error.').should('not.exist')
    cy.get('tbody').should('contain.text', 'Recovered Raw Material')
  })

  it('shows mutation error when create request fails', () => {
    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: [],
    }).as('getRawMaterials')

    cy.intercept('POST', `${API_BASE_URL}/raw-materials`, {
      statusCode: 409,
      body: { message: 'Raw material code already exists.' },
    }).as('createRawMaterial')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.contains('button', 'New Raw Material').click()
    cy.contains('label', 'Raw Material Code').parent().find('input').clear().type('RM-001')
    cy.contains('label', 'Raw Material Name').parent().find('input').clear().type('Duplicated')
    cy.contains('label', 'Stock Quantity').parent().find('input').clear().type('10')
    clickModalPrimaryButton()

    cy.wait('@createRawMaterial')
    cy.contains('Raw material code already exists.').should('be.visible')
    cy.contains('h2', 'Create Raw Material').should('be.visible')
  })

  it('shows mutation error when update request fails', () => {
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Sheet', stockQuantity: 1200 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('PUT', `${API_BASE_URL}/raw-materials/*`, {
      statusCode: 500,
      body: { message: 'Unable to update raw material right now.' },
    }).as('updateRawMaterial')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.get('button[aria-label="Edit Steel Sheet"]').click()
    cy.contains('label', 'Raw Material Name').parent().find('input').clear().type('Steel Sheet Grade A')
    clickModalPrimaryButton()

    cy.wait('@updateRawMaterial')
    cy.contains('Unable to update raw material right now.').should('be.visible')
    cy.contains('h2', 'Edit Raw Material').should('be.visible')
  })

  it('shows linked-composition error message when delete request fails', () => {
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Sheet', stockQuantity: 1200 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('DELETE', `${API_BASE_URL}/raw-materials/*`, {
      statusCode: 409,
      body: { message: 'Conflict' },
    }).as('deleteRawMaterial')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.get('button[aria-label="Delete Steel Sheet"]').click()
    cy.get('[role="dialog"]').contains('button', 'Delete').click()

    cy.wait('@deleteRawMaterial')
    cy.contains(
      'Unable to delete raw material because it is linked to product composition. Remove the associations first.',
    ).should('be.visible')
    cy.get('tbody').should('contain.text', 'Steel Sheet')
  })

  it('keeps raw material when delete is cancelled', () => {
    let deleteCalled = false
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Sheet', stockQuantity: 1200 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('DELETE', `${API_BASE_URL}/raw-materials/*`, () => {
      deleteCalled = true
    }).as('deleteRawMaterial')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.get('button[aria-label="Delete Steel Sheet"]').click()
    cy.get('[role="dialog"]').contains('button', 'Cancel').click()

    cy.then(() => {
      expect(deleteCalled).to.eq(false)
    })
    cy.get('tbody').should('contain.text', 'Steel Sheet')
  })

  it('creates, updates and deletes raw materials', () => {
    let rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Sheet', stockQuantity: 1200 },
      { id: 2, code: 'RM-002', name: 'Aluminum Coil', stockQuantity: 800 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, (request) => {
      request.reply({
        statusCode: 200,
        body: rawMaterials,
      })
    }).as('getRawMaterials')

    cy.intercept('POST', `${API_BASE_URL}/raw-materials`, (request) => {
      const payload = request.body as Omit<RawMaterialMock, 'id'>
      const createdRawMaterial: RawMaterialMock = {
        id: Math.max(...rawMaterials.map((rawMaterial) => rawMaterial.id), 0) + 1,
        code: payload.code,
        name: payload.name,
        stockQuantity: Number(payload.stockQuantity),
      }

      rawMaterials = [...rawMaterials, createdRawMaterial]
      request.reply({
        statusCode: 201,
        body: createdRawMaterial,
      })
    }).as('createRawMaterial')

    cy.intercept('PUT', `${API_BASE_URL}/raw-materials/*`, (request) => {
      const rawMaterialId = Number(request.url.split('/').pop())
      const payload = request.body as Omit<RawMaterialMock, 'id'>

      rawMaterials = rawMaterials.map((rawMaterial) =>
        rawMaterial.id === rawMaterialId
          ? {
              ...rawMaterial,
              code: payload.code,
              name: payload.name,
              stockQuantity: Number(payload.stockQuantity),
            }
          : rawMaterial,
      )

      const updatedRawMaterial = rawMaterials.find((rawMaterial) => rawMaterial.id === rawMaterialId)
      request.reply({
        statusCode: 200,
        body: updatedRawMaterial,
      })
    }).as('updateRawMaterial')

    cy.intercept('DELETE', `${API_BASE_URL}/raw-materials/*`, (request) => {
      const rawMaterialId = Number(request.url.split('/').pop())
      rawMaterials = rawMaterials.filter((rawMaterial) => rawMaterial.id !== rawMaterialId)
      request.reply({
        statusCode: 204,
        body: '',
      })
    }).as('deleteRawMaterial')

    cy.visit('/raw-materials')
    cy.wait('@getRawMaterials')

    cy.contains('h1', 'Raw Materials').should('be.visible')
    cy.get('tbody').should('contain.text', 'Steel Sheet')
    cy.get('tbody').should('contain.text', 'Aluminum Coil')

    cy.contains('button', 'New Raw Material').click()
    cy.contains('label', 'Raw Material Code').parent().find('input').clear().type('RM-003')
    cy.contains('label', 'Raw Material Name').parent().find('input').clear().type('Industrial Adhesive')
    cy.contains('label', 'Stock Quantity').parent().find('input').clear().type('150')
    clickModalPrimaryButton()

    cy.wait('@createRawMaterial').its('request.body').should('deep.include', {
      code: 'RM-003',
      name: 'Industrial Adhesive',
      stockQuantity: 150,
    })
    cy.contains('Raw material created successfully.').should('be.visible')
    cy.get('tbody').should('contain.text', 'Industrial Adhesive')

    cy.get('button[aria-label="Edit Steel Sheet"]').click()
    cy.contains('label', 'Raw Material Name').parent().find('input').clear().type('Steel Sheet Grade A')
    clickModalPrimaryButton()

    cy.wait('@updateRawMaterial').its('request.body').should('deep.include', {
      code: 'RM-001',
      name: 'Steel Sheet Grade A',
      stockQuantity: 1200,
    })
    cy.contains('Raw material updated successfully.').should('be.visible')
    cy.get('tbody').should('contain.text', 'Steel Sheet Grade A')

    cy.get('button[aria-label="Delete Aluminum Coil"]').click()
    cy.get('[role="dialog"]').contains('button', 'Delete').click()

    cy.wait('@deleteRawMaterial')
    cy.contains('Raw material deleted successfully.').should('be.visible')
    cy.get('tbody').should('not.contain.text', 'Aluminum Coil')
  })
})
