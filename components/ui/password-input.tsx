import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

export function PasswordInput({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10 [&::-ms-reveal]:hidden", className)}
        disabled={disabled}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        title={disabled ? "Password visibility toggle disabled" : showPassword ? "Hide password" : "Show password"}
        aria-label={disabled ? "Password visibility toggle disabled" : showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {showPassword ? (
          <EyeOffIcon className="size-5" />
        ) : (
          <EyeIcon className="size-5" />
        )}
      </button>
    </div>
  );
}
