"use client";
import { useEffect } from "react";

export default function ClientEffects() {
  useEffect(() => {
    // 1. Hero Canvas Particles & Constellation
    const canvas = document.getElementById("particles-canvas") as HTMLCanvasElement;
    let cleanupCanvas: (() => void) | undefined;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
        let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

        const resize = () => {
          width = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
          height = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
        };
        window.addEventListener("resize", resize);

        const particleCount = 42;
        const particles: any[] = [];
        const mouse = { x: null as number | null, y: null as number | null, maxDist: 140 };

        class Particle {
          x: number; y: number; vx: number; vy: number; radius: number; baseAlpha: number;
          constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 2 + 1;
            this.baseAlpha = Math.random() * 0.5 + 0.2;
          }
          update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0) this.x = width; else if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height; else if (this.y > height) this.y = 0;
          }
          draw() {
            ctx!.beginPath();
            ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(245, 158, 11, ${this.baseAlpha})`;
            ctx!.fill();
          }
        }

        for (let i = 0; i < particleCount; i++) particles.push(new Particle());

        const mousemove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          mouse.x = e.clientX - rect.left;
          mouse.y = e.clientY - rect.top;
        };
        const mouseleave = () => { mouse.x = null; mouse.y = null; };
        const click = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;
          for (let i = 0; i < 12; i++) {
            const p = new Particle();
            p.x = clickX; p.y = clickY;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1.5;
            p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed;
            p.radius = Math.random() * 2.5 + 1.5; p.baseAlpha = 0.9;
            particles.push(p);
            if (particles.length > 70) particles.shift();
          }
        };

        canvas.addEventListener("mousemove", mousemove);
        canvas.addEventListener("mouseleave", mouseleave);
        canvas.addEventListener("click", click);

        let animationFrameId: number;
        const animate = () => {
          ctx.clearRect(0, 0, width, height);
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 110) {
                const alpha = (1 - dist / 110) * 0.18;
                ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
              }
            }
            if (mouse.x !== null && mouse.y !== null) {
              const mdx = particles[i].x - mouse.x;
              const mdy = particles[i].y - mouse.y;
              const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
              if (mdist < mouse.maxDist) {
                const malpha = (1 - mdist / mouse.maxDist) * 0.35;
                ctx.strokeStyle = `rgba(251, 191, 36, ${malpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
              }
            }
            particles[i].update(); particles[i].draw();
          }
          animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        cleanupCanvas = () => {
          window.removeEventListener("resize", resize);
          canvas.removeEventListener("mousemove", mousemove);
          canvas.removeEventListener("mouseleave", mouseleave);
          canvas.removeEventListener("click", click);
          cancelAnimationFrame(animationFrameId);
        };
      }
    }

    // 2. Scroll Progress Widget & Audio Chime
    const widget = document.getElementById("scroll-widget");
   const circle = document.getElementById("scroll-progress-circle") as unknown as SVGCircleElement | null;
    const text = document.getElementById("scroll-percent-text");
    const totalCircumference = 2 * Math.PI * 20;

    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;
      const percent = Math.round(progress * 100);
      if (circle) circle.style.strokeDashoffset = String(totalCircumference - progress * totalCircumference);
      if (text) text.textContent = `${percent}%`;
    };
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    const playChime = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const actx = new AudioContext();
        const now = actx.currentTime;
        const notes = [587.33, 880, 1174.66];
        notes.forEach((freq, idx) => {
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.001, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.9);
          osc.connect(gain); gain.connect(actx.destination);
          osc.start(now + idx * 0.05); osc.stop(now + idx * 0.05 + 1.0);
        });
      } catch (e) {}
    };

    const onWidgetClick = () => { playChime(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    if (widget) widget.addEventListener("click", onWidgetClick);

    return () => {
      cleanupCanvas?.();
      window.removeEventListener("scroll", updateScroll);
      if (widget) widget.removeEventListener("click", onWidgetClick);
    };
  }, []);

  return null;
}