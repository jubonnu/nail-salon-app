<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Instagram投稿管理</h1>
      <el-button 
        type="primary" 
        @click="showCreatePostDialog = true"
        :loading="loading"
      >
        新規投稿作成
      </el-button>
    </div>
    
    <div 
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      v-loading="loading"
      v-if="sortedPosts.length > 0"
    >
      <div v-for="post in sortedPosts" :key="post.id" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="relative aspect-square">
          <img 
            :src="post.image_url" 
            :alt="post.caption || 'Nail design'" 
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
          <div class="absolute top-2 right-2">
            <el-tag v-if="post.status === 'scheduled'" type="warning">予約済み</el-tag>
            <el-tag v-else-if="post.status === 'published'" type="success">投稿済み</el-tag>
            <el-tag v-else type="info">下書き</el-tag>
          </div>
        </div>
        
        <div class="p-4">
          <p class="text-sm text-gray-500 mb-2">{{ post.scheduled_time || '未予約' }}</p>
          <p class="font-medium mb-2 line-clamp-2">{{ post.caption }}</p>
          <div class="flex flex-wrap gap-1 mb-3">
            <el-tag v-for="(tag, index) in post.hashtags" :key="index" size="small" effect="plain">
              {{ tag }}
            </el-tag>
          </div>
          
          <div class="flex justify-between mt-4">
            <el-button size="small" @click="editPost(post)">編集</el-button>
            <el-button 
              size="small" 
              type="primary" 
              :disabled="post.status === 'published'"
              @click="post.status === 'scheduled' ? unschedulePost(post) : schedulePost(post)"
            >
              {{ post.status === 'scheduled' ? '予約解除' : '予約投稿' }}
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
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div v-if="postForm.image_url" class="mb-4">
              <img :src="postForm.image_url" alt="プレビュー" class="max-h-60 mx-auto object-contain" />
            </div>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
            >
              <el-button type="primary" plain>{{ postForm.image_url ? '画像を変更' : '画像をアップロード' }}</el-button>
              <p class="mt-2 text-sm text-gray-500">ネイルデザインの高品質な画像をアップロードしてください</p>
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
          <el-button @click="showCreatePostDialog = false">キャンセル</el-button>
          <el-button type="primary" @click="savePost">
            {{ editingPost ? '投稿を更新' : '投稿を作成' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useInstagramStore } from '~/stores/instagram';

const instagramStore = useInstagramStore();
const showCreatePostDialog = ref(false);
const editingPost = ref(false);
const editingPostId = ref(null);
const fallbackImageUrl = 'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg';

// Sample nail design images from Pexels
const sampleImages = [
  'https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg',
  'https://images.pexels.com/photos/3997391/pexels-photo-3997391.jpeg',
  'https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg',
  'https://images.pexels.com/photos/1638340/pexels-photo-1638340.jpeg',
  'https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg'
];

const loading = computed(() => instagramStore.loading);
const error = computed(() => instagramStore.error);
const sortedPosts = computed(() => instagramStore.sortedPosts);

// Form model
const postForm = reactive({
  image_url: '',
  caption: '',
  hashtags: [],
  scheduled_time: null
});

// Common hashtags for suggestions
const commonHashtags = [
  '#ネイルアート',
  '#ジェルネイル',
  '#ネイルデザイン',
  '#マニキュア',
  '#ネイル',
  '#ネイルサロン',
  '#ネイリスト',
  '#ネイル好き',
  '#美甲',
  '#ネイルスタイル'
];

const handleImageError = (event) => {
  // Only update the display source, don't persist to database
  event.target.src = fallbackImageUrl;
};

const loadPosts = async () => {
  try {
    await Promise.all([
      instagramStore.fetchPosts(),
      instagramStore.fetchScheduledPosts()
    ]);
  } catch (e) {
    ElMessage.error('投稿の取得に失敗しました');
  }
};

const handleImageChange = (file) => {
  if (file.raw) {
    // Select a random sample image
    const randomIndex = Math.floor(Math.random() * sampleImages.length);
    postForm.image_url = sampleImages[randomIndex];
  }
};

const editPost = (post) => {
  editingPost.value = true;
  editingPostId.value = post.id;
  
  Object.assign(postForm, {
    image_url: post.image_url,
    caption: post.caption,
    hashtags: [...(post.hashtags || [])],
    scheduled_time: post.scheduled_time
  });
  
  showCreatePostDialog.value = true;
};

const savePost = async () => {
  if (!postForm.image_url) {
    ElMessage.error('画像は必須です');
    return;
  }

  if (editingPost.value) {
    try {
      await instagramStore.updatePost(editingPostId.value, {
        image_url: postForm.image_url,
        caption: postForm.caption,
        hashtags: postForm.hashtags,
        scheduled_time: postForm.scheduled_time,
        status: postForm.scheduled_time ? 'scheduled' : 'draft'
      });
      ElMessage.success('投稿を更新しました');
    } catch (e) {
      ElMessage.error('投稿の更新に失敗しました');
      return;
    }
  } else {
    try {
      await instagramStore.createPost({
        image_url: postForm.image_url,
        caption: postForm.caption,
        hashtags: postForm.hashtags,
        scheduled_time: postForm.scheduled_time,
        status: postForm.scheduled_time ? 'scheduled' : 'draft'
      });
      ElMessage.success('投稿を作成しました');
    } catch (e) {
      ElMessage.error('投稿の作成に失敗しました');
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
      status: 'scheduled'
    });
    ElMessage.success('投稿を予約しました');
  } catch (e) {
    ElMessage.error('投稿の予約に失敗しました');
  }
};

const unschedulePost = async (post) => {
  try {
    await instagramStore.updatePost(post.id, {
      ...post,
      scheduled_time: null,
      status: 'draft'
    });
    ElMessage.success('予約を解除しました');
  } catch (e) {
    ElMessage.error('予約の解除に失敗しました');
  }
};

const resetPostForm = () => {
  Object.assign(postForm, {
    image_url: '',
    caption: '',
    hashtags: [],
    scheduled_time: null
  });
};

onMounted(loadPosts);
</script>