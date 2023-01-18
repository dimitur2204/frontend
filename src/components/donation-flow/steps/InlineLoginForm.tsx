import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useFormikContext } from 'formik'
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material'
import theme from 'common/theme'
import Google from 'common/icons/Google'
import { OneTimeDonation } from 'gql/donations'
import { signIn } from 'next-auth/react'
import { AlertStore } from 'stores/AlertStore'
import PasswordField from 'components/common/form/PasswordField'
import EmailField from 'components/common/form/EmailField'

const onGoogleLogin = () => {
  const resp = signIn('google')
}

function InlineLoginForm() {
  const { t } = useTranslation('one-time-donation')
  const [loading, setLoading] = useState(false)
  const formik = useFormikContext<OneTimeDonation>()

  const onClick = async () => {
    try {
      setLoading(true)

      const resp = await signIn<'credentials'>('credentials', {
        email: formik.values.loginEmail,
        password: formik.values.loginPassword,
        redirect: false,
      })
      if (resp?.error) {
        throw new Error(resp.error)
      }
      if (resp?.ok) {
        setLoading(false)
        formik.setFieldValue('isAnonymous', false)
        AlertStore.show(t('auth:alerts.welcome'), 'success')
      }
    } catch (error) {
      setLoading(false)
      AlertStore.show(t('auth:alerts.invalid-login'), 'error')
    }
  }
  return (
    <Grid sx={{ marginBottom: theme.spacing(4) }} container rowSpacing={3}>
      <Grid item xs={12}>
        <EmailField name="loginEmail" label="Email" fullWidth />
      </Grid>
      <Grid item xs={12}>
        <PasswordField
          name="loginPassword"
          type="password"
          label={t('second-step.password')}
          fullWidth
        />
      </Grid>
      <Button
        color="primary"
        variant="contained"
        fullWidth
        sx={{ marginTop: theme.spacing(3) }}
        onClick={onClick}>
        {loading ? <CircularProgress color="inherit" size="1.5rem" /> : t('second-step.btn-login')}
      </Button>
      <Button
        color="primary"
        variant="outlined"
        fullWidth
        sx={{ marginTop: theme.spacing(3) }}
        onClick={onGoogleLogin}>
        <Box display="inline-flex" alignItems="center" marginRight={theme.spacing(2)}>
          <Google /> {t('common:nav.login-with')} Google
        </Box>
      </Button>
    </Grid>
  )
}

export default InlineLoginForm
