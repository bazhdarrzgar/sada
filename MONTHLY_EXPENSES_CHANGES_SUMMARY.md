# Monthly Expenses Tab Implementation - Changes Summary

## Overview
Successfully restructured the Monthly Expenses (خەرجی مانگانە) page to have two tabs similar to the Supervision System (سیستەمی چاودێری).

## Changes Made

### 1. **Imports** (Line 10)
- Added `Tabs, TabsContent, TabsList, TabsTrigger` from '@/components/ui/tabs'

### 2. **State Management** (Line 58)
- Added `activeTab` state to track current tab ('main' or 'educational')
- Added `educationalTotal` field to `newEntry` state (Line 73)
- Added `educationalTotal` field to `resetNewEntry` function (Line 297)

### 3. **Total Calculation Logic**
Updated two functions to calculate totals differently:

#### `handleCellEdit` (Lines 302-327)
- **Main expenses total**: Excludes books, clothes, travel, transportation
- **Educational total**: Only books + clothes + travel + transportation
- Stores educational total in `educationalTotal` field

#### `handleModalFieldChange` (Lines 389-410)
- Same logic as `handleCellEdit`
- Calculates main total without educational/travel expenses
- Calculates educational total separately

### 4. **Card View Component** (Lines 737-831)
Updated `ExpensesCardView` to accept `type` prop:
- **Main type**: Shows staffSalary, expenses, buildingRent, electricity, receiptImages, requirement
- **Educational type**: Shows books, clothes, travel, transportation
- Displays appropriate total based on type

### 5. **Table View Component** (Lines 833-1095)
Updated `ExpensesTableView` to accept `type` prop:

#### Main Columns (mainColumns)
- Year, Month, Requirement
- Staff Salary, Expenses, Building Rent, Drama Fee, Social Support, Electricity
- **Total** (sum of main expenses only)
- Receipt Images, Notes

#### Educational Columns (educationalColumns)
- Year, Month
- Books, Clothes, Travel, Transportation
- **Educational Total** (کۆی گشتی) - sum of the 4 educational fields
- Notes

### 6. **Tab Interface** (Lines 1579-1608)
Replaced single table view with tabbed interface:
```jsx
<Tabs defaultValue="main" onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="main">خەرجییە سەرەکییەکان</TabsTrigger>
    <TabsTrigger value="educational">خەرجی پەروەردەیی و گەشت</TabsTrigger>
  </TabsList>
  
  <TabsContent value="main">
    {/* Main expenses table/cards */}
  </TabsContent>
  
  <TabsContent value="educational">
    {/* Educational expenses table/cards */}
  </TabsContent>
</Tabs>
```

## Tab Names

### Tab 1: Main Expenses
- **Kurdish**: خەرجییە سەرەکییەکان
- **English**: Main Expenses

### Tab 2: Educational & Travel
- **Kurdish**: خەرجی پەروەردەیی و گەشت
- **English**: Educational & Travel

## Features Preserved
✅ Add new entries
✅ Edit existing entries
✅ Delete entries
✅ Search functionality
✅ Print functionality
✅ Download functionality
✅ Image upload (for main expenses)
✅ Filters (year, month)
✅ Pagination
✅ Mobile responsive (card view)
✅ Dark mode support

## Data Model
The data model remains unchanged - all fields are still stored in the database:
- Main expenses: staffSalary, expenses, buildingRent, dramaFee, socialSupport, electricity
- Educational/Travel: books, clothes, travel, transportation
- Common: year, month, requirement, receiptImages, notes
- Totals: `total` (main), `educationalTotal` (educational/travel)

## Testing Checklist
- [ ] Navigate to Monthly Expenses page
- [ ] Verify two tabs are visible
- [ ] Switch between tabs
- [ ] Add new entry (verify all fields work)
- [ ] Edit existing entry (verify calculations)
- [ ] Delete entry
- [ ] Search across both tabs
- [ ] Print from both tabs
- [ ] Download data from both tabs
- [ ] Test on mobile (card view)
- [ ] Verify totals calculate correctly in both tabs

## Backup
A backup of the original file was created at:
`/home/swyanswartz/Documents/sada/sada29/sada197/app/expenses/page.js.backup`
