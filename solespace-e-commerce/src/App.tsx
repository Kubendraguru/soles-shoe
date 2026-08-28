import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Sparkles,
  ChevronDown,
  X,
  Eye,
  CheckCircle2
} from 'lucide-react';

const TOTAL_FRAMES = 240;

interface CategoryCardProps {
  title: string;
  image: string;
  subtitle?: string;
  price?: string;
}

const CategoryCard = ({ title, image, subtitle, price }: CategoryCardProps) => (
  <div className="relative group overflow-hidden rounded-[1.25rem] aspect-[16/11] bg-neutral-950 border border-white/10 cursor-pointer shadow-2xl hover:border-[#ff6a00]/60 transition-all duration-500 transform hover:-translate-y-1">
    <img
      src={image}
      alt={title}
      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
      onError={(e) => {
        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
    <div className="absolute bottom-0 left-0 p-6 lg:p-7 w-full flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#ff6a00] uppercase block mb-1">
          {subtitle || 'Premium Edition'}
        </span>
        <h3 className="text-white text-lg lg:text-xl font-bold tracking-wide uppercase group-hover:text-[#ff6a00] transition-colors">
          {title}
        </h3>
        {price && (
          <p className="text-neutral-400 text-xs font-semibold mt-1">{price}</p>
        )}
      </div>
      <div className="flex items-center text-[#ff6a00] text-xs font-bold tracking-widest uppercase mt-3">
        <span>Shop Collection</span>
        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform duration-300" />
      </div>
    </div>
  </div>
);

const Feature = ({
  icon: Icon,
  title,
  subtitle
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className="flex items-center justify-center p-3.5 rounded-full border border-[#ff6a00]/40 bg-[#ff6a00]/10 group-hover:bg-[#ff6a00] group-hover:text-black transition-all duration-300 flex-shrink-0">
      <Icon className="w-6 h-6 text-[#ff6a00] group-hover:text-black transition-colors" strokeWidth={1.75} />
    </div>
    <div className="flex flex-col">
      <h4 className="text-white text-[14px] font-bold tracking-wider uppercase">
        {title}
      </h4>
      <p className="text-neutral-400 text-[12px] mt-0.5 font-light">
        {subtitle}
      </p>
    </div>
  </div>
);

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(2);
  const [wishlistCount, setWishlistCount] = useState<number>(3);
  const [activeNav, setActiveNav] = useState<string>('HOME');
  const [quickViewProduct, setQuickViewProduct] = useState<string | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Render Frame on Canvas
  const renderCanvasFrame = (frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameIdx)));
    const img = imagesRef.current[idx];

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Deep black background fill
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    if (img && img.complete && img.naturalWidth !== 0) {
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = width / height;

      let renderW, renderH, renderX, renderY;

      if (canvasRatio > imgRatio) {
        renderH = height;
        renderW = height * imgRatio;
        renderX = (width - renderW) / 2;
        renderY = 0;
      } else {
        renderW = width;
        renderH = width / imgRatio;
        renderX = 0;
        renderY = (height - renderH) / 2;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, renderX, renderY, renderW, renderH);
    }
  };

  // Preload frame images & setup scroll handler
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const paddedNumber = String(i).padStart(3, '0');
      img.src = `/frames-jpg/ezgif-frame-${paddedNumber}.jpg`;

      img.onload = () => {
        if (i === 1) {
          renderCanvasFrame(0);
        }
      };

      loadedImages.push(img);
    }
    imagesRef.current = loadedImages;

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = Math.max(
        1,
        (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
      );
      const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
      setScrollProgress(scrollFraction);

      // Map scroll progress smoothly across 0.70 of total scroll height
      const frameFraction = Math.min(1, scrollFraction / 0.70);
      targetFrameRef.current = frameFraction * (TOTAL_FRAMES - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      handleScroll();
      renderCanvasFrame(currentFrameRef.current);
    });
    handleScroll();

    const loop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.001) {
        currentFrameRef.current += diff * 0.15;
        renderCanvasFrame(currentFrameRef.current);
      }
      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const triggerAddToCart = (productName: string) => {
    setCartCount((c) => c + 1);
    setAddedToast(productName);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const isFooterZone = scrollProgress > 0.75;

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-[#ff6a00]/30 relative min-h-screen">
      
      {/* Fixed Canvas Animation Background */}
      <canvas
        ref={canvasRef}
        className={`fixed top-0 left-0 w-full h-full pointer-events-none z-0 block transition-opacity duration-700 ${
          isFooterZone ? 'opacity-20' : 'opacity-100'
        }`}
      />

      {/* Radial Gradient Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050505]/40 to-[#050505] pointer-events-none z-0" />

      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#ff6a00] text-black font-extrabold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs uppercase tracking-wider">{addedToast} Added to Bag!</span>
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 px-6 md:px-12 py-4 backdrop-blur-md bg-black/80 border-b border-white/10 transition-all duration-300">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="flex flex-col items-center justify-center w-11 h-11 border border-[#ff6a00]/50 rounded-full bg-black shadow-lg shadow-[#ff6a00]/20 group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-5 h-3 text-[#ff6a00]"
                  viewBox="0 0 24 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 6h20M6 2h12M6 10h12" />
                  <path d="M12 2v8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-widest text-white leading-none group-hover:text-[#ff6a00] transition-colors">
                  SOLESPACE
                </span>
                <span className="text-[7px] text-[#ff6a00] tracking-[0.3em] uppercase mt-0.5 font-bold">
                  HAUTE FOOTWEAR
                </span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-8">
              {['HOME', 'MEN', 'WOMEN', 'COLLECTIONS', 'NEW ARRIVALS', 'TECH'].map((link) => (
                <button
                  key={link}
                  onClick={() => setActiveNav(link)}
                  className={`text-xs font-bold tracking-widest uppercase transition-all duration-300 relative py-1.5 cursor-pointer ${
                    activeNav === link
                      ? 'text-[#ff6a00]'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {link}
                  {activeNav === link && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff6a00] shadow-[0_0_8px_#ff6a00]" />
                  )}
                </button>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-6">
              <Search className="w-5 h-5 text-neutral-300 hover:text-[#ff6a00] cursor-pointer transition-colors" />
              <User className="w-5 h-5 text-neutral-300 hover:text-[#ff6a00] cursor-pointer transition-colors" />
              
              <div
                className="relative cursor-pointer group"
                onClick={() => setWishlistCount(wishlistCount + 1)}
              >
                <Heart className="w-5 h-5 text-neutral-300 group-hover:text-[#ff6a00] transition-colors" />
                <span className="absolute -top-2 -right-2 bg-[#ff6a00] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              </div>

              <div
                className="relative cursor-pointer group"
                onClick={() => setCartCount(cartCount + 1)}
              >
                <ShoppingBag className="w-5 h-5 text-neutral-300 group-hover:text-[#ff6a00] transition-colors" />
                <span className="absolute -top-2 -right-2 bg-[#ff6a00] text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* SECTION 1: HERO OVERLAY */}
        <section className="min-h-screen max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col justify-between pt-12 pb-20 relative">
          <div className="flex flex-col items-center justify-center text-center mt-8 z-10">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ff6a00]/10 border border-[#ff6a00]/30 text-[#ff6a00] text-xs font-bold tracking-[0.25em] uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The 2026 Innovation Series</span>
            </div>

            <h1 className="text-white text-5xl sm:text-7xl lg:text-[6.5rem] font-black tracking-tight leading-[0.95] mb-6 uppercase drop-shadow-2xl">
              DEFINE YOUR <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] via-[#ff9b44] to-[#ffffff] italic pr-2">
                FOOTPRINT
              </span>
            </h1>

            <p className="text-neutral-300 text-base md:text-xl max-w-2xl font-light tracking-wide leading-relaxed drop-shadow-md mb-8">
              Crafted for the modern trailblazer. Experience 360-degree precision engineering, ergonomic luxury, and dynamic responsiveness as you scroll.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: window.innerHeight * 1.2, behavior: 'smooth' })}
                className="px-8 py-4 rounded-full bg-[#ff6a00] text-black font-extrabold text-xs tracking-widest uppercase hover:bg-white transition-all duration-300 shadow-lg shadow-[#ff6a00]/30 flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => window.scrollTo({ top: window.innerHeight * 2.2, behavior: 'smooth' })}
                className="px-8 py-4 rounded-full bg-white/5 border border-white/20 text-white font-extrabold text-xs tracking-widest uppercase hover:bg-white/10 transition-all duration-300 backdrop-blur-sm cursor-pointer"
              >
                DISCOVER CRAFTSMANSHIP
              </button>
            </div>

          </div>

          {/* Scroll Down Prompt */}
          <div className="flex flex-col items-center justify-center text-center mt-12 animate-bounce opacity-80">
            <span className="text-[10px] tracking-[0.3em] text-neutral-400 uppercase mb-2 font-mono">
              SCROLL TO DISCOVER
            </span>
            <ChevronDown className="w-5 h-5 text-[#ff6a00]" />
          </div>
        </section>

        {/* SECTION 2: CATEGORIES 3-COLUMN GRID */}
        <section className="min-h-screen max-w-[1800px] mx-auto px-6 md:px-12 py-24 flex flex-col justify-center">
          
          <div className="text-center mb-16">
            <span className="text-[#ff6a00] text-xs font-bold tracking-[0.3em] uppercase block mb-2">
              CURATED ESSENTIALS
            </span>
            <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight">
              DESIGNED TO ELEVATE EVERY STEP
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8 z-20">
              <CategoryCard
                title="LUXURY TIMEPIECES"
                subtitle="Chronograph Series"
                image="/images/watch.png"
                price="From ₹24,999"
              />
              <CategoryCard
                title="URBAN CAPS"
                subtitle="Streetwear Edition"
                image="/images/cap.jpeg"
                price="From ₹2,499"
              />
              <CategoryCard
                title="PREMIUM WATCHES"
                subtitle="Limited Automatic"
                image="/images/watch.png"
                price="From ₹34,999"
              />
            </div>

            {/* Center Area: Clean space where 3D sneaker rotates as you scroll */}
            <div className="lg:col-span-6 min-h-[350px] lg:min-h-[550px]" />

            {/* Right Column */}
            <div className="lg:col-span-3 flex flex-col gap-6 lg:gap-8 z-20">
              <CategoryCard
                title="HIGH-TOP SNEAKERS"
                subtitle="Performance Sole"
                image="/images/sneaker.jpeg"
                price="From ₹14,999"
              />
              <CategoryCard
                title="SLIDERS & MULES"
                subtitle="Ergonomic Comfort"
                image="/images/slider.jpeg"
                price="From ₹4,999"
              />
              <CategoryCard
                title="ITALIAN LOAFERS"
                subtitle="Handcrafted Leather"
                image="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80"
                price="From ₹18,999"
              />
            </div>

          </div>

        </section>

        {/* SECTION 3: FEATURES BAR SECTION */}
        <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-20">
          <div className="border border-white/10 rounded-3xl bg-neutral-950/90 px-8 py-12 lg:px-14 backdrop-blur-xl shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <Feature
                icon={Truck}
                title="EXPRESS SHIPPING"
                subtitle="Complimentary delivery nationwide on orders above ₹999"
              />
              <Feature
                icon={RotateCcw}
                title="EASY EXCHANGES"
                subtitle="14-day hassle-free doorstep pickup & exchange"
              />
              <Feature
                icon={ShieldCheck}
                title="AUTHENTIC GUARANTEE"
                subtitle="100% genuine certified luxury craftsmanship"
              />
              <Feature
                icon={Headphones}
                title="CONCIERGE SUPPORT"
                subtitle="24/7 dedicated service for all your inquiries"
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: FEATURED CATALOG */}
        <section className="max-w-[1800px] mx-auto px-6 md:px-12 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-[#ff6a00] text-xs font-bold tracking-[0.3em] uppercase block mb-2">
                2026 EDITION
              </span>
              <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tight">
                FEATURED FOOTWEAR
              </h2>
            </div>
            <button className="text-xs font-bold tracking-widest text-[#ff6a00] hover:text-white uppercase flex items-center gap-2 group cursor-pointer">
              <span>VIEW FULL CATALOGUE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'apex-pro',
                name: 'SOLESPACE APEX PRO 360',
                category: 'Performance Running',
                price: '₹16,499',
                image: '/images/sneaker.jpeg',
                badge: 'NEW RELEASE'
              },
              {
                id: 'stealth-v2',
                name: 'SOLESPACE STEALTH RUNNER',
                category: 'Urban Lifestyle',
                price: '₹14,999',
                image: '/images/slider.jpeg',
                badge: 'BESTSELLER'
              },
              {
                id: 'chronos-monarch',
                name: 'SOLESPACE CHRONOS EDITION',
                category: 'Luxury Accessories',
                price: '₹28,999',
                image: '/images/watch.png',
                badge: 'LIMITED'
              }
            ].map((prod) => (
              <div
                key={prod.id}
                className="bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#ff6a00]/50 transition-all duration-500 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                  <span className="absolute top-4 left-4 z-10 bg-[#ff6a00] text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    {prod.badge}
                  </span>
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setQuickViewProduct(prod.name)}
                      className="p-3 bg-black/80 text-white rounded-full hover:bg-[#ff6a00] hover:text-black transition-colors cursor-pointer"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => triggerAddToCart(prod.name)}
                      className="px-5 py-2.5 bg-[#ff6a00] text-black text-xs font-bold rounded-full hover:bg-white transition-colors uppercase tracking-wider cursor-pointer"
                    >
                      ADD TO BAG
                    </button>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                      {prod.category}
                    </span>
                    <h3 className="text-white font-bold text-base uppercase tracking-wide group-hover:text-[#ff6a00] transition-colors">
                      {prod.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <span className="text-white font-extrabold text-sm">{prod.price}</span>
                    <div className="flex gap-1">
                      {['#ff6a00', '#262626', '#ffffff'].map((color) => (
                        <span
                          key={color}
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/95 pt-16 pb-12 px-6 md:px-12 relative z-20">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 border border-[#ff6a00] rounded-full bg-black">
                  <svg className="w-5 h-3 text-[#ff6a00]" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6h20M6 2h12M6 10h12" />
                    <path d="M12 2v8" />
                  </svg>
                </div>
                <span className="font-extrabold text-xl tracking-widest text-white">SOLESPACE</span>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed max-w-sm font-light">
                Pioneering high-performance luxury footwear and curated street style. Seamlessly blending ergonomic dynamic engineering with high fashion.
              </p>
            </div>

            <div className="md:col-span-2">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-4">NAVIGATE</h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><a href="#" className="hover:text-[#ff6a00]">Men's Collection</a></li>
                <li><a href="#" className="hover:text-[#ff6a00]">Women's Line</a></li>
                <li><a href="#" className="hover:text-[#ff6a00]">New Arrivals</a></li>
                <li><a href="#" className="hover:text-[#ff6a00]">Limited Drops</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest mb-4">SUPPORT</h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><a href="#" className="hover:text-[#ff6a00]">Order Tracking</a></li>
                <li><a href="#" className="hover:text-[#ff6a00]">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-[#ff6a00]">Size Guide</a></li>
                <li><a href="#" className="hover:text-[#ff6a00]">Contact Concierge</a></li>
              </ul>
            </div>

            <div className="md:col-span-4 flex flex-col gap-4">
              <h5 className="text-white text-xs font-bold uppercase tracking-widest">JOIN THE CLUB</h5>
              <p className="text-neutral-400 text-xs">Subscribe to receive exclusive drop alerts and private previews.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="bg-neutral-900 border border-white/10 rounded-full px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff6a00] flex-1"
                />
                <button className="bg-[#ff6a00] text-black font-extrabold text-xs px-6 py-2.5 rounded-full uppercase hover:bg-white transition-colors cursor-pointer">
                  JOIN
                </button>
              </div>
            </div>

          </div>

          <div className="max-w-[1800px] mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
            <p>© 2026 SOLESPACE HAUTE FOOTWEAR. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-neutral-300">PRIVACY POLICY</a>
              <a href="#" className="hover:text-neutral-300 font-mono">TERMS OF SERVICE</a>
            </div>
          </div>
        </footer>

      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-neutral-950 border border-white/10 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[#ff6a00] text-[10px] font-bold tracking-[0.2em] uppercase block mb-1">
              QUICK VIEW
            </span>
            <h3 className="text-white text-2xl font-black uppercase mb-3">
              {quickViewProduct}
            </h3>
            <p className="text-neutral-300 text-xs leading-relaxed mb-6 font-light">
              Features our proprietary 360° ergonomic cushioning matrix, engineered for maximum energy return and all-day comfort.
            </p>
            <button
              onClick={() => {
                triggerAddToCart(quickViewProduct);
                setQuickViewProduct(null);
              }}
              className="w-full py-4 bg-[#ff6a00] text-black font-extrabold text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors cursor-pointer"
            >
              ADD TO BAG NOW
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
