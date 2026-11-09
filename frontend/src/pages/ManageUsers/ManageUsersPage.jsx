import AdminDirectory from '../../components/crud2/AdminDirectory'
import seed from '../../data/usersSeed'
export default function ManageUsersPage() { return <AdminDirectory kind="users" seed={seed} /> }
