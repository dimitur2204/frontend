import React, { forwardRef, Ref, useMemo } from 'react'
import Link, { LinkProps } from 'next/link'
import { IconButton, IconButtonProps } from '@mui/material'
import { uniqueId } from 'lodash'

export type LinkRef = HTMLButtonElement
export type NextLinkProps = IconButtonProps & Pick<LinkProps, 'href' | 'as' | 'prefetch'>

const LinkIconButton = ({ href, as, prefetch, ...props }: NextLinkProps, ref: Ref<LinkRef>) => {
  const id = useMemo(() => uniqueId('link-button-'), [props.id])
  return (
    <Link href={href} as={as} aria-labelledby={id} prefetch={prefetch} passHref>
      <IconButton id={id} tabIndex={-1} ref={ref} {...props} size="large" />
    </Link>
  )
}

export default forwardRef(LinkIconButton)
