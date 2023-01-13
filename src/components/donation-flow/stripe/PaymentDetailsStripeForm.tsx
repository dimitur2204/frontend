import { Appearance } from '@stripe/stripe-js'
import { Elements, PaymentElement } from '@stripe/react-stripe-js'
import { Box, BoxProps } from '@mui/material'
import { useTranslation } from 'react-i18next'

import theme from 'common/theme'
import { stripePromise } from 'pages/_app'

const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: theme.palette.primary.main,
    colorBackground: theme.palette.background.paper,
    // colorText: theme.palette.text.primary resolves to rgba(0, 0, 0, 0.87) and Stripe doesn't like that
    colorText: 'rgb(0, 0, 0)',
    colorDanger: theme.palette.error.main,
    fontFamily: "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSizeSm: theme.typography.pxToRem(14),
    fontSizeBase: theme.typography.pxToRem(14),
    fontSizeLg: theme.typography.pxToRem(18),
    fontSizeXl: theme.typography.pxToRem(20),
    spacingUnit: theme.spacing(0),
    borderRadius: theme.borders.round,
    focusBoxShadow: 'none',
    focusOutline: `2px solid ${theme.palette.primary.main}`,
  },
  rules: {
    '.Input': {
      boxShadow: 'none',
      border: `1px solid ${theme.palette.grey[300]}`,
    },
    '.Input:focus': {
      border: 'none',
      boxShadow: 'none',
    },
  },
}

export type PaymentDetailsStripeFormProps = {
  clientSecret: string
  containerProps?: BoxProps
}
export default function PaymentDetailsStripeForm({
  clientSecret,
  containerProps,
}: PaymentDetailsStripeFormProps) {
  const { i18n } = useTranslation()
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: clientSecret,
        appearance,
        locale: i18n.language,
      }}>
      <Box {...containerProps}>
        <PaymentElement />
      </Box>
    </Elements>
  )
}
