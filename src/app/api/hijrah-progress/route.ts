import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET /api/hijrah-progress?user_id=<uuid>
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");

        if (!userId) return NextResponse.json({ error: "user_id diperlukan." }, { status: 400 });

        const supabase = getSupabaseAdmin();

        const { data: existing, error: fetchError } = await supabase
            .from("hijrah_progress")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

        if (fetchError) {
            console.error("[HijrahProgress] Fetch error:", fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!existing) {
            // Buat progress baru hari ke-1
            const { data: inserted, error: insertError } = await supabase
                .from("hijrah_progress")
                .insert({ user_id: userId, current_day: 1 })
                .select()
                .single();

            if (insertError) {
                console.error("[HijrahProgress] Insert error:", insertError);
                return NextResponse.json({ error: insertError.message }, { status: 500 });
            }

            console.log(`[HijrahProgress] ✅ New Day 1 for ${userId.slice(0, 8)}...`);
            return NextResponse.json(inserted);
        }

        return NextResponse.json(existing);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// PATCH /api/hijrah-progress — update current_day
export async function PATCH(request: NextRequest) {
    try {
        const { user_id, current_day } = await request.json();
        if (!user_id || !current_day) return NextResponse.json({ error: "user_id dan current_day diperlukan." }, { status: 400 });

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from("hijrah_progress")
            .update({ current_day: Number(current_day) })
            .eq("user_id", user_id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
