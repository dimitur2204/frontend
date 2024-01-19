import { Button, ButtonProps } from '@mui/material'
import { uniqueId } from 'lodash'
import Link, { LinkProps } from 'next/link'
import { forwardRef, Ref, useMemo } from 'react'

export type LinkRef = HTMLButtonElement
export type NextLinkProps = ButtonProps & Pick<LinkProps, 'href' | 'as' | 'prefetch' | 'locale'>

const LinkButton = (
  { href, as, prefetch, locale, disabled, ...props }: NextLinkProps,
  ref: Ref<LinkRef>,
) => {
  const id = useMemo(() => uniqueId('link-button-'), [props.id])
  return (
    <Link
      href={href}
      as={as}
      prefetch={prefetch}
      locale={locale}
      passHref
      tabIndex={disabled ? -1 : 0}
      aria-labelledby={id}
      style={{ pointerEvents: disabled ? 'none' : 'all' }}>
      <Button id={props.id || id} ref={ref} tabIndex={-1} disabled={disabled} {...props} />
    </Link>
  )
}

export default forwardRef(LinkButton)
