"use server";

import { createClient } from "@/lib/supabase/server";

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
