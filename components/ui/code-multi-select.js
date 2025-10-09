'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

export function CodeMultiSelect({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select codes...",
  className,
  disabled = false
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    
    return options.filter(option => 
      option.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.full_description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [options, searchTerm])

  const handleSelect = (optionId) => {
    const newValue = value.includes(optionId)
      ? value.filter(id => id !== optionId)
      : [...value, optionId]
    onChange(newValue)
  }

  const handleRemove = (optionId) => {
    const newValue = value.filter(id => id !== optionId)
    onChange(newValue)
  }

  const selectedOptions = options.filter(option => value.includes(option.abbreviation))

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between min-h-[40px] h-auto"
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedOptions.map((option) => (
                  <Badge 
                    key={option.abbreviation} 
                    variant="secondary"
                    className="text-xs"
                  >
                    {option.abbreviation}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(option.abbreviation)
                      }}
                    />
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <Command>
            <CommandInput 
              placeholder="Search codes..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>No codes found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.abbreviation}
                  onSelect={() => handleSelect(option.abbreviation)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.abbreviation) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {option.abbreviation}
                      </Badge>
                      <span className="text-sm">{option.full_description}</span>
                    </div>
                    {option.category && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Category: {option.category}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}