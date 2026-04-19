describe('slotpatcher live scan experience', () => {
  it('shows a staged premium scan console before results', () => {
    cy.visit('/');

    cy.get('#providerPickerBtn').click();
    cy.get('.provider-modal.is-open .provider-card').first().click();

    cy.get('#scanButton').click({ force: true });

    cy.get('#scanningSection', { timeout: 15000 }).should('be.visible');
    cy.contains('#scanningSection', 'Provider Scan').should('exist');
    cy.get('#scanningSection [data-scan-stage]').should('have.length', 5);
    cy.get('#scanningSection [data-scan-metric]').should('have.length.at.least', 4);
    cy.contains('#scanningSection', 'ACTIVE PIPELINE').should('exist');
    cy.contains('#scanningSection', 'EVENT STREAM').should('exist');
    cy.get('#scanFinalReveal', { timeout: 15000 }).should('be.visible');
    cy.contains('#scanFinalReveal', 'Live result ready').should('exist');

    cy.get('#resultsSection', { timeout: 22000 }).should('be.visible');
  });

  it('loads provider logos from local assets without lazy-loading the modal grid', () => {
    cy.visit('/');

    cy.get('#providerPickerBtn').click();
    cy.get('.provider-modal.is-open .provider-card img').should('have.length.at.least', 10);
    cy.get('.provider-modal.is-open .provider-card img').each(($img) => {
      const src = $img.attr('src') || '';
      const loading = $img.attr('loading') || '';

      expect(src, `logo src for ${$img.attr('alt')}`).to.include('assets/');
      expect(src, `logo src for ${$img.attr('alt')}`).to.not.include('storage.googleapis.com');
      expect(loading, `loading attr for ${$img.attr('alt')}`).to.not.equal('lazy');
    });
  });
});
