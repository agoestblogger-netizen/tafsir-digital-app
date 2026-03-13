import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: penemu, error } = await supabase.from("penemu_muslim").select("*").limit(1);
  if (error) console.error("Error:", error.message);
  console.log("Penemu Muslim Schema:", penemu && penemu.length > 0 ? Object.keys(penemu[0]).join(", ") : "Empty");
}
main();
