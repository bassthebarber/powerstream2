import React, { useMemo, useState } from "react";
import { getLogoUrls, getLogoFolder } from "../utils/getLogo.js";

/**
 * Image with lazy loading + glowing letter fallback when all URLs fail.
 *
 * @param {string} [type] - tv | artists | modules (or artist/module aliases)
 * @param {string} [slug]
 * @param {string} [src] - Explicit URL wins first
 * @param {string} [alt]
 * @param {string} [className]
 */
export default function LogoImage({
  type = "tv",
  slug = "",
  src,
  alt = "",
  className = "",
  loading = "lazy",
  ...imgProps
}) {
  const urls = useMemo(() => {
    const list = [];
    if (src) list.push(src);
    const folder = getLogoFolder(type);
    list.push(...getLogoUrls(folder, slug));
    return [...new Set(list)];
  }, [src, type, slug]);

  const [index, setIndex] = useState(0);
  const current = urls[index];
  const failedAll = index >= urls.length;
  const letter = (alt || slug || "?").trim().charAt(0).toUpperCase() || "?";

  if (failedAll || !current) {
    return (
      <span className={`ps-logo-fallback ${className}`.trim()} aria-hidden={!alt} title={alt || slug}>
        {letter}
      </span>
    );
  }

  return (
    <img
      {...imgProps}
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
