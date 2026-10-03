import type React from "react";

interface VariantMatrixProps<V extends string, S extends string> {
  component: React.ComponentType<Record<string, unknown>>;
  variantProp: string;
  variants: readonly V[];
  sizeProp?: string;
  sizes?: readonly S[];
  props?: Record<string, unknown>;
}

export function VariantMatrix<V extends string, S extends string>({
  component: Component,
  variantProp,
  variants,
  sizeProp,
  sizes,
  props = {},
}: VariantMatrixProps<V, S>) {
  if (sizes && sizeProp) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div
            style={{
              width: "140px",
              fontWeight: 600,
              fontSize: "0.75rem",
              color: "#666",
            }}
          />
          {sizes.map((size) => (
            <div
              key={size}
              style={{
                flex: 1,
                textAlign: "center",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "#666",
              }}
            >
              {size}
            </div>
          ))}
        </div>
        {variants.map((variant) => (
          <div
            key={variant}
            style={{ display: "flex", gap: "1rem", alignItems: "center" }}
          >
            <div
              style={{
                width: "140px",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "#666",
              }}
            >
              {variant}
            </div>
            {sizes.map((size) => (
              <div
                key={size}
                style={{ flex: 1, display: "flex", justifyContent: "center" }}
              >
                <Component
                  {...props}
                  {...{ [variantProp]: variant, [sizeProp]: size }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1rem",
        alignItems: "center",
      }}
    >
      {variants.map((variant) => (
        <div
          key={variant}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Component {...props} {...{ [variantProp]: variant }} />
          <span style={{ fontSize: "0.75rem", color: "#666" }}>{variant}</span>
        </div>
      ))}
    </div>
  );
}
