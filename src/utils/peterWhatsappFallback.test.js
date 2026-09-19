import { buildPeterWhatsappUrl } from './peterWhatsappFallback';

describe('PayFlow commercial handoff', () => {
  it('preserves the WhatsApp destination and encodes the commercial intent', () => {
    const url = buildPeterWhatsappUrl(
      'https://wa.me/5562999999999',
      'Quero conhecer os planos disponíveis e concluir a contratação.'
    );

    expect(url).toBe(
      'https://wa.me/5562999999999?text=Quero%20conhecer%20os%20planos%20dispon%C3%ADveis%20e%20concluir%20a%20contrata%C3%A7%C3%A3o.'
    );
  });

  it('does not invent a destination when commercial contact is unavailable', () => {
    expect(buildPeterWhatsappUrl(null, 'Quero contratar')).toBeNull();
  });
});
