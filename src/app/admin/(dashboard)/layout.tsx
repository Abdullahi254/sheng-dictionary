import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import connectToDatabase from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Flag from '@/models/Flag'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  await connectToDatabase()
  const [pendingCount, flagsCount] = await Promise.all([
    Submission.countDocuments({ status: 'pending' }),
    Flag.countDocuments({ status: 'pending' }),
  ])

  return (
    <AdminShell pendingCount={pendingCount} flagsCount={flagsCount} email={session.user?.email ?? ''}>
      {children}
    </AdminShell>
  )
}
