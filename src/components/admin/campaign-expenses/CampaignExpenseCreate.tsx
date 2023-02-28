import { useTranslation } from 'next-i18next'

import { useViewCampaign } from 'common/hooks/campaigns'
import { useRouter } from 'next/router'
import Form from 'components/admin/campaign-expenses/Form'
import Layout from 'components/client/layout/Layout'

export default function CreateCampaignExpensePage() {
  const router = useRouter()
  const { slug } = router.query
  const { data } = useViewCampaign(slug as string)

  return (
    <Layout maxWidth={false}>
      <Form />
    </Layout>
  )
}
