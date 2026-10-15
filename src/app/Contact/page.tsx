'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import BlurText from '@/blocks/TextAnimations/BlurText/BlurText';
import { useIsDesktop } from '@/lib/useIsDesktop';

// Squares is an OGL/WebGL canvas. Lazy + desktop-only: on mobile it used to
// create a GL context and run a render loop behind a 15%-opacity overlay.
const Squares = dynamic(() => import('@/blocks/Backgrounds/Squares/Squares'), {
  ssr: false,
});

// The old handle was "xynnthinc", which is a different (empty) GitHub account.
const socialLinks = [
  { platform: "GitHub", href: "https://github.com/xynnthincc", iconPath: "/icons/github_icon.svg" },
  { platform: "Instagram", href: "https://www.instagram.com/xynnthinc", iconPath: "/icons/instagram_icon.svg" },
  { platform: "Gmail", href: "mailto:zakiimaalik@gmail.com", iconPath: "/icons/gmail_icon.svg" },
];

export default function Contact() {
  const isDesktop = useIsDesktop();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Message sent successfully!");
      form.reset();
    } else {
      alert("Failed to send message.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
      
      <div className="text-center mb-12 md:mb-16">
        <BlurText
          text="Get In Touch"
          delay={50}
          animateBy="letters"
          direction="top"
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center"
        />
      </div>

      <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Contact Info */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Contact Information</h2>

          <div className="flex items-center text-white/80">
            <span className="mr-2 text-cyan-500">📧</span>
            <a href="mailto:zakiimaalik@gmail.com" className="hover:underline text-base sm:text-lg">
              zakiimaalik@gmail.com
            </a>
          </div>

          <div className="mt-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Connect with Me</h3>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform duration-200 hover:scale-110"
                >
                  <Image
                    src={link.iconPath}
                    alt={`${link.platform} icon`}
                    width={30}
                    height={30}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Send a Message</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">

            <div>
              <label className="block text-white/80 text-sm mb-1">Name</label>
              <input name="name" required
                className="w-full px-3 py-2 bg-[#1a1b1c] border border-white/20 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Email</label>
              <input type="email" name="email" required
                className="w-full px-3 py-2 bg-[#1a1b1c] border border-white/20 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Subject</label>
              <input name="subject"
                className="w-full px-3 py-2 bg-[#1a1b1c] border border-white/20 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Message</label>
              <textarea name="message" rows={4} required
                className="w-full px-3 py-2 bg-[#1a1b1c] border border-white/20 rounded-md text-white"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 transition"
            >
              Send Message
            </button>

          </form>
        </div>

      </div>

      {isDesktop && (
        <div className="absolute top-0 left-0 w-full h-full z-[-5] opacity-15">
          <Squares
            speed={0.5}
            squareSize={50}
            direction="diagonal"
            borderColor="#fff"
            hoverFillColor="#222"
          />
        </div>
      )}

      <footer className="flex w-full items-center justify-center p-4 mt-20 border-t border-white/20 text-white/50 text-sm">
        © {new Date().getFullYear()} Zakii Maalik. All rights reserved.
      </footer>

    </main>
  );
}
