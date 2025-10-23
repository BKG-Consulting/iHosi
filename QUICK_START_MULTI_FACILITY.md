# 🚀 Quick Start - Multi-Facility System

## ✅ PHASE 1 COMPLETE!

Your multi-facility, multi-tenant system is **LIVE** and ready to test!

---

## 🏃 Quick Start (3 Steps)

### Step 1: Setup Local DNS (30 seconds)

```bash
sudo bash setup-local-hosts.sh
```

This adds facility subdomains to your `/etc/hosts` file.

### Step 2: Start Dev Server

```bash
npm run dev
```

### Step 3: Test!

Open these URLs:
- http://mayo-clinic.localhost:3000
- http://cleveland-clinic.localhost:3000
- http://stanford-medical.localhost:3000

**What to Look For:**
- ✅ Different colors per facility
- ✅ Console log: "✅ Facility context loaded"
- ✅ Terminal log: "🔍 Middleware: ... ✅ Facility resolved"

---

## 🏥 10 Facilities Ready to Test

| Facility | URL | Brand Color |
|----------|-----|-------------|
| Mayo Clinic | `mayo-clinic.localhost:3000` | Blue (#0051C3) |
| Cleveland Clinic | `cleveland-clinic.localhost:3000` | Navy (#003366) |
| Stanford Medical | `stanford-medical.localhost:3000` | Cardinal (#8C1515) |
| Johns Hopkins | `johns-hopkins.localhost:3000` | Blue (#002D72) |
| Mass General | `mass-general.localhost:3000` | Blue (#005A9C) |
| UCLA Medical | `ucla-medical.localhost:3000` | Blue (#2774AE) |
| UCSF Medical | `ucsf-medical.localhost:3000` | Navy (#052049) |
| NY Presbyterian | `newyork-presbyterian.localhost:3000` | Red (#D31F30) |
| Cedars-Sinai | `cedars-sinai.localhost:3000` | Blue (#005DAA) |
| Duke University | `duke-university.localhost:3000` | Navy (#003366) |

---

## 🎨 Using Facility Context

### In Client Components

```tsx
'use client';
import { useFacility } from '@/lib/facility-context';

export function Header() {
  const facility = useFacility();
  
  return (
    <div style={{ backgroundColor: facility?.branding.primaryColor }}>
      <h1>{facility?.name || 'iHosi'}</h1>
    </div>
  );
}
```

### In Server Components

```tsx
import { getCurrentFacility } from '@/lib/facility-helpers';

export default async function Page() {
  const facility = await getCurrentFacility();
  
  return <h1>Welcome to {facility?.name || 'iHosi'}</h1>;
}
```

### CSS Variables (Automatic)

```css
/* These are set automatically per facility */
--facility-primary: #0051C3;
--facility-secondary: #7B8794;
--facility-accent: #00A3E0;

/* Use them in your styles */
.button {
  background-color: var(--facility-primary);
}
```

---

## 📊 View Data in Prisma Studio

```bash
npx prisma studio --port 5555
```

Visit http://localhost:5555 and explore:
- ✅ `Facility` table (10 facilities)
- ✅ All branding colors
- ✅ Facility slugs

---

## 🔍 How It Works

1. **URL**: User visits `mayo-clinic.localhost:3000`
2. **Middleware**: Extracts `mayo-clinic` from hostname
3. **Database**: Looks up facility by slug
4. **Context**: Injects facility into headers + cookies
5. **Client**: `FacilityProvider` reads cookie
6. **Branding**: CSS variables applied automatically
7. **Components**: Access via `useFacility()` hook

---

## 🎯 What's Implemented

### ✅ Core Infrastructure
- [x] Multi-tenant database schema
- [x] Subdomain routing middleware
- [x] Facility context provider
- [x] Automatic branding system
- [x] 10 test facilities seeded
- [x] Helper functions for facility queries

### ✅ Features
- [x] Per-facility branding (colors, logo, favicon)
- [x] Client-side facility access (`useFacility`)
- [x] Server-side facility access (`getCurrentFacility`)
- [x] Automatic CSS variable injection
- [x] Facility-aware database queries

### 📝 Next (Phase 2)
- [ ] Assign doctors to multiple facilities
- [ ] Per-facility schedules
- [ ] Unified doctor calendar
- [ ] Cross-facility conflict detection
- [ ] Facility admin portal

---

## 🧪 Testing Checklist

- [ ] Run `npm run dev`
- [ ] Visit mayo-clinic.localhost:3000
- [ ] Check console for facility context
- [ ] Check terminal for middleware logs
- [ ] Visit different facility subdomains
- [ ] Verify colors change per facility
- [ ] Open Prisma Studio
- [ ] Verify 10 facilities exist

---

## 📁 Key Files

```
prisma/schema.prisma          # Multi-facility models
middleware.ts                  # Subdomain extraction
lib/facility-helpers.ts        # Server-side utilities
lib/facility-context.tsx       # Client-side context
app/layout.tsx                 # FacilityProvider integration
scripts/seed-facilities.ts     # Test data
```

---

## 🎉 Success Indicators

**You'll know it's working when:**

✅ Different subdomain → different colors
✅ Console shows: "✅ Facility context loaded: { name: 'Mayo Clinic' ... }"
✅ Terminal shows: "✅ Facility resolved: { id: '...', name: '...' }"
✅ No TypeScript or runtime errors
✅ Build succeeds: `npm run build`

---

## 🐛 Troubleshooting

### "Cannot resolve facility"
→ Run: `npx ts-node scripts/seed-facilities.ts`

### "Subdomain not working"
→ Run: `sudo bash setup-local-hosts.sh`
→ Check: `cat /etc/hosts | grep localhost`

### "Colors not applying"
→ Hard refresh: `Ctrl+Shift+R`
→ Check console for branding logs

---

## 📞 Next Steps

1. **Test the system** - Visit all 10 facility subdomains
2. **Review documentation** - Read `MULTI_FACILITY_SETUP_COMPLETE.md`
3. **Start Phase 2** - Multi-facility doctor support
4. **Review architecture** - Check `MULTI_FACILITY_SCHEDULING_ARCHITECTURE.md`

---

**Status:** ✅ READY FOR TESTING
**Time:** ~2 hours
**Build:** ✅ SUCCESS

---

🎉 **Congratulations! Your multi-facility system is live!**

