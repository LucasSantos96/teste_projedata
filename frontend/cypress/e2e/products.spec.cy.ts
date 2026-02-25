/// <reference types="cypress" />
export {}

const API_BASE_URL = 'http://localhost:8080'

interface ProductMock {
  id: number
  code: string
  name: string
  price: number
}

function clickModalPrimaryButton() {
  cy.get('.border-t > .flex > .bg-blue-600').click()
}

describe('Products', () => {
  it('validates required fields before creating a product', () => {
    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: [],
    }).as('getProducts')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.contains('button', 'New Product').click()
    clickModalPrimaryButton()

    cy.contains('Product code is required.').should('be.visible')
    cy.contains('Product name is required.').should('be.visible')
    cy.contains('Price is required.').should('be.visible')
  })

  it('validates invalid price before creating a product', () => {
    let createCalled = false

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: [],
    }).as('getProducts')

    cy.intercept('POST', `${API_BASE_URL}/products`, () => {
      createCalled = true
    }).as('createProduct')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.contains('button', 'New Product').click()
    cy.contains('label', 'Product Code').parent().find('input').clear().type('PRD-900')
    cy.contains('label', 'Product Name').parent().find('input').clear().type('Invalid Product')
    cy.contains('label', 'Price').parent().find('input').clear().type('-10')
    clickModalPrimaryButton()

    cy.contains('Price must be a valid number greater than or equal to zero.').should('be.visible')
    cy.then(() => {
      expect(createCalled).to.eq(false)
    })
  })

  it('shows empty state and opens create modal from empty state action', () => {
    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: [],
    }).as('getProducts')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.contains('h3', 'No products available').should('be.visible')
    cy.contains('button', 'Create Product').click()
    cy.contains('h2', 'Create Product').should('be.visible')
  })

  it('sorts products by code ascending', () => {
    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: [
        { id: 10, code: 'PRD-010', name: 'Item 10', price: 10 },
        { id: 2, code: 'PRD-002', name: 'Item 2', price: 2 },
      ],
    }).as('getProducts')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.get('tbody tr').eq(0).should('contain.text', 'PRD-002')
    cy.get('tbody tr').eq(1).should('contain.text', 'PRD-010')
  })

  it('shows load error and retries successfully', () => {
    let shouldFail = true

    cy.intercept('GET', `${API_BASE_URL}/products`, (request) => {
      if (shouldFail) {
        shouldFail = false
        request.reply({
          statusCode: 500,
          body: { message: 'Temporary products error.' },
        })
        return
      }

      request.reply({
        statusCode: 200,
        body: [{ id: 1, code: 'PRD-001', name: 'Recovered Product', price: 120 }],
      })
    }).as('getProducts')

    cy.visit('/products')
    cy.wait('@getProducts')
    cy.contains('Temporary products error.').should('be.visible')

    cy.contains('button', 'Retry').click()
    cy.wait('@getProducts')

    cy.contains('Temporary products error.').should('not.exist')
    cy.get('tbody').should('contain.text', 'Recovered Product')
  })

  it('shows mutation error when create request fails', () => {
    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: [],
    }).as('getProducts')

    cy.intercept('POST', `${API_BASE_URL}/products`, {
      statusCode: 409,
      body: { message: 'Product code already exists.' },
    }).as('createProduct')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.contains('button', 'New Product').click()
    cy.contains('label', 'Product Code').parent().find('input').clear().type('PRD-001')
    cy.contains('label', 'Product Name').parent().find('input').clear().type('Duplicated')
    cy.contains('label', 'Price').parent().find('input').clear().type('10')
    clickModalPrimaryButton()

    cy.wait('@createProduct')
    cy.contains('Product code already exists.').should('be.visible')
    cy.contains('h2', 'Create Product').should('be.visible')
  })

  it('shows mutation error when update request fails', () => {
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Sensor', price: 89.99 }]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('PUT', `${API_BASE_URL}/products/*`, {
      statusCode: 500,
      body: { message: 'Unable to update product right now.' },
    }).as('updateProduct')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.get('button[aria-label="Edit Sensor"]').click()
    cy.contains('label', 'Product Name').parent().find('input').clear().type('Sensor Pro')
    clickModalPrimaryButton()

    cy.wait('@updateProduct')
    cy.contains('Unable to update product right now.').should('be.visible')
    cy.contains('h2', 'Edit Product').should('be.visible')
  })

  it('shows mutation error when delete request fails', () => {
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Sensor', price: 89.99 }]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('DELETE', `${API_BASE_URL}/products/*`, {
      statusCode: 500,
      body: { message: 'Unable to delete product right now.' },
    }).as('deleteProduct')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.get('button[aria-label="Delete Sensor"]').click()
    cy.get('[role="dialog"]').contains('button', 'Delete').click()

    cy.wait('@deleteProduct')
    cy.contains('Unable to delete product right now.').should('be.visible')
    cy.get('tbody').should('contain.text', 'Sensor')
  })

  it('keeps product when delete is cancelled', () => {
    let deleteCalled = false
    const products: ProductMock[] = [{ id: 1, code: 'PRD-001', name: 'Sensor', price: 89.99 }]

    cy.intercept('GET', `${API_BASE_URL}/products`, {
      statusCode: 200,
      body: products,
    }).as('getProducts')

    cy.intercept('DELETE', `${API_BASE_URL}/products/*`, () => {
      deleteCalled = true
    }).as('deleteProduct')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.get('button[aria-label="Delete Sensor"]').click()
    cy.get('[role="dialog"]').contains('button', 'Cancel').click()

    cy.then(() => {
      expect(deleteCalled).to.eq(false)
    })
    cy.get('tbody').should('contain.text', 'Sensor')
  })

  it('creates, updates and deletes products', () => {
    let products: ProductMock[] = [
      { id: 1, code: 'PRD-001', name: 'Sensor', price: 89.99 },
      { id: 2, code: 'PRD-002', name: 'Pump', price: 450 },
    ]

    cy.intercept('GET', `${API_BASE_URL}/products`, (request) => {
      request.reply({
        statusCode: 200,
        body: products,
      })
    }).as('getProducts')

    cy.intercept('POST', `${API_BASE_URL}/products`, (request) => {
      const payload = request.body as Omit<ProductMock, 'id'>
      const createdProduct: ProductMock = {
        id: Math.max(...products.map((product) => product.id), 0) + 1,
        code: payload.code,
        name: payload.name,
        price: Number(payload.price),
      }

      products = [...products, createdProduct]
      request.reply({
        statusCode: 201,
        body: createdProduct,
      })
    }).as('createProduct')

    cy.intercept('PUT', `${API_BASE_URL}/products/*`, (request) => {
      const productId = Number(request.url.split('/').pop())
      const payload = request.body as Omit<ProductMock, 'id'>

      products = products.map((product) =>
        product.id === productId
          ? {
              ...product,
              code: payload.code,
              name: payload.name,
              price: Number(payload.price),
            }
          : product,
      )

      const updatedProduct = products.find((product) => product.id === productId)
      request.reply({
        statusCode: 200,
        body: updatedProduct,
      })
    }).as('updateProduct')

    cy.intercept('DELETE', `${API_BASE_URL}/products/*`, (request) => {
      const productId = Number(request.url.split('/').pop())
      products = products.filter((product) => product.id !== productId)
      request.reply({
        statusCode: 204,
        body: '',
      })
    }).as('deleteProduct')

    cy.visit('/products')
    cy.wait('@getProducts')

    cy.contains('h1', 'Products').should('be.visible')
    cy.get('tbody').should('contain.text', 'Sensor')
    cy.get('tbody').should('contain.text', 'Pump')

    cy.contains('button', 'New Product').click()
    cy.contains('label', 'Product Code').parent().find('input').clear().type('PRD-003')
    cy.contains('label', 'Product Name').parent().find('input').clear().type('Mouse Gamer')
    cy.contains('label', 'Price').parent().find('input').clear().type('149.97')
    clickModalPrimaryButton()

    cy.wait('@createProduct').its('request.body').should('deep.include', {
      code: 'PRD-003',
      name: 'Mouse Gamer',
      price: 149.97,
    })
    cy.contains('Product created successfully.').should('be.visible')
    cy.get('tbody').should('contain.text', 'Mouse Gamer')

    cy.get('button[aria-label="Edit Sensor"]').click()
    cy.contains('label', 'Product Name').parent().find('input').clear().type('Sensor Pro')
    clickModalPrimaryButton()

    cy.wait('@updateProduct').its('request.body').should('deep.include', {
      code: 'PRD-001',
      name: 'Sensor Pro',
      price: 89.99,
    })
    cy.contains('Product updated successfully.').should('be.visible')
    cy.get('tbody').should('contain.text', 'Sensor Pro')

    cy.get('button[aria-label="Delete Pump"]').click()
    cy.get('[role="dialog"]').contains('button', 'Delete').click()

    cy.wait('@deleteProduct')
    cy.contains('Product deleted successfully.').should('be.visible')
    cy.get('tbody').should('not.contain.text', 'Pump')
  })
})
