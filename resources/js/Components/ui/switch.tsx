import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group/switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 data-[checked]:bg-primary data-[state=checked]:bg-primary bg-gray-200 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15)] ring-0 transition-transform duration-300 translate-x-0 group-data-[checked]/switch:translate-x-5 group-data-[state=checked]/switch:translate-x-5"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
