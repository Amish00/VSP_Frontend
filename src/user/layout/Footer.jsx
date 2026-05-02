import React from 'react'
import logoUrl from '../../assets/logo.svg'
const LINKS=[
  {title:'Platform',items:[['Browse','#home'],['Trending','#trending'],['Subscriptions','#subscriptions'],['Shorts','#home']]},
  {title:'Creators', items:[['Creator Studio','#creator'],['Upload','#creator'],['Analytics','#creator'],['Earnings','#creator']]},
  {title:'Company',  items:[['About','#'],['Blog','#'],['Careers','#'],['Press','#']]},
  {title:'Legal',    items:[['Privacy','#'],['Terms','#'],['DMCA','#'],['Cookies','#']]},
]
const Footer = () => {
  return(
    <footer className="bg-bg-deep border-t border-border mt-16 pb-[72px] md:pb-0" role="contentinfo">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3"><img src={logoUrl} alt="ViriShare" style={{height:26+"px",width:"auto"}}/><span className="font-display font-black text-xl text-text-primary">ViriShare</span></div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">Premium video platform built for Nepali creators and global audiences.</p>
            <div className="flex gap-2">{['𝕏','▶','📸','💼'].map((s,i)=><a key={i} href="#" aria-label={['Twitter','YouTube','Instagram','LinkedIn'][i]} className="w-9 h-9 rounded-xl border border-border bg-bg-el flex items-center justify-center text-sm text-text-secondary hover:border-primary/50 hover:text-primary-light hover:bg-primary/8 transition-all">{s}</a>)}</div>
          </div>
          {LINKS.map(col=><div key={col.title}><h3 className="font-display font-bold text-sm text-text-primary mb-3">{col.title}</h3><ul className="space-y-2.5">{col.items.map(([l,h])=><li key={l}><a href={h} className="text-sm text-text-secondary hover:text-primary-light transition-colors">{l}</a></li>)}</ul></div>)}
        </div>
        <div className="rounded-2xl border border-border bg-bg-card p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1"><p className="font-display font-bold text-base text-text-primary mb-0.5">Stay in the loop</p><p className="text-sm text-text-secondary">Creator tips and platform updates weekly.</p></div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 sm:w-44 px-4 py-2.5 rounded-xl bg-bg-el border border-border text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:outline-none"/>
              <button className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-85 whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
