import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { AxiosError, AxiosResponse } from 'axios'
import * as yup from 'yup'
import { FormikHelpers } from 'formik'
import { Box, Grid, Typography } from '@mui/material'

import { routes } from 'common/routes'
import { Currency } from 'gql/currency'
import { AlertStore } from 'stores/AlertStore'
import { endpoints } from 'service/apiEndpoints'
import LinkButton from 'components/common/LinkButton'
import { useViewExpense } from 'common/hooks/expenses'
import GenericForm from 'components/common/form/GenericForm'
import SubmitButton from 'components/common/form/SubmitButton'
//import DeletedCheckbox from 'components/common/DeletedCheckbox'
import CurrencySelect from 'components/currency/CurrencySelect'
import FormTextField from 'components/common/form/FormTextField'
import { useCreateExpense, useEditExpense } from 'service/expense'
//import DocumentSelect from 'components/documents/grid/DocumentSelect'
import { ApiErrors, isAxiosError, matchValidator } from 'service/apiErrors'
import { ExpenseInput, ExpenseResponse, ExpenseStatus, ExpenseType } from 'gql/expenses'
import FileUpload from 'components/file-upload/FileUpload'

import ExpenseTypeSelect from '../expenses/ExpenseTypeSelect'
// import PersonSelect from 'components/person/PersonSelect'
import { useViewCampaign } from 'common/hooks/campaigns'
import { UploadExpenseFile, ExpenseFile } from 'gql/expenses'
import { useUploadExpenseFiles } from 'service/expense'
import FileList from 'components/campaign-expenses/grid/FileList'
import FormDatePicker from 'components/common/form/FormDatePicker'
import { toMoney, fromMoney } from 'common/util/money'
import { useCampaignExpenseFiles } from 'common/hooks/expenses'

const validTypes = Object.keys(ExpenseType)
const validStatuses = Object.keys(ExpenseStatus)
const validCurrencies = Object.keys(Currency)

interface Props {
  onFileUpload: (file: File) => void
}

export default function Form() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const slug = router.query.slug as string
  const { t } = useTranslation('expenses')
  const { data: campaignResponse } = useViewCampaign(slug)
  let id = router.query.id as string
  const [files, setFiles] = useState<File[]>([])
  const { data: expenseFiles } = useCampaignExpenseFiles(id)

  const fileUploadMutation = useMutation<
    AxiosResponse<ExpenseFile[]>,
    AxiosError<ApiErrors>,
    UploadExpenseFile
  >({
    mutationFn: useUploadExpenseFiles(),
  })

  let data: ExpenseResponse | undefined
  const validationSchema = yup
    .object()
    .defined()
    .shape({
      type: yup.string().trim().oneOf(validTypes).required(),
      status: yup.string().trim().oneOf(validStatuses).required(),
      currency: yup.string().trim().oneOf(validCurrencies).required(),
      // money: yup.number().positive().integer().required(),
      //      vaultId: yup.string().trim().uuid().required(),
      //      deleted: yup.boolean().required(),
      description: yup.string().trim().notRequired(),
      //      documentId: yup.string().trim().uuid().notRequired(),
      // approvedById: yup.string().trim().notRequired(),
    })
  if (id) {
    id = String(id)
    data = useViewExpense(id).data
  }

  const initialValues: ExpenseInput = {
    type: data?.type || ExpenseType.none,
    status: data?.status || ExpenseStatus.pending,
    currency: data?.currency || Currency.BGN,
    money: fromMoney(data?.amount as number),
    amount: data?.amount || 0,
    vaultId: data?.vaultId || campaignResponse?.campaign.defaultVault || '',
    deleted: data?.deleted || false,
    description: data?.description || '',
    documentId: data?.documentId || '',
    approvedById: data?.approvedById || '',
    spentAt: data?.spentAt || '',
  }

  const mutationFn = id ? useEditExpense(id) : useCreateExpense()

  const mutation = useMutation<AxiosResponse<ExpenseResponse>, AxiosError<ApiErrors>, ExpenseInput>(
    {
      mutationFn,
      onError: () =>
        AlertStore.show(id ? t('alerts.edit-row.error') : t('alerts.new-row.error'), 'error'),
      onSuccess: () => {
        queryClient.invalidateQueries([endpoints.expenses.listExpenses.url])
        router.push(routes.campaigns.viewExpenses(slug))
        AlertStore.show(id ? t('alerts.edit-row.success') : t('alerts.new-row.success'), 'success')
      },
    },
  )

  async function onSubmit(data: ExpenseInput, { setFieldError }: FormikHelpers<ExpenseInput>) {
    try {
      if (data.documentId == '') {
        data.documentId = null
      }
      if (data.approvedById == '') {
        data.approvedById = null
      }

      if (data.spentAt.length == 10) {
        data.spentAt = data.spentAt + 'T00:00:00.000Z'
      }

      data.amount = toMoney(data.money)

      const response = await mutation.mutateAsync(data)

      if (files.length > 0) {
        await fileUploadMutation.mutateAsync({
          files,
          expenseId: response.data.id,
        })
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const { response } = error as AxiosError<ApiErrors>
        response?.data.message.map(({ property, constraints }) => {
          setFieldError(property, t(matchValidator(constraints)))
        })
      }
    }
  }

  if (!campaignResponse?.campaign.defaultVault) {
    //return an error if there is no default vault for the campaign
    return <div> {t('expenses:errors.no-default-vault')} </div>
  }

  return (
    <GenericForm
      onSubmit={onSubmit}
      initialValues={initialValues}
      validationSchema={validationSchema}>
      <Box sx={{ marginTop: '5%', height: '62.6vh' }}>
        <Typography variant="h5" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
          {id ? t('headings.edit') : t('headings.add')}
        </Typography>
        <Grid container spacing={2} sx={{ width: 600, margin: '0 auto' }}>
          <Grid item xs={6}>
            <ExpenseTypeSelect />
          </Grid>
          <Grid item xs={6}>
            <FormDatePicker name="spentAt" label={t('expenses:fields.date')} />
          </Grid>
          <Grid item xs={6}>
            <FormTextField type="number" name="money" label="expenses:fields.amount" />
          </Grid>
          <Grid item xs={6}>
            <CurrencySelect disabled={true} />
          </Grid>
          <Grid item xs={12}>
            <FileUpload
              buttonLabel="Добави документи"
              onUpload={(newFiles) => {
                setFiles((prevFiles) => [...prevFiles, ...newFiles])
              }}
            />
            <FileList
              files={files}
              filesRole={[]}
              onDelete={(deletedFile) =>
                setFiles((prevFiles) => prevFiles.filter((file) => file.name !== deletedFile.name))
              }
              onSetFileRole={() => {
                return undefined
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormTextField
              type="string"
              name="description"
              label="expenses:fields.description"
              multiline
              rows={5}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
              {t('expenses:uploaded-documents')}:
            </Typography>
            {expenseFiles?.map((file, key) => (
              <a key={key} href={endpoints.expenses.downloadFile(file.id).url}>
                {file.filename}
              </a>
            ))}
          </Grid>
          <Grid item xs={6}>
            <SubmitButton fullWidth label={'expenses:btns.save'} />
          </Grid>
          <Grid item xs={6}>
            <LinkButton
              fullWidth
              variant="contained"
              color="primary"
              href={routes.admin.expenses.index}>
              {t('btns.cancel')}
            </LinkButton>
          </Grid>
        </Grid>
      </Box>
    </GenericForm>
  )
}