'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Level = 0|1|2|3|4|5|6|7;

interface Member {
  id: string;
  name: string;
  title: string;
  department: string;
  level: Level;
  parentId: string | null;
  photo?: string;
  email?: string;
  phone?: string;
  bio?: string;
  linkedin?: string;
  joinDate?: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────
const SEED: Member[] = [
  { id:'1',  name:'Kiran Chakravarthy', title:'Co-Founder & CEO',      department:'Leadership',   level:0, parentId:null,  email:'kiran@imlocl.com',    linkedin:'linkedin.com/in/kiran', joinDate:'2023-01-01', bio:'Visionary leader building the future of hyperlocal delivery in India.' },
  { id:'2',  name:'Arjun Mehta',        title:'Co-Founder & CTO',      department:'Technology',   level:0, parentId:null,  email:'arjun@imlocl.com',    linkedin:'linkedin.com/in/arjun', joinDate:'2023-01-01', bio:'Full-stack architect with 12 years building scalable platforms.' },
  { id:'3',  name:'Priya Sharma',       title:'Chief Operating Officer',department:'Operations',  level:1, parentId:'1',   email:'priya@imlocl.com',    joinDate:'2023-03-01' },
  { id:'4',  name:'Rahul Nair',         title:'Director of Engineering',department:'Technology',  level:2, parentId:'2',   email:'rahul@imlocl.com',    joinDate:'2023-04-01' },
  { id:'5',  name:'Sneha Reddy',        title:'Director of Product',    department:'Product',     level:2, parentId:'2',   email:'sneha@imlocl.com',    joinDate:'2023-05-01' },
  { id:'6',  name:'Vikram Singh',       title:'Operations Manager',     department:'Operations',  level:3, parentId:'3',   email:'vikram@imlocl.com',   joinDate:'2023-06-01' },
  { id:'7',  name:'Anita Rao',          title:'Engineering Manager',    department:'Technology',  level:3, parentId:'4',   email:'anita@imlocl.com',    joinDate:'2023-07-01' },
  { id:'8',  name:'Dev Kapoor',         title:'Frontend Lead',          department:'Technology',  level:4, parentId:'7',   email:'dev@imlocl.com',      joinDate:'2023-08-01' },
  { id:'9',  name:'Meera Iyer',         title:'Backend Lead',           department:'Technology',  level:4, parentId:'7',   email:'meera@imlocl.com',    joinDate:'2023-08-01' },
  { id:'10', name:'Aryan Gupta',        title:'Senior Engineer',        department:'Technology',  level:5, parentId:'8',   email:'aryan@imlocl.com',    joinDate:'2024-01-01' },
  { id:'11', name:'Kavya Pillai',       title:'Senior Engineer',        department:'Technology',  level:5, parentId:'9',   email:'kavya@imlocl.com',    joinDate:'2024-01-01' },
  { id:'12', name:'Rohan Das',          title:'Junior Engineer',        department:'Technology',  level:6, parentId:'10',  email:'rohan@imlocl.com',    joinDate:'2024-06-01' },
  { id:'13', name:'Sana Qureshi',       title:'Intern – Frontend',      department:'Technology',  level:7, parentId:'8',   email:'sana@imlocl.com',     joinDate:'2025-01-01' },
];

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVELS: { label: string; color: string; ring: string; bg: string }[] = [
  { label:'Founder',       color:'#FFD700', ring:'#FFD70060', bg:'rgba(255,215,0,0.08)'   },
  { label:'C-Suite',       color:'#E879F9', ring:'#E879F960', bg:'rgba(232,121,249,0.08)' },
  { label:'Director',      color:'#60A5FA', ring:'#60A5FA60', bg:'rgba(96,165,250,0.08)'  },
  { label:'Manager',       color:'#34D399', ring:'#34D39960', bg:'rgba(52,211,153,0.08)'  },
  { label:'Lead',          color:'#FB923C', ring:'#FB923C60', bg:'rgba(251,146,60,0.08)'  },
  { label:'Engineer',      color:'#A78BFA', ring:'#A78BFA60', bg:'rgba(167,139,250,0.08)' },
  { label:'Jr. Engineer',  color:'#94A3B8', ring:'#94A3B860', bg:'rgba(148,163,184,0.08)' },
  { label:'Intern',        color:'#6EE7B7', ring:'#6EE7B760', bg:'rgba(110,231,183,0.08)' },
];

const DEPARTMENTS = ['Leadership','Technology','Product','Operations','Design','Marketing','Finance','HR','Sales'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2,10); }
function initials(name: string) {
  return name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
}
function lvl(l: Level) { return LEVELS[l]; }

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORE_KEY = 'central-hub-members-v1';
function load(): Member[] {
  try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : SEED; }
  catch { return SEED; }
}
function save(members: Member[]) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(members)); } catch {}
}

// ─── Member Card (tree node) ──────────────────────────────────────────────────
function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const cfg = lvl(member.level);
  return (
    <div onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'center',
      cursor:'pointer', padding:'0 8px',
      transition:'transform 0.18s',
    }}
    onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-3px)')}
    onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
      <div style={{
        width:72, height:72, borderRadius:'50%',
        background: member.photo ? 'none' : cfg.bg,
        border:`2.5px solid ${cfg.color}`,
        boxShadow:`0 0 0 4px ${cfg.ring}, 0 4px 20px rgba(0,0,0,0.4)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:22, fontWeight:800, color:cfg.color,
        overflow:'hidden', flexShrink:0,
        fontFamily:'Georgia, serif',
      }}>
        {member.photo
          ? <img src={member.photo} alt={member.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          : initials(member.name)
        }
      </div>
      <div style={{
        marginTop:8, background:'#141720',
        border:`1px solid ${cfg.ring}`,
        borderRadius:10, padding:'8px 12px',
        textAlign:'center', minWidth:110, maxWidth:140,
        backdropFilter:'blur(8px)',
      }}>
        <div style={{ fontSize:11, fontWeight:700, color:cfg.color, textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:2 }}>
          {LEVELS[member.level].label}
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:'#F1F0EB', lineHeight:1.3 }}>{member.name}</div>
        <div style={{ fontSize:10, color:'#8B8A85', marginTop:2, lineHeight:1.3 }}>{member.title}</div>
      </div>
    </div>
  );
}

// ─── Tree renderer ────────────────────────────────────────────────────────────
function TreeNode({ member, members, onSelect, depth }:
  { member: Member; members: Member[]; onSelect:(m:Member)=>void; depth:number }) {
  const children = members.filter(m => m.parentId === member.id);
  const cfg = lvl(member.level);

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <MemberCard member={member} onClick={() => onSelect(member)} />
      {children.length > 0 && (
        <>
          {/* Vertical stem down */}
          <div style={{ width:2, height:24, background:`${cfg.color}50` }} />
          {/* Horizontal bar connecting children */}
          {children.length > 1 && (
            <div style={{ position:'relative', display:'flex', alignItems:'flex-start' }}>
              <div style={{
                position:'absolute', top:0, left:'50%', right:'50%',
                height:2, background:`${cfg.color}40`,
                width: `calc(100% - 48px)`,
                transform:'translateX(-50%)',
              }}/>
            </div>
          )}
          {/* Children row */}
          <div style={{ display:'flex', flexDirection:'row', alignItems:'flex-start', gap:0, position:'relative' }}>
            {/* Top connector bar */}
            {children.length > 1 && (
              <div style={{
                position:'absolute', top:0,
                left:'calc(50% - 50%)', right:'calc(50% - 50%)',
                height:2, background:`${cfg.color}40`,
                width:'100%',
              }}/>
            )}
            {children.map((child, i) => (
              <div key={child.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'0 4px' }}>
                {/* Vertical drop to each child */}
                <div style={{ width:2, height:24, background:`${lvl(child.level).color}50` }} />
                <TreeNode member={child} members={members} onSelect={onSelect} depth={depth+1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Profile Modal ────────────────────────────────────────────────────────────
function ProfileModal({ member, members, onClose, onEdit }:
  { member: Member; members: Member[]; onClose:()=>void; onEdit:()=>void }) {
  const cfg = lvl(member.level);
  const manager = members.find(m => m.id === member.parentId);
  const reports = members.filter(m => m.parentId === member.id);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if(e.key==='Escape') onClose(); };
    window.addEventListener('keydown',h);
    return () => window.removeEventListener('keydown',h);
  },[onClose]);

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, backdropFilter:'blur(4px)',
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:460, background:'#13151E',
        border:`1px solid ${cfg.ring}`,
        borderRadius:20, overflow:'hidden',
        boxShadow:`0 0 60px ${cfg.ring}, 0 24px 80px rgba(0,0,0,0.6)`,
        animation:'fadeIn 0.2s ease',
      }}>
        {/* Header banner */}
        <div style={{ height:80, background:`linear-gradient(135deg, ${cfg.bg}, #0C0E14)`, position:'relative', borderBottom:`1px solid ${cfg.ring}` }}>
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ fontSize:11, fontWeight:700, color:cfg.color, letterSpacing:'2px', textTransform:'uppercase', opacity:0.6 }}>
              {cfg.label} · {member.department}
            </div>
          </div>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'none', border:'none', color:'#636360', cursor:'pointer', fontSize:20, lineHeight:1 }}>✕</button>
        </div>

        <div style={{ padding:'0 28px 28px', marginTop:-40 }}>
          {/* Avatar */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
            <div style={{
              width:80, height:80, borderRadius:'50%',
              background:member.photo?'none':cfg.bg,
              border:`3px solid ${cfg.color}`,
              boxShadow:`0 0 0 5px ${cfg.ring}, 0 8px 32px rgba(0,0,0,0.5)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:26, fontWeight:800, color:cfg.color,
              overflow:'hidden', fontFamily:'Georgia, serif',
            }}>
              {member.photo
                ? <img src={member.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : initials(member.name)
              }
            </div>
          </div>

          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:22, fontWeight:800, color:'#F1F0EB', fontFamily:'Georgia, serif', marginBottom:4 }}>{member.name}</div>
            <div style={{ fontSize:13, color:cfg.color, fontWeight:600 }}>{member.title}</div>
            {member.bio && <div style={{ fontSize:12, color:'#8B8A85', marginTop:8, lineHeight:1.6 }}>{member.bio}</div>}
          </div>

          {/* Info rows */}
          <div style={{ background:'#0C0E14', borderRadius:12, padding:14, marginBottom:14, border:'1px solid rgba(255,255,255,0.06)' }}>
            {[
              member.email && { icon:'✉', label:'Email', value:member.email },
              member.phone && { icon:'✆', label:'Phone', value:member.phone },
              member.linkedin && { icon:'in', label:'LinkedIn', value:member.linkedin },
              member.joinDate && { icon:'📅', label:'Joined', value:new Date(member.joinDate).toLocaleDateString('en-IN',{year:'numeric',month:'long'}) },
            ].filter(Boolean).map((row:any) => (
              <div key={row.label} style={{ display:'flex', gap:10, alignItems:'center', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize:12, color:cfg.color, width:18, textAlign:'center', flexShrink:0 }}>{row.icon}</span>
                <span style={{ fontSize:11, color:'#636360', width:54, flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:12, color:'#B4B2A9', fontWeight:500 }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Reporting */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {manager && (
              <div style={{ background:'#0C0E14', borderRadius:10, padding:12, border:`1px solid ${lvl(manager.level).ring}` }}>
                <div style={{ fontSize:9, color:'#636360', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Reports to</div>
                <div style={{ fontSize:11, fontWeight:700, color:lvl(manager.level).color }}>{manager.name}</div>
                <div style={{ fontSize:10, color:'#8B8A85', marginTop:2 }}>{manager.title}</div>
              </div>
            )}
            {reports.length > 0 && (
              <div style={{ background:'#0C0E14', borderRadius:10, padding:12, border:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize:9, color:'#636360', textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:6 }}>Direct Reports</div>
                <div style={{ fontSize:20, fontWeight:900, color:'#F1F0EB' }}>{reports.length}</div>
                <div style={{ fontSize:10, color:'#8B8A85', marginTop:2 }}>team members</div>
              </div>
            )}
          </div>

          <button onClick={onEdit} style={{
            width:'100%', padding:'11px 0',
            background:`linear-gradient(135deg, ${cfg.color}20, ${cfg.color}10)`,
            border:`1px solid ${cfg.ring}`, borderRadius:10,
            color:cfg.color, fontSize:13, fontWeight:700, cursor:'pointer',
          }}>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Member Form (Add / Edit) ─────────────────────────────────────────────────
function MemberForm({ initial, members, onSave, onCancel, onDelete }:
  { initial?: Member; members: Member[]; onSave:(m:Member)=>void; onCancel:()=>void; onDelete?:()=>void }) {
  const blank: Member = { id:uid(), name:'', title:'', department:'Technology', level:5, parentId:null };
  const [form, setForm] = useState<Member>(initial ?? blank);

  const set = (k: keyof Member) => (e: any) =>
    setForm(p => ({ ...p, [k]: k==='level' ? Number(e.target.value) as Level : e.target.value }));

  const valid = form.name.trim() && form.title.trim();

  const inputStyle: React.CSSProperties = {
    width:'100%', background:'#0C0E14', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:8, padding:'9px 12px', color:'#F1F0EB', fontSize:13,
    outline:'none', boxSizing:'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize:10, fontWeight:700, color:'#636360', textTransform:'uppercase',
    letterSpacing:'0.6px', display:'block', marginBottom:5,
  };

  return (
    <div onClick={onCancel} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1100, backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:480, maxHeight:'90vh', overflowY:'auto', background:'#13151E', borderRadius:18, border:'1px solid rgba(255,255,255,0.1)', padding:28 }}>
        <div style={{ fontSize:18, fontWeight:800, color:'#F1F0EB', marginBottom:22, fontFamily:'Georgia, serif' }}>
          {initial ? 'Edit Member' : 'Add Team Member'}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
          {[
            { label:'Full Name *', key:'name', placeholder:'e.g. Arjun Mehta' },
            { label:'Job Title *', key:'title', placeholder:'e.g. Senior Engineer' },
            { label:'Email', key:'email', placeholder:'name@imlocl.com' },
            { label:'Phone', key:'phone', placeholder:'+91 98765 43210' },
            { label:'LinkedIn', key:'linkedin', placeholder:'linkedin.com/in/...' },
            { label:'Join Date', key:'joinDate', placeholder:'', type:'date' },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input style={inputStyle} placeholder={f.placeholder} type={f.type||'text'}
                value={(form as any)[f.key] ?? ''} onChange={set(f.key as keyof Member)} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Bio</label>
          <textarea style={{ ...inputStyle, height:72, resize:'vertical' } as any}
            placeholder="Short bio or description…"
            value={form.bio ?? ''} onChange={set('bio')} />
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={labelStyle}>Photo URL</label>
          <input style={inputStyle} placeholder="https://... or leave blank for initials"
            value={form.photo ?? ''} onChange={set('photo')} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:14 }}>
          <div>
            <label style={labelStyle}>Level</label>
            <select style={inputStyle} value={form.level} onChange={set('level')}>
              {LEVELS.map((l,i) => <option key={i} value={i}>{i} — {l.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Department</label>
            <select style={inputStyle} value={form.department} onChange={set('department')}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Reports To</label>
            <select style={inputStyle} value={form.parentId ?? ''} onChange={e => setForm(p=>({...p,parentId:e.target.value||null}))}>
              <option value="">— No parent (root) —</option>
              {members.filter(m=>m.id!==form.id).map(m=>(
                <option key={m.id} value={m.id}>{m.name} ({LEVELS[m.level].label})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Level preview */}
        <div style={{ background:`${LEVELS[form.level].bg}`, border:`1px solid ${LEVELS[form.level].ring}`, borderRadius:10, padding:'10px 14px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:LEVELS[form.level].color, flexShrink:0 }} />
          <span style={{ fontSize:12, color:LEVELS[form.level].color, fontWeight:600 }}>{LEVELS[form.level].label} level selected</span>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          {onDelete && (
            <button onClick={onDelete} style={{ padding:'10px 16px', background:'rgba(226,75,74,0.12)', border:'1px solid rgba(226,75,74,0.3)', borderRadius:9, color:'#F09595', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              Remove
            </button>
          )}
          <button onClick={onCancel} style={{ flex:1, padding:'10px 0', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, color:'#8B8A85', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Cancel
          </button>
          <button onClick={()=>{ if(valid) onSave(form); }} disabled={!valid} style={{ flex:2, padding:'10px 0', background: valid?'#1D9E75':'#1D9E7540', border:'none', borderRadius:9, color:'#fff', fontSize:13, fontWeight:700, cursor: valid?'pointer':'not-allowed' }}>
            {initial ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', padding:'12px 20px', background:'rgba(255,255,255,0.02)', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
      {LEVELS.map((l,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:l.color }} />
          <span style={{ fontSize:10, color:'#636360', fontWeight:600 }}>{l.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function CentralHub() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [selected, setSelected] = useState<Member | null>(null);
  const [editing, setEditing] = useState<Member | null | 'new'>(null);
  const [view, setView] = useState<'tree'|'admin'>('tree');
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const treeRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.9);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x:0, y:0, ox:0, oy:0 });

  // Load from localStorage on mount
  useEffect(() => { setMembers(load()); }, []);

  const persist = useCallback((m: Member[]) => { setMembers(m); save(m); }, []);

  // Tree pan & zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(2, Math.max(0.3, s - e.deltaY * 0.001)));
  };
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-card]')) return;
    dragging.current = true;
    dragStart.current = { x:e.clientX, y:e.clientY, ox:offset.x, oy:offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setOffset({ x: dragStart.current.ox + e.clientX - dragStart.current.x, y: dragStart.current.oy + e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => { dragging.current = false; };

  const roots = members.filter(m => m.parentId === null);

  // Admin table filtered
  const adminMembers = members.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.title.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'ALL' || m.department === filterDept;
    const matchLevel = filterLevel === 'ALL' || String(m.level) === filterLevel;
    return matchSearch && matchDept && matchLevel;
  });

  return (
    <div style={{ minHeight:'100vh', background:'#0C0E14', fontFamily:'system-ui, sans-serif', color:'#F1F0EB', display:'flex', flexDirection:'column' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:#0C0E14; }
        ::-webkit-scrollbar-thumb { background:#2a2d3a; border-radius:3px; }
        select option { background:#13151E; }
      `}</style>

      {/* ── Top nav ── */}
      <div style={{ background:'#13151E', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px', display:'flex', alignItems:'center', gap:20, height:58, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'linear-gradient(135deg,#1D9E75,#0d6b4f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900 }}>C</div>
          <span style={{ fontSize:16, fontWeight:800, letterSpacing:'-0.3px' }}>Central Hub</span>
          <span style={{ fontSize:11, color:'#636360', borderLeft:'1px solid rgba(255,255,255,0.1)', paddingLeft:10, marginLeft:2 }}>ImLocl</span>
        </div>

        <div style={{ flex:1 }} />

        {/* Nav tabs */}
        {(['tree','admin'] as const).map(tab => (
          <button key={tab} onClick={() => setView(tab)} style={{
            padding:'6px 18px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
            background: view===tab ? 'rgba(29,158,117,0.15)' : 'transparent',
            color: view===tab ? '#1D9E75' : '#636360',
            transition:'all 0.15s',
          }}>
            {tab === 'tree' ? '🌳 Org Tree' : '⚙ Admin'}
          </button>
        ))}

        <button onClick={() => setEditing('new')} style={{
          padding:'7px 16px', borderRadius:8, background:'#1D9E75', border:'none',
          color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer',
        }}>
          + Add Member
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ background:'#0e1018', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'8px 24px', display:'flex', gap:24, alignItems:'center', flexShrink:0 }}>
        {LEVELS.map((l,i) => {
          const count = members.filter(m=>m.level===i).length;
          if(!count) return null;
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:6,height:6,borderRadius:'50%',background:l.color }}/>
              <span style={{ fontSize:11,color:'#636360' }}>{count} {l.label}{count>1?'s':''}</span>
            </div>
          );
        })}
        <div style={{ marginLeft:'auto', fontSize:11, color:'#636360' }}>{members.length} total members</div>
      </div>

      {/* ── Tree view ── */}
      {view === 'tree' && (
        <div style={{ flex:1, overflow:'hidden', position:'relative', cursor:'grab' }}
          onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          {/* Zoom controls */}
          <div style={{ position:'absolute', top:16, right:16, zIndex:10, display:'flex', flexDirection:'column', gap:4 }}>
            {[
              { label:'+', action:()=>setScale(s=>Math.min(2,s+0.1)) },
              { label:'⟳', action:()=>{ setScale(0.9); setOffset({x:0,y:0}); } },
              { label:'−', action:()=>setScale(s=>Math.max(0.3,s-0.1)) },
            ].map(btn => (
              <button key={btn.label} onClick={btn.action} style={{
                width:34, height:34, borderRadius:8, background:'#13151E',
                border:'1px solid rgba(255,255,255,0.1)', color:'#B4B2A9',
                fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              }}>{btn.label}</button>
            ))}
            <div style={{ fontSize:10, color:'#636360', textAlign:'center', marginTop:2 }}>{Math.round(scale*100)}%</div>
          </div>

          {/* Hint */}
          <div style={{ position:'absolute', bottom:60, left:'50%', transform:'translateX(-50%)', fontSize:11, color:'#636360', pointerEvents:'none' }}>
            Scroll to zoom · Drag to pan · Click to view profile
          </div>

          {/* Tree canvas */}
          <div ref={treeRef} style={{
            transformOrigin:'center top',
            transform:`scale(${scale}) translate(${offset.x/scale}px, ${offset.y/scale}px)`,
            padding:'40px 60px 80px',
            display:'flex', flexDirection:'row', gap:40, justifyContent:'center', alignItems:'flex-start',
            minWidth:'100%', minHeight:'100%',
            transition:'transform 0.05s linear',
          }}>
            {roots.map(root => (
              <TreeNode key={root.id} member={root} members={members} onSelect={setSelected} depth={0} />
            ))}
          </div>
        </div>
      )}

      {/* ── Admin view ── */}
      {view === 'admin' && (
        <div style={{ flex:1, padding:24, overflowY:'auto' }}>
          {/* Filters */}
          <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
            <input placeholder="Search name or title…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ flex:1, minWidth:200, background:'#13151E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'9px 14px', color:'#F1F0EB', fontSize:13, outline:'none' }} />
            <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}
              style={{ background:'#13151E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'9px 14px', color:'#F1F0EB', fontSize:13, outline:'none' }}>
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterLevel} onChange={e=>setFilterLevel(e.target.value)}
              style={{ background:'#13151E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:9, padding:'9px 14px', color:'#F1F0EB', fontSize:13, outline:'none' }}>
              <option value="ALL">All Levels</option>
              {LEVELS.map((l,i)=><option key={i} value={String(i)}>{i} — {l.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div style={{ background:'#13151E', borderRadius:14, border:'1px solid rgba(255,255,255,0.07)', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['Member','Title','Department','Level','Reports To','Actions'].map(h=>(
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, color:'#636360', textTransform:'uppercase', letterSpacing:'0.6px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adminMembers.map((m,i) => {
                  const cfg = lvl(m.level);
                  const manager = members.find(p=>p.id===m.parentId);
                  return (
                    <tr key={m.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', background: i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34,height:34,borderRadius:'50%',background:cfg.bg,border:`1.5px solid ${cfg.color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:cfg.color,overflow:'hidden',flexShrink:0 }}>
                            {m.photo ? <img src={m.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : initials(m.name)}
                          </div>
                          <div>
                            <div style={{ fontSize:13,fontWeight:600,color:'#F1F0EB' }}>{m.name}</div>
                            {m.email && <div style={{ fontSize:11,color:'#636360' }}>{m.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:13,color:'#B4B2A9' }}>{m.title}</td>
                      <td style={{ padding:'12px 16px', fontSize:12,color:'#8B8A85' }}>{m.department}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ fontSize:11,fontWeight:700,color:cfg.color,background:cfg.bg,border:`1px solid ${cfg.ring}`,borderRadius:20,padding:'3px 9px' }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:12,color:'#8B8A85' }}>{manager?.name ?? '— Root'}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>setSelected(m)} style={{ padding:'5px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:7,color:'#B4B2A9',fontSize:12,cursor:'pointer',fontWeight:600 }}>View</button>
                          <button onClick={()=>setEditing(m)} style={{ padding:'5px 12px',background:'rgba(29,158,117,0.1)',border:'1px solid rgba(29,158,117,0.3)',borderRadius:7,color:'#1D9E75',fontSize:12,cursor:'pointer',fontWeight:600 }}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {adminMembers.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#636360', fontSize:14 }}>No members found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <Legend />

      {/* ── Modals ── */}
      {selected && !editing && (
        <ProfileModal
          member={selected} members={members}
          onClose={()=>setSelected(null)}
          onEdit={()=>{ setEditing(selected); setSelected(null); }}
        />
      )}

      {editing && (
        <MemberForm
          initial={editing === 'new' ? undefined : editing as Member}
          members={members}
          onSave={m => {
            const exists = members.find(x=>x.id===m.id);
            persist(exists ? members.map(x=>x.id===m.id?m:x) : [...members, m]);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
          onDelete={editing !== 'new' ? () => {
            if (confirm(`Remove ${(editing as Member).name}?`)) {
              persist(members.filter(x=>x.id!==(editing as Member).id));
              setEditing(null);
            }
          } : undefined}
        />
      )}
    </div>
  );
}
