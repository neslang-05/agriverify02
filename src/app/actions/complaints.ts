'use server';

import { createClient } from '@/lib/supabase/server';
import {
  ComplaintSubmission,
  ProductComplaint,
  BatchRiskRegistry,
  ComplaintStatus,
} from '@/types/complaints';
import { revalidatePath } from 'next/cache';
import { DEMO_COMPLAINTS, DEMO_BATCH_REGISTRY, DEMO_COMPLAINT_STATS } from '@/lib/demo-data';
import { logAuditEvent } from './admin';
import { getCurrentUser } from './auth';

export async function submitComplaint(
  data: ComplaintSubmission
): Promise<{ success: boolean; error?: string; complaint?: ProductComplaint }> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    // In demo mode, simulate complaint submission
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const newComplaint: ProductComplaint = {
      id: `demo-${Date.now()}`,
      user_id: currentUser.id,
      verification_id: data.verificationId,
      batch_number: data.batchNumber,
      brand_name: data.brandName,
      crop_type: data.cropType,
      district: data.district,
      issue_type: data.issueType,
      description: data.description,
      days_since_sowing: data.daysSinceSowing,
      severity_score: data.severityScore,
      field_image_url: data.fieldImageUrl,
      status: 'received',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // In demo mode, we don't save to DB, just return success
    revalidatePath('/farmer/complaints');
    return { success: true, complaint: newComplaint };
  }

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // 1. Insert complaint into product_complaints
    const { data: complaint, error: insertError } = await supabase
      .from('product_complaints')
      .insert({
        user_id: user.id,
        batch_number: data.batchNumber,
        brand_name: data.brandName,
        crop_type: data.cropType,
        district: data.district,
        issue_type: data.issueType,
        description: data.description,
        days_since_sowing: data.daysSinceSowing,
        severity_score: data.severityScore,
        verification_id: data.verificationId,
        field_image_url: data.fieldImageUrl,
        status: 'received',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting complaint:', insertError);
      return { success: false, error: 'Failed to submit complaint' };
    }

    // 2. Get updated batch risk registry (trigger will update it automatically)
    const { data: batchRisk, error: riskError } = await supabase
      .from('batch_risk_registry')
      .select('*')
      .eq('batch_number', data.batchNumber)
      .single();

    if (riskError) {
      console.error('Error fetching batch risk:', riskError);
    }

    // 3. Revalidate dashboard paths for real-time updates
    revalidatePath('/farmer/complaints');
    revalidatePath('/officer/complaints');
    revalidatePath('/officer/dashboard');

    return {
      success: true,
      complaint: complaint as ProductComplaint,
    };
  } catch (error) {
    console.error('Error in submitComplaint:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

export async function getUserComplaints(): Promise<ProductComplaint[]> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    // Return demo complaints for the current demo user
    const currentUser = await getCurrentUser();
    if (!currentUser) return [];

    return DEMO_COMPLAINTS.filter(complaint => complaint.user_id === currentUser.id);
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return [];
    }

    const { data: complaints, error } = await supabase
      .from('product_complaints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error.message || error);
      return [];
    }

    return (complaints as ProductComplaint[]) || [];
  } catch (error) {
    console.error('Error in getUserComplaints:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getHighRiskBatches(): Promise<BatchRiskRegistry[]> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    return DEMO_BATCH_REGISTRY;
  }

  try {
    const supabase = await createClient();

    const { data: batches, error } = await supabase
      .from('batch_risk_registry')
      .select('*')
      .order('total_complaints', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching high risk batches:', error.message || error);
      // Return empty array if table doesn't exist yet (before migration)
      return [];
    }

    return (batches as BatchRiskRegistry[]) || [];
  } catch (error) {
    console.error('Error in getHighRiskBatches:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getBatchComplaints(
  batchNumber: string
): Promise<ProductComplaint[]> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    return DEMO_COMPLAINTS.filter(complaint => complaint.batch_number === batchNumber);
  }

  try {
    const supabase = await createClient();

    const { data: complaints, error } = await supabase
      .from('product_complaints')
      .select('*')
      .eq('batch_number', batchNumber)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching batch complaints:', error.message || error);
      return [];
    }

    return (complaints as ProductComplaint[]) || [];
  } catch (error) {
    console.error('Error in getBatchComplaints:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  status: 'received' | 'under_review' | 'finished'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user is an officer
    const { data: userData } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data')
      .eq('id', user.id)
      .single();

    if (userData?.raw_user_meta_data?.role !== 'officer') {
      return { success: false, error: 'Only officers can update complaint status' };
    }

    const { error } = await supabase
      .from('product_complaints')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', complaintId);

    if (error) {
      console.error('Error updating complaint status:', error);
      return { success: false, error: 'Failed to update complaint status' };
    }

    revalidatePath('/officer/complaints');
    revalidatePath('/officer/workflow');

    return { success: true };
  } catch (error) {
    console.error('Error in updateComplaintStatus:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function assignComplaint(
  complaintId: string,
  officerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'officer') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const { error } = await supabase
      .from('product_complaints')
      .update({ assigned_officer_id: officerId, updated_at: new Date().toISOString() })
      .eq('id', complaintId);

    if (error) {
      console.error('Error assigning complaint:', error);
      return { success: false, error: 'Failed to assign complaint' };
    }

    await logAuditEvent('assign_complaint', 'complaint', complaintId, { officer_id: officerId });

    revalidatePath('/officer/complaints');
    revalidatePath('/officer/workflow');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error in assignComplaint:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function addInvestigationNote(
  complaintId: string,
  note: string,
  newStatus?: ComplaintStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const updateData: Record<string, unknown> = {
      investigation_notes: note,
      updated_at: new Date().toISOString(),
    };
    if (newStatus) updateData.status = newStatus;

    const { error } = await supabase
      .from('product_complaints')
      .update(updateData)
      .eq('id', complaintId);

    if (error) {
      console.error('Error adding investigation note:', error);
      return { success: false, error: 'Failed to add note' };
    }

    revalidatePath('/officer/complaints');
    revalidatePath('/officer/workflow');
    revalidatePath('/farmer/complaints');
    return { success: true };
  } catch (error) {
    console.error('Error in addInvestigationNote:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getAllComplaints(): Promise<ProductComplaint[]> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    return DEMO_COMPLAINTS;
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) return [];

    const { data: complaints, error } = await supabase
      .from('product_complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all complaints:', error.message || error);
      return [];
    }

    return (complaints as ProductComplaint[]) || [];
  } catch (error) {
    console.error('Error in getAllComplaints:', error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getComplaintStats() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    return DEMO_COMPLAINT_STATS;
  }

  try {
    const supabase = await createClient();

    // Get high risk batches count
    const { count: highRiskCount, error: highRiskError } = await supabase
      .from('batch_risk_registry')
      .select('*', { count: 'exact', head: true })
      .eq('risk_level', 'high_risk');

    // Get today's complaints count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayCount, error: todayError } = await supabase
      .from('product_complaints')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get worst performing district
    const { data: districtStats } = await supabase
      .from('product_complaints')
      .select('district')
      .order('created_at', { ascending: false })
      .limit(100);

    const districtCounts = (districtStats || []).reduce(
      (acc: Record<string, number>, complaint) => {
        acc[complaint.district] = (acc[complaint.district] || 0) + 1;
        return acc;
      },
      {}
    );

    const worstDistrict = Object.entries(districtCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || 'N/A';

    if (highRiskError) {
      console.warn('High risk batch count warning:', highRiskError.message || highRiskError);
    }
    if (todayError) {
      console.warn('Today complaints count warning:', todayError.message || todayError);
    }

    return {
      highRiskBatchesCount: highRiskCount || 0,
      todayComplaintsCount: todayCount || 0,
      worstPerformingDistrict: worstDistrict,
    };
  } catch (error) {
    console.error('Error in getComplaintStats:', error instanceof Error ? error.message : error);
    return {
      highRiskBatchesCount: 0,
      todayComplaintsCount: 0,
      worstPerformingDistrict: 'N/A',
    };
  }
}
