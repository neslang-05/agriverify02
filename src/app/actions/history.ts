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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    const { data, error } = await supabase
      .from("verification_history")
      .insert({
        user_id: user.id,
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
      .from("packet_verifications")
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
