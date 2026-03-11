import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/hijrah-auth
 * Buat "ghost" Supabase Auth user untuk device anonim.
 * Dipanggil sekali saat pertama kali user membuka halaman Jalur Hijrah.
 * Mengembalikan user_id (UUID) yang disimpan di localStorage sebagai device identifier.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email: existingEmail } = body as { email?: string };

        const supabase = getSupabaseAdmin();

        // Jika ada email sebelumnya (ghost user sudah dibuat), cek apakah masih valid
        if (existingEmail) {
            const { data: existingUser } = await supabase.auth.admin.getUserById(
                existingEmail // ini bukan email, tapi kita kembalikan user_id nanti
            );
            if (existingUser?.user) {
                return NextResponse.json({ user_id: existingUser.user.id });
            }
        }

        // Buat ghost user baru dengan email unik
        const ghostEmail = `device-${Date.now()}-${Math.random().toString(36).slice(2)}@hijrah.local`;
        const { data, error } = await supabase.auth.admin.createUser({
            email: ghostEmail,
            password: crypto.randomUUID(), // random password, tidak akan pernah dipakai
            email_confirm: true,           // bypass email verification
        });

        if (error) {
            console.error("[HijrahAuth] Create ghost user error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[HijrahAuth] ✅ Ghost user created: ${data.user.id.slice(0, 8)}...`);
        return NextResponse.json({ user_id: data.user.id });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan internal";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
