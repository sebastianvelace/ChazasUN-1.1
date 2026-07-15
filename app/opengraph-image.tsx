import { ImageResponse } from 'next/og'

// Imagen Open Graph dinamica (se auto-cablea como og:image y twitter:image).
// No hay imagen OG estatica en public/, asi que se genera con ImageResponse.
export const alt = 'Chaseek — El marketplace de tu campus'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(circle at 78% 22%, #A31E1E 0, transparent 42%), #101010',
          padding: '80px',
          color: '#fbfbf9',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#A31E1E',
              fontSize: '34px',
              fontWeight: 800,
            }}
          >
            C
          </div>
          <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '0.06em' }}>
            CHASEEK
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '86px',
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              maxWidth: '900px',
            }}
          >
            Las chazas de tu campus, a un desliz de distancia.
          </div>
          <div style={{ display: 'flex', fontSize: '30px', color: 'rgba(251,251,249,0.66)' }}>
            Comida, impresiones, reparaciones y más · UN Bogotá
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '26px' }}>
          <div style={{ display: 'flex', width: '40px', height: '4px', borderRadius: '2px', background: '#A31E1E' }} />
          <div style={{ display: 'flex', color: 'rgba(251,251,249,0.8)' }}>
            Marketplace universitario · sin comisiones
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
