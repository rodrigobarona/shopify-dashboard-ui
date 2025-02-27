import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Create context for sidebar
const SidebarContext = React.createContext<{
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  expanded: false,
  setExpanded: () => {},
});

// Sidebar provider
export function SidebarProvider({
  children,
  defaultExpanded = false,
}: {
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded }}>
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  );
}

// Main sidebar component
export function Sidebar({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = React.useContext(SidebarContext);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-20 h-full w-16 flex-col border-r bg-background transition-all duration-300 lg:w-72",
        expanded ? "w-72" : "w-16",
        className
      )}
      {...props}
    >
      <div className="flex h-full flex-col">{children}</div>
    </aside>
  );
}

// Sidebar header
export function SidebarHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex h-16 items-center px-4", className)} {...props}>
      {children}
    </div>
  );
}

// Sidebar content
export function SidebarContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1 overflow-auto py-2", className)} {...props}>
      {children}
    </div>
  );
}

// Sidebar footer
export function SidebarFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-4", className)} {...props}>
      {children}
    </div>
  );
}

// Sidebar trigger
export function SidebarTrigger({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { expanded, setExpanded } = React.useContext(SidebarContext);

  return (
    <button
      className={cn("h-9 w-9 rounded-md border", className)}
      onClick={() => setExpanded(!expanded)}
      {...props}
    >
      <span className="sr-only">Toggle sidebar</span>
      {expanded ? "←" : "→"}
    </button>
  );
}

// Simplified group components
export function SidebarGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-3 py-2", className)} {...props}>
      {children}
    </div>
  );
}

export function SidebarGroupLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = React.useContext(SidebarContext);

  return (
    <div
      className={cn(
        "mb-2 px-2 text-xs font-semibold text-muted-foreground",
        expanded ? "text-left" : "text-center",
        className
      )}
      {...props}
    >
      {expanded ? children : null}
    </div>
  );
}

export function SidebarGroupContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

// Menu components
export function SidebarMenu({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("space-y-1", className)} {...props}>
      {children}
    </ul>
  );
}

export function SidebarMenuItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn(className)} {...props}>
      {children}
    </li>
  );
}

const sidebarMenuButtonVariants = cva(
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent text-foreground",
        active: "bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, variant, asChild = false, ...props }, ref) => {
  const { expanded } = React.useContext(SidebarContext);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        sidebarMenuButtonVariants({ variant }),
        expanded ? "justify-start" : "justify-center",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showIcon?: boolean }) {
  return (
    <div
      className={cn("flex items-center gap-2 rounded-md px-3 py-2", className)}
      {...props}
    >
      {showIcon && <div className="h-5 w-5 rounded-md bg-muted"></div>}
      <div className="h-4 w-full rounded-md bg-muted"></div>
    </div>
  );
}
