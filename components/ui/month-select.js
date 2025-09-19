'use client'

import { useState } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

const MONTHS = [
  { value: '1-Jan', label: 'January - کانونی دووەم', short: 'Jan' },
  { value: '1-Feb', label: 'February - شوبات', short: 'Feb' },
  { value: '1-Mar', label: 'March - ئازار', short: 'Mar' },
  { value: '1-Apr', label: 'April - نیسان', short: 'Apr' },
  { value: '1-May', label: 'May - ئایار', short: 'May' },
  { value: '1-Jun', label: 'June - حوزەیران', short: 'Jun' },
  { value: '1-Jul', label: 'July - تەمووز', short: 'Jul' },
  { value: '1-Aug', label: 'August - ئاب', short: 'Aug' },
  { value: '1-Sep', label: 'September - ئەیلوول', short: 'Sep' },
  { value: '1-Oct', label: 'October - تشرینی یەکەم', short: 'Oct' },
  { value: '1-Nov', label: 'November - تشرینی دووەم', short: 'Nov' },
  { value: '1-Dec', label: 'December - کانونی یەکەم', short: 'Dec' }
]

export function MonthSelect({ 
  value, 
  onChange, 
  placeholder = "Select month...",
  className,
  disabled = false,
  showYear = true
}) {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const getDisplayValue = () => {
    if (!value) return placeholder
    
    const month = MONTHS.find(m => value.startsWith(m.short) || value.includes(m.short))
    if (month) {
      return showYear ? `${month.short} ${currentYear}` : month.short
    }
    return value
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{getDisplayValue()}</span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Search month..." />
          <CommandEmpty>No month found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-y-auto">
            {MONTHS.map((month) => (
              <CommandItem
                key={month.value}
                onSelect={() => {
                  onChange(month.value)
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{month.short}</span>
                    <span className="text-xs text-muted-foreground">
                      {showYear ? currentYear : ''}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {month.label}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}