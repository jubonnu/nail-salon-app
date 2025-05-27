<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Instagram投稿管理</h1>
      <el-button type="primary" @click="showCreatePostDialog = true">
        新規投稿作成
      </el-button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="post in instagramPosts" :key="post.id" class="bg-white rounded-lg shadow overflow-hidden">
        <div class="relative aspect-square">
          <img :src="post.imageUrl" alt="Nail design" class="w-full h-full object-cover" />
          <div class="absolute top-2 right-2">
            <el-tag v-if="post.status === 'scheduled'" type="warning">予約済み</el-tag>
            <el-tag v-else-if="post.status === 'published'" type="success">投稿済み</el-tag>
            <el-tag v-else type="info">下書き</el-tag>
          </div>
        </div>
        
        <div class="p-4">
          <p class="text-sm text-gray-500 mb-2">{{ post.scheduledDate || '未予約' }}</p>
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
            <div v-if="postForm.imageUrl" class="mb-4">
              <img :src="postForm.imageUrl" alt="プレビュー" class="max-h-60 mx-auto object-contain" />
            </div>
            <el-upload
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
            >
              <el-button type="primary" plain>{{ postForm.imageUrl ? '画像を変更' : '画像をアップロード' }}</el-button>
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
            v-model="postForm.scheduledDate"
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
import { ref, reactive } from 'vue';

// State
const showCreatePostDialog = ref(false);
const editingPost = ref(false);
const editingPostId = ref(null);

// Sample data
const instagramPosts = ref([
  {
    id: 1,
    imageUrl: 'https://images.pexels.com/photos/704815/pexels-photo-704815.jpeg',
    caption: '桜をイメージしたジェルネイル。春にぴったりのデザインです！✨💅',
    hashtags: ['#ネイルアート', '#ジェルネイル', '#桜ネイル', '#春ネイル'],
    status: 'published',
    publishedDate: '2024-03-28',
    scheduledDate: null
  },
  {
    id: 2,
    imageUrl: 'https://images.pexels.com/photos/3997385/pexels-photo-3997385.jpeg',
    caption: 'モダンなアレンジを加えたエレガントなフレンチネイル。クラシックは永遠に色褪せません！',
    hashtags: ['#フレンチネイル', '#ネイルデザイン', '#エレガントネイル'],
    status: 'scheduled',
    publishedDate: null,
    scheduledDate: '2024-04-05 10:00'
  },
  {
    id: 3,
    imageUrl: 'https://images.pexels.com/photos/2253833/pexels-photo-2253833.jpeg',
    caption: '明るく鮮やかな夏カラーで気分を上げましょう！お気に入りの色はどれですか？',
    hashtags: ['#夏ネイル', '#カラフルネイル', '#ネイルデザイン'],
    status: 'draft',
    publishedDate: null,
    scheduledDate: null
  }
]);

// Form model
const postForm = reactive({
  imageUrl: '',
  caption: '',
  hashtags: [],
  scheduledDate: null
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

// Methods
const handleImageChange = (file) => {
  // In a real implementation, this would upload the file to a server
  // For demo purposes, we'll use a URL.createObjectURL or a placeholder
  if (file.raw) {
    // Simulate image upload
    postForm.imageUrl = URL.createObjectURL(file.raw);
  }
};

const editPost = (post) => {
  editingPost.value = true;
  editingPostId.value = post.id;
  
  // Populate form with post data
  postForm.imageUrl = post.imageUrl;
  postForm.caption = post.caption;
  postForm.hashtags = [...post.hashtags];
  postForm.scheduledDate = post.scheduledDate;
  
  showCreatePostDialog.value = true;
};

const savePost = () => {
  if (editingPost.value) {
    // Update existing post
    const postIndex = instagramPosts.value.findIndex(p => p.id === editingPostId.value);
    if (postIndex !== -1) {
      const updatedPost = {
        ...instagramPosts.value[postIndex],
        imageUrl: postForm.imageUrl,
        caption: postForm.caption,
        hashtags: [...postForm.hashtags],
        scheduledDate: postForm.scheduledDate,
        status: postForm.scheduledDate ? 'scheduled' : 'draft'
      };
      instagramPosts.value[postIndex] = updatedPost;
    }
  } else {
    // Create new post
    const newPost = {
      id: instagramPosts.value.length + 1,
      imageUrl: postForm.imageUrl,
      caption: postForm.caption,
      hashtags: [...postForm.hashtags],
      scheduledDate: postForm.scheduledDate,
      status: postForm.scheduledDate ? 'scheduled' : 'draft',
      publishedDate: null
    };
    instagramPosts.value.unshift(newPost);
  }
  
  // Reset form and close dialog
  resetPostForm();
  showCreatePostDialog.value = false;
  editingPost.value = false;
  editingPostId.value = null;
};

const schedulePost = (post) => {
  // Open scheduling dialog or directly schedule for a default time
  const postIndex = instagramPosts.value.findIndex(p => p.id === post.id);
  if (postIndex !== -1) {
    // For demo, just set a date 1 day in the future
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    instagramPosts.value[postIndex] = {
      ...post,
      scheduledDate: tomorrow.toLocaleString(),
      status: 'scheduled'
    };
  }
};

const unschedulePost = (post) => {
  const postIndex = instagramPosts.value.findIndex(p => p.id === post.id);
  if (postIndex !== -1) {
    instagramPosts.value[postIndex] = {
      ...post,
      scheduledDate: null,
      status: 'draft'
    };
  }
};

const resetPostForm = () => {
  postForm.imageUrl = '';
  postForm.caption = '';
  postForm.hashtags = [];
  postForm.scheduledDate = null;
};
</script>