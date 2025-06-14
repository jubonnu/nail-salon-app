// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2024-04-03",
    devtools: { enabled: false },
    vite: {
        server: {
            hmr: {
                protocol: "ws",
                host: "0.0.0.0",
            },
        },
    },
    devServer: {
        port: 3000,
        host: "0.0.0.0",
    },
    modules: [
        "@nuxtjs/tailwindcss",
        "@pinia/nuxt",
        "@element-plus/nuxt",
        "@vueuse/nuxt",
    ],
    css: ["~/assets/css/main.css"],
    app: {
        head: {
            title: "Nail Salon Business App",
            meta: [
                { charset: "utf-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    hid: "description",
                    name: "description",
                    content: "Nail salon business improvement application",
                },
            ],
            link: [
                { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
                {
                    rel: "stylesheet",
                    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap",
                },
            ],
        },
    },
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8080/api",
            supabaseUrl: process.env.VITE_SUPABASE_URL,
            supabaseKey: process.env.VITE_SUPABASE_ANON_KEY,
        },
    },
    hooks: {
        "pages:extend"(pages) {
            pages.push({
                name: "default",
                path: "/",
                redirect: "/login",
            });
        },
    },
});
