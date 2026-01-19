<template>
  <div class="editor-view">
    <div class="editor-header">
      <h2>编辑图纸</h2>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="handleCancel">取消</button>
        <button class="btn btn-primary" @click="handleSave">保存</button>
      </div>
    </div>

    <TemplateEditor
      v-if="templateData"
      :pixels="editablePixels"
      :available-colors="availableColors"
      :cell-size="20"
      @update:pixels="handlePixelsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { TemplateData, PixelInfo, BeadColor } from '@/types'
import TemplateEditor from './TemplateEditor.vue'
import { getColorPalette } from '@/assets/data/beadColors'

interface Props {
  templateId?: string
}

const props = defineProps<Props>()
const router = useRouter()

const templateData = ref<TemplateData | null>(null)
const editablePixels = ref<PixelInfo[][]>([])

// 获取可用颜色
const availableColors = computed(() => {
  if (!templateData.value) return []
  return getColorPalette(templateData.value.brand)
})

// 加载模板数据
onMounted(() => {
  // 这里应该从 store 或路由参数加载模板数据
  // 示例：从 localStorage 加载
  if (props.templateId) {
    const stored = localStorage.getItem(`template_${props.templateId}`)
    if (stored) {
      templateData.value = JSON.parse(stored)
      editablePixels.value = templateData.value?.pixels || []
    }
  }
})

// 处理像素更新
const handlePixelsUpdate = (pixels: PixelInfo[][]) => {
  editablePixels.value = pixels
}

// 保存编辑
const handleSave = () => {
  if (!templateData.value) return

  // 更新模板数据
  templateData.value.pixels = editablePixels.value

  // 保存到 localStorage
  localStorage.setItem(`template_${templateData.value.id}`, JSON.stringify(templateData.value))

  // 返回上一页或跳转到预览页
  router.back()
}

// 取消编辑
const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.editor-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.editor-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #4caf50;
  color: #fff;
}

.btn-primary:hover {
  background: #45a049;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
