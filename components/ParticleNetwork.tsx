"use client";

import React, { useEffect, useRef } from "react";

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let sparks: Spark[] = [];
    let animationFrameId: number;
    let mouse = { x: -1000, y: -1000, radius: 150 };

    // تنظیم اندازه بوم
    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
      }
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      baseX: number;
      baseY: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.directionX = (Math.random() - 0.5) * 0.5;
        this.directionY = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        // حرکت طبیعی
        this.x += this.directionX;
        this.y += this.directionY;

        // برخورد با لبه‌ها
        if (this.x < 0 || this.x > canvas!.width) this.directionX *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.directionY *= -1;

        // تعامل با موس (دور شدن)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= forceDirectionX * force * 5;
          this.y -= forceDirectionY * force * 5;
        } else {
          // برگشت به حالت اولیه
          if (this.x !== this.baseX) {
            const dxBase = this.x - this.baseX;
            this.x -= dxBase / 50;
          }
          if (this.y !== this.baseY) {
            const dyBase = this.y - this.baseY;
            this.y -= dyBase / 50;
          }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.6)"; // رنگ طلایی
        ctx.fill();
      }
    }

    class Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.maxLife = Math.random() * 30 + 20;
        this.life = this.maxLife;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95; // اصطکاک
        this.vy *= 0.95;
        this.life--;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = `rgba(252, 211, 77, ${opacity})`; // رنگ طلایی روشن
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particles.push(new Particle(x, y));
      }
    };

    const connectParticles = () => {
      if (!ctx) return;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // خطوط بین ذرات
          if (distance < 120) {
            const opacity = 1 - distance / 120;
            ctx.strokeStyle = `rgba(245, 158, 11, ${opacity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }

          // خطوط بین موس و ذرات
          const dxMouse = particles[a].x - mouse.x;
          const dyMouse = particles[a].y - mouse.y;
          const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distanceMouse < mouse.radius) {
            const opacity = 1 - distanceMouse / mouse.radius;
            ctx.strokeStyle = `rgba(252, 211, 77, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // آپدیت و رسم ذرات
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // آپدیت و رسم جرقه‌ها
      sparks = sparks.filter((s) => s.life > 0);
      sparks.forEach((s) => {
        s.update();
        s.draw();
      });

      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    // شنوندگان رویداد
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // ایجاد ۱۵ جرقه در محل کلیک
      for (let i = 0; i < 15; i++) {
        sparks.push(new Spark(clickX, clickY));
      }
    };

    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
    />
  );
}