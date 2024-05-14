describe('Login Test', () => {
  beforeEach(() => {
      cy.viewport(1920, 1080)
      Cypress.Keyboard.defaults({
          keystrokeDelay: 80,
      })
  })
  it('Logs in with valid credentials', () => {

      cy.visit('/');
      cy.screenshot('home-login')

      cy.contains('label', 'Username').should('be.visible')
      cy.get('input[name="username"]').should('have.attr', 'placeholder', 'Enter your Username')
      cy.contains('label', 'Password').should('be.visible')
      cy.get('input[name="password"]').should('have.attr', 'placeholder', 'Enter your Password')
      cy.contains('span', 'Sign in').should('be.visible')
      cy.wait(700)
      cy.get('input[name="username"]').type('cypressuser');
      cy.get('input[name="password"]').type('Unapassword.123');
      cy.screenshot('home-signin')
      cy.screenshot()
      cy.wait(700)
      cy.get('button[type="submit"]').click();

      cy.get('.nav-link.active').contains('Sesión iniciada con cypressuser')
      cy.wait(700)
      cy.screenshot('home')
  });

});