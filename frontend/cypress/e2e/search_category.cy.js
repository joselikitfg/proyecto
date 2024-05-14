describe('Search Product', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080)
        Cypress.Keyboard.defaults({
            keystrokeDelay: 80,
        })
        cy.visit('/')
        cy.get('input[name="username"]').type('cypressuser')
        cy.get('input[name="password"]').type('Unapassword.123')
        cy.get('button[type="submit"]').click();
    })


    it('should actually be accessible', () => {

        cy.get('input[name="search"]').should('have.attr', 'placeholder', 'Buscar productos')
        cy.screenshot('contains search button')
    })

    // it('should search detergente', () => {
    //     cy.get('input[name="search"]').type('detergente')
    //     cy.get('button[type="submit"]').contains('Buscar').click()
    //     cy.wait(700)
    //     cy.screenshot('search result')
    // });

})