import React from 'react'
import {ResponsiveContainer,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend} from 'recharts'
const data=[{m:'Jan',subs:4200,ads:1800,coins:600},{m:'Feb',subs:5100,ads:2200,coins:800},{m:'Mar',subs:4800,ads:2000,coins:750},{m:'Apr',subs:6200,ads:2600,coins:950},{m:'May',subs:7100,ads:3000,coins:1100},{m:'Jun',subs:8400,ads:3400,coins:1300},{m:'Jul',subs:9800,ads:4000,coins:1500},{m:'Aug',subs:11200,ads:4600,coins:1700},{m:'Sep',subs:12800,ads:5200,coins:1900},{m:'Oct',subs:15000,ads:6000,coins:2200},{m:'Nov',subs:17500,ads:7000,coins:2600},{m:'Dec',subs:21000,ads:8500,coins:3100}]
const RevenueChart = () => {
  return(
    <div className="bg-bg-card border border-border rounded-2xl p-5">
      <h3 className="font-display font-bold text-base mb-4 text-text-primary">Revenue by Source</h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{top:4,right:4,left:-24,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,43,66,.6)"/>
          <XAxis dataKey="m" tick={{fill:'#4A6080',fontSize:11}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:'#4A6080',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
          <Tooltip contentStyle={{background:'#0F1724',border:'1px solid #1A2B42',borderRadius:'12px',color:'#ECF0FB'}} formatter={v=>[`$${v.toLocaleString()}`]}/>
          <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:'11px',color:'#8FA3BE'}}/>
          <Bar dataKey="subs"  fill="#2563EB" radius={[2,2,0,0]} name="Subscriptions"/>
          <Bar dataKey="ads"   fill="#10B981" radius={[2,2,0,0]} name="Ads"/>
          <Bar dataKey="coins" fill="#F59E0B" radius={[2,2,0,0]} name="Coins"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
