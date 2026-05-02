const V={primary:'bg-primary text-white border-transparent shadow-[0_2px_8px_rgba(37,99,235,.35)] hover:bg-[#1d4ed8]',ghost:'bg-bg-el text-text-secondary border-border hover:bg-bg-hov hover:text-text-primary',danger:'bg-danger/8 text-danger border-danger/25 hover:bg-danger/15',success:'bg-success text-white border-transparent hover:opacity-85',outline:'bg-transparent text-primary-light border-primary/40 hover:bg-primary/8'}
const S={xs:'px-2.5 py-1 text-xs rounded-lg gap-1',sm:'px-3.5 py-1.5 text-sm rounded-xl gap-1.5',md:'px-5 py-2.5 text-base rounded-xl gap-2',lg:'px-6 py-3 text-lg rounded-xl gap-2'}
const Button = ({children,variant='primary',size='md',disabled,onClick,className='',fullWidth,type='button',style}) => {
  return <button type={type} onClick={onClick} disabled={disabled} style={style}
    className={`inline-flex items-center justify-center font-semibold border transition-all duration-180 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed ${V[variant]||V.primary} ${S[size]||S.md} ${fullWidth?'w-full':''} ${className}`}>
    {children}
  </button>
}

export default Button