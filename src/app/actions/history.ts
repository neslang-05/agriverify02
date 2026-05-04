"use server";

import { createClient } from "@/lib/supabase/server";
import { DEMO_VERIFICATION_HISTORY } from "@/lib/demo-data";
import { getCurrentUser } from "./auth";

export interface VerificationHistoryItem {
  id: string;
  created_at: string;
  image_url: string;
  status: "genuine" | "fake" | "suspicious";
  confidence: number;
  vision_ai_tag?: string;
  vision_ai_confidence?: number;
  seed_variety?: string;
  recommendation?: string;
  user_id?: string;
  profiles?: {
    full_name: string;
    email: string;
    district: string;
  };
}

export async function getVerificationHistory(limit = 20) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    const userHistory = DEMO_VERIFICATION_HISTORY.filter(item => item.user_id === currentUser.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return {
      success: true,
      data: userHistory
    };
  }

  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    const { data, error } = await supabase
      .from("verification_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching verification history:", error);
      return {
        success: false,
        error: "Failed to fetch verification history"
      };
    }

    return {
      success: true,
      data: data as VerificationHistoryItem[]
    };
  } catch (error) {
    console.error("Verification history error:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}

export async function saveVerificationHistory(verificationData: {
  image_url: string;
  status: "genuine" | "fake" | "suspicious";
  confidence: number;
  vision_ai_tag?: string;
  vision_ai_confidence?: number;
  seed_variety?: string;
  recommendation?: string;
  risk_factors?: string[];
}) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    // In demo mode, don't save to database
    return {
      success: true,
      data: {
        id: `demo-${Date.now()}`,
        user_id: 'demo-user',
        ...verificationData,
        created_at: new Date().toISOString()
      }
    };
  }

  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    let userIdToSave = null;
    
    if (user) {
      // Check if profile exists to avoid foreign key violation
      // (happens if session is for a user deleted during DB reset)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        userIdToSave = user.id;
      }
    }
    
    // If no valid profile, we save it (anonymous verification)
    const { data, error } = await supabase
      .from("verification_history")
      .insert({
        user_id: userIdToSave,
        ...verificationData
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving verification history:", error);
      return {
        success: false,
        error: "Failed to save verification history"
      };
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error("Save verification history error:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}

export async function deleteVerificationHistoryItem(id: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    const { error } = await supabase
      .from("verification_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting verification history:", error);
      return {
        success: false,
        error: "Failed to delete verification history"
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error("Delete verification history error:", error);
    return {
      success: false,
      error: "An unexpected error occurred"
    };
  }
}

export async function getUserVerifications() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    // In demo mode, return empty array for now
    return [];
  }

  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return [];
    }

    const { data, error } = await supabase
      .from("verification_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching user verifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserVerifications:", error);
    return [];
  }
}

export async function getAllVerificationsForOfficer(limit = 100) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (isDemoMode) {
    return {
      success: true,
      data: DEMO_VERIFICATION_HISTORY.map(item => ({
        ...item,
        profiles: {
          full_name: 'Demo Farmer',
          email: 'farmer@example.com',
          district: 'Imphal West'
        }
      }))
    };
  }

  try {
    const supabase = await createClient();
    
    // Check if user is officer or admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== 'officer' && profile.role !== 'admin')) {
      return { success: false, error: "Unauthorized access" };
    }

    const { data, error } = await supabase
      .from("verification_history")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email,
          district
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching all verifications:", error);
      return { success: false, error: "Failed to fetch records" };
    }

    return {
      success: true,
      data: data as VerificationHistoryItem[]
    };
  } catch (error) {
    console.error("All verifications error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function uploadImageToStorage(file: File | Buffer, fileName: string) {
  try {
    const supabase = await createClient();
    
    // Determine the storage path
    const path = `verifications/${Date.now()}-${fileName}`;

    const { data, error } = await supabase.storage
      .from('verifications')
      .upload(path, file, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error("Storage upload error:", error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('verifications')
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToStorage:", error);
    throw new Error("Failed to upload image to storage");
  }
}
