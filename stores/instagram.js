import { defineStore } from "pinia";
import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

const validatePost = (data) => {
    if (!data.image_url) {
        throw new Error("画像URLは必須です");
    }
    return {
        image_url: data.image_url,
        caption: data.caption || "",
        hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
        scheduled_time: data.scheduled_time || null,
        status: data.scheduled_time ? "scheduled" : "draft",
    };
};

export const useInstagramStore = defineStore("instagram", {
    state: () => ({
        posts: [],
        scheduledPosts: [],
        loading: false,
        error: null,
    }),

    getters: {
        sortedPosts: (state) => {
            const allPosts = [...state.posts, ...state.scheduledPosts];
            return allPosts.sort((a, b) => {
                const dateA = a.scheduled_time
                    ? new Date(a.scheduled_time)
                    : new Date(a.created_at);
                const dateB = b.scheduled_time
                    ? new Date(b.scheduled_time)
                    : new Date(b.created_at);
                return dateB - dateA;
            });
        },
    },

    actions: {
        async fetchPosts() {
            this.loading = true;
            try {
                const { data: allPosts, error } = await supabase
                    .from("instagram_posts")
                    .select()
                    .in("status", ["draft", "published"])
                    .order("created_at", { ascending: false });

                if (error) throw error;
                this.posts = allPosts || [];
                return this.posts;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchScheduledPosts() {
            this.loading = true;
            try {
                const { data: scheduledPosts, error } = await supabase
                    .from("instagram_posts")
                    .select()
                    .eq("status", "scheduled")
                    .order("scheduled_time", { ascending: true });

                if (error) throw error;
                this.scheduledPosts = scheduledPosts || [];
                return this.scheduledPosts;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createPost(data) {
            this.loading = true;
            try {
                const postData = validatePost(data);

                const { data: post, error } = await supabase
                    .from("instagram_posts")
                    .insert([postData])
                    .select("*")
                    .single();

                if (error) throw error;

                if (post.status === "scheduled") {
                    this.scheduledPosts.unshift(post);
                } else {
                    this.posts.unshift(post);
                }

                return post;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updatePost(id, data) {
            this.loading = true;
            try {
                const postData = validatePost(data);

                const { data: post, error } = await supabase
                    .from("instagram_posts")
                    .update(postData)
                    .eq("id", id)
                    .select("*")
                    .single();

                if (error) throw error;

                // 更新後のステータスに応じて、適切な配列を更新
                if (post.status === "scheduled") {
                    this.posts = this.posts.filter((p) => p.id !== id);
                    this.scheduledPosts = this.scheduledPosts.filter(
                        (p) => p.id !== id
                    );
                    this.scheduledPosts.unshift(post);
                } else {
                    this.scheduledPosts = this.scheduledPosts.filter(
                        (p) => p.id !== id
                    );
                    this.posts = this.posts.filter((p) => p.id !== id);
                    this.posts.unshift(post);
                }

                return post;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deletePost(id) {
            this.loading = true;
            try {
                const { error } = await supabase
                    .from("instagram_posts")
                    .delete()
                    .eq("id", id);

                if (error) throw error;

                this.posts = this.posts.filter((post) => post.id !== id);
                this.scheduledPosts = this.scheduledPosts.filter(
                    (post) => post.id !== id
                );
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async uploadImage(fileName, file) {
            try {
                // Supabase Storageへのアップロード
                const { data: uploadData, error: uploadError } =
                    await supabase.storage
                        .from("instagram")
                        .upload("instagram/" + fileName, file);

                if (uploadError) throw uploadError;

                // 公開URLの取得
                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from("instagram")
                    .getPublicUrl("instagram/" + fileName);

                return { data: { publicUrl }, error: null };
            } catch (error) {
                console.error("Upload error:", error);
                return { data: null, error };
            }
        },

        async deleteImage(fileName) {
            try {
                await supabase.storage
                    .from("instagram")
                    .remove(["instagram/" + fileName]);
            } catch (error) {
                console.error("Failed to cleanup:", error);
            }
        },
    },
});
