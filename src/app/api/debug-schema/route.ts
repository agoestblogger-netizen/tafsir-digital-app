import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
    try {
        const sb = getSupabaseAdmin();

        // Insert dummy row to see what columns are expected
        const { error: pErr } = await sb
            .from("hijrah_progress")
            .insert({ _probe: "test" } as never);

        const { error: tErr } = await sb
            .from("hijrah_tasks")
            .insert({ _probe: "test" } as never);

        return NextResponse.json({
            hijrah_progress_error: pErr?.message,
            hijrah_progress_details: pErr?.details,
            hijrah_tasks_error: tErr?.message,
            hijrah_tasks_details: tErr?.details,
        });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
