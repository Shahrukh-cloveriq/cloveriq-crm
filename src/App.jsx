import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ───────────────────────────────────────────
const SUPABASE_URL = "https://ftmibyazzjoqymdukjmu.supabase.co";
const SUPABASE_KEY = "sb_publishable_yiAzvToO1A-Jns5NK6mbIA_fCeo_b9w";
// ⚠ Replace PASTE_YOUR_PUBLISHABLE_KEY_HERE with your publishable key
// from Supabase Dashboard → Settings → API Keys → Publishable key (starts with sb_publishable_...)
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Clover IQ palette ─────────────────────────────────────────
const C = {
  bg:"#F5F6F8", sidebar:"#1F2D3D", sidebarAct:"#0073EA",
  white:"#FFFFFF", card:"#FFFFFF",
  red:"#8B0000", redDark:"#6B0000", redSoft:"#FDF0F0", redBorder:"#E8BABA",
  blue:"#0073EA", blueSoft:"#E8F3FF",
  green:"#00C875", greenSoft:"#E6FAF5",
  amber:"#FFCB00", amberSoft:"#FFF8E1", amberText:"#7A5F00",
  purple:"#A25DDC", purpleSoft:"#F3EAFF",
  teal:"#0ABFA3", tealSoft:"#E3FAF7",
  text:"#323338", textSub:"#676879", textMuted:"#C3C6D4",
  border:"#E6E9EF", borderMid:"#D0D4E4",
};

const PIPELINE_STAGES = ["New Lead","Contacted","Qualified","Proposal Sent","Won","Lost"];
const STAGE_META = {
  "New Lead":      {color:"#676879", bg:"#F0F0F0"},
  "Contacted":     {color:C.blue,    bg:C.blueSoft},
  "Qualified":     {color:C.purple,  bg:C.purpleSoft},
  "Proposal Sent": {color:"#7A5F00", bg:C.amberSoft},
  "Won":           {color:"#007B4F", bg:C.greenSoft},
  "Lost":          {color:C.red,     bg:C.redSoft},
};
const SEQ_STEPS  = ["Intro Email","Follow-up 1","LinkedIn Connect","Follow-up 2","WhatsApp","Meeting Request","Final Follow-up"];
const INDUSTRIES = ["Technology","Finance","Healthcare","Education","Retail","Manufacturing","Consulting","Media","Government","NGO","Other"];
const SOURCES    = ["Event","LinkedIn","Cold Outreach","Referral","Website","Conference","WhatsApp","Other"];
const ACT_ICONS  = {email:"✉️",phone:"📞",whatsapp:"💬",meeting:"🤝",linkedin:"🔗",note:"📝"};
const ACT_TYPES  = ["email","phone","whatsapp","meeting","linkedin","note"];
const VENDOR_CAT = ["Hardware","Software","Networking","Security","Cloud","Logistics","Consulting","Other"];
const PROJ_STATUS= ["Not Started","Working on it","Stuck","Done"];
const PROJ_PRI   = ["Low","Medium","High","Critical"];
const PROJ_STAT_COLOR = {
  "Not Started":{color:C.textSub,bg:"#F0F0F0"},
  "Working on it":{color:C.blue,bg:C.blueSoft},
  "Stuck":{color:C.red,bg:C.redSoft},
  "Done":{color:"#007B4F",bg:C.greenSoft},
};
const CLOVER_IQ_CONTEXT = `Clover IQ is a technology solutions company in Pakistan selling:
1. Industrial Technology & Rugged Hardware — rugged tablets (Dell, Panasonic Toughbook, Getac, Zebra), field devices
2. Private Wireless & Connectivity — private LTE/5G networks, enterprise Wi-Fi, secure industrial connectivity
Differentiators: certified hardware expertise, end-to-end delivery, local Pakistan support.`;
const ICP_PROFILES = {
  "Tech Decision Maker":{title:"CTO/VP Eng/IT Director",painPoints:"integration complexity, downtime risk, vendor reliability, scalability",valueProps:"enterprise-grade certified hardware, seamless integration, reliable connectivity"},
  "Operations / Field Manager":{title:"Head of Ops/Plant Manager/Logistics Director",painPoints:"device failures, connectivity dead zones, field durability",valueProps:"MIL-STD rugged devices, private wireless for remote sites"},
  "Finance / Executive Buyer":{title:"CFO/CEO/Managing Director",painPoints:"ROI on tech, cost reduction, risk mitigation",valueProps:"measurable efficiency gains, single vendor, cost-effective sourcing"},
};

// ── Helpers ───────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0,10);
function Avatar({name,size=32}){
  const ini=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const h=(name||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0)%360;
  return <div style={{width:size,height:size,borderRadius:"50%",background:`hsl(${h},50%,72%)`,color:`hsl(${h},60%,22%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.35,fontWeight:700,flexShrink:0}}>{ini}</div>;
}
function Tag({label,color=C.blue,bg}){return <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20,background:bg||color+"18",color,display:"inline-block",whiteSpace:"nowrap"}}>{label}</span>;}
function SPill({label,meta}){const m=meta||{color:C.textSub,bg:"#F0F0F0"};return <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:4,background:m.bg,color:m.color,display:"inline-block",whiteSpace:"nowrap"}}>{label}</span>;}
function Input({style,...p}){return <input style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:6,color:C.text,padding:"8px 11px",fontSize:13,outline:"none",width:"100%",fontFamily:"inherit",...style}} {...p}/>;}
function Sel({style,children,...p}){return <select style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:6,color:C.text,padding:"8px 11px",fontSize:13,outline:"none",width:"100%",fontFamily:"inherit",...style}} {...p}>{children}</select>;}
function TA({style,...p}){return <textarea style={{background:C.white,border:`1.5px solid ${C.border}`,borderRadius:6,color:C.text,padding:"8px 11px",fontSize:13,outline:"none",width:"100%",fontFamily:"inherit",resize:"vertical",...style}} {...p}/>;}
function Btn({children,onClick,variant="primary",style,small}){
  const sz={fontSize:small?12:13,padding:small?"5px 12px":"8px 18px"};
  const vs={
    primary:{background:C.blue,color:"#fff",border:`1.5px solid ${C.blue}`},
    red:{background:C.red,color:"#fff",border:`1.5px solid ${C.redDark}`},
    ghost:{background:"transparent",color:C.textSub,border:`1.5px solid ${C.border}`},
    danger:{background:C.redSoft,color:C.red,border:`1.5px solid ${C.redBorder}`},
    success:{background:C.greenSoft,color:"#007B4F",border:`1.5px solid #A5D6A7`},
  };
  return <button onClick={onClick} style={{borderRadius:6,fontFamily:"inherit",fontWeight:600,cursor:"pointer",...sz,...vs[variant],...style}}>{children}</button>;
}
function Modal({title,onClose,children,wide}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:12,width:"100%",maxWidth:wide?780:520,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px 14px",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontWeight:700,fontSize:15,color:C.text}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.textMuted,fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
        </div>
        <div style={{padding:"20px 24px 28px"}}>{children}</div>
      </div>
    </div>
  );
}
function Field({label,children}){
  return(
    <div style={{marginBottom:13}}>
      <div style={{fontSize:11,fontWeight:700,color:C.textSub,marginBottom:5,textTransform:"uppercase",letterSpacing:".06em"}}>{label}</div>
      {children}
    </div>
  );
}
function SLabel({label}){return <div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:".08em",margin:"18px 0 8px",paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>{label}</div>;}

const TH={padding:"9px 14px",fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:".06em",background:"#F8F9FB",borderBottom:`1px solid ${C.border}`,textAlign:"left",whiteSpace:"nowrap"};
const TD={padding:"11px 14px",fontSize:13,color:C.text,borderBottom:`1px solid ${C.border}`,verticalAlign:"middle"};

const NAV=[
  {section:"MAIN",items:[{id:"dashboard",label:"Dashboard",icon:"⊞"},{id:"contacts",label:"Contacts",icon:"👥"},{id:"leads",label:"Leads",icon:"🎯"},{id:"deals",label:"Deals",icon:"💼"}]},
  {section:"WORK",items:[{id:"projects",label:"Client Projects",icon:"📁"},{id:"vendors",label:"Vendors",icon:"🏭"},{id:"sequences",label:"Sequences",icon:"⇒"},{id:"tasks",label:"My Tasks",icon:"✅"}]},
];

// ═══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");

  async function handleSubmit(){
    if(!email||!password){setMsg("Please fill in email and password.");return;}
    setLoading(true);setMsg("");
    if(mode==="signup"){
      const{error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
      if(error){setMsg(error.message);}
      else{setMsg("✓ Check your email to confirm your account, then sign in.");}
    } else {
      const{data,error}=await sb.auth.signInWithPassword({email,password});
      if(error){setMsg(error.message);}
      else{onLogin(data.user);}
    }
    setLoading(false);
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter','Segoe UI',sans-serif"}}>
      <div style={{background:C.white,borderRadius:14,padding:"36px 40px",width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.12)",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <div style={{width:42,height:42,borderRadius:10,background:C.red,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontWeight:800,fontSize:20}}>C</span>
          </div>
          <div>
            <div style={{fontWeight:800,fontSize:18,color:C.text}}>ProCRM</div>
            <div style={{fontSize:11,color:C.textMuted}}>by Clover IQ</div>
          </div>
        </div>
        <div style={{fontWeight:700,fontSize:18,color:C.text,marginBottom:6}}>{mode==="login"?"Welcome back":"Create your account"}</div>
        <div style={{fontSize:13,color:C.textSub,marginBottom:24}}>{mode==="login"?"Sign in to your team CRM":"Join your team on Clover IQ ProCRM"}</div>
        {mode==="signup"&&(
          <Field label="Full Name">
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Shahrukh Khan"/>
          </Field>
        )}
        <Field label="Email"><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="shahrukh@cloveriq.com"/></Field>
        <Field label="Password"><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleSubmit()}/></Field>
        {msg&&<div style={{background:msg.startsWith("✓")?C.greenSoft:C.redSoft,border:`1px solid ${msg.startsWith("✓")?"#A5D6A7":C.redBorder}`,borderRadius:7,padding:"9px 14px",fontSize:12,color:msg.startsWith("✓")?"#007B4F":C.red,marginBottom:14}}>{msg}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{width:"100%",background:loading?"#ccc":C.red,color:"#fff",border:"none",borderRadius:8,padding:"12px 0",fontSize:14,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",marginBottom:14}}>
          {loading?"Please wait…":mode==="login"?"Sign In →":"Create Account →"}
        </button>
        <div style={{textAlign:"center",fontSize:13,color:C.textSub}}>
          {mode==="login"?"Don't have an account? ":"Already have an account? "}
          <span onClick={()=>{setMode(mode==="login"?"signup":"login");setMsg("");}} style={{color:C.blue,cursor:"pointer",fontWeight:600}}>
            {mode==="login"?"Sign up":"Sign in"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const [user,setUser]         = useState(null);
  const [loading,setLoading]   = useState(true);
  const [tab,setTab]           = useState("dashboard");

  // data
  const [contacts,setContacts]     = useState([]);
  const [orgs,setOrgs]             = useState([]);
  const [activities,setActivities] = useState([]);
  const [tasks,setTasks]           = useState([]);
  const [vendors,setVendors]       = useState([]);
  const [projects,setProjects]     = useState([]);
  const [profiles,setProfiles]     = useState([]);
  const [dataLoading,setDataLoading] = useState(false);

  // UI state
  const [search,setSearch]         = useState("");
  const [stageF,setStageF]         = useState("All");
  const [contactView,setContactView] = useState("all");
  const [expandedGroup,setExpandedGroup] = useState(null);
  const [selected,setSelected]     = useState(null);
  const [modal,setModal]           = useState(null);
  const [editC,setEditC]           = useState(null);
  const [editO,setEditO]           = useState(null);
  const [editV,setEditV]           = useState(null);
  const [editP,setEditP]           = useState(null);
  const [csvText,setCsvText]       = useState("");
  const [csvMsg,setCsvMsg]         = useState("");
  const [dragOver,setDragOver]     = useState(false);
  const [inlineEdit,setInlineEdit] = useState(false);
  const [inlineData,setInlineData] = useState(null);
  const [actF,setActF]             = useState({type:"email",note:"",date:today(),user_name:""});
  const [taskF,setTaskF]           = useState({title:"",due:"",assignee:"",contact_id:null});
  const [showAI,setShowAI]         = useState(false);
  const [aiContact,setAiContact]   = useState(null);
  const [aiICP,setAiICP]           = useState("Tech Decision Maker");
  const [aiChannel,setAiChannel]   = useState("Email");
  const [aiStep,setAiStep]         = useState("Intro Email");
  const [aiOutput,setAiOutput]     = useState(null);
  const [aiLoading,setAiLoading]   = useState(false);
  const [aiError,setAiError]       = useState("");
  const [toast,setToast]           = useState(null);
  const fileInputRef               = useRef(null);

  // ── Auth ────────────────────────────────────────────────────
  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      setUser(session?.user||null);
      setLoading(false);
    });
    const{data:{subscription}}=sb.auth.onAuthStateChange((_,session)=>{
      setUser(session?.user||null);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  // ── Load data when user logs in ─────────────────────────────
  useEffect(()=>{
    if(user) loadAll();
  },[user]);

  async function loadAll(){
    setDataLoading(true);
    const [c,o,a,t,v,p,pr]=await Promise.all([
      sb.from("contacts").select("*").order("created_at",{ascending:false}),
      sb.from("organizations").select("*").order("name"),
      sb.from("activities").select("*").order("date",{ascending:false}),
      sb.from("tasks").select("*").order("due"),
      sb.from("vendors").select("*").order("name"),
      sb.from("projects").select("*").order("created_at",{ascending:false}),
      sb.from("profiles").select("*"),
    ]);
    if(c.data) setContacts(c.data);
    if(o.data) setOrgs(o.data);
    if(a.data) setActivities(a.data);
    if(t.data) setTasks(t.data);
    if(v.data) setVendors(v.data);
    if(p.data) setProjects(p.data);
    if(pr.data) setProfiles(pr.data);
    setDataLoading(false);
  }

  function showToast(msg,type="success"){
    setToast({msg,type});
    setTimeout(()=>setToast(null),3000);
  }

  const userName = profiles.find(p=>p.id===user?.id)?.full_name || user?.email?.split("@")[0] || "You";
  const teamNames = profiles.map(p=>p.full_name||p.email?.split("@")[0]).filter(Boolean);
  const closeModal=()=>{setModal(null);setEditC(null);setEditO(null);setEditV(null);setEditP(null);};

  // ── Computed ────────────────────────────────────────────────
  const filtered = useMemo(()=>contacts.filter(c=>{
    const q=search.toLowerCase(), org=orgs.find(o=>o.id===c.org_id);
    return(!q||[c.name,c.email,c.title,org?.name||""].some(v=>v.toLowerCase().includes(q)))
      &&(stageF==="All"||c.stage===stageF);
  }),[contacts,search,stageF,orgs]);

  const stageCounts=PIPELINE_STAGES.reduce((a,s)=>({...a,[s]:contacts.filter(c=>c.stage===s).length}),{});
  const openTasks=tasks.filter(t=>!t.done);
  const panelC=selected?contacts.find(c=>c.id===selected.id)||selected:null;
  const panelActs=panelC?[...activities].filter(a=>a.contact_id===panelC.id).sort((a,b)=>b.date.localeCompare(a.date)):[];
  const panelTasks=panelC?tasks.filter(t=>t.contact_id===panelC.id&&!t.done):[];

  // ── Mutations ────────────────────────────────────────────────
  async function saveContact(d){
    const payload={name:d.name,title:d.title,email:d.email,phone:d.phone,whatsapp:d.whatsapp,linkedin:d.linkedin||"",org_id:d.org_id||null,stage:d.stage,source:d.source,seq_step:d.seq_step||0,tags:d.tags||[],notes:d.notes,last_contact:d.last_contact,created_by:user.id};
    if(d.id){
      const{error}=await sb.from("contacts").update(payload).eq("id",d.id);
      if(!error){setContacts(cs=>cs.map(c=>c.id===d.id?{...c,...payload}:c));showToast("Contact updated");}
    } else {
      const{data,error}=await sb.from("contacts").insert(payload).select().single();
      if(!error&&data){setContacts(cs=>[data,...cs]);showToast("Contact added");}
    }
    closeModal();
  }

  async function deleteContact(id){
    await sb.from("contacts").delete().eq("id",id);
    setContacts(cs=>cs.filter(c=>c.id!==id));
    setSelected(null);showToast("Contact deleted","info");
  }

  async function saveOrg(d){
    const payload={name:d.name,industry:d.industry,size:d.size||"",website:d.website||"",city:d.city||"",created_by:user.id};
    if(d.id){
      await sb.from("organizations").update(payload).eq("id",d.id);
      setOrgs(os=>os.map(o=>o.id===d.id?{...o,...payload}:o));
    } else {
      const{data}=await sb.from("organizations").insert(payload).select().single();
      if(data) setOrgs(os=>[...os,data]);
    }
    closeModal();showToast("Organization saved");
  }

  async function saveVendor(d){
    const payload={name:d.name,category:d.category,contact:d.contact||"",rating:d.rating||3,notes:d.notes||"",status:d.status,tags:d.tags||[],created_by:user.id};
    if(d.id){
      await sb.from("vendors").update(payload).eq("id",d.id);
      setVendors(vs=>vs.map(v=>v.id===d.id?{...v,...payload}:v));
    } else {
      const{data}=await sb.from("vendors").insert(payload).select().single();
      if(data) setVendors(vs=>[...vs,data]);
    }
    closeModal();showToast("Vendor saved");
  }

  async function saveProject(d){
    const payload={name:d.name,owner:d.owner,priority:d.priority,status:d.status,start_date:d.start_date||null,end_date:d.end_date||null,contact_id:d.contact_id||null,notes:d.notes||"",created_by:user.id};
    if(d.id){
      await sb.from("projects").update(payload).eq("id",d.id);
      setProjects(ps=>ps.map(p=>p.id===d.id?{...p,...payload}:p));
    } else {
      const{data}=await sb.from("projects").insert(payload).select().single();
      if(data) setProjects(ps=>[data,...ps]);
    }
    closeModal();showToast("Project saved");
  }

  async function setStage(cid,stage){
    await sb.from("contacts").update({stage}).eq("id",cid);
    setContacts(cs=>cs.map(c=>c.id===cid?{...c,stage}:c));
    if(selected?.id===cid) setSelected(s=>({...s,stage}));
  }

  async function advanceSeq(contact){
    const next=Math.min((contact.seq_step||0)+1,SEQ_STEPS.length-1);
    await sb.from("contacts").update({seq_step:next}).eq("id",contact.id);
    setContacts(cs=>cs.map(c=>c.id===contact.id?{...c,seq_step:next}:c));
    setSelected(s=>s?{...s,seq_step:next}:s);
    showToast("Sequence advanced");
  }

  async function logActivity(){
    if(!actF.note.trim()) return;
    const payload={contact_id:panelC?.id,type:actF.type,note:actF.note,date:actF.date,user_name:userName,created_by:user.id};
    const{data}=await sb.from("activities").insert(payload).select().single();
    if(data){
      setActivities(as=>[data,...as]);
      await sb.from("contacts").update({last_contact:today()}).eq("id",panelC.id);
      setContacts(cs=>cs.map(c=>c.id===panelC.id?{...c,last_contact:today()}:c));
      showToast("Activity logged");
    }
    setActF({type:"email",note:"",date:today(),user_name:""});
    closeModal();
  }

  async function addTask(){
    if(!taskF.title.trim()) return;
    const payload={title:taskF.title,due:taskF.due||null,assignee:taskF.assignee||userName,contact_id:taskF.contact_id||null,done:false,created_by:user.id};
    const{data}=await sb.from("tasks").insert(payload).select().single();
    if(data){setTasks(ts=>[...ts,data]);showToast("Task added");}
    setTaskF({title:"",due:"",assignee:"",contact_id:null});
    closeModal();
  }

  async function toggleTask(id,done){
    await sb.from("tasks").update({done}).eq("id",id);
    setTasks(ts=>ts.map(t=>t.id===id?{...t,done}:t));
  }

  async function deleteTask(id){
    await sb.from("tasks").delete().eq("id",id);
    setTasks(ts=>ts.filter(t=>t.id!==id));
  }

  async function saveInlineContact(){
    if(!inlineData) return;
    await saveContact(inlineData);
    setSelected(inlineData);
    setInlineEdit(false);setInlineData(null);
  }

  // ── CSV Import ───────────────────────────────────────────────
  function parseCSV(text){
    const lines=text.trim().split("\n").filter(Boolean);
    if(lines.length<2){setCsvMsg("Need header row + at least 1 data row.");return;}
    const h=lines[0].split(",").map(s=>s.trim().toLowerCase());
    const idx=k=>h.findIndex(x=>x.includes(k));
    const [ni,ei,pi,ti,oi,si]=[idx("name"),idx("email"),idx("phone"),idx("title"),h.findIndex(x=>x.includes("company")||x.includes("org")),idx("source")];
    let added=0,skipped=0;
    const batch=[];
    lines.slice(1).forEach(async line=>{
      if(!line.trim()) return;
      const cols=line.split(",").map(s=>s.trim());
      const name=ni>=0?cols[ni]||"":"",email=ei>=0?cols[ei]||"":"";
      if(!name&&!email){skipped++;return;}
      if(contacts.some(c=>c.email===email&&email)){skipped++;return;}
      const company=oi>=0?cols[oi]||"":"";
      let org_id=null;
      if(company){
        let org=orgs.find(o=>o.name.toLowerCase()===company.toLowerCase());
        if(!org){
          const{data}=await sb.from("organizations").insert({name:company,industry:"Other",size:"",website:"",city:"",created_by:user.id}).select().single();
          if(data){setOrgs(os=>[...os,data]);org=data;}
        }
        org_id=org?.id||null;
      }
      batch.push({name,email,phone:pi>=0?cols[pi]||"":"",whatsapp:"",linkedin:"",title:ti>=0?cols[ti]||"":"",org_id,stage:"New Lead",source:si>=0?cols[si]||"Event":"Event",seq_step:0,tags:[],notes:"",last_contact:today(),created_by:user.id});
      added++;
    });
    setTimeout(async()=>{
      if(batch.length>0){
        const{data}=await sb.from("contacts").insert(batch).select();
        if(data) setContacts(cs=>[...data,...cs]);
      }
      setCsvMsg(`✓ Imported ${added} contact${added!==1?"s":""}. ${skipped} skipped.`);
    },200);
  }

  function handleFileUpload(file){
    if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{const text=e.target.result;setCsvText(text);parseCSV(text);};
    reader.readAsText(file);
  }

  // ── AI Copy ──────────────────────────────────────────────────
  async function generateAICopy(){
    if(!aiContact) return;
    setAiLoading(true);setAiError("");setAiOutput(null);
    const icp=ICP_PROFILES[aiICP];
    const org=orgs.find(o=>o.id===aiContact.org_id);
    const recentActs=[...activities].filter(a=>a.contact_id===aiContact.id).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,2).map(a=>`${a.type} on ${a.date}: ${a.note}`).join("; ")||"No previous contact";
    const prompt=`You are an expert B2B sales copywriter for Clover IQ.\n\nCOMPANY CONTEXT:\n${CLOVER_IQ_CONTEXT}\n\nCONTACT:\n- Name: ${aiContact.name}\n- Title: ${aiContact.title||"Unknown"}\n- Company: ${org?.name||"Their company"}\n- Industry: ${org?.industry||"Technology"}\n- Source: ${aiContact.source}\n- Stage: ${aiContact.stage}\n- Notes: ${aiContact.notes||"None"}\n- Recent activity: ${recentActs}\n\nICP: ${icp.title}\nPain points: ${icp.painPoints}\nValue props: ${icp.valueProps}\n\nSEQUENCE STEP: ${aiStep}\nCHANNEL: ${aiChannel}\nRULES: Direct and concise. No fluff. Personalize using their name, company, notes. One clear CTA.\nOutput ONLY valid JSON: {"subject":"...","body":"...","whatsapp":"...","linkedin":"..."}`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const raw=data.content?.find(b=>b.type==="text")?.text||"";
      setAiOutput(JSON.parse(raw.replace(/```json|```/g,"").trim()));
    }catch(e){setAiError("Generation failed. Please try again.");}
    setAiLoading(false);
  }

  function openOutlook(subject,body){window.open(`https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,"_blank");}
  function openWhatsApp(phone,msg){const c=(phone||"").replace(/\D/g,"");if(!c){alert("No WhatsApp number.");return;}window.open(`https://wa.me/${c}?text=${encodeURIComponent(msg)}`,"_blank");}
  function openLinkedIn(msg){navigator.clipboard?.writeText(msg).catch(()=>{});window.open("https://linkedin.com/messaging","_blank");}

  async function logAISent(type){
    const payload={contact_id:aiContact.id,type:type.toLowerCase(),note:`AI-generated ${type} sent (${aiStep})`,date:today(),user_name:userName,created_by:user.id};
    const{data}=await sb.from("activities").insert(payload).select().single();
    if(data){setActivities(as=>[data,...as]);showToast("Activity logged");}
    await sb.from("contacts").update({last_contact:today()}).eq("id",aiContact.id);
    setContacts(cs=>cs.map(c=>c.id===aiContact.id?{...c,last_contact:today()}:c));
  }

  // ── Auth check ───────────────────────────────────────────────
  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif",color:C.textSub}}>Loading…</div>;
  if(!user) return <LoginScreen onLogin={u=>setUser(u)}/>;

  const allNavItems=NAV.flatMap(s=>s.items);

  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",fontSize:14,overflow:"hidden"}}>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:toast.type==="success"?C.greenSoft:toast.type==="info"?C.blueSoft:C.redSoft,border:`1px solid ${toast.type==="success"?"#A5D6A7":toast.type==="info"?C.border:C.redBorder}`,borderRadius:8,padding:"10px 18px",fontSize:13,fontWeight:600,color:toast.type==="success"?"#007B4F":toast.type==="info"?C.blue:C.red,boxShadow:"0 4px 20px rgba(0,0,0,.12)"}}>
        {toast.msg}
      </div>}

      {/* Sidebar */}
      <aside style={{width:230,background:C.sidebar,display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:9,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(139,0,0,.4)"}}>
              <span style={{color:"#fff",fontWeight:800,fontSize:18}}>C</span>
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:15,color:"#fff"}}>ProCRM</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>by Clover IQ</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {NAV.map(sec=>(
            <div key={sec.section} style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.3)",letterSpacing:".1em",padding:"8px 10px 4px",textTransform:"uppercase"}}>{sec.section}</div>
              {sec.items.map(n=>{
                const active=tab===n.id;
                return(
                  <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"8px 10px",borderRadius:6,border:"none",background:active?"rgba(0,115,234,.25)":"transparent",color:active?"#fff":"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:active?600:400,marginBottom:1,transition:"all .12s",position:"relative"}}>
                    {active&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,background:C.blue,borderRadius:"0 3px 3px 0"}}/>}
                    <span style={{fontSize:15,width:20,textAlign:"center"}}>{n.icon}</span>
                    {n.label}
                    {n.id==="tasks"&&openTasks.length>0&&<span style={{marginLeft:"auto",background:C.red,color:"#fff",borderRadius:10,fontSize:10,fontWeight:700,padding:"1px 6px"}}>{openTasks.length}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div style={{padding:"10px 16px 14px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <Avatar name={userName} size={28}/>
            <div style={{fontSize:12,color:"rgba(255,255,255,.6)"}}>
              <div style={{color:"rgba(255,255,255,.85)",fontWeight:600}}>{userName}</div>
              <div>{contacts.length} contacts</div>
            </div>
          </div>
          <button onClick={()=>sb.auth.signOut()} style={{width:"100%",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:6,color:"rgba(255,255,255,.5)",padding:"6px 0",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
        <header style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontWeight:700,fontSize:17,color:C.text}}>{allNavItems.find(n=>n.id===tab)?.label}</div>
            {dataLoading&&<span style={{fontSize:11,color:C.textMuted,background:C.bg,padding:"2px 8px",borderRadius:10}}>syncing…</span>}
          </div>
          <div style={{display:"flex",gap:8}}>
            {tab==="contacts"&&<><Btn variant="ghost" small onClick={()=>{setCsvText("");setCsvMsg("");setModal("import");}}>⬆ Import CSV</Btn><Btn small onClick={()=>{setEditC({name:"",title:"",email:"",phone:"",whatsapp:"",linkedin:"",org_id:null,stage:"New Lead",source:"Event",seq_step:0,tags:[],notes:"",last_contact:today()});setModal("contact");}}>+ Add Contact</Btn></>}
            {tab==="leads"&&<Btn small variant="red" onClick={()=>{setEditC({name:"",title:"",email:"",phone:"",whatsapp:"",linkedin:"",org_id:null,stage:"New Lead",source:"Event",seq_step:0,tags:[],notes:"",last_contact:today()});setModal("contact");}}>+ Add Lead</Btn>}
            {tab==="vendors"&&<Btn small onClick={()=>{setEditV({name:"",category:"Hardware",contact:"",rating:3,notes:"",status:"Active",tags:[]});setModal("vendor");}}>+ Add Vendor</Btn>}
            {tab==="projects"&&<Btn small onClick={()=>{setEditP({name:"",owner:userName,priority:"Medium",status:"Not Started",start_date:today(),end_date:"",contact_id:null,notes:""});setModal("project");}}>+ New Project</Btn>}
            {tab==="tasks"&&<Btn small onClick={()=>{setTaskF({title:"",due:"",assignee:userName,contact_id:null});setModal("task");}}>+ Add Task</Btn>}
          </div>
        </header>

        <main style={{flex:1,overflow:"auto",padding:"20px 24px"}}>

          {/* DASHBOARD */}
          {tab==="dashboard"&&(<>
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
              {[{label:"Contacts",val:contacts.length,col:C.red},{label:"Open Tasks",val:openTasks.length,col:C.blue},{label:"Active Projects",val:projects.filter(p=>p.status!=="Done").length,col:C.purple},{label:"Won",val:contacts.filter(c=>c.stage==="Won").length,col:C.green},{label:"Vendors",val:vendors.length,col:C.teal}].map(s=>(
                <div key={s.label} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 18px",flex:1,minWidth:100,borderLeft:`3px solid ${s.col}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:6}}>{s.label}</div>
                  <div style={{fontSize:24,fontWeight:700,color:C.text}}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
                <div style={{fontWeight:700,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Pipeline</div>
                {PIPELINE_STAGES.map(s=>(
                  <div key={s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                    <div style={{width:100,fontSize:12,color:C.textSub,flexShrink:0}}>{s}</div>
                    <div style={{flex:1,background:C.bg,borderRadius:4,height:7,overflow:"hidden"}}>
                      <div style={{width:`${contacts.length?stageCounts[s]/contacts.length*100:0}%`,background:STAGE_META[s].color,height:"100%",borderRadius:4}}/>
                    </div>
                    <div style={{width:20,textAlign:"right",fontSize:12,fontWeight:700,color:STAGE_META[s].color}}>{stageCounts[s]}</div>
                  </div>
                ))}
              </div>
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
                <div style={{fontWeight:700,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Recent Activity</div>
                {[...activities].slice(0,6).map(a=>{
                  const c=contacts.find(x=>x.id===a.contact_id);
                  return <div key={a.id} style={{display:"flex",gap:10,marginBottom:9}}><span style={{fontSize:13,flexShrink:0}}>{ACT_ICONS[a.type]}</span><div><div style={{fontSize:13}}>{c?.name||"Unknown"} <span style={{color:C.textMuted}}>· {a.type}</span></div><div style={{fontSize:11,color:C.textMuted}}>{a.note?.slice(0,50)} · {a.date} · <strong>{a.user_name}</strong></div></div></div>;
                })}
                {activities.length===0&&<div style={{fontSize:12,color:C.textMuted}}>No activity yet.</div>}
              </div>
            </div>
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
              <div style={{fontWeight:700,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:12}}>Upcoming Tasks</div>
              {openTasks.length===0&&<div style={{fontSize:13,color:C.textMuted}}>All tasks completed 🎉</div>}
              {openTasks.slice(0,6).map(t=>{
                const c=contacts.find(x=>x.id===t.contact_id);
                return(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,background:C.bg,borderRadius:6,padding:"9px 13px",marginBottom:7}}>
                    <button onClick={()=>toggleTask(t.id,true)} style={{width:18,height:18,borderRadius:4,border:`2px solid ${C.borderMid}`,background:"none",cursor:"pointer",flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.title}</div>
                      {c&&<div style={{fontSize:11,color:C.textMuted}}>→ {c.name}</div>}
                    </div>
                    <span style={{fontSize:11,color:C.textMuted,flexShrink:0}}>{t.due}</span>
                    <Tag label={t.assignee} color={C.blue}/>
                  </div>
                );
              })}
            </div>
          </>)}

          {/* CONTACTS / LEADS */}
          {(tab==="contacts"||tab==="leads")&&(<>
            {/* View toggle */}
            <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:"0 0 240px"}}>
                <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.textMuted,fontSize:13}}>🔍</span>
                <Input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:32}}/>
              </div>
              <Sel value={stageF} onChange={e=>setStageF(e.target.value)} style={{width:150}}><option>All</option>{PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}</Sel>
              <span style={{marginLeft:"auto",fontSize:12,color:C.textMuted}}>{filtered.length} of {contacts.length}</span>
            </div>
            <div style={{display:"flex",marginBottom:14,background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
              {[{id:"all",icon:"☰",label:"All"},{id:"event",icon:"📅",label:"By Event"},{id:"industry",icon:"🏭",label:"By Industry"},{id:"company",icon:"🏢",label:"By Company"}].map((v,i,arr)=>(
                <button key={v.id} onClick={()=>{setContactView(v.id);setExpandedGroup(null);}} style={{flex:1,padding:"10px 14px",border:"none",borderRight:i<arr.length-1?`1px solid ${C.border}`:"none",background:contactView===v.id?C.red:"transparent",color:contactView===v.id?"#fff":C.textSub,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:contactView===v.id?700:400,display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .15s"}}>
                  <span>{v.icon}</span>{v.label}
                </button>
              ))}
            </div>

            {/* All view */}
            {contactView==="all"&&(
              <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Contact","Organization","Stage","Source","Sequence","Last Contact",""].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map((c,i)=>{
                      const org=orgs.find(o=>o.id===c.org_id),sel=panelC?.id===c.id;
                      return(
                        <tr key={c.id} onClick={()=>setSelected(c)} style={{cursor:"pointer",background:sel?"#EFF6FF":"transparent"}}
                          onMouseEnter={e=>{if(!sel)e.currentTarget.style.background=C.bg;}}
                          onMouseLeave={e=>{if(!sel)e.currentTarget.style.background="transparent";}}>
                          <td style={TD}><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={c.name} size={32}/><div><div style={{fontWeight:600}}>{c.name}</div><div style={{fontSize:11,color:C.textMuted}}>{c.title}</div></div></div></td>
                          <td style={TD}><span style={{fontSize:12,color:C.textSub}}>{org?.name||"—"}</span></td>
                          <td style={TD}><SPill label={c.stage} meta={STAGE_META[c.stage]}/></td>
                          <td style={TD}><Tag label={c.source} color={C.purple}/></td>
                          <td style={TD}>
                            <div style={{fontSize:12,color:C.blue,fontWeight:500}}>{SEQ_STEPS[c.seq_step||0]}</div>
                            <div style={{display:"flex",gap:2,marginTop:3}}>{SEQ_STEPS.map((_,si)=><div key={si} style={{flex:1,height:3,borderRadius:2,background:si<=(c.seq_step||0)?C.blue:C.border}}/>)}</div>
                          </td>
                          <td style={TD}><span style={{fontSize:12,color:C.textMuted}}>{c.last_contact}</span></td>
                          <td style={TD}><Btn small variant="ghost" onClick={e=>{e.stopPropagation();setEditC({...c});setModal("contact");}}>Edit</Btn></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:C.textMuted}}>No contacts found.</div>}
              </div>
            )}

            {/* Grouped views */}
            {contactView!=="all"&&(()=>{
              const groupFn = contactView==="event"
                ? c=>{const m=c.notes?.match(/(?:at|from)\s+([A-Z][^\.\,\n]{3,40}(?:\d{4})?)/i);return m?m[1]:c.source||"Other";}
                : contactView==="industry"
                ? c=>orgs.find(o=>o.id===c.org_id)?.industry||"Unknown"
                : c=>orgs.find(o=>o.id===c.org_id)?.name||"No Company";
              const groups=filtered.reduce((acc,c)=>{const k=groupFn(c);if(!acc[k])acc[k]=[];acc[k].push(c);return acc;},{});
              const COLS=["#0073EA","#A25DDC","#0ABFA3","#FF7575","#8B0000","#00C875"];
              return(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([gName,members],gi)=>{
                    const col=COLS[gi%COLS.length],isOpen=expandedGroup===gName;
                    return(
                      <div key={gName} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",borderLeft:`4px solid ${col}`}}>
                        <div onClick={()=>setExpandedGroup(isOpen?null:gName)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 18px",cursor:"pointer"}}>
                          <div style={{width:36,height:36,borderRadius:8,background:col+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>
                            {contactView==="event"?"📅":contactView==="industry"?"🏭":"🏢"}
                          </div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:14}}>{gName}</div>
                          </div>
                          <span style={{background:col+"18",color:col,fontWeight:700,fontSize:12,padding:"3px 10px",borderRadius:20}}>{members.length} contacts</span>
                          {members.filter(c=>["Qualified","Proposal Sent"].includes(c.stage)).length>0&&<span style={{background:C.purpleSoft,color:C.purple,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>🔥 {members.filter(c=>["Qualified","Proposal Sent"].includes(c.stage)).length} hot</span>}
                          <div style={{display:"flex"}}>{members.slice(0,4).map((c,ci)=><div key={c.id} style={{marginLeft:ci>0?-8:0}}><Avatar name={c.name} size={26}/></div>)}</div>
                          <span style={{fontSize:18,color:C.textMuted,transition:"transform .2s",transform:isOpen?"rotate(180deg)":"none"}}>⌄</span>
                        </div>
                        {isOpen&&(
                          <div style={{borderTop:`1px solid ${C.border}`}}>
                            <table style={{width:"100%",borderCollapse:"collapse"}}>
                              <thead><tr>{["Contact","Stage","Source","Sequence","Last Contact",""].map(h=><th key={h} style={{...TH,background:C.bg}}>{h}</th>)}</tr></thead>
                              <tbody>
                                {members.map(c=>{
                                  const sel=panelC?.id===c.id;
                                  return(
                                    <tr key={c.id} onClick={()=>setSelected(c)} style={{cursor:"pointer",background:sel?"#EFF6FF":"transparent"}}
                                      onMouseEnter={e=>{if(!sel)e.currentTarget.style.background=C.bg;}}
                                      onMouseLeave={e=>{if(!sel)e.currentTarget.style.background="transparent";}}>
                                      <td style={TD}><div style={{display:"flex",alignItems:"center",gap:9}}><Avatar name={c.name} size={30}/><div><div style={{fontWeight:600}}>{c.name}</div><div style={{fontSize:11,color:C.textMuted}}>{c.title}</div></div></div></td>
                                      <td style={TD}><SPill label={c.stage} meta={STAGE_META[c.stage]}/></td>
                                      <td style={TD}><Tag label={c.source} color={C.purple}/></td>
                                      <td style={TD}><div style={{fontSize:12,color:C.blue,fontWeight:500}}>{SEQ_STEPS[c.seq_step||0]}</div></td>
                                      <td style={TD}><span style={{fontSize:12,color:C.textMuted}}>{c.last_contact}</span></td>
                                      <td style={TD}><Btn small variant="ghost" onClick={e=>{e.stopPropagation();setEditC({...c});setModal("contact");}}>Edit</Btn></td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>)}

          {/* DEALS */}
          {tab==="deals"&&(
            <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:12,alignItems:"flex-start"}}>
              {PIPELINE_STAGES.map(stage=>{
                const m=STAGE_META[stage],cards=contacts.filter(c=>c.stage===stage);
                return(
                  <div key={stage} style={{minWidth:200,maxWidth:200}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                      <span style={{fontWeight:700,fontSize:11,color:m.color,textTransform:"uppercase",letterSpacing:".08em"}}>{stage}</span>
                      <span style={{fontSize:11,fontWeight:700,background:m.bg,color:m.color,padding:"2px 8px",borderRadius:20}}>{cards.length}</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {cards.map(c=>{
                        const org=orgs.find(o=>o.id===c.org_id);
                        return(
                          <div key={c.id} onClick={()=>setSelected(c)} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:12,cursor:"pointer",transition:"all .15s"}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=m.color;e.currentTarget.style.boxShadow=`0 2px 12px ${m.color}20`;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none";}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><Avatar name={c.name} size={28}/><div><div style={{fontWeight:600,fontSize:13}}>{c.name}</div><div style={{fontSize:11,color:C.textMuted}}>{c.title}</div></div></div>
                            {org&&<div style={{fontSize:11,color:C.textSub,marginBottom:6}}>🏢 {org.name}</div>}
                            <Sel value={c.stage} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();setStage(c.id,e.target.value);}} style={{fontSize:11,padding:"4px 8px"}}>
                              {PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}
                            </Sel>
                          </div>
                        );
                      })}
                      {cards.length===0&&<div style={{border:`2px dashed ${C.border}`,borderRadius:8,padding:14,textAlign:"center",fontSize:12,color:C.textMuted}}>Empty</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PROJECTS */}
          {tab==="projects"&&(<>
            <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
              {[{l:"Total",v:projects.length,c:C.blue},{l:"Active",v:projects.filter(p=>p.status==="Working on it").length,c:C.green},{l:"Stuck",v:projects.filter(p=>p.status==="Stuck").length,c:C.red},{l:"Done",v:projects.filter(p=>p.status==="Done").length,c:C.teal}].map(s=>(
                <div key={s.l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 18px",flex:1,minWidth:100,borderLeft:`3px solid ${s.c}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:700,color:C.text}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Project","Owner","Priority","Status","Timeline","Contact",""].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {projects.map((p,i)=>{
                    const c=contacts.find(x=>x.id===p.contact_id);
                    const priColor={Low:C.teal,Medium:C.blue,High:"#FF7575",Critical:C.red}[p.priority]||C.textSub;
                    return(
                      <tr key={p.id} style={{background:i%2===0?"transparent":C.bg}}>
                        <td style={TD}><div style={{fontWeight:600}}>{p.name}</div>{p.notes&&<div style={{fontSize:11,color:C.textMuted,marginTop:2}}>{p.notes.slice(0,50)}…</div>}</td>
                        <td style={TD}><div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={p.owner} size={24}/><span style={{fontSize:12}}>{p.owner}</span></div></td>
                        <td style={TD}><span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:priColor}}><span style={{width:7,height:7,borderRadius:"50%",background:priColor,display:"inline-block"}}/>{p.priority}</span></td>
                        <td style={TD}><SPill label={p.status} meta={PROJ_STAT_COLOR[p.status]}/></td>
                        <td style={TD}><span style={{fontSize:12,color:C.textSub}}>{p.start_date}{p.end_date?` → ${p.end_date}`:""}</span></td>
                        <td style={TD}>{c?<div style={{display:"flex",alignItems:"center",gap:6}}><Avatar name={c.name} size={22}/><span style={{fontSize:12}}>{c.name}</span></div>:<span style={{color:C.textMuted}}>—</span>}</td>
                        <td style={TD}><Btn small variant="ghost" onClick={()=>{setEditP({...p});setModal("project");}}>Edit</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {projects.length===0&&<div style={{padding:32,textAlign:"center",color:C.textMuted}}>No projects yet.</div>}
            </div>
          </>)}

          {/* VENDORS */}
          {tab==="vendors"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
              {vendors.map(v=>(
                <div key={v.id} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:18}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div><div style={{fontWeight:700,fontSize:15}}>{v.name}</div><div style={{fontSize:12,color:C.textSub}}>{v.category}</div></div>
                    <SPill label={v.status} meta={v.status==="Active"?{color:"#007B4F",bg:C.greenSoft}:{color:"#7A5F00",bg:C.amberSoft}}/>
                  </div>
                  <div style={{color:C.amber,fontSize:13,letterSpacing:1,marginBottom:8}}>{"★".repeat(v.rating)}{"☆".repeat(5-v.rating)}</div>
                  {v.contact&&<div style={{fontSize:12,color:C.blue,marginBottom:8}}>🔗 {v.contact}</div>}
                  {v.notes&&<div style={{fontSize:12,color:C.textSub,lineHeight:1.6,background:C.bg,borderRadius:6,padding:"8px 10px",marginBottom:10}}>{v.notes}</div>}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>{v.tags?.map(t=><Tag key={t} label={t} color={C.teal}/>)}</div>
                  <Btn small variant="ghost" onClick={()=>{setEditV({...v});setModal("vendor");}}>Edit</Btn>
                </div>
              ))}
              {vendors.length===0&&<div style={{padding:32,textAlign:"center",color:C.textMuted,background:C.white,borderRadius:8,border:`1px solid ${C.border}`}}>No vendors yet.</div>}
            </div>
          )}

          {/* SEQUENCES */}
          {tab==="sequences"&&(<>
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:18,marginBottom:16,overflowX:"auto"}}>
              <div style={{fontWeight:700,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:14}}>Outreach Sequence</div>
              <div style={{display:"flex",alignItems:"center",minWidth:"max-content"}}>
                {SEQ_STEPS.map((s,i)=>(
                  <div key={s} style={{display:"flex",alignItems:"center"}}>
                    <div style={{background:C.blueSoft,border:`1px solid ${C.blue}33`,borderRadius:7,padding:"9px 14px",textAlign:"center",minWidth:110}}>
                      <div style={{fontSize:10,color:C.textMuted,marginBottom:3,fontWeight:600}}>STEP {i+1}</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.blue}}>{s}</div>
                    </div>
                    {i<SEQ_STEPS.length-1&&<span style={{color:C.borderMid,padding:"0 4px",fontSize:18}}>→</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,fontWeight:700,fontSize:13}}>Active Contacts</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>{["Contact","Organization","Step","Progress","Stage","Action"].map(h=><th key={h} style={TH}>{h}</th>)}</tr></thead>
                <tbody>
                  {contacts.filter(c=>c.stage!=="Won"&&c.stage!=="Lost").sort((a,b)=>(a.seq_step||0)-(b.seq_step||0)).map((c,i)=>{
                    const org=orgs.find(o=>o.id===c.org_id);
                    return(
                      <tr key={c.id} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?"transparent":C.bg}}>
                        <td style={TD}><div style={{display:"flex",alignItems:"center",gap:9}}><Avatar name={c.name} size={30}/><div><div style={{fontWeight:600}}>{c.name}</div><div style={{fontSize:11,color:C.textMuted}}>{c.email}</div></div></div></td>
                        <td style={TD}><span style={{fontSize:12,color:C.textSub}}>{org?.name||"—"}</span></td>
                        <td style={TD}><span style={{fontSize:12,fontWeight:600,color:C.blue}}>{SEQ_STEPS[c.seq_step||0]}</span></td>
                        <td style={TD}>
                          <div style={{display:"flex",gap:2}}>{SEQ_STEPS.map((_,si)=><div key={si} style={{width:14,height:5,borderRadius:3,background:si<=(c.seq_step||0)?C.blue:C.border}}/>)}</div>
                          <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>{(c.seq_step||0)+1}/{SEQ_STEPS.length}</div>
                        </td>
                        <td style={TD}><SPill label={c.stage} meta={STAGE_META[c.stage]}/></td>
                        <td style={TD}><Btn small variant="ghost" onClick={()=>advanceSeq(c)}>{(c.seq_step||0)<SEQ_STEPS.length-1?`→ ${SEQ_STEPS[(c.seq_step||0)+1]}`:"✓ Done"}</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>)}

          {/* TASKS */}
          {tab==="tasks"&&(<>
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
              {[{l:"Open",v:tasks.filter(t=>!t.done).length,c:C.red},{l:"Done",v:tasks.filter(t=>t.done).length,c:C.green},{l:"Total",v:tasks.length,c:C.textSub}].map(s=>(
                <div key={s.l} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"14px 18px",flex:1,minWidth:100,borderLeft:`3px solid ${s.c}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:4}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:700,color:C.text}}>{s.v}</div>
                </div>
              ))}
            </div>
            {["Open","Completed"].map(sec=>{
              const done=sec==="Completed",list=tasks.filter(t=>t.done===done);
              return(
                <div key={sec} style={{marginBottom:20}}>
                  <div style={{fontWeight:700,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10}}>{sec}</div>
                  {list.map(t=>{
                    const c=contacts.find(x=>x.id===t.contact_id);
                    return(
                      <div key={t.id} style={{display:"flex",alignItems:"center",gap:12,background:C.white,border:`1px solid ${C.border}`,borderRadius:7,padding:"10px 16px",marginBottom:7,opacity:done?.6:1}}>
                        <button onClick={()=>toggleTask(t.id,!t.done)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${t.done?C.green:C.borderMid}`,background:t.done?C.greenSoft:"none",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#007B4F",fontSize:12}}>{t.done?"✓":""}</button>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,textDecoration:t.done?"line-through":"none",color:t.done?C.textMuted:C.text}}>{t.title}</div>
                          {c&&<div style={{fontSize:11,color:C.textMuted,marginTop:1}}>→ {c.name} · {c.title}</div>}
                        </div>
                        <span style={{fontSize:12,color:C.textMuted,flexShrink:0}}>{t.due}</span>
                        <Tag label={t.assignee} color={C.blue}/>
                        <button onClick={()=>deleteTask(t.id)} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:14,padding:4}}>✕</button>
                      </div>
                    );
                  })}
                  {list.length===0&&<div style={{fontSize:13,color:C.textMuted,padding:"8px 0"}}>No {sec.toLowerCase()} tasks.</div>}
                </div>
              );
            })}
          </>)}

        </main>
      </div>

      {/* Detail Panel */}
      {panelC&&(()=>{
        const c=panelC,org=orgs.find(o=>o.id===c.org_id);
        const ed=inlineEdit&&inlineData;
        return(
          <aside style={{width:330,background:C.white,borderLeft:`1px solid ${C.border}`,overflow:"auto",flexShrink:0}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.white,zIndex:10}}>
              <span style={{fontWeight:700,fontSize:13}}>Contact Detail</span>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {!inlineEdit?<Btn small variant="ghost" onClick={()=>{setInlineEdit(true);setInlineData({...c});}}>✏ Edit</Btn>:<><Btn small onClick={saveInlineContact}>Save</Btn><Btn small variant="ghost" onClick={()=>{setInlineEdit(false);setInlineData(null);}}>Cancel</Btn></>}
                <button onClick={()=>{setSelected(null);setInlineEdit(false);setInlineData(null);}} style={{background:"none",border:"none",color:C.textMuted,cursor:"pointer",fontSize:18,lineHeight:1}}>✕</button>
              </div>
            </div>
            <div style={{padding:16}}>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12,padding:"12px 14px",background:inlineEdit?C.blueSoft:C.bg,borderRadius:8}}>
                <Avatar name={inlineEdit?inlineData?.name||c.name:c.name} size={44}/>
                <div style={{flex:1,minWidth:0}}>
                  {inlineEdit?<>
                    <input value={inlineData?.name||""} onChange={e=>setInlineData(d=>({...d,name:e.target.value}))} style={{width:"100%",fontWeight:700,fontSize:15,background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:5,padding:"5px 8px",outline:"none",fontFamily:"inherit",marginBottom:4}}/>
                    <input value={inlineData?.title||""} onChange={e=>setInlineData(d=>({...d,title:e.target.value}))} style={{width:"100%",fontSize:12,background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:5,padding:"5px 8px",outline:"none",fontFamily:"inherit"}} placeholder="Job title"/>
                  </>:<>
                    <div style={{fontWeight:700,fontSize:15}}>{c.name}</div>
                    <div style={{fontSize:12,color:C.textSub}}>{c.title}</div>
                    {org&&<div style={{fontSize:12,color:C.blue,marginTop:2}}>🏢 {org.name}</div>}
                  </>}
                </div>
              </div>
              {inlineEdit?
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <div><div style={{fontSize:10,fontWeight:700,color:C.textSub,marginBottom:4,textTransform:"uppercase"}}>Stage</div><Sel value={inlineData?.stage} onChange={e=>setInlineData(d=>({...d,stage:e.target.value}))} style={{fontSize:12,padding:"6px 8px"}}>{PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}</Sel></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:C.textSub,marginBottom:4,textTransform:"uppercase"}}>Source</div><Sel value={inlineData?.source} onChange={e=>setInlineData(d=>({...d,source:e.target.value}))} style={{fontSize:12,padding:"6px 8px"}}>{SOURCES.map(s=><option key={s}>{s}</option>)}</Sel></div>
                </div>:
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}><SPill label={c.stage} meta={STAGE_META[c.stage]}/><Tag label={c.source} color={C.purple}/></div>
              }
              <div style={{background:C.bg,borderRadius:8,padding:"10px 12px",marginBottom:12}}>
                {[{ic:"✉️",field:"email",href:`mailto:${c.email}`},{ic:"📞",field:"phone"},{ic:"💬",field:"whatsapp",href:c.whatsapp?`https://wa.me/${c.whatsapp.replace(/\D/g,"")}`:""}].map(r=>(
                  <div key={r.field} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,fontSize:12}}>
                    <span style={{width:20}}>{r.ic}</span>
                    {inlineEdit?<input value={inlineData?.[r.field]||""} onChange={e=>setInlineData(d=>({...d,[r.field]:e.target.value}))} style={{flex:1,background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:5,padding:"4px 7px",fontSize:12,outline:"none",fontFamily:"inherit"}}/>:
                      r.href&&c[r.field]?<a href={r.href} target="_blank" rel="noreferrer" style={{color:C.blue,textDecoration:"none"}}>{c[r.field]}</a>:<span style={{color:C.textSub}}>{c[r.field]||"—"}</span>}
                  </div>
                ))}
                <div style={{display:"flex",gap:8,alignItems:"center",fontSize:12}}><span style={{width:20}}>📅</span><span style={{color:C.textMuted}}>Last contact: {c.last_contact}</span></div>
              </div>
              {inlineEdit?
                <div style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:C.textSub,marginBottom:4,textTransform:"uppercase"}}>Notes</div><TA rows={3} value={inlineData?.notes||""} onChange={e=>setInlineData(d=>({...d,notes:e.target.value}))} placeholder="Notes…"/></div>:
                c.notes&&<div style={{background:C.bg,borderRadius:7,padding:"9px 12px",fontSize:12,color:C.textSub,lineHeight:1.7,marginBottom:12}}>{c.notes}</div>
              }
              <SLabel label="Sequence"/>
              <div style={{fontSize:12,fontWeight:600,color:C.blue,marginBottom:5}}>Step {(c.seq_step||0)+1}: {SEQ_STEPS[c.seq_step||0]}</div>
              <div style={{display:"flex",gap:2,marginBottom:8}}>{SEQ_STEPS.map((_,si)=><div key={si} style={{flex:1,height:5,borderRadius:3,background:si<=(c.seq_step||0)?C.blue:C.border}}/>)}</div>
              {(c.seq_step||0)<SEQ_STEPS.length-1&&!inlineEdit&&<Btn small variant="ghost" onClick={()=>advanceSeq(c)}>→ {SEQ_STEPS[(c.seq_step||0)+1]}</Btn>}
              {panelTasks.length>0&&<><SLabel label="Open Tasks"/>{panelTasks.map(t=><div key={t.id} style={{fontSize:12,padding:"6px 9px",background:C.amberSoft,borderRadius:5,marginBottom:5,color:C.amberText,fontWeight:500}}>◻ {t.title} · {t.due}</div>)}</>}
              {!inlineEdit&&<>
                <SLabel label="Actions"/>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                  <Btn small variant="red" onClick={()=>{setAiContact(c);setAiStep(SEQ_STEPS[c.seq_step||0]);setAiOutput(null);setAiError("");setShowAI(true);}}>✨ Generate Copy</Btn>
                  <Btn small onClick={()=>{setActF({type:"email",note:"",date:today(),user_name:userName});setModal("activity");}}>+ Log Activity</Btn>
                  <Btn small variant="ghost" onClick={()=>{setTaskF({title:"",due:"",assignee:userName,contact_id:c.id});setModal("task");}}>+ Task</Btn>
                  <Btn small variant="danger" onClick={()=>deleteContact(c.id)}>Delete</Btn>
                </div>
              </>}
              <SLabel label={`Activity Log (${panelActs.length})`}/>
              {panelActs.map(a=>(
                <div key={a.id} style={{background:C.bg,borderRadius:7,padding:10,marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}><span>{ACT_ICONS[a.type]}</span><span style={{fontSize:12,fontWeight:600,textTransform:"capitalize"}}>{a.type}</span><span style={{marginLeft:"auto",fontSize:11,color:C.textMuted}}>{a.date}</span></div>
                  <div style={{fontSize:12,color:C.textSub,lineHeight:1.6}}>{a.note}</div>
                  <div style={{fontSize:10,color:C.textMuted,marginTop:3}}>by {a.user_name}</div>
                </div>
              ))}
              {panelActs.length===0&&<div style={{fontSize:12,color:C.textMuted}}>No activity yet.</div>}
            </div>
          </aside>
        );
      })()}

      {/* ── MODALS ── */}
      {modal==="contact"&&editC&&(
        <Modal title={editC.id?"Edit Contact":"Add Contact"} onClose={closeModal} wide>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Field label="Full Name"><Input value={editC.name} onChange={e=>setEditC({...editC,name:e.target.value})} placeholder="Sara Ahmed"/></Field>
            <Field label="Job Title"><Input value={editC.title} onChange={e=>setEditC({...editC,title:e.target.value})} placeholder="CTO"/></Field>
            <Field label="Email"><Input type="email" value={editC.email} onChange={e=>setEditC({...editC,email:e.target.value})} placeholder="sara@company.com"/></Field>
            <Field label="Phone"><Input value={editC.phone} onChange={e=>setEditC({...editC,phone:e.target.value})} placeholder="+92 300 123 4567"/></Field>
            <Field label="WhatsApp"><Input value={editC.whatsapp} onChange={e=>setEditC({...editC,whatsapp:e.target.value})} placeholder="+923001234567"/></Field>
            <Field label="LinkedIn"><Input value={editC.linkedin||""} onChange={e=>setEditC({...editC,linkedin:e.target.value})} placeholder="linkedin.com/in/name"/></Field>
            <Field label="Organization"><Sel value={editC.org_id||""} onChange={e=>setEditC({...editC,org_id:e.target.value||null})}><option value="">— None —</option>{orgs.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</Sel></Field>
            <Field label="Stage"><Sel value={editC.stage} onChange={e=>setEditC({...editC,stage:e.target.value})}>{PIPELINE_STAGES.map(s=><option key={s}>{s}</option>)}</Sel></Field>
            <Field label="Source"><Sel value={editC.source} onChange={e=>setEditC({...editC,source:e.target.value})}>{SOURCES.map(s=><option key={s}>{s}</option>)}</Sel></Field>
            <Field label="Last Contact"><Input type="date" value={editC.last_contact} onChange={e=>setEditC({...editC,last_contact:e.target.value})}/></Field>
          </div>
          <Field label="Notes"><TA rows={3} value={editC.notes} onChange={e=>setEditC({...editC,notes:e.target.value})} placeholder="Key context, next steps…"/></Field>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={()=>saveContact(editC)}>Save Contact</Btn>
          </div>
        </Modal>
      )}

      {modal==="vendor"&&editV&&(
        <Modal title={editV.id?"Edit Vendor":"Add Vendor"} onClose={closeModal}>
          <Field label="Company Name"><Input value={editV.name} onChange={e=>setEditV({...editV,name:e.target.value})} placeholder="Dell Technologies"/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Field label="Category"><Sel value={editV.category} onChange={e=>setEditV({...editV,category:e.target.value})}>{VENDOR_CAT.map(c=><option key={c}>{c}</option>)}</Sel></Field>
            <Field label="Status"><Sel value={editV.status} onChange={e=>setEditV({...editV,status:e.target.value})}><option>Active</option><option>Review</option><option>Inactive</option></Sel></Field>
          </div>
          <Field label="Contact / Website"><Input value={editV.contact} onChange={e=>setEditV({...editV,contact:e.target.value})} placeholder="dell.com or contact@dell.com"/></Field>
          <Field label="Rating"><Sel value={editV.rating} onChange={e=>setEditV({...editV,rating:Number(e.target.value)})}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}</Sel></Field>
          <Field label="Notes"><TA rows={3} value={editV.notes} onChange={e=>setEditV({...editV,notes:e.target.value})} placeholder="Certifications, pricing notes…"/></Field>
          <Field label="Tags (comma separated)"><Input value={editV.tags?.join(",")||""} onChange={e=>setEditV({...editV,tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)})} placeholder="rugged, certified, mil-spec"/></Field>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={()=>saveVendor(editV)}>Save Vendor</Btn>
          </div>
        </Modal>
      )}

      {modal==="project"&&editP&&(
        <Modal title={editP.id?"Edit Project":"New Project"} onClose={closeModal} wide>
          <Field label="Project Name"><Input value={editP.name} onChange={e=>setEditP({...editP,name:e.target.value})} placeholder="Rugged Tablets — Hunaid Electronics"/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Field label="Owner"><Sel value={editP.owner} onChange={e=>setEditP({...editP,owner:e.target.value})}><option value={userName}>{userName}</option>{teamNames.filter(n=>n!==userName).map(n=><option key={n}>{n}</option>)}</Sel></Field>
            <Field label="Priority"><Sel value={editP.priority} onChange={e=>setEditP({...editP,priority:e.target.value})}>{PROJ_PRI.map(p=><option key={p}>{p}</option>)}</Sel></Field>
            <Field label="Status"><Sel value={editP.status} onChange={e=>setEditP({...editP,status:e.target.value})}>{PROJ_STATUS.map(s=><option key={s}>{s}</option>)}</Sel></Field>
            <Field label="Linked Contact"><Sel value={editP.contact_id||""} onChange={e=>setEditP({...editP,contact_id:e.target.value||null})}><option value="">— None —</option>{contacts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Sel></Field>
            <Field label="Start Date"><Input type="date" value={editP.start_date} onChange={e=>setEditP({...editP,start_date:e.target.value})}/></Field>
            <Field label="End Date"><Input type="date" value={editP.end_date} onChange={e=>setEditP({...editP,end_date:e.target.value})}/></Field>
          </div>
          <Field label="Notes"><TA rows={3} value={editP.notes} onChange={e=>setEditP({...editP,notes:e.target.value})} placeholder="Scope, deliverables, key notes…"/></Field>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={()=>saveProject(editP)}>Save Project</Btn>
          </div>
        </Modal>
      )}

      {modal==="import"&&(
        <Modal title="Import Contacts from CSV" onClose={()=>{closeModal();setCsvText("");setCsvMsg("");}} wide>
          <input ref={fileInputRef} type="file" accept=".csv,.txt" style={{display:"none"}} onChange={e=>{if(e.target.files[0])handleFileUpload(e.target.files[0]);}}/>
          <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFileUpload(f);}} onClick={()=>fileInputRef.current?.click()} style={{border:`2px dashed ${dragOver?C.blue:C.border}`,borderRadius:10,padding:"28px 20px",textAlign:"center",cursor:"pointer",background:dragOver?C.blueSoft:C.bg,marginBottom:16}}>
            <div style={{fontSize:28,marginBottom:8}}>📂</div>
            <div style={{fontWeight:700,fontSize:14,color:dragOver?C.blue:C.text,marginBottom:4}}>{dragOver?"Drop CSV here":"Click to upload or drag & drop"}</div>
            <div style={{fontSize:12,color:C.textMuted}}>Supports .csv · Auto-imports on upload</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:12,color:C.textMuted}}>OR PASTE CSV</span><div style={{flex:1,height:1,background:C.border}}/></div>
          <TA rows={6} value={csvText} onChange={e=>setCsvText(e.target.value)} placeholder={"name,email,phone,title,company,source\n…"}/>
          {csvMsg&&<div style={{background:csvMsg.startsWith("✓")?C.greenSoft:C.redSoft,border:`1px solid ${csvMsg.startsWith("✓")?"#A5D6A7":C.redBorder}`,borderRadius:6,padding:"9px 14px",fontSize:13,color:csvMsg.startsWith("✓")?"#007B4F":C.red,margin:"10px 0",fontWeight:500}}>{csvMsg}</div>}
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}>
            <Btn variant="ghost" onClick={()=>{closeModal();setCsvText("");setCsvMsg("");}}>Close</Btn>
            <Btn onClick={()=>parseCSV(csvText)}>Import Pasted CSV</Btn>
          </div>
        </Modal>
      )}

      {modal==="activity"&&panelC&&(
        <Modal title={`Log Activity — ${panelC.name}`} onClose={closeModal}>
          <Field label="Type"><Sel value={actF.type} onChange={e=>setActF({...actF,type:e.target.value})}>{ACT_TYPES.map(t=><option key={t} value={t}>{ACT_ICONS[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</Sel></Field>
          <Field label="Notes"><TA rows={3} value={actF.note} onChange={e=>setActF({...actF,note:e.target.value})} placeholder="What happened? Key points, outcomes…"/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Field label="Date"><Input type="date" value={actF.date} onChange={e=>setActF({...actF,date:e.target.value})}/></Field>
            <Field label="Team Member"><Input value={actF.user_name||userName} onChange={e=>setActF({...actF,user_name:e.target.value})} placeholder={userName}/></Field>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={logActivity}>Log Activity</Btn>
          </div>
        </Modal>
      )}

      {modal==="task"&&(
        <Modal title="Add Task" onClose={closeModal}>
          <Field label="Task Title"><Input value={taskF.title} onChange={e=>setTaskF({...taskF,title:e.target.value})} placeholder="Send rugged tablet vendor list to Hunaid…"/></Field>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
            <Field label="Due Date"><Input type="date" value={taskF.due} onChange={e=>setTaskF({...taskF,due:e.target.value})}/></Field>
            <Field label="Assign To"><Input value={taskF.assignee||userName} onChange={e=>setTaskF({...taskF,assignee:e.target.value})} placeholder={userName}/></Field>
          </div>
          <Field label="Linked Contact"><Sel value={taskF.contact_id||""} onChange={e=>setTaskF({...taskF,contact_id:e.target.value||null})}><option value="">— None —</option>{contacts.map(c=><option key={c.id} value={c.id}>{c.name} · {c.title}</option>)}</Sel></Field>
          <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
            <Btn variant="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn onClick={addTask}>Add Task</Btn>
          </div>
        </Modal>
      )}

      {/* AI Copy Generator */}
      {showAI&&aiContact&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.white,borderRadius:14,width:"100%",maxWidth:660,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.25)",border:`1px solid ${C.border}`}}>
            <div style={{padding:"16px 22px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"linear-gradient(135deg,#8B0000,#B71C1C)"}}>
              <div><div style={{fontWeight:700,fontSize:15,color:"#fff"}}>✨ AI Copy Generator</div><div style={{fontSize:11,color:"rgba(255,255,255,.7)"}}>Powered by Claude · Clover IQ context baked in</div></div>
              <button onClick={()=>setShowAI(false)} style={{background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:16,cursor:"pointer",borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
            <div style={{padding:"18px 22px"}}>
              <div style={{background:C.bg,borderRadius:8,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:12}}>
                <Avatar name={aiContact.name} size={36}/>
                <div><div style={{fontWeight:700,fontSize:13}}>{aiContact.name} · {aiContact.title}</div><div style={{fontSize:11,color:C.textSub}}>{orgs.find(o=>o.id===aiContact.org_id)?.name||"No org"} · {aiContact.stage}</div></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
                <div><div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",marginBottom:5}}>ICP Profile</div><Sel value={aiICP} onChange={e=>setAiICP(e.target.value)}>{Object.keys(ICP_PROFILES).map(k=><option key={k}>{k}</option>)}</Sel></div>
                <div><div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",marginBottom:5}}>Channel</div><Sel value={aiChannel} onChange={e=>setAiChannel(e.target.value)}><option>Email</option><option>WhatsApp</option><option>LinkedIn</option><option>Meeting</option></Sel></div>
                <div><div style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase",marginBottom:5}}>Step</div><Sel value={aiStep} onChange={e=>setAiStep(e.target.value)}>{SEQ_STEPS.map(s=><option key={s}>{s}</option>)}</Sel></div>
              </div>
              <button onClick={generateAICopy} disabled={aiLoading} style={{width:"100%",background:aiLoading?"#ccc":"linear-gradient(135deg,#8B0000,#B71C1C)",color:"#fff",border:"none",borderRadius:8,padding:"12px 0",fontSize:14,fontWeight:700,cursor:aiLoading?"not-allowed":"pointer",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit"}}>
                {aiLoading?<><div style={{width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Generating…</>:"✨ Generate Personalized Copy"}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              {aiError&&<div style={{background:C.redSoft,border:`1px solid ${C.redBorder}`,borderRadius:7,padding:"10px 14px",color:C.red,fontSize:13,marginBottom:12}}>{aiError}</div>}
              {aiOutput&&(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                    <div style={{background:C.bg,padding:"8px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,fontWeight:700,color:C.textSub,textTransform:"uppercase"}}>✉️ Email</span>
                      <button onClick={()=>openOutlook(aiOutput.subject,aiOutput.body)} style={{background:C.blue,color:"#fff",border:"none",borderRadius:5,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Open in Outlook ↗</button>
                    </div>
                    <div style={{padding:"12px 14px"}}>
                      <div style={{fontSize:11,fontWeight:700,color:C.textMuted,marginBottom:4,textTransform:"uppercase"}}>Subject</div>
                      <div style={{fontSize:13,fontWeight:600,padding:"7px 10px",background:C.bg,borderRadius:5,marginBottom:10}}>{aiOutput.subject}</div>
                      <div style={{fontSize:11,fontWeight:700,color:C.textMuted,marginBottom:4,textTransform:"uppercase"}}>Body</div>
                      <textarea defaultValue={aiOutput.body} rows={6} onChange={e=>setAiOutput(o=>({...o,body:e.target.value}))} style={{width:"100%",background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 10px",fontSize:12,color:C.text,fontFamily:"inherit",resize:"vertical",outline:"none",lineHeight:1.7}}/>
                      <div style={{display:"flex",gap:8,marginTop:8}}>
                        <button onClick={()=>openOutlook(aiOutput.subject,aiOutput.body)} style={{flex:1,background:C.blue,color:"#fff",border:"none",borderRadius:6,padding:"9px 0",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📧 Send via Outlook</button>
                        <button onClick={()=>navigator.clipboard?.writeText(`Subject: ${aiOutput.subject}\n\n${aiOutput.body}`)} style={{background:C.bg,color:C.textSub,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Copy</button>
                      </div>
                    </div>
                  </div>
                  {aiOutput.whatsapp&&(
                    <div style={{border:`1px solid #C3EFC0`,borderRadius:8,overflow:"hidden"}}>
                      <div style={{background:"#E7FFE3",padding:"8px 14px",borderBottom:`1px solid #C3EFC0`}}><span style={{fontSize:11,fontWeight:700,color:"#1A7F37",textTransform:"uppercase"}}>💬 WhatsApp</span></div>
                      <div style={{padding:"10px 14px"}}>
                        <textarea defaultValue={aiOutput.whatsapp} rows={3} onChange={e=>setAiOutput(o=>({...o,whatsapp:e.target.value}))} style={{width:"100%",background:"#f9fff9",border:`1px solid #C3EFC0`,borderRadius:6,padding:"8px 10px",fontSize:12,color:C.text,fontFamily:"inherit",resize:"vertical",outline:"none",lineHeight:1.7}}/>
                        <button onClick={()=>openWhatsApp(aiContact.whatsapp,aiOutput.whatsapp)} style={{marginTop:8,width:"100%",background:"#25D366",color:"#fff",border:"none",borderRadius:6,padding:"9px 0",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>💬 Send via WhatsApp</button>
                      </div>
                    </div>
                  )}
                  <div style={{background:C.bg,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                    <span style={{fontSize:12,color:C.textSub}}>After sending, log it.</span>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>logAISent(aiChannel)} style={{background:C.green,color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✓ Log as Sent</button>
                      <button onClick={()=>advanceSeq(aiContact)} style={{background:C.blueSoft,color:C.blue,border:`1px solid ${C.blue}33`,borderRadius:6,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>→ Advance Sequence</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
