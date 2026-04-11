import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, NavBar } from '../ui'
import { getUsers, deleteUser, suspendUser, type User } from '../../data/database'

export default function AdminScreen() {
  const nav = useNavigate()
  const [users, setUsers] = useState<User[]>(getUsers())
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'delete' | 'suspend' | null>(null)
  const [toast, setToast] = useState('')

  const refresh = () => setUsers([...getUsers()])
  const handleDelete = (id: string) => { deleteUser(id); refresh(); setConfirmId(null); setConfirmAction(null); setToast('User deleted'); setTimeout(() => setToast(''), 2000) }
  const handleSuspend = (id: string) => { suspendUser(id); refresh(); setConfirmId(null); setConfirmAction(null); setToast('User status updated'); setTimeout(() => setToast(''), 2000) }
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <Page>
      <NavBar title="Admin Panel" left="back" onClose={() => nav('/settings')} />

      {toast && <div className="fixed top-[60px] left-0 right-0 z-50 flex justify-center" style={{ maxWidth: 390, margin: '0 auto' }}>
        <div className="flex items-center gap-2 px-5 py-3 shadow-lg" style={{ borderRadius: 14, background: '#0F0F0C' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#34C759"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="text-[14px] font-semibold text-white">{toast}</span>
        </div>
      </div>}

      {/* Stats */}
      <div className="px-4 mt-2">
        <div className="flex gap-2 mb-4">
          {[[String(users.length),'Total Users','#3E7C59'],[String(users.filter(u=>u.isPro).length),'Pro Users','#C9A24D'],[String(users.filter(u=>u.isSuspended).length),'Suspended','#C94A4A']].map(([n,l,c])=>(
            <div key={l} className="flex-1 bg-white text-center" style={{ borderRadius: 14, padding: '14px 8px' }}>
              <p className="text-[22px] font-bold" style={{ color: c }}>{n}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#8E8E93' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User list */}
      <div className="px-4">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#8E8E93' }}>All Users ({users.length})</p>
        <div className="bg-white overflow-hidden" style={{ borderRadius: 14 }}>
          {users.map((u, i) => (
            <div key={u.id} style={{ borderBottom: i < users.length - 1 ? '.33px solid rgba(60,60,67,.12)' : 'none' }}>
              <div className="flex items-center gap-3" style={{ padding: '14px 16px' }}>
                <div className="shrink-0 flex items-center justify-center text-[13px] font-bold uppercase"
                  style={{ width: 40, height: 40, borderRadius: 20, background: u.isSuspended ? '#FFF0EF' : u.isPro ? 'rgba(201,162,77,.12)' : '#F2F2F7', color: u.isSuspended ? '#C94A4A' : u.isPro ? '#C9A24D' : '#636366' }}>
                  {u.username.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[16px] font-semibold truncate">{u.username}</p>
                    {u.isPro && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: '#FDF8ED', color: '#C9A24D' }}>PRO</span>}
                    {u.isSuspended && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: '#FFF0EF', color: '#C94A4A' }}>SUSPENDED</span>}
                  </div>
                  <p className="text-[13px] truncate" style={{ color: '#8E8E93' }}>{u.email}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#AEAEB2' }}>Joined {fmtDate(u.createdAt)}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => { setConfirmId(u.id); setConfirmAction('suspend') }} className="press-scale flex items-center justify-center"
                    style={{ width: 34, height: 34, borderRadius: 17, background: u.isSuspended ? '#E8F9ED' : '#FFF8ED', border: 'none' }}>
                    {u.isSuspended
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3E7C59" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CC7A00" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>}
                  </button>
                  <button onClick={() => { setConfirmId(u.id); setConfirmAction('delete') }} className="press-scale flex items-center justify-center"
                    style={{ width: 34, height: 34, borderRadius: 17, background: '#FFF0EF', border: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C94A4A" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
              {confirmId === u.id && (
                <div style={{ padding: '0 16px 14px' }}>
                  <div className="flex items-center justify-between gap-2" style={{ padding: '12px 14px', borderRadius: 12, background: confirmAction === 'delete' ? '#FFF0EF' : '#FFF8ED' }}>
                    <p className="text-[12px] font-medium" style={{ color: confirmAction === 'delete' ? '#C94A4A' : '#CC7A00' }}>
                      {confirmAction === 'delete' ? `Delete ${u.username}?` : u.isSuspended ? `Reactivate ${u.username}?` : `Suspend ${u.username}?`}
                    </p>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => { setConfirmId(null); setConfirmAction(null) }} className="press-scale text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#F2F2F7', color: '#636366' }}>Cancel</button>
                      <button onClick={() => confirmAction === 'delete' ? handleDelete(u.id) : handleSuspend(u.id)} className="press-scale text-[12px] font-semibold px-3 py-1.5 rounded-lg text-white" style={{ background: confirmAction === 'delete' ? '#C94A4A' : '#CC7A00' }}>
                        {confirmAction === 'delete' ? 'Delete' : u.isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 mt-5 mb-8">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#8E8E93' }}>Quick guide</p>
        <div className="bg-white" style={{ borderRadius: 14, padding: '14px 16px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 13, background: '#FFF8ED' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#CC7A00" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
            </div>
            <p className="text-[13px]" style={{ color: '#636366' }}>Suspend — temporarily block access</p>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 13, background: '#E8F9ED' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3E7C59" strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <p className="text-[13px]" style={{ color: '#636366' }}>Reactivate — restore a suspended account</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 13, background: '#FFF0EF' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C94A4A" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </div>
            <p className="text-[13px]" style={{ color: '#636366' }}>Delete — permanently remove account</p>
          </div>
        </div>
      </div>
    </Page>
  )
}
