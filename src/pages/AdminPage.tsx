import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Order = {
  id: string
  created_at: string
  buyer_email: string
  buyer_name: string
  total_chf: number
  status: string
  stripe_id: string
}

const STATUS_COLORS: Record<string, string> = {
  pending:   '#F5B11C',
  paid:      '#34D399',
  shipped:   '#60A5FA',
  delivered: '#A78BFA',
  cancelled: '#F87171',
}

function actionBtn(bg: string): React.CSSProperties {
  return {
    padding: '5px 10px', background: bg, color: 'white', border: 'none',
    borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer'
  }
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'blocked'>('all')
  const navigate = useNavigate()

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const blocked = orders.filter(o => o.status === 'pending')
  const displayed = activeTab === 'blocked' ? blocked : orders

  return (
    <div style={{ minHeight: '100vh', background: '#18181B', fontFamily: 'Inter, sans-serif', color: '#F4F4F5' }}>
      <div style={{ background: '#27272A', borderBottom: '1px solid #3F3F46', padding: '0 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#F5B11C', fontWeight: '700', fontSize: '16px' }}>1624 Cards</span>
            <span style={{ color: '#3F3F46' }}>|</span>
            <span style={{ color: '#71717A', fontSize: '13px' }}>Admin</span>
          </div>
          <button onClick={handleLogout} style={{ color: '#71717A', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Blocked / Pending', value: blocked.length, alert: blocked.length > 0 },
            { label: 'Paid', value: orders.filter(o => o.status === 'paid').length },
            { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#27272A', borderRadius: '10px', padding: '20px',
              border: `1px solid ${stat.alert ? '#F5B11C44' : '#3F3F46'}`
            }}>
              <div style={{ color: '#71717A', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: stat.alert ? '#F5B11C' : '#F4F4F5' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {(['all', 'blocked'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500',
              background: activeTab === tab ? '#0B42A7' : 'transparent',
              color: activeTab === tab ? 'white' : '#71717A',
            }}>
              {tab === 'all' ? 'All Orders' : `Blocked / Pending (${blocked.length})`}
            </button>
          ))}
        </div>

        <div style={{ background: '#27272A', borderRadius: '12px', border: '1px solid #3F3F46', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#71717A' }}>Loading orders...</div>
          ) : displayed.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#71717A' }}>
              {activeTab === 'blocked' ? '✓ No blocked orders' : 'No orders yet'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #3F3F46' }}>
                  {['Date', 'Buyer', 'Total', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((order, i) => (
                  <tr key={order.id} style={{ borderBottom: i < displayed.length - 1 ? '1px solid #3F3F46' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#A1A1AA' }}>
                      {new Date(order.created_at).toLocaleDateString('de-CH')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '500' }}>{order.buyer_name || '—'}</div>
                      <div style={{ fontSize: '12px', color: '#71717A' }}>{order.buyer_email}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>
                      CHF {Number(order.total_chf).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600',
                        background: `${STATUS_COLORS[order.status]}22`,
                        color: STATUS_COLORS[order.status] || '#A1A1AA'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {order.status === 'paid' && (
                          <button onClick={() => updateStatus(order.id, 'shipped')} style={actionBtn('#0B42A7')}>Mark Shipped</button>
                        )}
                        {order.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(order.id, 'paid')} style={actionBtn('#059669')}>Release</button>
                            <button onClick={() => updateStatus(order.id, 'cancelled')} style={actionBtn('#DC2626')}>Cancel</button>
                          </>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => updateStatus(order.id, 'delivered')} style={actionBtn('#7C3AED')}>Mark Delivered</button>
                        )}
                        {order.stripe_id && (
                          <a href={`https://dashboard.stripe.com/payments/${order.stripe_id}`} target="_blank" rel="noreferrer"
                            style={{ ...actionBtn('#52525B'), textDecoration: 'none', display: 'inline-block' }}>
                            Stripe ↗
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
