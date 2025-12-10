# Monthly Expenses Tab Implementation Plan

## Overview
Restructuring the Monthly Expenses (خەرجی مانگانە) section to have two tabs similar to the Supervision System (سیستەمی چاودێری).

## Tab Structure

### Tab 1: Main Expenses (خەرجییە سەرەکییەکان)
Contains:
- Year (ساڵ)
- Month (مانگ)
- Requirement (پێداویستی)
- Staff Salary (مووچەی ستاف)
- Expenses (خەرجی)
- Building Rent (کرێی بینا)
- Drama Fee (کرێی دراما)
- Social Support (یارمەتی کۆمەڵایەتی)
- Electricity (کارەبا)
- **Total (کۆی گشتی)** - Sum of the above fields
- Receipt Images (وێنەی وەسڵ)
- Notes (تێبینی)

### Tab 2: Educational & Travel Expenses (خەرجی پەروەردەیی و گەشت)
Contains:
- Year (ساڵ)
- Month (مانگ)
- Books (کتێب)
- Clothes (جلوبەرگ)
- Travel (گەشت)
- Transportation (پاس)
- **Total (کۆی گشتی)** - Sum of these 4 fields only

## Implementation Steps

1. Import Tabs components from '@/components/ui/tabs'
2. Add state for active tab
3. Create two separate column configurations
4. Create two separate table/card views
5. Update the total calculation logic for each tab
6. Update add/edit modals to handle both tabs
7. Ensure all CRUD operations work for both tabs
8. Update search, print, and download functionality

## Notes
- Both tabs will share the same data source
- The main difference is which columns are displayed
- Each tab will have its own "Total" calculation
- All existing functionality (add, edit, delete, search, print, download) must work perfectly
