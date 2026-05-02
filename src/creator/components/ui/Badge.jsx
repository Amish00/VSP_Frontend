import React from 'react'
const S={free:'bg-success/15 text-[#34d399] border-success/30',paid:'bg-warning/15 text-[#fbbf24] border-warning/30',pending:'bg-warning/10 text-warning border-warning/25',approved:'bg-success/10 text-success border-success/25',rejected:'bg-danger/10 text-danger border-danger/25',pro:'bg-primary/15 text-primary-light border-primary/30',live:'bg-danger/15 text-danger border-danger/30',draft:'bg-bg-hov text-text-secondary border-border',info:'bg-accent/12 text-accent border-accent/28'}
const Badge = ({text,type='free',small=false}) => {
  return <span className={`inline-flex items-center font-semibold border whitespace-nowrap tracking-wide ${small?'px-2 py-px text-xs rounded-md':'px-2.5 py-0.5 text-sm rounded-lg'} ${S[type]||S.draft}`}>{text}</span>
}

export default Badge