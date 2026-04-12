// frontend/src/utils/lazyComponents.jsx
// PowerStream Lazy Loading Utilities
// SUPER UPGRADE PACK - Performance Boost

import React, { lazy, Suspense, memo, useState, useEffect, useRef } from "react";

// ============================================
// LOADING SPINNER COMPONENT
// ============================================
export const LoadingSpinner = memo(function LoadingSpinner({ size = 40, color = "#ffb84d" }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
      minHeight: "200px",
    }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ animation: "spin 1s linear infinite" }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 200"
        />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </div>
  );
});

// ============================================
// PAGE LOADING FALLBACK
// ============================================
export const PageLoadingFallback = memo(function PageLoadingFallback({ pageName = "Loading" }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
    }}>
      <LoadingSpinner size={50} />
      <p style={{ color: "#666", fontSize: "14px" }}>
        Loading {pageName}...
      </p>
    </div>
  );
});

// ============================================
// LAZY COMPONENT WRAPPER
// ============================================
export function createLazyComponent(importFn, componentName = "Page") {
  const LazyComponent = lazy(importFn);
  
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={<PageLoadingFallback pageName={componentName} />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// ============================================
// LAZY IMAGE COMPONENT
// ============================================
export const LazyImage = memo(function LazyImage({
  src,
  alt = "",
  className = "",
  style = {},
  placeholder = null,
  onLoad,
  onError,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = (e) => {
    setLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setError(true);
    onError?.(e);
  };

  return (
    <div
      ref={imgRef}
      className={`lazy-image-wrapper ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#1a1a1f",
        ...style,
      }}
    >
      {/* Placeholder shimmer */}
      {!loaded && !error && (
        <div
          className="lazy-image-placeholder"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #1a1a1f 25%, #2a2a2f 50%, #1a1a1f 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      )}

      {/* Actual image */}
      {inView && !error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`lazy-image ${loaded ? "loaded" : ""}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
          {...props}
        />
      )}

      {/* Error fallback */}
      {error && (
        placeholder || (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#1a1a1f",
            color: "#666",
            fontSize: "12px",
          }}>
            ⚠️ Image unavailable
          </div>
        )
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
});

// ============================================
// LAZY VIDEO THUMBNAIL
// ============================================
export const LazyVideoThumbnail = memo(function LazyVideoThumbnail({
  src,
  poster,
  alt = "",
  className = "",
  style = {},
  onClick,
  ...props
}) {
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`lazy-video-thumbnail ${className}`}
      onClick={onClick}
      style={{
        position: "relative",
        background: "#1a1a1f",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {inView ? (
        <LazyImage
          src={poster || src}
          alt={alt}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <div className="lazy-image-placeholder" style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, #1a1a1f 25%, #2a2a2f 50%, #1a1a1f 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }} />
      )}

      {/* Play button overlay */}
      {onClick && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.3)",
          opacity: 0,
          transition: "opacity 0.2s",
        }}
        className="play-overlay"
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >
          <div style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,184,77,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 24 }}>▶</span>
          </div>
        </div>
      )}

      {...props}
    </div>
  );
});

// ============================================
// VIRTUALIZED LIST (for large lists)
// ============================================
export const VirtualList = memo(function VirtualList({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      item: items[i],
      style: {
        position: "absolute",
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      },
    });
  }

  const handleScroll = (e) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: containerHeight,
        overflow: "auto",
        position: "relative",
      }}
    >
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {visibleItems.map(({ index, item, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================
// DEFERRED RENDER (for expensive components)
// ============================================
export function useDeferredRender(delay = 100) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return shouldRender;
}

export function DeferredRender({ children, delay = 100, fallback = null }) {
  const shouldRender = useDeferredRender(delay);
  return shouldRender ? children : fallback;
}

export default {
  LoadingSpinner,
  PageLoadingFallback,
  createLazyComponent,
  LazyImage,
  LazyVideoThumbnail,
  VirtualList,
  DeferredRender,
  useDeferredRender,
};










