import AdminDirectory from '../../components/crud2/AdminDirectory'
import seed from '../../data/companiesSeed'
export default function ManageCompaniesPage() { return <AdminDirectory kind="companies" seed={seed} /> }
