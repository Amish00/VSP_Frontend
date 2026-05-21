// src/layout/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Youtube, Instagram, Linkedin } from 'lucide-react';
import logoUrl from '../../assets/logo.svg';

const LINKS = [
  {
    title: 'Platform',
    items: [
      ['Trending', '/trending'],
      ['Subscriptions', '/subscriptions'],
      ['Shorts', '/shorts'],
      ['Plans', '/plans'],
    ],
  },
  {
    title: 'Company',
    items: [
      ['About', '/not-found'],
      ['Blog', '/not-found'],
      ['Careers', '/not-found'],
      ['Press', '/not-found'],
    ],
  },
  {
    title: 'Legal',
    items: [
      ['Privacy', '/not-found'],
      ['Terms', '/not-found'],
      ['DMCA', '/not-found'],
      ['Cookies', '/not-found'],
    ],
  },
];

const SOCIALS = [
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', ariaLabel: 'Twitter (X)' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', ariaLabel: 'YouTube' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', ariaLabel: 'Instagram' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com', ariaLabel: 'LinkedIn' },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Thanks for subscribing! Check your inbox.' });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Subscription failed. Please try again.' });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-bg-deep border-t border-border" role="contentinfo">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img src={logoUrl} alt="ViriShare" style={{ height: 26, width: 'auto' }} />
              <span className="font-display font-black text-xl text-text-primary">ViriShare</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Premium video platform built for Nepali creators and global audiences.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="w-9 h-9 rounded-xl border border-border bg-bg-el flex items-center justify-center text-text-secondary hover:border-primary/50 hover:bg-primary/8 hover:text-primary-light transition-all"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display font-bold text-sm text-text-primary mb-3">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.items.map(([label, path]) => (
                  <li key={label}>
                    <Link to={path} reloadDocument className="text-sm text-text-secondary hover:text-primary-light transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <form onSubmit={handleSubscribe}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-display font-bold text-base text-text-primary mb-0.5">Stay in the loop</p>
                <p className="text-sm text-text-secondary">Creator tips and platform updates weekly.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex gap-2 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={isSubmitting}
                    className="flex-1 sm:w-44 px-4 py-2.5 rounded-xl bg-bg-el border border-border text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-85 whitespace-nowrap transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                {message.text && (
                  <p className={`text-xs mt-1 sm:mt-0 sm:ml-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;