# Debugging Review User Assignment Issue

## Problem
When submitting a review as USER "syahri", the review appears under OWNER "servisnih" instead.

## Investigation Steps

### Step 1: Check Browser Console Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console (Ctrl+L)
4. Login as syahri (USER account)
5. Navigate to UMKM detail page
6. Click "Tulis Ulasan" and submit review
7. Look for these logs:
   ```
   [Review Submit] Current authenticated user: syahri@gmail.com Role: USER User ID: <uuid>
   [Review Submit] Review created successfully. User in response: syahri@gmail.com
   ```

### Step 2: Check Debug Endpoint
After login as syahri, open new tab and go to:
```
http://127.0.0.1:8000/api/umkm-reviews/debug-auth-user/
```

Should show:
```json
{
  "authenticated": true,
  "user_id": "<syahri's uuid>",
  "email": "syahri@gmail.com",
  "name": "syahri",
  "role": "USER"
}
```

If it shows servisnih instead, then token is incorrect.

### Step 3: Check localStorage
Open Console and run:
```javascript
console.log("Token:", localStorage.getItem('token'))
console.log("Refresh:", localStorage.getItem('refresh'))
```

Token should be valid JWT for syahri. Paste token value to https://jwt.io to decode and check.

### Step 4: Check Network Requests
1. Open Network tab (F12)
2. Submit review
3. Find POST request to `/api/umkm-reviews/`
4. Click on request and check:
   - Request Headers: Should have `Authorization: Bearer <token>`
   - Response: Check if response includes user info for syahri

## Possible Causes & Solutions

### Cause 1: Logging in with wrong account
- **Check**: Are you sure you logged in as syahri (USER)?
- **Solution**: Clear localStorage and re-login
  ```javascript
  localStorage.clear()
  ```
  Then refresh page and login again with syahri account (not owner account)

### Cause 2: Token not saved correctly
- **Check**: Run step 3 above and verify token
- **Solution**: If token is missing or wrong, try:
  1. Logout (click Keluar)
  2. Clear cache: Ctrl+Shift+Delete
  3. Login again as syahri
  4. Check localStorage again

### Cause 3: Token expired
- **Check**: Token should be valid for 2 hours
- **Solution**: Logout and login again

### Cause 4: Multiple user accounts with same email
- **Check**: Database might have duplicate accounts
- **Solution**: Contact developer to check database:
  ```bash
  python manage.py shell
  from account.models import User
  User.objects.filter(email='syahri@gmail.com')  # Check if multiple entries
  ```

## Expected vs Actual

**Expected Behavior:**
- Login as syahri (USER role)
- Submit review
- Review shows: syahri@gmail.com, Role: USER

**Actual Behavior:**
- Review shows: servisnih@gmail.com, Role: OWNER

## Next Steps
1. Run debugging steps above
2. Share console logs and debug endpoint response
3. Tell us what you see at each step
4. Share localStorage token value (decoded from https://jwt.io)

Based on findings, we can identify if issue is in:
- Frontend (wrong token sent)
- Backend (wrong user decoded from token)  
- Database (data integrity issue)
- Authentication (token generation issue)
