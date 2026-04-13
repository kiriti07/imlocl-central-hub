'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Member, Level, LEVELS, DEPARTMENTS, SEED_MEMBERS } from '@/lib/types';
import { loadMembers, saveMembers, uid, initials } from '@/lib/storage';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lcfg = (l: Level) => LEVELS[l];

// ─── Shared input styles ──────────────────────────────────────────────────────
const INP: React.CSSProperties = {
  width: '100%', background: '#0C0E14',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '9px 12px',
  color: '#F0EFE8', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
};
const LBL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#636360',
  textTransform: 'uppercase', letterSpacing: '0.6px',
  display: 'block', marginBottom: 5,
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER CARD (tree node)
// ═══════════════════════════════════════════════════════════════════════════════
function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const c = lcfg(member.level);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        cursor: 'pointer', padding: '0 8px',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.2s ease',
      }}
    >
      {/* Photo / initials */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        border: `2.5px solid ${c.color}`,
        boxShadow: `0 0 0 4px ${c.ring}, 0 6px 24px rgba(0,0,0,0.5)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 800, color: c.color,
        background: member.photo ? 'none' : c.bg,
        overflow: 'hidden', flexShrink: 0,
        fontFamily: 'Georgia, serif',
        transition: 'box-shadow 0.2s ease',
      }}>
        {member.photo
          ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials(member.name)
        }
      </div>

      {/* Info card */}
      <div style={{
        marginTop: 9,
        background: hovered ? '#1a1d28' : '#141720',
        border: `1px solid ${hovered ? c.color + '60' : c.ring}`,
        borderRadius: 12, padding: '9px 12px',
        textAlign: 'center', minWidth: 116, maxWidth: 150,
        transition: 'all 0.2s ease',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 3 }}>
          {c.label}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#F0EFE8', lineHeight: 1.3 }}>
          {member.name}
        </div>
        <div style={{ fontSize: 10, color: '#8B8A85', marginTop: 2, lineHeight: 1.3 }}>
          {member.title}
        </div>
        {member.project && (
          <div style={{ fontSize: 9, color: c.color, marginTop: 5, fontWeight: 600, opacity: 0.85, lineHeight: 1.3 }}>
            ◎ {member.project}
          </div>
        )}
        {member.phone && (
          <div style={{ fontSize: 9, color: '#636360', marginTop: 3, lineHeight: 1.3 }}>
            {member.phone}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TREE NODE (recursive)
// ═══════════════════════════════════════════════════════════════════════════════
function TreeNode({ member, members, onSelect }: {
  member: Member; members: Member[]; onSelect: (m: Member) => void;
}) {
  const children = members.filter(m => m.parentId === member.id);
  const c = lcfg(member.level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <MemberCard member={member} onClick={() => onSelect(member)} />

      {children.length > 0 && (
        <>
          {/* Vertical stem down from parent */}
          <div style={{ width: 2, height: 24, background: `${c.color}45`, flexShrink: 0 }} />

          {/* Horizontal bar + children */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', position: 'relative' }}>
            {/* Horizontal connector bar across all children */}
            {children.length > 1 && (
              <div style={{
                position: 'absolute', top: 0, left: '50%', right: 0,
                height: 2, background: `${c.color}30`,
                width: '100%', transform: 'translateX(-50%)',
              }} />
            )}

            {children.map(child => (
              <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px' }}>
                {/* Vertical drop to each child */}
                <div style={{ width: 2, height: 24, background: `${lcfg(child.level).color}45`, flexShrink: 0 }} />
                <TreeNode member={child} members={members} onSelect={onSelect} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function ProfileModal({ member, members, onClose, onEdit }: {
  member: Member; members: Member[]; onClose: () => void; onEdit: () => void;
}) {
  const c = lcfg(member.level);
  const manager = members.find(m => m.id === member.parentId);
  const reports = members.filter(m => m.parentId === member.id);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const infoRows = [
    member.project  && { icon: '◎', label: 'Project',  value: member.project  },
    member.email    && { icon: '✉', label: 'Email',    value: member.email    },
    member.phone    && { icon: '✆', label: 'Phone',    value: member.phone    },
    member.linkedin && { icon: 'in', label: 'LinkedIn', value: member.linkedin },
    member.joinDate && { icon: '📅', label: 'Joined',   value: new Date(member.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.78)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 460, maxHeight: '92vh', overflowY: 'auto',
          background: '#13151E',
          border: `1px solid ${c.ring}`,
          borderRadius: 22,
          boxShadow: `0 0 80px ${c.ring}, 0 32px 100px rgba(0,0,0,0.7)`,
          animation: 'fadeIn 0.22s ease',
        }}
      >
        {/* Banner */}
        <div style={{ height: 76, background: c.bg, position: 'relative', borderBottom: `1px solid ${c.ring}`, borderRadius: '22px 22px 0 0', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.65 }}>
            {c.label} · {member.department}
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(255,255,255,0.06)', border: 'none', color: '#8B8A85', cursor: 'pointer', fontSize: 16, lineHeight: 1, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '0 28px 28px', marginTop: -38 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: member.photo ? 'none' : c.bg,
              border: `3px solid ${c.color}`,
              boxShadow: `0 0 0 5px ${c.ring}, 0 10px 32px rgba(0,0,0,0.55)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800, color: c.color,
              overflow: 'hidden', fontFamily: 'Georgia, serif',
            }}>
              {member.photo
                ? <img src={member.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials(member.name)
              }
            </div>
          </div>

          {/* Name & title */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#F0EFE8', fontFamily: 'Georgia, serif', marginBottom: 5 }}>
              {member.name}
            </div>
            <div style={{ fontSize: 13, color: c.color, fontWeight: 700 }}>{member.title}</div>
            {member.bio && (
              <div style={{ fontSize: 12, color: '#8B8A85', marginTop: 10, lineHeight: 1.7 }}>{member.bio}</div>
            )}
          </div>

          {/* Info rows */}
          <div style={{ background: '#0C0E14', borderRadius: 13, padding: '4px 14px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
            {infoRows.map((row, i) => (
              <div key={row.label} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '9px 0', borderBottom: i < infoRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 13, color: c.color, width: 18, textAlign: 'center', flexShrink: 0 }}>{row.icon}</span>
                <span style={{ fontSize: 10, color: '#636360', width: 55, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: '#B4B2A9', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Reporting grid */}
          {(manager || reports.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: manager && reports.length ? '1fr 1fr' : '1fr', gap: 10, marginBottom: 18 }}>
              {manager && (
                <div style={{ background: '#0C0E14', borderRadius: 11, padding: 13, border: `1px solid ${lcfg(manager.level).ring}` }}>
                  <div style={{ fontSize: 9, color: '#636360', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Reports to</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: lcfg(manager.level).color }}>{manager.name}</div>
                  <div style={{ fontSize: 10, color: '#8B8A85', marginTop: 3 }}>{manager.title}</div>
                </div>
              )}
              {reports.length > 0 && (
                <div style={{ background: '#0C0E14', borderRadius: 11, padding: 13, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize: 9, color: '#636360', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Direct Reports</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#F0EFE8' }}>{reports.length}</div>
                  <div style={{ fontSize: 10, color: '#8B8A85', marginTop: 3 }}>team member{reports.length !== 1 ? 's' : ''}</div>
                </div>
              )}
            </div>
          )}

          <button onClick={onEdit} style={{ width: '100%', padding: '12px 0', background: c.bg, border: `1px solid ${c.ring}`, borderRadius: 11, color: c.color, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMBER FORM (Add / Edit)
// ═══════════════════════════════════════════════════════════════════════════════
function MemberForm({ initial, members, onSave, onCancel, onDelete }: {
  initial?: Member; members: Member[];
  onSave: (m: Member) => void; onCancel: () => void; onDelete?: () => void;
}) {
  const blank: Member = { id: uid(), name: '', title: '', project: '', phone: '', email: '', department: 'Technology', level: 5, parentId: null };
  const [form, setForm] = useState<Member>(initial ?? blank);
  const c = lcfg(form.level);

  const set = (k: keyof Member) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: k === 'level' ? Number(e.target.value) as Level : e.target.value }));

  const valid = form.name.trim() && form.title.trim() && form.email.trim();

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onCancel]);

  const fields: { label: string; key: keyof Member; placeholder: string; type?: string }[] = [
    { label: 'Full Name *',  key: 'name',     placeholder: 'e.g. Arjun Mehta'       },
    { label: 'Job Title *',  key: 'title',    placeholder: 'e.g. Senior Engineer'    },
    { label: 'Email *',      key: 'email',    placeholder: 'name@imlocl.com'          },
    { label: 'Phone',        key: 'phone',    placeholder: '+91 98765 43210'          },
    { label: 'Current Project', key: 'project', placeholder: 'e.g. Admin Dashboard'  },
    { label: 'LinkedIn URL', key: 'linkedin', placeholder: 'linkedin.com/in/...'      },
    { label: 'Photo URL',    key: 'photo',    placeholder: 'https://... or leave blank'},
    { label: 'Join Date',    key: 'joinDate', placeholder: '',  type: 'date'          },
  ];

  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(6px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 540, maxHeight: '93vh', overflowY: 'auto', background: '#13151E', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 28, animation: 'fadeIn 0.2s ease' }}
      >
        {/* Form header with level colour accent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, border: `1.5px solid ${c.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: c.color, fontFamily: 'Georgia, serif' }}>
            {form.name ? initials(form.name) : '?'}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#F0EFE8', fontFamily: 'Georgia, serif' }}>
              {initial ? 'Edit Team Member' : 'Add Team Member'}
            </div>
            <div style={{ fontSize: 11, color: '#636360', marginTop: 1 }}>
              {initial ? `Editing ${initial.name}` : 'Fill in the details below'}
            </div>
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 13 }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={LBL}>{f.label}</label>
              <input style={INP} type={f.type || 'text'} placeholder={f.placeholder}
                value={(form as any)[f.key] ?? ''} onChange={set(f.key)} />
            </div>
          ))}
        </div>

        {/* Bio full width */}
        <div style={{ marginBottom: 13 }}>
          <label style={LBL}>Bio / Description</label>
          <textarea
            style={{ ...INP, height: 72, resize: 'vertical' } as React.CSSProperties}
            placeholder="Short bio or role description…"
            value={form.bio ?? ''} onChange={set('bio')}
          />
        </div>

        {/* Three selects */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 13, marginBottom: 13 }}>
          <div>
            <label style={LBL}>Level</label>
            <select style={INP} value={form.level} onChange={set('level')}>
              {LEVELS.map((l, i) => <option key={i} value={i}>{i} — {l.label}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>Department</label>
            <select style={INP} value={form.department} onChange={set('department')}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>Reports To</label>
            <select style={INP} value={form.parentId ?? ''} onChange={e => setForm(p => ({ ...p, parentId: e.target.value || null }))}>
              <option value="">— Root (no parent) —</option>
              {members.filter(m => m.id !== form.id).map(m => (
                <option key={m.id} value={m.id}>{m.name} ({LEVELS[m.level].label})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Level preview chip */}
        <div style={{ background: c.bg, border: `1px solid ${c.ring}`, borderRadius: 10, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: c.color, fontWeight: 700 }}>{c.label} — {form.department}</span>
          {form.project && <span style={{ fontSize: 11, color: '#636360', marginLeft: 'auto' }}>◎ {form.project}</span>}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {onDelete && (
            <button onClick={onDelete} style={{ padding: '10px 16px', background: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: 9, color: '#F09595', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Remove
            </button>
          )}
          <button onClick={onCancel} style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, color: '#8B8A85', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={() => { if (valid) onSave(form); }}
            disabled={!valid}
            style={{ flex: 2, padding: '10px 0', background: valid ? '#1D9E75' : 'rgba(29,158,117,0.25)', border: 'none', borderRadius: 9, color: valid ? '#fff' : '#636360', fontSize: 13, fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
          >
            {initial ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function CentralHubPage() {
  const [members,     setMembers]     = useState<Member[]>(SEED_MEMBERS);
  const [selected,    setSelected]    = useState<Member | null>(null);
  const [editing,     setEditing]     = useState<Member | null | 'new'>(null);
  const [view,        setView]        = useState<'tree' | 'admin'>('tree');
  const [search,      setSearch]      = useState('');
  const [filterDept,  setFilterDept]  = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [scale,       setScale]       = useState(0.85);
  const [offset,      setOffset]      = useState({ x: 0, y: 0 });

  const dragging  = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // Load from localStorage on mount
  useEffect(() => { setMembers(loadMembers()); }, []);

  const persist = useCallback((m: Member[]) => {
    setMembers(m);
    saveMembers(m);
  }, []);

  // ── Pan & zoom ──────────────────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(2.5, Math.max(0.2, s - e.deltaY * 0.001)));
  };
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.currentTarget as HTMLElement).style.cursor = 'grabbing';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.x, y: dragStart.current.oy + e.clientY - dragStart.current.y });
  };
  const onMouseUp = (e: React.MouseEvent) => {
    dragging.current = false;
    (e.currentTarget as HTMLElement).style.cursor = 'grab';
  };

  const roots = members.filter(m => m.parentId === null);

  // ── Admin table filter ──────────────────────────────────────────────────────
  const adminMembers = members.filter(m => {
    const q = search.toLowerCase();
    const ms = !search || [m.name, m.title, m.email, m.project, m.phone].some(f => f?.toLowerCase().includes(q));
    const md = filterDept  === 'ALL' || m.department === filterDept;
    const ml = filterLevel === 'ALL' || String(m.level) === filterLevel;
    return ms && md && ml;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = (m: Member) => {
    const exists = members.find(x => x.id === m.id);
    persist(exists ? members.map(x => x.id === m.id ? m : x) : [...members, m]);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!editing || editing === 'new') return;
    const m = editing as Member;
    if (!confirm(`Remove ${m.name} from the org chart?`)) return;
    persist(members.filter(x => x.id !== m.id));
    setEditing(null);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0C0E14', color: '#F0EFE8' }}>

      {/* ── Navbar ── */}
      <nav style={{ background: '#13151E', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 18, height: 58, flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #1D9E75, #0a5c43)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', flexShrink: 0 }}>C</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#F0EFE8', letterSpacing: '-0.4px', lineHeight: 1.2 }}>Central Hub</div>
            <div style={{ fontSize: 10, color: '#636360', letterSpacing: '0.4px' }}>ImLocl · Team Directory</div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* View switcher */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4 }}>
          {([['tree', '🌳 Org Tree'], ['admin', '⚙ Admin']] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setView(tab)} style={{
              padding: '6px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              background: view === tab ? '#1D9E75' : 'transparent',
              color: view === tab ? '#fff' : '#636360',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Add member */}
        <button
          data-no-drag
          onClick={() => setEditing('new')}
          style={{ padding: '8px 18px', borderRadius: 9, background: '#1D9E75', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Member
        </button>
      </nav>

      {/* ── Stats bar ── */}
      <div style={{ background: '#0e1018', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '7px 24px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        {LEVELS.map((l, i) => {
          const count = members.filter(m => m.level === i).length;
          if (!count) return null;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: 11, color: '#636360' }}>{count} {l.label}{count > 1 ? 's' : ''}</span>
            </div>
          );
        })}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4a4a4a' }}>{members.length} total members</div>
      </div>

      {/* ══ TREE VIEW ══ */}
      {view === 'tree' && (
        <div
          style={{ flex: 1, overflow: 'hidden', position: 'relative', cursor: 'grab', userSelect: 'none' }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {/* Zoom controls */}
          <div data-no-drag style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { l: '+', a: () => setScale(s => Math.min(2.5, s + 0.1)) },
              { l: '⟳', a: () => { setScale(0.85); setOffset({ x: 0, y: 0 }); } },
              { l: '−', a: () => setScale(s => Math.max(0.2, s - 0.1)) },
            ].map(b => (
              <button key={b.l} onClick={b.a} style={{ width: 34, height: 34, borderRadius: 9, background: '#13151E', border: '1px solid rgba(255,255,255,0.1)', color: '#B4B2A9', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                {b.l}
              </button>
            ))}
            <div style={{ fontSize: 10, color: '#636360', textAlign: 'center', marginTop: 2 }}>
              {Math.round(scale * 100)}%
            </div>
          </div>

          {/* Pan hint */}
          <div style={{ position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: '#3a3a3a', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            Scroll to zoom · Drag to pan · Click a card to view profile
          </div>

          {/* Tree canvas */}
          <div style={{
            transformOrigin: 'center top',
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            padding: '48px 80px 120px',
            display: 'flex', flexDirection: 'row',
            gap: 56, justifyContent: 'center', alignItems: 'flex-start',
          }}>
            {roots.map(root => (
              <TreeNode key={root.id} member={root} members={members} onSelect={setSelected} />
            ))}
          </div>
        </div>
      )}

      {/* ══ ADMIN VIEW ══ */}
      {view === 'admin' && (
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input
              placeholder="Search name, title, email, project, phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...INP, flex: 1, minWidth: 240, maxWidth: 400 }}
            />
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              style={{ ...INP, width: 'auto' }}>
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              style={{ ...INP, width: 'auto' }}>
              <option value="ALL">All Levels</option>
              {LEVELS.map((l, i) => <option key={i} value={String(i)}>{i} — {l.label}</option>)}
            </select>
            <div style={{ fontSize: 12, color: '#636360', display: 'flex', alignItems: 'center' }}>
              {adminMembers.length} result{adminMembers.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: '#13151E', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Member', 'Title', 'Project', 'Phone', 'Email', 'Level', 'Reports To', ''].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#636360', textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminMembers.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px 0', textAlign: 'center', color: '#636360', fontSize: 14 }}>
                      No team members found
                    </td>
                  </tr>
                )}
                {adminMembers.map((m, i) => {
                  const c = lcfg(m.level);
                  const manager = members.find(p => p.id === m.parentId);
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)', transition: 'background 0.1s' }}>

                      {/* Member */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.bg, border: `1.5px solid ${c.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: c.color, overflow: 'hidden', flexShrink: 0 }}>
                            {m.photo ? <img src={m.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(m.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#F0EFE8' }}>{m.name}</div>
                            <div style={{ fontSize: 10, color: '#636360', marginTop: 1 }}>{m.department}</div>
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#B4B2A9', whiteSpace: 'nowrap' }}>{m.title}</td>

                      {/* Project */}
                      <td style={{ padding: '12px 14px' }}>
                        {m.project && (
                          <span style={{ fontSize: 11, fontWeight: 600, color: c.color, background: c.bg, border: `1px solid ${c.ring}`, borderRadius: 20, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                            ◎ {m.project}
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#8B8A85', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{m.phone}</td>

                      {/* Email */}
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#8B8A85', whiteSpace: 'nowrap' }}>{m.email}</td>

                      {/* Level */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.ring}`, borderRadius: 20, padding: '3px 9px', whiteSpace: 'nowrap' }}>
                          {c.label}
                        </span>
                      </td>

                      {/* Reports to */}
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#636360', whiteSpace: 'nowrap' }}>
                        {manager ? manager.name : '— Root'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setSelected(m)} style={{ padding: '5px 11px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#B4B2A9', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>View</button>
                          <button onClick={() => setEditing(m)} style={{ padding: '5px 11px', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)', borderRadius: 7, color: '#1D9E75', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', padding: '10px 24px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        {LEVELS.map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color }} />
            <span style={{ fontSize: 10, color: '#636360', fontWeight: 600 }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* ── Profile Modal ── */}
      {selected && !editing && (
        <ProfileModal
          member={selected}
          members={members}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditing(selected); setSelected(null); }}
        />
      )}

      {/* ── Add / Edit Form ── */}
      {editing && (
        <MemberForm
          initial={editing === 'new' ? undefined : editing as Member}
          members={members}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
          onDelete={editing !== 'new' ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
