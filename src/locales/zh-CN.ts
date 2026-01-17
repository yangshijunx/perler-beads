export default {
  // App wide
  appName: '拼豆模版生成器',
  appSubtitle: '将图片转换为漂亮的拼豆图案',

  // Navigation
  nav: {
    home: '首页',
    history: '历史记录',
    backToEditor: '返回编辑器'
  },

  // Home page
  home: {
    title: '拼豆模版生成器',
    subtitle: '将图片转换为漂亮的拼豆图案',
    section1: '上传图片',
    section2: '配置设置',
    section3: '生成模版'
  },

  // Image Uploader
  imageUploader: {
    title: '点击或拖拽上传图片',
    subtitle: '支持 JPG、PNG、GIF 格式',
    cropImage: '裁剪图片',
    rotateLeft: '向左旋转',
    rotateRight: '向右旋转',
    zoomIn: '放大',
    zoomOut: '缩小',
    apply: '应用',
    cancel: '取消',
    clear: '清除'
  },

  // Size Selector
  sizeSelector: {
    beadSize: '豆子尺寸',
    gridSize: '网格大小',
    gridWidth: '宽度（豆子数）',
    gridHeight: '高度（豆子数）',
    presets: {
      small: '小',
      medium: '中',
      large: '大',
      xl: '超大'
    },
    sizes: {
      mini: '迷你',
      regular: '常规',
      maxi: '加大',
      mega: '特大'
    },
    estimatedSize: '预估尺寸',
    width: '宽度',
    height: '高度',
    totalBeads: '总豆子数'
  },

  // Color Palette
  colorPalette: {
    title: '色板',
    colorsAvailable: '{count} 种颜色可用',
    selectedColor: '已选颜色',
    code: '色号',
    brand: '品牌'
  },

  // Template Generator
  templateGenerator: {
    noTemplate: '未生成模版',
    noTemplateDesc: '上传图片并点击"生成模版"开始',
    templateName: '模版名称',
    templateInfo: '{width} × {height} 豆 · {size} · {brand} · {pages} 页',
    settings: '设置',
    showGrid: '显示网格',
    showColorCodes: '显示色号',
    showColors: '显示颜色',
    cellSize: '单元格大小',
    zoomLevel: '{percent}%',
    resetZoom: '重置缩放',
    colorLegend: '色号对照表',
    colors: '种颜色',
    exportPNG: '导出 PNG',
    print: '打印'
  },

  // Processing
  processing: {
    generate: '生成模版',
    generating: '生成中...',
    processing: '处理中...'
  },

  // Brands
  brands: {
    hama: 'Hama',
    perler: 'Perler',
    artkal: 'Artkal',
    nabbi: 'Nabbi'
  },

  // Bead Sizes
  beadSizes: {
    mini: '迷你',
    regular: '常规',
    maxi: '加大',
    mega: '特大'
  },

  // History
  history: {
    title: '历史记录',
    noHistory: '暂无历史记录',
    noHistoryDesc: '您的生成历史将显示在这里',
    selectTemplate: '选择模版',
    clearAll: '全部清除',
    delete: '删除',
    confirmDelete: '确定要删除此模版吗？',
    confirmClearAll: '确定要清除所有历史记录吗？此操作无法撤销。',
    edit: '编辑',
    export: '导出',
    colorStatistics: '颜色统计',
    page: '第 {current} 页，共 {total} 页',
    rows: '行',
    cols: '列',
    today: '今天',
    yesterday: '昨天',
    daysAgo: '{days} 天前',
    weeksAgo: '{weeks} 周前'
  },

  // Settings
  settings: {
    advancedOptions: '高级选项',
    enableDithering: '启用抖动处理',
    language: '语言',
    theme: '主题'
  },

  // Errors
  errors: {
    failedToLoadImage: '加载图片失败',
    failedToGenerate: '生成模版失败，请重试',
    failedToSave: '保存失败',
    fileNotSupported: '不支持的文件类型',
    fileTooLarge: '文件过大'
  },

  // Common
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    export: '导出',
    print: '打印',
    share: '分享',
    download: '下载',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    done: '完成',
    loading: '加载中...',
    success: '成功',
    error: '错误'
  }
}
