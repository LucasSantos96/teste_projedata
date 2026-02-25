/// <reference types="cypress" />
export {}

const API_BASE_URL = 'http://localhost:8080'

interface ProductMock {
  id: number
  code: string
  name: string
  price: number
}

interface RawMaterialMock {
  id: number
  code: string
  name: string
  stockQuantity: number
}

interface CompositionMock {
  id: number
  productId: number
  rawMaterialId: number
  rawMaterialCode: string
  rawMaterialName: string
  requiredQuantity: number
}

function clickModalPrimaryButton() {
  cy.get('.border-t > .flex > .bg-blue-600').click()
}

describe('Composition', () => {
  it('validates required fields before adding a composition item', () => {
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Frame', stockQuantity: 250 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('GET', `${API_BASE_URL}/products/*/raw-materials`, {
      statusCode: 200,
      body: [],
    }).as('getComposition')

    cy.visit('/composition')
    cy.wait(['@getProducts', '@getRawMaterials', '@getComposition'])

    cy.contains('button', 'Add Raw Material').click()
    clickModalPrimaryButton()

    cy.contains('Raw material is required.').should('be.visible')
    cy.contains('Required quantity is required.').should('be.visible')
  })

  it('validates invalid required quantity before adding a composition item', () => {
    let createCalled = false
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Frame', stockQuantity: 250 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('GET', `${API_BASE_URL}/products/*/raw-materials`, {
      statusCode: 200,
      body: [],
    }).as('getComposition')

    cy.intercept('POST', `${API_BASE_URL}/products/*/raw-materials`, () => {
      createCalled = true
    }).as('createComposition')

    cy.visit('/composition')
    cy.wait(['@getProducts', '@getRawMaterials', '@getComposition'])

    cy.contains('button', 'Add Raw Material').click()
    cy.get('#raw-material-select').select('1')
    cy.contains('label', 'Required Quantity').parent().find('input').clear().type('-1')
    clickModalPrimaryButton()

    cy.contains('Required quantity must be a valid number greater than zero.').should('be.visible')
    cy.then(() => {
      expect(createCalled).to.eq(false)
    })
  })

  it('shows composition load error and retries successfully', () => {
    let shouldFail = true
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Frame', stockQuantity: 250 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('GET', `${API_BASE_URL}/products/*/raw-materials`, (request) => {
      if (shouldFail) {
        shouldFail = false
        request.reply({
          statusCode: 500,
          body: { message: 'Temporary composition error.' },
        })
        return
      }

      request.reply({
        statusCode: 200,
        body: [],
      })
    }).as('getComposition')

    cy.visit('/composition')
    cy.wait(['@getProducts', '@getRawMaterials', '@getComposition'])
    cy.contains('Temporary composition error.').should('be.visible')

    cy.contains('button', 'Retry Composition').click()
    cy.wait('@getComposition')

    cy.contains('Temporary composition error.').should('not.exist')
    cy.contains('h3', 'No raw materials associated').should('be.visible')
  })

  it('shows mutation error when create request fails', () => {
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Frame', stockQuantity: 250 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('GET', `${API_BASE_URL}/products/*/raw-materials`, {
      statusCode: 200,
      body: [],
    }).as('getComposition')

    cy.intercept('POST', `${API_BASE_URL}/products/*/raw-materials`, {
      statusCode: 409,
      body: { message: 'Composition item already exists.' },
    }).as('createComposition')

    cy.visit('/composition')
    cy.wait(['@getProducts', '@getRawMaterials', '@getComposition'])

    cy.contains('button', 'Add Raw Material').click()
    cy.get('#raw-material-select').select('1')
    cy.contains('label', 'Required Quantity').parent().find('input').clear().type('2')
    clickModalPrimaryButton()

    cy.wait('@createComposition').its('request.body').should('deep.include', {
      rawMaterialId: 1,
      quantityRequired: 2,
    })
    cy.contains('Composition item already exists.').should('be.visible')
    cy.contains('h2', 'Add Composition Item').should('be.visible')
  })

  it('shows mutation error when update request fails', () => {
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Frame', stockQuantity: 250 },
    ]
    const compositions: CompositionMock[] = [
      {
        id: 1,
        productId: 1,
        rawMaterialId: 1,
        rawMaterialCode: 'RM-001',
        rawMaterialName: 'Steel Frame',
        requiredQuantity: 2,
      },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('GET', `${API_BASE_URL}/products/*/raw-materials`, {
      statusCode: 200,
      body: compositions,
    }).as('getComposition')

    cy.intercept('PUT', `${API_BASE_URL}/products/*/raw-materials/*`, {
      statusCode: 500,
      body: { message: 'Unable to update composition item right now.' },
    }).as('updateComposition')

    cy.visit('/composition')
    cy.wait(['@getProducts', '@getRawMaterials', '@getComposition'])

    cy.get('button[aria-label="Edit Steel Frame"]').click()
    cy.contains('label', 'Required Quantity').parent().find('input').clear().type('4')
    clickModalPrimaryButton()

    cy.wait('@updateComposition').its('request.body').should('deep.include', {
      rawMaterialId: 1,
      quantityRequired: 4,
    })
    cy.contains('Unable to update composition item right now.').should('be.visible')
    cy.contains('h2', 'Edit Composition Item').should('be.visible')
  })

  it('shows mutation error when delete request fails', () => {
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Frame', stockQuantity: 250 },
    ]
    const compositions: CompositionMock[] = [
      {
        id: 1,
        productId: 1,
        rawMaterialId: 1,
        rawMaterialCode: 'RM-001',
        rawMaterialName: 'Steel Frame',
        requiredQuantity: 2,
      },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('GET', `${API_BASE_URL}/products/*/raw-materials`, {
      statusCode: 200,
      body: compositions,
    }).as('getComposition')

    cy.intercept('DELETE', `${API_BASE_URL}/products/*/raw-materials/*`, {
      statusCode: 500,
      body: { message: 'Unable to delete composition item right now.' },
    }).as('deleteComposition')

    cy.visit('/composition')
    cy.wait(['@getProducts', '@getRawMaterials', '@getComposition'])

    cy.get('button[aria-label="Delete Steel Frame"]').click()
    cy.get('[role="dialog"]').contains('button', 'Delete').click()

    cy.wait('@deleteComposition')
    cy.contains('Unable to delete composition item right now.').should('be.visible')
    cy.get('tbody').should('contain.text', 'Steel Frame')
  })

  it('creates, updates and deletes composition items', () => {
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Mouse Gamer', price: 149.97 }]
    const rawMaterials: RawMaterialMock[] = [
      { id: 1, code: 'RM-001', name: 'Steel Frame', stockQuantity: 250 },
      { id: 2, code: 'RM-002', name: 'Plastic Resin', stockQuantity: 400 },
    ]
    let compositions: CompositionMock[] = [
      {
        id: 1,
        productId: 1,
        rawMaterialId: 1,
        rawMaterialCode: 'RM-001',
        rawMaterialName: 'Steel Frame',
        requiredQuantity: 2,
      },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('GET', `${API_BASE_URL}/raw-materials`, {
      statusCode: 200,
      body: rawMaterials,
    }).as('getRawMaterials')

    cy.intercept('GET', `${API_BASE_URL}/products/*/raw-materials`, (request) => {
      request.reply({
        statusCode: 200,
        body: compositions,
      })
    }).as('getComposition')

    cy.intercept('POST', `${API_BASE_URL}/products/*/raw-materials`, (request) => {
      const payload = request.body as { rawMaterialId: number; quantityRequired: number }
      const rawMaterial = rawMaterials.find((item) => item.id === Number(payload.rawMaterialId))

      const createdItem: CompositionMock = {
        id: Math.max(...compositions.map((item) => item.id), 0) + 1,
        productId: 1,
        rawMaterialId: Number(payload.rawMaterialId),
        rawMaterialCode: rawMaterial?.code ?? 'RM-NEW',
        rawMaterialName: rawMaterial?.name ?? 'Unknown Raw Material',
        requiredQuantity: Number(payload.quantityRequired),
      }

      compositions = [...compositions, createdItem]
      request.reply({
        statusCode: 201,
        body: createdItem,
      })
    }).as('createComposition')

    cy.intercept('PUT', `${API_BASE_URL}/products/*/raw-materials/*`, (request) => {
      const compositionId = Number(request.url.split('/').pop())
      const payload = request.body as { rawMaterialId: number; quantityRequired: number }
      const rawMaterial = rawMaterials.find((item) => item.id === Number(payload.rawMaterialId))

      compositions = compositions.map((item) =>
        item.id === compositionId
          ? {
              ...item,
              rawMaterialId: Number(payload.rawMaterialId),
              rawMaterialCode: rawMaterial?.code ?? item.rawMaterialCode,
              rawMaterialName: rawMaterial?.name ?? item.rawMaterialName,
              requiredQuantity: Number(payload.quantityRequired),
            }
          : item,
      )

      const updatedItem = compositions.find((item) => item.id === compositionId)
      request.reply({
        statusCode: 200,
        body: updatedItem,
      })
    }).as('updateComposition')

    cy.intercept('DELETE', `${API_BASE_URL}/products/*/raw-materials/*`, (request) => {
      const compositionId = Number(request.url.split('/').pop())
      compositions = compositions.filter((item) => item.id !== compositionId)
      request.reply({
        statusCode: 204,
        body: '',
      })
    }).as('deleteComposition')

    cy.visit('/composition')
    cy.wait(['@getProducts', '@getRawMaterials', '@getComposition'])

    cy.contains('h1', 'Composition').should('be.visible')
    cy.get('tbody').should('contain.text', 'Steel Frame')

    cy.contains('button', 'Add Raw Material').click()
    cy.get('#raw-material-select').select('2')
    cy.contains('label', 'Required Quantity').parent().find('input').clear().type('3')
    clickModalPrimaryButton()

    cy.wait('@createComposition').its('request.body').should('deep.include', {
      rawMaterialId: 2,
      quantityRequired: 3,
    })
    cy.contains('Composition item created successfully.').should('be.visible')
    cy.get('tbody').should('contain.text', 'Plastic Resin')

    cy.get('button[aria-label="Edit Plastic Resin"]').click()
    cy.contains('label', 'Required Quantity').parent().find('input').clear().type('4')
    clickModalPrimaryButton()

    cy.wait('@updateComposition').its('request.body').should('deep.include', {
      rawMaterialId: 2,
      quantityRequired: 4,
    })
    cy.contains('Composition item updated successfully.').should('be.visible')
    cy.get('tbody').contains('tr', 'Plastic Resin').within(() => {
      cy.contains('4').should('be.visible')
    })

    cy.get('button[aria-label="Delete Plastic Resin"]').click()
    cy.get('[role="dialog"]').contains('button', 'Delete').click()

    cy.wait('@deleteComposition')
    cy.contains('Composition item deleted successfully.').should('be.visible')
    cy.get('tbody').should('not.contain.text', 'Plastic Resin')
  })
})
