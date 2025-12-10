# Manual Testing Guide for Activities (چالاکی) Edit Fix

## Prerequisites
1. The server is running on `http://localhost:3000`
2. You can login to the system (use username: `berdoz`, or the appropriate credentials)
3. Navigate to the Activities (چالاکی) section from the dashboard

## Test Data
Three test activities have been created:

1. **وەرزشی** (Sports) - Football game
   - ID: 84f5dbdc-021b-4cda-98b2-235b1bb82861
   - Who Did It: مامۆستا ئەحمەد

2. **هونەری** (Art) - Nature drawing
   - ID: 64a80ac4-c367-42ba-9b45-3c50e5a2be02
   - Who Did It: مامۆستا لەیلا

3. **زانستی** (Science) - Chemistry experiment (UPDATED)
   - ID: a37ade29-e821-4e84-b118-414ec8f13f1a
   - Who Did It: مامۆستا هیوا - دەستکاریکراو
   - Content: تاقیکردنەوەی کیمیایی لە تاقیگە - نوێکراوە

## Test Cases

### Test 1: Basic Edit - First Row
**Steps:**
1. Go to Activities page (چالاکی)
2. Find the first activity in the table
3. Click the blue "Edit" button (pencil icon)
4. **VERIFY**: Edit modal opens
5. **VERIFY**: All fields are populated with the **correct data** from that row:
   - Activity Type (جۆری چالاکی)
   - Preparation Date (بەرواری ئامادەکردن)
   - Content (ناوەرۆک)
   - Start Date (بەرواری دەستپێکردن)
   - Who Did It (کێ ئەنجامی داوە)
   - Helper (هاوکار)
   - Notes (تێبینی)
6. Change any field (e.g., add "TEST" to the content)
7. Click "Save" (پاشەکەوتکردن)
8. **VERIFY**: Modal closes
9. **VERIFY**: The row is **updated** (not a new row added)
10. **VERIFY**: The edited row moves to the top

**Expected Result**: ✅ Edit works correctly, data updates

---

### Test 2: Edit from Different Pages (Pagination)
**Steps:**
1. If you have more than 10 activities, go to page 2
2. Click edit on any row from page 2
3. **VERIFY**: The edit modal shows the **correct data** for that specific row
4. Make a change
5. Save
6. **VERIFY**: The correct row is updated (check by the activity type or unique content)

**Expected Result**: ✅ Pagination doesn't affect which row gets edited

---

### Test 3: Search + Edit
**Steps:**
1. In the search box (گەڕان), type "زانستی" (Science)
2. **VERIFY**: The search filters to show only the science activity
3. Click "Edit" on the filtered result
4. **VERIFY**: The edit modal shows the **correct data** for the science activity:
   - Content should contain: "تاقیکردنەوەی کیمیایی لە تاقیگە - نوێکراوە"
   - Who Did It: "مامۆستا هیوا - دەستکاریکراو"
5. Change the "Helper" field to "مامۆستا نەرمین - دەستکاری 2"
6. Save
7. Clear the search
8. **VERIFY**: The science activity is updated (not duplicated)
9. **VERIFY**: It shows the new helper name

**Expected Result**: ✅ Search + Edit works correctly

---

### Test 4: Edit Multiple Rows in Sequence
**Steps:**
1. Click edit on the first activity
2. Change something small (e.g., add "1" to notes)
3. Save
4. Immediately click edit on the second activity
5. **VERIFY**: The modal shows data from the **second** activity (not the first)
6. Change something
7. Save
8. Click edit on the third activity
9. **VERIFY**: The modal shows data from the **third** activity

**Expected Result**: ✅ Each edit opens with correct data

---

### Test 5: Verify No Duplicate Rows
**Steps:**
1. Note the total number of activities (shown in statistics)
2. Edit any activity
3. Make a change
4. Save
5. **VERIFY**: Total count remains the **same** (no new row added)
6. **VERIFY**: The edited row is **updated** with your changes

**Expected Result**: ✅ Edit updates existing row, doesn't create duplicate

---

## Common Issues Before Fix

### ❌ Issue 1: Wrong Data in Edit Modal
**Symptom**: Clicking edit on "Sports" activity shows data from "Art" activity  
**Status**: FIXED ✅

### ❌ Issue 2: Creating Duplicates
**Symptom**: Editing row A and saving creates a new row instead of updating row A  
**Status**: FIXED ✅

### ❌ Issue 3: Search Edit Broken
**Symptom**: Search for item, click edit, modal shows wrong data or empty fields  
**Status**: FIXED ✅

## Quick Backend Test (Optional)
If you want to test the backend directly without UI:

```bash
# Get all activities
curl http://localhost:3000/api/activities

# Update an activity (replace ID with actual ID)
curl -X PUT http://localhost:3000/api/activities/YOUR_ACTIVITY_ID \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "وەرزشی",
    "preparationDate": "2024-12-01",
    "content": "Updated content",
    "startDate": "2024-12-15",
    "whoDidIt": "Updated teacher",
    "helper": "Updated helper",
    "activityImages": [],
    "notes": "Updated notes"
  }'

# Verify the update
curl http://localhost:3000/api/activities/YOUR_ACTIVITY_ID
```

## Success Criteria
✅ All 5 test cases pass  
✅ No duplicate rows created  
✅ Correct data always shown in edit modal  
✅ Updates work from any page/search state  
✅ Multiple sequential edits work correctly  

## Need Help?
- Check `/app/ACTIVITIES_EDIT_FIX_SUMMARY.md` for technical details
- Backend logs: `tail -f /var/log/supervisor/nextjs.out.log`
- Error logs: `tail -f /var/log/supervisor/nextjs.err.log`
