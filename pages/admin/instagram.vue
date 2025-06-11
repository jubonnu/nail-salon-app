<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Instagram投稿管理</h1>
            <el-button type="primary" @click="createNewPost" :loading="loading">
                新規投稿作成
            </el-button>
        </div>

        <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            v-loading="loading"
            v-if="sortedPosts.length > 0"
        >
            <div
                v-for="post in sortedPosts"
                :key="post.id"
                class="bg-white rounded-lg shadow overflow-hidden"
            >
                <div class="relative aspect-square">
                    <img
                        :src="post.image_url"
                        :alt="post.caption || 'Nail design'"
                        class="w-full h-full object-cover"
                        @error="() => handleImageError(post)"
                    />
                    <div class="absolute top-2 right-2">
                        <el-tag
                            v-if="post.status === 'scheduled'"
                            type="warning"
                            >予約済み</el-tag
                        >
                        <el-tag
                            v-else-if="post.status === 'published'"
                            type="success"
                            >投稿済み</el-tag
                        >
                        <el-tag v-else type="info">下書き</el-tag>
                    </div>
                </div>

                <div class="p-4">
                    <p class="text-sm text-gray-500 mb-2">
                        {{ post.scheduled_time || "未予約" }}
                    </p>
                    <p class="font-medium mb-2 line-clamp-2">
                        {{ post.caption }}
                    </p>
                    <div class="flex flex-wrap gap-1 mb-3">
                        <el-tag
                            v-for="(tag, index) in post.hashtags"
                            :key="index"
                            size="small"
                            effect="plain"
                        >
                            {{ tag }}
                        </el-tag>
                    </div>

                    <div class="flex justify-between mt-4">
                        <el-button size="small" @click="editPost(post)"
                            >編集</el-button
                        >
                        <el-button
                            size="small"
                            type="primary"
                            :disabled="post.status === 'published'"
                            @click="
                                post.status === 'scheduled'
                                    ? unschedulePost(post)
                                    : schedulePost(post)
                            "
                        >
                            {{
                                post.status === "scheduled"
                                    ? "予約解除"
                                    : "予約投稿"
                            }}
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Post Dialog -->
        <el-dialog
            v-model="showCreatePostDialog"
            :title="editingPost ? 'Instagram投稿編集' : 'Instagram投稿作成'"
            width="600px"
        >
            <el-form :model="postForm" label-position="top">
                <div class="mb-4">
                    <div
                        class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
                    >
                        <div v-if="postForm.image_url" class="mb-4">
                            <img
                                :src="postForm.image_url"
                                alt="プレビュー"
                                class="max-h-60 mx-auto object-contain"
                            />
                        </div>
                        <el-upload
                            action="#"
                            :auto-upload="false"
                            :show-file-list="false"
                            :on-change="handleImageChange"
                            accept="image/jpeg,image/png,image/gif"
                        >
                            <el-button type="primary" plain>{{
                                postForm.image_url
                                    ? "画像を変更"
                                    : "画像をアップロード"
                            }}</el-button>
                            <p class="mt-2 text-sm text-gray-500">
                                ネイルデザインの高品質な画像をアップロードしてください
                            </p>
                        </el-upload>
                    </div>
                </div>

                <el-form-item label="キャプション">
                    <el-input
                        v-model="postForm.caption"
                        type="textarea"
                        rows="3"
                        placeholder="投稿のキャプションを入力してください..."
                    />
                </el-form-item>

                <el-form-item label="ハッシュタグ">
                    <el-select
                        v-model="postForm.hashtags"
                        multiple
                        filterable
                        allow-create
                        default-first-option
                        placeholder="ハッシュタグを追加 (例: #ネイルアート)"
                        class="w-full"
                    >
                        <el-option
                            v-for="tag in commonHashtags"
                            :key="tag"
                            :label="tag"
                            :value="tag"
                        />
                    </el-select>
                </el-form-item>

                <el-form-item label="投稿予約">
                    <el-date-picker
                        v-model="postForm.scheduled_time"
                        type="datetime"
                        placeholder="日時を選択"
                        class="w-full"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showCreatePostDialog = false"
                        >キャンセル</el-button
                    >
                    <el-button type="primary" @click="savePost">
                        {{ editingPost ? "投稿を更新" : "投稿を作成" }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useInstagramStore } from "~/stores/instagram";
import { useSupabase } from "~/composables/useSupabase";
import { useRuntimeConfig } from "#app";

const config = useRuntimeConfig();
const { supabase } = useSupabase();
const instagramStore = useInstagramStore();
const showCreatePostDialog = ref(false);
const editingPost = ref(false);
const editingPostId = ref(null);
const uploadingImage = ref(false);

const loading = computed(() => instagramStore.loading);
const error = computed(() => instagramStore.error);
const sortedPosts = computed(() => instagramStore.sortedPosts);

// Form model
const postForm = reactive({
    image_url: "",
    caption: "",
    hashtags: [],
    scheduled_time: null,
});

// Common hashtags for suggestions
const commonHashtags = [
    "#ネイルアート",
    "#ジェルネイル",
    "#ネイルデザイン",
    "#マニキュア",
    "#ネイル",
    "#ネイルサロン",
    "#ネイリスト",
    "#ネイル好き",
    "#美甲",
    "#ネイルスタイル",
];

const handleImageError = async (post) => {
    try {
        // postオブジェクトの存在確認
        if (!post) {
            console.error("投稿データが存在しません");
            return;
        }

        // 画像のURLとパスの詳細をログ
        const imageUrl = post.image_url;

        // URLが存在しない場合は処理を中断
        if (!imageUrl) {
            console.error("画像URLが存在しません:", {
                id: post.id,
                status: post.status,
            });
            return;
        }

        // URLからファイル名を抽出
        const fileName = imageUrl.split("/").pop();

        console.log("画像の詳細情報:", {
            投稿ID: post.id,
            投稿ステータス: post.status,
            完全なURL: imageUrl,
            ファイル名: fileName,
        });

        // ストレージでの存在確認
        const { data: exists, error: listError } = await supabase.storage
            .from("instagram")
            .list("", {
                search: fileName,
            });

        if (listError) {
            console.error("ストレージリストのエラー:", listError);
            return;
        }

        if (!exists || exists.length === 0) {
            console.log("ストレージに画像が見つかりません:", fileName);
            // ストレージに存在しない場合は投稿を削除
            if (post.status === "scheduled") {
                instagramStore.scheduledPosts =
                    instagramStore.scheduledPosts.filter(
                        (p) => p.id !== post.id
                    );
            } else {
                instagramStore.posts = instagramStore.posts.filter(
                    (p) => p.id !== post.id
                );
            }
        } else {
            console.log("画像はストレージに存在します:", {
                検索結果: exists,
                ファイル名: fileName,
            });
        }
    } catch (error) {
        console.error("予期せぬエラーが発生:", error);
    }
};

const loadPosts = async () => {
    try {
        // 投稿データの取得
        await Promise.all([
            instagramStore.fetchPosts(),
            instagramStore.fetchScheduledPosts(),
        ]);

        // ストレージの内容を取得
        const { data: storageFiles, error: storageError } =
            await supabase.storage.from("instagram").list("instagram");

        if (storageError) {
            console.error("Storage list error:", storageError);
            return;
        }

        // ストレージに存在するファイル名のセットを作成
        const existingFiles = new Set(
            storageFiles.map((file) => `instagram/${file.name}`)
        );

        // ストレージに存在しない画像の投稿を非表示にする
        instagramStore.posts = instagramStore.posts.filter((post) => {
            const fileName = post.image_url.split("/").slice(-2).join("/");
            return existingFiles.has(fileName);
        });

        instagramStore.scheduledPosts = instagramStore.scheduledPosts.filter(
            (post) => {
                const fileName = post.image_url.split("/").slice(-2).join("/");
                return existingFiles.has(fileName);
            }
        );
    } catch (e) {
        console.error("Error loading posts:", e);
        ElMessage.error("投稿の取得に失敗しました");
    }
};

// ファイルのバリデーション関数
const validateFile = (file) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
            "許可されていないファイル形式です。JPG、PNG、GIFのみアップロード可能です。"
        );
    }

    if (file.size > MAX_SIZE) {
        throw new Error(
            "ファイルサイズが大きすぎます。5MB以下にしてください。"
        );
    }
};

// ユニークなファイル名を生成する関数
const generateUniqueFileName = (originalName) => {
    const fileExt = originalName.split(".").pop();
    return `${Date.now()}.${fileExt}`;
};

// 失敗したアップロードを削除する関数
const deleteFailedUpload = async (fileName) => {
    try {
        await supabase.storage.from("instagram").remove([fileName]);
    } catch (error) {
        console.error("Failed to cleanup:", error);
    }
};

const handleImageChange = async (file) => {
    if (file.raw) {
        uploadingImage.value = true;
        let fileName = "";
        try {
            // ファイルのバリデーション
            validateFile(file.raw);

            // ユニークなファイル名の生成
            fileName = generateUniqueFileName(file.raw.name);

            // Supabase Storageへのアップロード
            const { data: uploadData, error: uploadError } =
                await supabase.storage
                    .from("instagram")
                    .upload(`instagram/${fileName}`, file.raw);

            if (uploadError) throw uploadError;

            // 公開URLの取得
            const {
                data: { publicUrl },
            } = supabase.storage
                .from("instagram")
                .getPublicUrl(`instagram/${fileName}`);

            // フォームの画像URLを更新
            postForm.image_url = publicUrl;
            ElMessage.success("画像をアップロードしました");
        } catch (error) {
            console.error("Upload error:", error);
            ElMessage.error("画像のアップロードに失敗しました");
            if (fileName) {
                await deleteFailedUpload(`instagram/${fileName}`);
            }
        } finally {
            uploadingImage.value = false;
        }
    }
};

const editPost = (post) => {
    editingPost.value = true;
    editingPostId.value = post.id;

    Object.assign(postForm, {
        image_url: post.image_url,
        caption: post.caption,
        hashtags: [...(post.hashtags || [])],
        scheduled_time: post.scheduled_time,
    });

    showCreatePostDialog.value = true;
};

const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        const fileName = imageUrl.split("/").pop();
        await supabase.storage.from("instagram").remove([fileName]);
    } catch (error) {
        console.error("Delete image error:", error);
    }
};

const savePost = async () => {
    if (!postForm.image_url) {
        ElMessage.error("画像は必須です");
        return;
    }

    if (editingPost.value) {
        try {
            // 更新するデータを準備
            const updateData = {
                image_url: postForm.image_url,
                caption: postForm.caption,
                hashtags: postForm.hashtags,
                scheduled_time: postForm.scheduled_time,
                status: postForm.scheduled_time ? "scheduled" : "draft",
            };

            await instagramStore.updatePost(editingPostId.value, updateData);
            ElMessage.success("投稿を更新しました");
        } catch (e) {
            console.error("更新エラー:", e);
            ElMessage.error("投稿の更新に失敗しました");
            return;
        }
    } else {
        try {
            await instagramStore.createPost({
                image_url: postForm.image_url,
                caption: postForm.caption,
                hashtags: postForm.hashtags,
                scheduled_time: postForm.scheduled_time,
                status: postForm.scheduled_time ? "scheduled" : "draft",
            });
            ElMessage.success("投稿を作成しました");
        } catch (e) {
            console.error("作成エラー:", e);
            ElMessage.error("投稿の作成に失敗しました");
            return;
        }
    }

    resetPostForm();
    showCreatePostDialog.value = false;
    editingPost.value = false;
    editingPostId.value = null;
};

const schedulePost = async (post) => {
    try {
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await instagramStore.updatePost(post.id, {
            ...post,
            scheduled_time: tomorrow,
            status: "scheduled",
        });
        ElMessage.success("投稿を予約しました");
    } catch (e) {
        ElMessage.error("投稿の予約に失敗しました");
    }
};

const unschedulePost = async (post) => {
    try {
        await instagramStore.updatePost(post.id, {
            ...post,
            image_url: post.image_url,
            scheduled_time: null,
            status: "draft",
        });
        ElMessage.success("予約を解除しました");
    } catch (e) {
        ElMessage.error("予約の解除に失敗しました");
    }
};

const resetPostForm = () => {
    Object.assign(postForm, {
        image_url: "",
        caption: "",
        hashtags: [],
        scheduled_time: null,
    });
};

const createNewPost = () => {
    // フォームをリセット
    resetPostForm();
    // 編集モードをオフに
    editingPost.value = false;
    editingPostId.value = null;
    // ダイアログを表示
    showCreatePostDialog.value = true;
};

onMounted(loadPosts);
</script>
