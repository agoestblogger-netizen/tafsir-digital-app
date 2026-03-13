import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

// GET /api/hijrah-tasks?user_id=<uuid>&day=N
// Return: { completed_task_ids: number[] }
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");
        const day = searchParams.get("day");

        if (!userId || !day) return NextResponse.json({ error: "user_id dan day diperlukan." }, { status: 400 });

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from("hijrah_tasks")
            .select("task_id")
            .eq("user_id", userId)
            .eq("day_number", Number(day))
            .eq("is_completed", true);

        if (error) {
            console.error("[HijrahTasks] Fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const completedIds = (data || []).map((r: { task_id: string }) => String(r.task_id));
        return NextResponse.json({ completed_task_ids: completedIds });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// POST /api/hijrah-tasks — tandai task selesai (UPSERT)
export async function POST(request: NextRequest) {
    try {
        const { user_id, day_number, task_id } = await request.json();
        if (!user_id || !day_number || task_id === undefined) {
            return NextResponse.json({ error: "user_id, day_number, task_id diperlukan." }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from("hijrah_tasks")
            .upsert(
                {
                    user_id,
                    day_number: Number(day_number),
                    task_id: String(task_id),
                    is_completed: true,
                    completed_at: new Date().toISOString(),
                },
                { onConflict: "user_id,day_number,task_id" }
            )
            .select();

        if (error) {
            console.error("[HijrahTasks CRITICAL] Upsert error full details:", JSON.stringify(error, null, 2));
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[HijrahTasks] ✅ Task ${task_id} done — Day ${day_number}. Data returned:`, data);
        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// DELETE /api/hijrah-tasks — batalkan task
export async function DELETE(request: NextRequest) {
    try {
        const { user_id, day_number, task_id } = await request.json();
        if (!user_id || !day_number || task_id === undefined) {
            return NextResponse.json({ error: "user_id, day_number, task_id diperlukan." }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
            .from("hijrah_tasks")
            .update({ is_completed: false })
            .eq("user_id", user_id)
            .eq("day_number", Number(day_number))
            .eq("task_id", String(task_id))
            .select();

        if (error) {
            console.error("[HijrahTasks CRITICAL] Cancel error full details:", JSON.stringify(error, null, 2));
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[HijrahTasks] ✅ Task ${task_id} dibatalkan — Day ${day_number}. Data cancelled:`, data);
        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
