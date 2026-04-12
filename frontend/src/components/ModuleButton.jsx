import React, { useState } from "react";
import "../styles/module-button.css";

/**
 * Premium glass module tile for the Home hub grid.
 */
export default function ModuleButton({ iconSrc, label, onClick, alt }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <button type="button" className="ps-module-btn" onClick={onClick}>
      <span className="ps-module-btn__icon-wrap" aria-hidden={!imgOk}>
        {imgOk ? (
          <img
            className="ps-module-btn__icon"
            src={iconSrc}
            alt={alt || label}
            loading="lazy"
            decoding="async"
            onError={() => setImgOk(false)}
          />
        ) : (
          <span className="ps-module-btn__icon-fallback" title={label}>
            {(label || "?").charAt(0)}
          </span>
        )}
      </span>
      <span className="ps-module-btn__label">{label}</span>
    </button>
  );
}
