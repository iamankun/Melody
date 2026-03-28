
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-lg",
  {
    variants: {
      variant: {
        default: "bg-primary/10 border-transparent text-primary-foreground hover:bg-primary/20 active:bg-green-500",
        destructive:
          "bg-destructive/10 border-transparent text-destructive-foreground hover:bg-destructive/20 active:bg-green-500",
        outline:
          "border-transparent bg-transparent hover:bg-accent/20 hover:text-accent-foreground active:bg-green-500",
        secondary:
          "bg-secondary/10 border-transparent text-secondary-foreground hover:bg-secondary/20 active:bg-green-500",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground border-transparent active:bg-green-500",
        link: "text-primary underline-offset-4 hover:underline border-transparent active:bg-green-500",
        success: "bg-success/10 border-transparent text-success-foreground hover:bg-success/20 active:bg-green-500",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-9 px-3 rounded-xl",
        lg: "h-11 px-8 rounded-xl",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
