import React from 'react'
import { Alert, Box, Typography, useMediaQuery } from '@mui/material'
import { useField, useFormikContext } from 'formik'

import theme from 'common/theme'
import {
  DonationFormDataPaymentOption,
  DonationFormDataV2,
} from 'components/donation-flow/helpers/types'

import { TaxesCheckbox } from './TaxesCheckbox'
import RadioCardGroup from '../../common/RadioCardGroup'
import RadioAccordionGroup from '../../common/RadioAccordionGroup'
import CardIcon from '../../icons/CardIcon'
import BankIcon from '../../icons/BankIcon'
import PaymentDetailsStripeForm from './PaymentDetailsStripeForm'
import BankPayment from './BankPayment'

export default function PaymentMethod({
  sectionRef,
}: {
  sectionRef: React.MutableRefObject<HTMLDivElement | null>
}) {
  const formik = useFormikContext<DonationFormDataV2>()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))
  const [payment] = useField('payment')
  const options = [
    {
      value: 'card',
      label: 'Card',
      icon: <CardIcon sx={{ width: 80, height: 80 }} />,
      disabled: !formik.values.amountChosen,
    },
    {
      value: 'bank',
      label: 'Bank Transfer',
      icon: <BankIcon sx={{ width: 80, height: 80 }} />,
    },
  ]
  const cardAlertDescription = `Таксата на Stripe се изчислява според района на картодържателя: 1.2% + 0.5лв. за Европейската икономическа зона`
  const bankAlertDescription = `Таксата за транзакция при банков превод зависи от индивидуалните условия на Вашата банка. от (0-4лв)`

  const paymentMethodAlertMap = {
    [DonationFormDataPaymentOption.CARD]: cardAlertDescription,
    [DonationFormDataPaymentOption.BANK]: bankAlertDescription,
  }

  const mobileOptions = [
    {
      value: 'card',
      label: 'Card',
      icon: <CardIcon sx={{ width: 80, height: 80 }} />,
      disabled: !formik.values.amountChosen,
      content: (
        <Box>
          <Alert sx={{ mt: 1, mb: 2, mx: -2 }} color="info" icon={false}>
            <Typography>
              {paymentMethodAlertMap[payment.value as DonationFormDataPaymentOption]}
            </Typography>
          </Alert>
          <PaymentDetailsStripeForm />
        </Box>
      ),
    },
    {
      value: 'bank',
      label: 'Bank Transfer',
      icon: <BankIcon sx={{ width: 80, height: 80 }} />,
      content: (
        <Box>
          <Alert sx={{ my: 2, mx: -2 }} color="info" icon={false}>
            <Typography>
              {paymentMethodAlertMap[payment.value as DonationFormDataPaymentOption]}
            </Typography>
          </Alert>
          <BankPayment />
        </Box>
      ),
    },
  ]
  return (
    <Box ref={sectionRef} component="section" id="select-payment-method">
      <Typography mb={3} variant="h5">
        Как желаете да дарите?
      </Typography>
      {isSmall ? (
        <RadioAccordionGroup name="payment" options={mobileOptions} />
      ) : (
        <>
          <RadioCardGroup columns={2} name="payment" options={options} />
          {payment.value === 'card' && (
            <>
              <PaymentDetailsStripeForm containerProps={{ sx: { my: 3 } }} />
              <TaxesCheckbox />
            </>
          )}
          {payment.value === 'bank' && <BankPayment />}
        </>
      )}
    </Box>
  )
}
