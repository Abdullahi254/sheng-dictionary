import { ImageResponse } from 'next/og'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  const imgBuffer = readFileSync(join(process.cwd(), 'public/matatu.jpg'))
  const src = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
        }}
      />
    ),
    { width: 512, height: 512 },
  )
}
