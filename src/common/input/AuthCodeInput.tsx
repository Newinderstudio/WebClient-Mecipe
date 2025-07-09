import React, { useRef, useEffect, useState } from 'react'

interface Props {
  onSubmit: (code: string) => void
}

export function AuthCodeInput({ onSubmit }: Props) {
  const [values, setValues] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return // 숫자 하나만 허용

    const newValues = [...values]
    newValues[index] = value
    setValues(newValues)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newValues.every((char) => char !== '')) {
      onSubmit(newValues.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {values.map((v, i) => (
        <input
          key={i}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          ref={(el) => (inputRefs.current[i] = el)}
          inputMode="numeric"
          style={{
            width: '2rem',
            height: '2.5rem',
            textAlign: 'center',
            fontSize: '1.5rem',
          }}
        />
      ))}
    </div>
  )
}