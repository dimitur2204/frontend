import { securedAdminProps } from 'middleware/auth/securedProps'
import { endpoints } from 'service/apiEndpoints'
import ExpensesEditPage from 'components/admin/campaign-expenses/CampaignExpenseEdit'

export const getServerSideProps = securedAdminProps(
  ['common', 'auth', 'validation', 'expenses'],
  (ctx) => endpoints.expenses.editExpense(ctx.query.id as string).url,
)

export default ExpensesEditPage
