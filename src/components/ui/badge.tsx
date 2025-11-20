
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/libs/utils";
const badgeVariants = cva(
"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus focus focus focus",
{
variants: {
variant: {
default:
"bg-primary text-primary-foreground hover/80",
secondary:
"bg-secondary text-secondary-foreground hover/80",
destructive:
"bg-destructive text-destructive-foreground hover/80",
outline:
"border border-input bg-background hover hover",
success:
"bg-green-500/20 text-green-500 border border-green-500/20",
warning:
"bg-amber-500/20 text-amber-500 border border-amber-500/20",
info:
"bg-blue-500/20 text-blue-500 border border-blue-500/20",
},
},
defaultVariants: {
variant: "default",
},
}
);
export interface BadgeProps
extends React.HTMLAttributes<HTMLDivElement>,
VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
return (
<div className={cn(badgeVariants({ variant }), className)} {...props} />
);
}
export { Badge, badgeVariants };