import { createClient } from "@supabase/supabase-js";

export const useSupabase = () => {
    const config = useRuntimeConfig();

    const supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseKey,
        {
            auth: {
                persistSession: true,
            },
        }
    );

    return { supabase };
};
