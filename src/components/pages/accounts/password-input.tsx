"use client";

import { useId, useState } from "react";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

const PasswordInput = ({
  value,
  onChange,
  disabled = false,
  required = false,
  placeholder = "Password",
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const id = useId();

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          className="pr-9 bg-card border-none"
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
        />
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setIsVisible((prevState) => !prevState)}
          className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
          disabled={disabled}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
          <span className="sr-only">
            {isVisible ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default PasswordInput;
