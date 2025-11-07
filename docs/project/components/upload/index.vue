<!-- 文件上传组件 -->
<template>
  <div class="flex flex-wrap">
    <a-upload v-model:file-list="fileList" :showUploadList="false" :maxCount="1" :accept="accept" :before-upload="beforeUpload" :customRequest="customRequest">
      <!-- 上传前 -->
      <div v-show="!isUpload && !fileUrl" class="custom-upload-select flex-direction-column flex-item-center upload-area">
        <plus-outlined class="mb-xs"></plus-outlined>
        <div class="ant-upload-text">选择文件</div>
      </div>
      <!-- 图片 -->
      <template v-if="type === 'img'">
        <common-image v-show="fileUrl" :src="fileUrl" class="upload-img" @changUrl="onChangeUrl" />
        <div v-if="fileUrl" class="preview-mask">
          <eye-outlined class="fz18 cp mr-xs" @click.stop="onPreview()" />
          <delete-outlined class="fz18 cp ml-xs" @click.stop="onDelete()" />
        </div>
      </template>

      <!-- 上传文件时/后的展示：有进度条 -->
      <div v-show="type === 'file' && isUpload" class="flex item-center">
        <div class="tc custom-upload-loading">
          <img :src="imgSrc" />
          <div class="mt-xxs" :class="{ 'e-color': uploadStatus === 'error', 'p-color': uploadStatus === 'uploading', 's-color': uploadStatus === 'success' }">{{ uploadStatusMsg }}</div>
          <div class="custom-upload-close flex item-center">
            <delete-outlined class="fz18 cp" style="color: #fff" @click.stop="onDelete()" />
          </div>
        </div>
        <div class="ml-base" @click.stop="">
          <div class="custom-upload-file-name" :title="fileName?.substr(fileName?.lastIndexOf('/') + 1) || '-'">
            {{ fileName?.substr(fileName?.lastIndexOf('/') + 1) }}
          </div>
          <div class="flex">
            <span style="width: 70px">上传进度：</span>
            <a-progress :percent="uploadProgress" :strokeWidth="4" :status="uploadProgress >= 100 ? 'success' : 'active'" style="width: 200px" />
          </div>
        </div>
      </div>
    </a-upload>

    <!-- 备注 -->
    <div v-if="$slots.tip" :class="getTipClass">
      <slot name="tip"></slot>
    </div>
    <template v-else-if="tips.length > 0">
      <h4 v-if="tips.length === 1" class="custom-tip-style flex-block">{{ tipTitle }}：{{ tips[0] }}</h4>
      <div v-else :class="getTipClass">
        <div>
          <p class="mb8 fz14" v-if="tipTitle">{{ tipTitle }}：</p>
          <p class="fz14 mb6" v-for="(item, index) in tips" :key="index">{{ index + 1 }}：{{ item.label ? item.label + '：' : '' }}{{ item.value }}</p>
        </div>
      </div>
    </template>
  </div>

  <!-- 预览图片 -->
  <BasicModal @register="registerModal" title="查看图片" width="80%" centered destroyOnClose :footer="null" :draggable="true" wrapClassName="upload-image-preview">
    <div class="img-popover">
      <img :src="realUrl" ref="currentImgRef" />
      <div class="img-bottom-popover">
        <zoom-out-outlined class="cp" @click="onZoomOut" />
        <span class="ml-base mr-base">{{ zoom }}%</span>
        <zoom-in-outlined class="cp" @click="onZoomIn" />
        <aim-outlined class="ml-base mr-base cp" @click="onFitCanvas" />
      </div>
    </div>
  </BasicModal>
</template>
<script setup>
import { PlusOutlined, DeleteOutlined, EyeOutlined, ZoomOutOutlined, ZoomInOutlined, AimOutlined } from '@ant-design/icons-vue'
import { confirmModal, closeModel, useModal } from 'gendo-ui-vue3'
import { message } from 'ant-design-vue'
import { isString, classNames, upload } from '@gendo/utils'

import { checkFileType } from '@/utils/common/fileUtils'
import { checkSizeMB } from '@/utils/index'
import { useUploadFile } from '@/hooks/web/useUploadFile'
// const UPLOAD_STATIC_NAMES = ['custom-image', 'custom-script']
const props = defineProps(uploadProps)

// 上传后img中展示的图片
const imgSrc = computed(() => props.showImg || new URL('@/assets/icon/compressed.svg', import.meta.url).href)

// 备注----start
const tips = computed(() => (isString(props.tipList) ? [props.tipList] : props.tipList))
const isTipRight = computed(() => (props.type === 'img' && tips.value.length > 0 && tips.value.length < 4) || props.tipPosition === 'right')
const getTipClass = computed(() => classNames('upload-tip item-center', isTipRight.value ? 'ml-base flex-center' : 'flex-block mt16'))
// 备注----end

// 图片查看--start
const currentImgRef = ref()
const zoom = ref(100)
const onZoomIn = () => {
  const scale = zoom.value + 10
  currentImgRef.value.style.scale = Math.min(scale * 0.01, 1)
  zoom.value = Math.min(scale, 100)
}
const onZoomOut = () => {
  const scale = zoom.value - 10
  currentImgRef.value.style.scale = Math.max(scale * 0.01, 0.1)
  zoom.value = Math.max(scale, 10)
}
const onFitCanvas = () => {
  currentImgRef.value.style.scale = 1
  zoom.value = 100
}
// 图片查看 --- end
const emit = defineEmits(['success', 'progress', 'error', 'update:url', 'returnKey', 'deleteUploadFile'])

const fileList = ref([])
const fileName = ref(undefined)
const fileUrl = ref() //回填图片地址
let uploadFile = undefined
const bucketName = props.bucketName || 'font-end'
const isUpload = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadStatusMsg = ref('')
const isDelete = ref(false)
const isUploaded = ref(false)

const deleteUpload = (isNotReturn) => {
  if (isDelete.value && fileName.value) {
    isDelete.value = false
    let key = `s3://${bucketName}/${fileName.value}`
    if (uploadObj.value[key]) {
      uploadObj.value[key].isStop = true
    }
    isUploaded.value = false
    if (!isNotReturn) return
  }
}

watch(
  () => props.editFile,
  (val, oldVal) => {
    const isEmpty = JSON.stringify(val) === '{}'
    if (!isEmpty && val?.name && !fileName.value) {
      isUploaded.value = true
      fileName.value = props.editFile.name
      isUpload.value = props.editFile.name ? true : false
      if (props.editFile.isUploadStatus === 'UPLOAD_SUCCESS' || props.editFile.isUploadStatus === 'SUCCESS') {
        uploadStatus.value = 'success'
        uploadStatusMsg.value = '文件上传成功'
        uploadProgress.value = 100
      } else if (props.editFile.isUploadStatus === 'UPLOADING') {
        uploadStatus.value = 'uploading'
        uploadStatusMsg.value = '文件上传中'
      } else if (props.editFile.isUploadStatus === 'UPLOAD_FAILED' || props.editFile.isUploadStatus === 'FAILED') {
        uploadStatus.value = 'error'
        uploadStatusMsg.value = '文件上传失败'
        uploadProgress.value = 100
      } else {
        uploadStatus.value = ''
        uploadStatusMsg.value = ''
        uploadProgress.value = 0
      }
    } else if (isEmpty && oldVal !== undefined && JSON.stringify(oldVal) !== '{}') {
      isUploaded.value = false
      uploadStatus.value = ''
      fileName.value = ''
      isUpload.value = false
      uploadStatusMsg.value = ''
      uploadProgress.value = 0
    }
  },
  { immediate: true, deep: true }
)
watch(
  () => props.imgUrl,
  (imgUrl) => {
    fileUrl.value = imgUrl
  },
  { immediate: true, deep: true }
)
const setUpload = (hasUpload, uploadData) => {
  isUpload.value = hasUpload
  fileUrl.value = ''
  uploadProgress.value = uploadData?.progress ? Number(uploadData?.progress) : hasUpload ? 100 : 0
  uploadStatus.value = uploadData?.status || (hasUpload ? 'success' : '')
  uploadStatusMsg.value = uploadData?.statusMsg || (hasUpload ? '文件上传成功' : '')
  fileName.value = undefined
}

const checkFileFnc = (file) => {
  return new Promise((resolve, reject) => {
    const uploadType = props.type === 'file' ? '文件' : '图片'
    // 数量

    // 检验格式
    const type = props?.accept || props?.fileType?.join('、')
    if (!checkFileType(file, props.MIMEType)) {
      message.error(`${uploadType}格式不支持,请上传${type}${uploadType}`)
      return reject(true)
    }
    // 校验图片大小、
    if (props.size && props.size > 0) {
      if (!checkSizeMB(file.size, props.size)) {
        message.error(`${uploadType}超过${props.size}mb,请调整${uploadType}后重新上传`)
        return reject(true)
      }
    }
    return resolve(true)
  })
}

//上传前操作
const beforeUpload = async (file) => {
  let checkResult = null
  // if (props.checkFile) {
  //   checkResult = await props.checkFile(file)
  // }
  checkResult = await checkFileFnc(file)
  return new Promise((resolve, reject) => {
    // if (props.checkFile && !checkResult) {
    if (!checkResult) {
      reject(true)
      return
    }
    // isUploadSuccess = false
    uploadFile = file
    uploadStatus.value = ref('waiting')
    if (isUploaded.value) {
      stopUpload()
      setUpload(false)
      emit('deleteUploadFile', true)
    }
    resolve(true)
  })
}

const {
  uploadFile: uploadFileMethod,
  uploadObj,
  uploadListObj
} = useUploadFile({
  uploadApi: props.uploadApi,
  isMultipartCallback: true,
  isForceMultipart: props.isForceMultipart,
  errorMsg: (data) => {
    let name = data?.fileName?.substring(data?.fileName?.lastIndexOf('/') + 1)
    fileName.value = name || undefined
    message.error({
      content: `文件上传失败，请重新上传`,
      key: 'fileError'
    })
    uploadStatusMsg.value = '文件上传失败'
    console.log('errorMsg', data)
    emit('error', data)
  },
  callback: (...args) => {
    const upload = args[5]
    emit('returnKey', upload) //  返回上传的file信息(s3地址等均可获取到)
    if (upload?.isStop && !props.isForceReUpload) return
    fileName.value = upload.fileName
    uploadProgress.value = Number(upload.progress)
    if (upload.status === 1 && Number(upload.progress) >= 100) {
      // 上传成功
      uploadProgress.value = 100
      fileUrl.value = upload.bucketName + '/' + upload.fileName
      emit('success', upload)
      uploadStatusMsg.value = '文件上传成功'
      // isUploadSuccess = true
    } else {
      // 上传中/上传失败
      upload.status === -1 ? emit('error', upload) && (uploadStatusMsg.value = '文件上传失败') : (uploadStatusMsg.value = '文件上传中')
    }
    // emit('progress', uploadProgress.value)
    emit('progress', { [upload.key]: upload })
    emit('update:url', upload.key)
  }
})

watch(
  () => uploadObj.value,
  (uploadObj) => {
    if (Object.getOwnPropertyNames(uploadObj).length > 0) {
      deleteUpload()
      if (fileName.value && props?.editFile?.name) {
        let key = `s3://${bucketName}/${fileName.value}`
        uploadObj.value[key] ? (uploadObj.value[key].isStop = false) : undefined
        uploadProgress.value = uploadObj[key]?.progress || (props?.editFile?.name ? 100 : 0)
      } else if (props?.editFile?.name) {
        uploadProgress.value = 100
      }
      if (uploadProgress.value >= 100) {
        uploadStatus.value = 'success'
        uploadStatusMsg.value = '文件上传成功'
      }
    }
  },
  { deep: true }
)

const customRequest = async () => {
  isUpload.value = true
  isUploaded.value = true
  uploadFileMethod(uploadFile, { bucketName: props.bucketName })
}

const onDelete = () => {
  const type = props.type === 'file' ? '文件' : '图片'
  confirmModal({
    title: '删除',
    content: `确定删除${type}？`,
    okText: '删除',
    onOk: async () => {
      isDelete.value = true
      isUploaded.value = true
      closeModel()
      deleteUpload(true)
      setUpload(false)
      emit('deleteUploadFile')
      emit('update:url', '')
      emit('success', {}, true)
    }
  })
  return
}

const stopUpload = async () => {
  isDelete.value = true
  await deleteUpload(true)
}

//查看图片

const onChangeUrl = (url) => {
  realUrl.value = url
}
const onPreview = () => {
  openModal()
}

const realUrl = ref()
const [registerModal, { openModal }] = useModal()

defineExpose({ uploadStatus, stopUpload })
</script>

<style lang="less" scoped>
.custom-upload-loading {
  width: 112px;
  height: 112px;
  text-align: center;
  padding-top: 10px;
  background: #f9f9f9;
  position: relative;
  &:hover {
    .custom-upload-close {
      opacity: 1;
    }
  }
  .custom-upload-close {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 26, 68, 0.45);
    opacity: 0;
    transition: all 0.3s;
    justify-content: center;
  }
}
.custom-upload-file-name {
  margin-bottom: 10px;
  max-width: 320px;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
  white-space: nowrap;
}
.upload-img {
  width: 277px;
  height: 165px;
  object-fit: contain;
}
.preview-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 277px;
  height: 165px;
  background-color: @text-color-secondary;
  color: fade(@white, 65%);
  justify-content: center;
  align-items: center;
  display: none;
}

:deep(.ant-upload) {
  &:hover .preview-mask {
    display: flex;
  }
}
.upload-tip {
  line-height: initial;
  margin-bottom: 0;
  .tip-title {
    color: @text-color;
  }
  .tip-word {
    color: @text-color-secondary;
  }
}
.flex-block {
  flex: 1 0 100%;
}
</style>
<style lang="less">
.upload-image-preview {
  .scrollbar__view > div {
    text-align: center;
    img {
      max-width: 100%;
      height: 100%;
      height: 80vh;
      object-fit: contain;
    }
  }
}
.fullscreen-modal.upload-image-preview {
  .scrollbar__view > div {
    img {
      min-height: auto;
      max-height: 100%;
    }
  }
}
.img-popover {
  position: relative;
  width: 100%;
  margin: auto;
  background: @layout-body-background;

  img {
    width: 100%;
  }
  .img-bottom-popover {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 100%;
    height: 40px;
    background: @text-color-secondary;
    margin: auto;
    transform: translateX(-50%);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    color: @white;
    user-select: none;
  }
}
</style>
