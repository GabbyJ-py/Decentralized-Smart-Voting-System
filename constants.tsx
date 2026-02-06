import React from 'react';
import { Candidate, AdminCredentials } from './types';

export const CANDIDATES: Candidate[] = [
  { id: 1, name: "TVK", party: "Tamil Valarchi Kazhagam (Tamil Development Federation)", logo: "🌾", votes: 0 },
  { id: 2, name: "DMK", party: "Dravida Makkal Kootani (People’s Dravidian Alliance)", logo: "🔥", votes: 0 },
  { id: 3, name: "ADMK", party: "Anaithu Desa Munnetra Kazhagam (All-Nation Progress Party)", logo: "⚙️", votes: 0 },
  { id: 4, name: "NTK", party: "Nalla Thamizh Katchi (Good Tamil Party)", logo: "🌳", votes: 0 },
  { id: 5, name: "PMK", party: "Pudhiya Makkal Katchi (New People’s Party)", logo: "✋", votes: 0 },
  { id: 6, name: "MNM", party: "Makkal Nalan Munnetram (People’s Welfare Movement)", logo: "❤️", votes: 0 },
  { id: 7, name: "OTA", party: "None of the Above", logo: "❌", votes: 0 },
];

export const CONSTITUENCY = "Cyber District 01";

export const DEFAULT_ADMIN: AdminCredentials = {
  username: 'admin',
  password: 'password123'
};

export const ICONS = {
  voter: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  blockchain: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  ai: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  admin: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};