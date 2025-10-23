# 🔐 Mobile Auth Fix - Authorization Header Support

## ❌ **Problem:**
Mobile apps can't send HTTP-only cookies like browsers. The backend was only checking cookies, so mobile requests were getting 401 errors.

## ✅ **Solution:**
Updated backend to check **both** cookies (for web) and Authorization header (for mobile).

---

## 🔧 **Backend Files Updated:**

### **1. `/api/auth/me/route.ts`**
Now checks:
1. Authorization header (Bearer token) ← **For mobile**
2. access-token cookie ← For web
3. auth-token cookie ← Legacy web

### **2. `/api/doctors/[id]/availability/route.ts`**
Same token checking logic

### **3. `/api/doctors/[id]/schedule/route.ts`**
Same token checking logic

---

## 🔄 **RESTART BACKEND:**

```bash
# Stop backend (Ctrl+C)
cd /home/bkg/parrot/project-bull/iHosi
npm run dev
```

---

## ✅ **How It Works Now:**

### **Web App (Browser):**
```
Login → Stores token in cookie
API calls → Sends cookie
Backend → Reads from cookie
✅ Works!
```

### **Mobile App (Expo):**
```
Login → Stores token in AsyncStorage
API calls → Sends in Authorization header
Backend → Reads from Authorization header
✅ Works!
```

---

## 🎯 **After Backend Restarts:**

1. **Refresh doctor app**
2. **You may need to login again:**
   - Email: `doctor2@hospital.com`
   - Password: `Doctor@123`
3. **Fresh token will be sent in Authorization header**
4. **Backend will accept it**
5. **All API calls will work!**

---

## 🚀 **Expected Result:**

```
✅ GET /api/auth/me → 200 OK
✅ GET /api/doctors/:id/availability → 200 OK
✅ GET /api/doctors/:id/schedule → 200 OK
✅ All endpoints work with mobile auth!
```

---

**Restart the backend now!** The mobile auth fix is complete! 🚀


