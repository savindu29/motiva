"use client";

import { useState } from "react";
import { CLINIC } from "./data";
import { useSite } from "./SiteProvider";
import { Cta, Mark } from "./Top";

export function Footer() {
  const { toast } = useSite();
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return toast("Enter an email address like name@example.com");
    setEmail("");
    toast("Subscribed (demo). Nothing was sent.");
  };

  return (
    <footer>
      <div className="wrap">
        <div className="fbox">
          <div className="f-top">
            <div>
              <h2>Let&apos;s get you moving again</h2>
              <p>Questions about your pain? Talk to a physio before you book.</p>
            </div>
            <div className="btns">
              <a className="btn" href="#faq">
                Read FAQs
              </a>
              <Cta href="#book">Book Appointment</Cta>
            </div>
          </div>
          <div className="f-mid">
            <div>
              <a className="logo" href="#home">
                <Mark />
                Motiva
              </a>
              <p>Get monthly exercise tips and clinic news.</p>
              <form className="news" onSubmit={subscribe}>
                <label htmlFor="n-email" style={{ position: "absolute", left: -9999 }}>
                  Email
                </label>
                <input id="n-email" type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit">Subscribe</button>
              </form>
            </div>
            <div>
              <h4>Clinic</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#experts">Our physios</a></li>
                <li><a href="#packages">Packages</a></li>
                <li><a href="#blog">Advice</a></li>
              </ul>
            </div>
            <div>
              <h4>Treatments</h4>
              <ul>
                <li><a href="#services">Sports injuries</a></li>
                <li><a href="#services">Back &amp; neck pain</a></li>
                <li><a href="#services">Post-surgery rehab</a></li>
                <li><a href="#services">Neuro rehab</a></li>
              </ul>
            </div>
            <div>
              <h4>Visit us</h4>
              <ul>
                <li>{CLINIC.address}, {CLINIC.area}</li>
                <li>{CLINIC.phone}</li>
                <li>{CLINIC.email}</li>
                <li>{CLINIC.hours} · {CLINIC.sat}</li>
              </ul>
            </div>
          </div>
          <div className="f-bot">
            <span>© 2026 Motiva Physio · Demo site with sample content</span>
            <div className="soc">
              <a href="https://www.facebook.com" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z" /></svg>
              </a>
              <a href="https://www.instagram.com" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
              </a>
              <a href="https://www.linkedin.com" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 9h4v12H4zM6 3a2 2 0 110 4 2 2 0 010-4zM10 9h4v2c.6-1 2-2.2 4-2.2 3.6 0 4 2.4 4 5.2V21h-4v-6c0-1.5 0-3.2-2-3.2s-2.2 1.5-2.2 3.1V21H10z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
