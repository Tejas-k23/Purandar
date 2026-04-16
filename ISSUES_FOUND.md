# Custom Contact Details Save Issues - Detailed Report

## Issues Found

### 1. **toggleContactMode Missing Response Data Handling** ❌
**File:** [src/pages/admin/AdminProperties.jsx](src/pages/admin/AdminProperties.jsx#L95-L143)  
**Lines:** 95-143  
**Issue:** The `toggleContactMode` function updates local state optimistically but never uses the API response to sync with the server.

**Problem:**
```javascript
try {
  await adminService.updateProperty(propertyId, { contactDisplayMode: nextMode });
  // ❌ MISSING: No state update with response data!
} catch (_error) {
  setProperties((current) => current.map((item) => (
    item._id === propertyId ? { ...item, contactDisplayMode: currentMode, useOriginalSellerContact: true } : item
  )));
}
```

**Impact:** If server returns updated field values, they're ignored. Client state stays only with optimistic update data.

---

### 2. **State Sync Issue in toggleContactMode Error Handler** ⚠️
**File:** [src/pages/admin/AdminProperties.jsx](src/pages/admin/AdminProperties.jsx#L130-L142)  
**Lines:** 130-142  
**Issue:** Error handling reverts `contactDisplayMode` and `useOriginalSellerContact` but doesn't verify the values were correctly set initially.

**Problem:** When switching from 'original' to 'custom' mode and API fails:
```javascript
// Next mode is 'custom'
setProperties(...{ contactDisplayMode: 'custom', useOriginalSellerContact: false }...);

// On error revert:
{ ...item, contactDisplayMode: currentMode, useOriginalSellerContact: true }
// ❌ But currentMode might be derived value, not original!
```

**Impact:** Incorrect state on revert if currentMode calculation is off.

---

### 3. **Missing Required Field Validation in Payload** ⚠️
**File:** [src/pages/admin/AdminProperties.jsx](src/pages/admin/AdminProperties.jsx#L175-L195)  
**Lines:** 175-195  
**Issue:** While there IS client-side validation for fields being present (line 188), there's no further validation that fields don't contain only whitespace after being trimmed, or that email format is valid.

**Problem:**
```javascript
// Validates trim() exists but doesn't check trimmed length
if (!draft.displaySellerName?.trim() || !draft.displaySellerPhone?.trim() || !draft.displaySellerEmail?.trim()) {
  // Only checks if trim exists, not if result is empty!
}
```

**Better would be:**
```javascript
if (!draft.displaySellerName?.trim() || !draft.displaySellerPhone?.trim() || !draft.displaySellerEmail?.trim()) {
  // Currently this looks correct - but email format isn't validated at all
}
```

---

### 4. **Backend Validation Missing Email Format Check** ❌
**File:** [backend/src/utils/propertyConfig.js](backend/src/utils/propertyConfig.js#L220-L225)  
**Lines:** 220-225  
**Issue:** `validatePropertyPayload` only checks if `displaySellerEmail` exists but doesn't validate email format.

**Problem:**
```javascript
if (payload.contactDisplayMode === 'custom') {
  if (!payload.displaySellerName?.trim()) errors.push('displaySellerName is required');
  if (!payload.displaySellerPhone?.trim()) errors.push('displaySellerPhone is required');
  if (!payload.displaySellerEmail?.trim()) errors.push('displaySellerEmail is required');
  // ❌ NO EMAIL FORMAT VALIDATION - Could save invalid email!
}
```

**Impact:** Invalid emails can be saved, causing display issues or validation failures later.

---

### 5. **Phone Number Format Not Validated** ❌
**File:** [backend/src/utils/propertyConfig.js](backend/src/utils/propertyConfig.js#L220-L225)  
**Lines:** 220-225  
**Issue:** No phone number format validation - accepts any non-empty string.

**Problem:**
```javascript
if (!payload.displaySellerPhone?.trim()) errors.push('displaySellerPhone is required');
// ❌ Accepts "abc", "123", "+91@#$%", etc. - anything with trim()
```

**Impact:** Unusable phone numbers saved to database.

---

### 6. **API Response Not Used in saveCustomContact for Toggle State** ⚠️
**File:** [src/pages/admin/AdminProperties.jsx](src/pages/admin/AdminProperties.jsx#L215-L230)  
**Lines:** 215-230  
**Issue:** `saveCustomContact` uses response to update property but doesn't update the toggle state if contactDisplayMode wasn't previously 'custom'.

**Problem:**
```javascript
if (response.data?.data) {
  setProperties((current) => current.map((item) => 
    item._id === propertyId ? response.data.data : item  // ✓ Updates all fields
  ));
}
// But the toggle UI might not reflect this if it uses different state
```

**Impact:** Minor - response data handling is actually correct here, unlike toggleContactMode.

---

### 7. **Response Data Structure Mismatch Risk** ⚠️
**File:** [backend/src/controllers/property.controller.js](backend/src/controllers/property.controller.js#L356-L380)  
**Lines:** 356-380  
**Issue:** Backend returns `{ success: true, message: '...', data: property }` but frontend expects `response.data?.data`

**Backend Response:**
```javascript
res.json({
  success: true,
  message: 'Property updated successfully',
  data: property,  // ✓ Correct
});
```

**Frontend Expects:**
```javascript
if (response.data?.data) { // ✓ Correct - axios wraps in response.data
```

**Status:** ✓ This is actually correct, but worth noting the structure.

---

### 8. **Missing API Response in toggleContactMode** 🔴 CRITICAL
**File:** [src/pages/admin/AdminProperties.jsx](src/pages/admin/AdminProperties.jsx#L95-L143)  
**Lines:** 120-127 and 133-140  
**Issue:** Two places where API response is completely ignored:

**First occurrence (switching to custom):**
```javascript
try {
  await adminService.updateProperty(propertyId, { contactDisplayMode: nextMode });
  // ❌ Response ignored - no state sync with server
} catch (_error) {
```

**Second occurrence (switching to original):**
```javascript
try {
  await adminService.updateProperty(propertyId, { contactDisplayMode: nextMode });
  // ❌ Response ignored - no state sync with server
} catch (_error) {
```

**Impact:** If server modifies response (e.g., adds useOriginalSellerContact, updates timestamps), client won't know. Next render might show stale data.

---

## Summary Table

| Issue | File | Line | Severity | Impact |
|-------|------|------|----------|--------|
| Missing response data in toggleContactMode | AdminProperties.jsx | 120-127, 133-140 | 🔴 HIGH | State stays out of sync with server |
| Email format not validated | propertyConfig.js | 224 | 🟠 MEDIUM | Invalid emails can be saved |
| Phone format not validated | propertyConfig.js | 223 | 🟠 MEDIUM | Invalid phones can be saved |
| State revert logic unclear | AdminProperties.jsx | 130-142 | 🟡 LOW | Edge cases in error recovery |
| Response not used in saveCustomContact toggle | AdminProperties.jsx | 215-230 | 🟡 LOW | Minor UI inconsistency risk |

## Recommended Fixes Priority
1. **HIGH:** Add email format validation (backend)
2. **HIGH:** Add phone format validation (backend)
3. **HIGH:** Use API response to update state in toggleContactMode
4. **MEDIUM:** Improve state revert logic clarity
5. **LOW:** Add email/phone validation on frontend as well
