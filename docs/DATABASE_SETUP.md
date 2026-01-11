# Database Setup - Complaints System

## Required Step: Apply Supabase Migration

Before the complaints feature will work, you must apply the database migration to create the necessary tables.

### Option 1: Using Supabase CLI (Recommended)

```bash
# From project root directory
supabase db push
```

This will apply the migration file `supabase/migrations/20260111_product_complaints.sql` to your Supabase database.

### Option 2: Manual SQL Execution

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `supabase/migrations/20260111_product_complaints.sql`
5. Paste into the SQL editor
6. Click "Run"

### What Gets Created

The migration creates:

1. **`complaint_issue_type` ENUM** - Types of complaints
2. **`product_complaints` TABLE** - Stores farmer complaints
   - 15 columns for complaint details
   - Row-Level Security (RLS) enabled
   - Indexes for performance

3. **`batch_risk_registry` TABLE** - Aggregated batch statistics
   - Automatically updated via trigger
   - Used for officer dashboard queries

4. **Automatic Trigger** - `update_batch_risk_registry()`
   - Calculates risk level automatically
   - Implements the 1-3-5 rule
   - Updates every time a complaint is added

5. **Security Policies** - RLS policies for:
   - Farmers can see only their complaints
   - Officers can see all complaints
   - Only officers can update status

6. **Performance Indexes** - For fast queries on:
   - Batch number
   - District
   - User ID
   - Creation date

## Verification

After running the migration, verify the tables exist:

### In Supabase Dashboard:
1. Go to **SQL Editor**
2. Run this query:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('product_complaints', 'batch_risk_registry');
   ```
3. Should return 2 rows

### In Your App:
1. Navigate to `/officer/complaints`
2. You should see the dashboard with 0 complaints (not error messages)
3. Navigate to `/farmer/complaints`
4. You should see the empty state with "File Your First Complaint" button

## Troubleshooting

### Error: "relation 'product_complaints' does not exist"
- Migration hasn't been applied yet
- Run `supabase db push` or follow Manual SQL option above

### Error: "column 'risk_level' does not exist"
- Partial migration - ensure full SQL file was executed
- Check that `batch_risk_registry` table exists

### Still seeing errors after migration?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart dev server (`npm run dev`)
3. Check Supabase logs for RLS policy errors

## Next Steps

Once migration is applied:

1. ✅ Database tables ready
2. ✅ Complaint submission works
3. ✅ Officer dashboard functions
4. Test by:
   - Go to `/farmer/complaints/new`
   - Submit a test complaint
   - Check `/officer/complaints` to see it appear
   - Verify risk calculation (submit multiple for same batch)

## Important Notes

- Migration is **one-time only** - it won't hurt to re-run
- All RLS policies are enforced at database level (secure)
- Trigger function auto-calculates risk levels (1-3-5 rule)
- Data is persistent in Supabase (survives app restarts)
