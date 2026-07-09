import React from "react"
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#eaeaea] dark:bg-[#333333]", className)}
      {...props}
    />
  )
}

export { Skeleton }
