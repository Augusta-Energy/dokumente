import type { ButtonHTMLAttributes } from 'react'

type Variante = 'gold' | 'dark' | 'outline' | 'text'
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; klein?: boolean }

export function Button({ variante = 'outline', klein = false, className = '', type = 'button', ...rest }: Props) {
  return <button type={type} className={`btn btn-${variante} ${klein ? 'btn-sm' : ''} ${className}`.trim()} {...rest} />
}
