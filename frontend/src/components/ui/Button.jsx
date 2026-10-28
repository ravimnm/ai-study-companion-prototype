import { forwardRef } from "react";

const Button = forwardRef(function Button(
  { children, variant = "primary", className = "", ...props },
  ref
) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    orange: "bg-orange-500 text-white hover:bg-orange-600",
  };

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
