<script setup lang="ts">
const { t } = useI18n()

interface CommentData {
  id: number
  forumSubjectId: number
  forumCommentId: number | null
  userId: number
  displayName: string
  addressedTo: string | null
  destUserId: number | null
  content: string
  status: string
  isPinned: boolean
  isStaff: boolean
  likes: number[]
  createdAt: string
  updatedAt: string | null
}

const props = withDefaults(defineProps<{
  comment: CommentData
  parentComment?: CommentData | null
  hasReplies?: boolean
  userId: number
  isMod: boolean
  lang: string
  readOnly?: boolean
}>(), {
  hasReplies: false,
  readOnly: false,
  parentComment: null,
})

const emit = defineEmits<{
  like: [id: number]
  reply: [comment: CommentData]
  refresh: []
}>()

const expanded = ref(false)
const isEditing = ref(false)
const editText = ref(props.comment.content)
const saving = ref(false)
const confirmDelete = ref(false)

const withinEditWindow = ref(false)
onMounted(() => {
  withinEditWindow.value = Date.now() - new Date(props.comment.createdAt).getTime() < 3_600_000
})

const likes = computed(() => Array.isArray(props.comment.likes) ? props.comment.likes as number[] : [])
const liked = computed(() => likes.value.includes(props.userId))
const isLevel1 = computed(() => props.comment.forumCommentId !== null)
const isOwner = computed(() => props.comment.userId === props.userId)
const canEdit = computed(() => !props.readOnly && isOwner.value && withinEditWindow.value)
const canDelete = computed(() => !props.readOnly && isOwner.value && !props.hasReplies)
const isHidden = computed(() => props.comment.status === 'hidden')
const isLong = computed(() => props.comment.content.length > 200 || props.comment.content.split('\n').length > 3)

async function handleSaveEdit() {
  if (!editText.value.trim()) return
  saving.value = true
  await $fetch(`/api/forum/comments/${props.comment.id}`, {
    method: 'PATCH',
    body: { action: 'update', content: editText.value.trim() },
  })
  saving.value = false
  isEditing.value = false
  emit('refresh')
}

async function handleDelete() {
  await $fetch(`/api/forum/comments/${props.comment.id}`, { method: 'DELETE' })
  emit('refresh')
}

async function handleToggleHide() {
  await $fetch(`/api/forum/comments/${props.comment.id}`, {
    method: 'PATCH',
    body: { action: isHidden.value ? 'unhide' : 'hide' },
  })
  emit('refresh')
}

async function handleTogglePin() {
  await $fetch(`/api/forum/comments/${props.comment.id}`, {
    method: 'PATCH',
    body: { action: props.comment.isPinned ? 'unpin' : 'pin' },
  })
  emit('refresh')
}
</script>

<template>
  <div v-if="!isHidden || isMod" :class="['flex gap-2', isHidden ? 'text-red-400' : '']">
    <span class="text-base mt-0.5">{{ isLevel1 ? '↩️' : '🗨️' }}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline gap-1 flex-wrap text-xs text-muted-foreground">
        <span class="font-medium">{{ comment.displayName }}</span>
        <span>· {{ forumFormatDate(comment.createdAt, lang) }}</span>
        <span v-if="isLevel1 && comment.addressedTo && parentComment" class="text-xs text-muted-foreground">
          (→ {{ comment.addressedTo }} · {{ forumFormatDate(parentComment.createdAt, lang) }})
        </span>
        <span v-if="isHidden && isMod" class="text-xs text-destructive">🚫</span>
        <div class="flex gap-3 items-center">
          <button v-if="!readOnly" class="text-xs text-muted-foreground hover:text-foreground transition-colors" @click="emit('like', comment.id)">
            {{ liked ? '❤️' : '🤍' }}{{ likes.length > 0 ? ` ${likes.length}` : '' }}
          </button>
          <button v-if="!readOnly && !isEditing" class="text-xs text-muted-foreground hover:text-foreground transition-colors" @click="emit('reply', comment)">
            ↩️
          </button>
          <button v-if="canEdit && !isEditing" class="text-xs text-muted-foreground hover:text-foreground transition-colors" @click="isEditing = true">
            ✏️
          </button>
          <template v-if="canDelete">
            <template v-if="confirmDelete">
              <button class="text-red-500 hover:text-red-600 transition-colors text-xs" @click="confirmDelete = false">✖</button>
              <button class="text-green-500 hover:text-green-600 transition-colors text-xs" @click="handleDelete">✔</button>
            </template>
            <button v-else class="text-xs text-muted-foreground hover:text-destructive transition-colors" @click="confirmDelete = true">🗑️</button>
          </template>
          <button v-if="isMod && !readOnly && !isLevel1" class="text-xs text-muted-foreground hover:text-foreground transition-colors" @click="handleTogglePin">
            {{ comment.isPinned ? '📌' : '📍' }}
          </button>
          <button v-if="isMod" class="text-xs text-muted-foreground hover:text-foreground transition-colors" @click="handleToggleHide">
            {{ isHidden ? '✅' : '🚫' }}
          </button>
        </div>
      </div>

      <div v-if="isEditing" class="mt-1 space-y-1">
        <UTextarea v-model="editText" :rows="4" class="text-sm" />
        <div class="flex gap-2">
          <UButton size="xs" :disabled="saving || !editText.trim()" @click="handleSaveEdit">
            {{ saving ? '…' : t('forum.save') }}
          </UButton>
          <UButton size="xs" variant="ghost" @click="isEditing = false; editText = comment.content">
            {{ t('forum.cancel') }}
          </UButton>
        </div>
      </div>
      <template v-else>
        <p
          class="text-sm mt-0.5"
          :class="!expanded && isLong ? 'overflow-hidden max-h-[3.75rem]' : ''"
          v-html="forumRenderWithLinks(comment.content)"
        />
        <button v-if="isLong" class="text-yellow-400 hover:text-yellow-500 transition-colors leading-none" @click="expanded = !expanded">
          {{ expanded ? '▲' : '▼' }}
        </button>
      </template>
    </div>
  </div>
</template>
