import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { QueryClient, dehydrate } from '@tanstack/react-query'

import DonationFlowStatusPage from 'components/client/donation-flow/DonationFlowStatusPage'
import { endpoints } from 'service/apiEndpoints'
import { queryFnFactory } from 'service/restRequests'
import { CampaignResponse } from 'gql/campaigns'

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { slug } = ctx.query
  const client = new QueryClient()
  await client.prefetchQuery<CampaignResponse>(
    [endpoints.campaign.viewCampaign(String(slug)).url],
    queryFnFactory<CampaignResponse>(),
  )

  return {
    props: {
      slug,
      dehydratedState: dehydrate(client),
      ...(await serverSideTranslations(ctx.locale ?? 'bg', [
        'common',
        'auth',
        'validation',
        'campaigns',
        'donation-flow',
      ])),
    },
  }
}

export default DonationFlowStatusPage
