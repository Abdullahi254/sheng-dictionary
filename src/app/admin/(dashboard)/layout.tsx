import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  await connectToDatabase()
  const pendingCount = await Submission.countDocuments({ status: 'pending' })

  return (
    <AdminShell pendingCount={pendingCount} email={session.user?.email ?? ''}>
      {children}
    </AdminShell>
  )
}
