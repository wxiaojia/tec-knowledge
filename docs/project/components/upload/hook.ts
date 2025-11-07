import { ref } from 'vue'

import { DEFAULT_BUCKET_NAME, LIST_FILE_UPLOAD_SUCCESS_CODE, LIST_FILE_UPLOAD_ERROR_CODE, putFile, getChunkFileName, getFileChunkList } from '@gendo/utils'
import { isAsyncFunction, isFunction, isArray, to } from '@gendo/utils'
const CHUNK_SIZE = 15 * 1024 * 1024 //分片15M
const DELETE_STORE_TIME = 60 * 1000 //删除缓存时间

/**
 * 上传文件，配置信息
 * @param {Object} options 配置信息
 * @param {String} options.bucketName 存储桶名称 默认DEFAULT_BUCKET_NAME - font-end
 * @param {Number} options.chunkSize 分片大小 默认5M-5 * 1024 * 1024
 * @param {Boolean | Function} options.successRunTask 所有文件上传成功后执行任务
 * @param {Function} options.errorMsg 失败时的错误提示回调
 * @param {Function} options.callback 上传成功或失败的回调函数，如果是list上传，每个文件都会触发。参数 key - 当前文件的key, isSuccess - 是否成功, fileItem - 当前上传文件的item 包含桶名、文件名、id、key等数据, id - listId或者fileId, isLast - 是否是list最后一个文件(只有list才有)
 * @param {Boolean} options.isMultipartCallback 是否是分片上传处理回调函数
 * @param {Boolean} options.isForceMultipart 是否强制触发分片上传
 * @param {Function} options.progressChange 上传进度发生变化
 */

/**
 * uploadObj 对应文件个数(多文件也对应多个文件),存储进度及文件信息,{ fileName: resData, 进度, listId(对应下面的key)}
 * uploadListObj 对应一个upload上传(多文件也对应一个key),存储进度 {key: 进度},(单文件且不分片,就不存在uploadListObj)
 */
/**
 * progress {
 *   loaded: 0, // 已上传的字节数
 *    total: 0, // 总字节数
 *   progress: 0, // 上传进度百分比
 *   status: 0, // 上传状态 0-上传中，1-上传成功，-1-上传失败
 *   statusMsg: '上传中', // 上传状态信息
 * }
 */
/**
 * 单文件存储,添加uploadListObj,
 * 多文件/大文件存储,把uploadObj放入到uploadListObj中
 * 总体返回uploadListObj
 */
export function useUploadFile(options) {
  const uploadObj = ref({})
  const uploadListObj = ref({})

  const task = {}
  const { chunkSize = CHUNK_SIZE, bucketName: defBucketName = DEFAULT_BUCKET_NAME, successRunTask, errorMsg, callback, isMultipartCallback, isForceMultipart, uploadApi, progressChange } = options

  //上传任务
  function addTask(key, data) {
    task[key] = data
  }

  /**执行任务 */
  async function runTask(key, result) {
    const taskData = task[key]
    if (!taskData) {
      console.warn('找不到需要执行的任务,taskId:%s', key)
      return
    }
    let { api, data, beforeFetch, afterFetch } = taskData
    if (!api) return
    if (beforeFetch) {
      if (isAsyncFunction(beforeFetch)) {
        data = await beforeFetch(data, result)
      } else {
        data = beforeFetch(data, result)
      }
    }
    if (!data) return
    await api(data)
    afterFetch && afterFetch(data)
    //1分钟后自动删除
    setTimeout(() => {
      delete task[key]
    }, DELETE_STORE_TIME)
  }

  /**获取缓存数据 */
  function getData(key) {
    return uploadObj.value[key] || {}
  }
  /**设置缓存数据 */
  function setData(key, data) {
    uploadObj.value[key] = data
    // console.log('setData===------', uploadListObj.value, uploadObj.value);
    // progressChange && progressChange({ ...state, list: uploadObj.value })
    return uploadObj.value[key]
  }

  /**初始化缓存数据 */
  function initData(data) {
    return setData(data.key, {
      ...data,
      progress: 0,
      status: 0,
      statusMsg: '上传中'
    })
  }

  /**
   * 上传成功
   * @param {*} key
   * @param {*} url
   * @param {*} data
   * @param {*} listId
   */
  function success(key, url, data, listId, callData = undefined) {
    const state = getData(key)
    setData(key, {
      ...state,
      progress: 100,
      status: 1,
      statusMsg: '上传成功',
      uploadUrl: url.slice(0, Math.max(0, url.lastIndexOf('?'))),
      resData: data
    })
    uploadListLast && updateListData(listId, LIST_FILE_UPLOAD_SUCCESS_CODE, undefined)
    callData && fileCallback(...callData, uploadObj.value[key])
  }

  /**
   * 上传失败
   * @param {*} key
   * @param {*} msg
   * @param {*} listId
   */
  function error(key, msg, listId = '', callData = undefined) {
    const state = getData(key)
    setData(key, {
      ...state,
      status: -1,
      statusMsg: '上传失败',
      msg
    })

    updateListData(listId, LIST_FILE_UPLOAD_ERROR_CODE, -1, msg)
    callData && fileCallback(...callData, uploadObj.value[key])
  }

  /**
   * 更新进度
   * @param {*} key
   * @param {*} _loaded
   */
  function updateProgress(key, _loaded, listId) {
    const state = getData(key)
    const loaded = (state.loaded || 0) + (_loaded || 0)
    setData(key, {
      ...state,
      loaded,
      progress: Number(((loaded / state.total) * 100).toFixed(2))
    })

    updateListData(listId, _loaded, undefined)
  }

  /**
   * 更新列表上传的数据
   * @param {*} id
   * @param {*} loaded
   * @param {*} status
   * @param {*} msg
   * @returns
   */
  function updateListData(id, loaded, status, msg = '', isInit = false) {
    if (!id) return
    if (!uploadListObj.value[id]) {
      uploadListObj.value[id] = {}
    }
    const state = uploadListObj.value[id]
    if (!state.loaded || isInit) {
      state.loaded = 0
    }
    if (loaded === LIST_FILE_UPLOAD_ERROR_CODE) {
      state.status = status ?? 1
      state.statusMsg = '上传失败'
      state.msg = msg
      return
    }
    if (loaded === LIST_FILE_UPLOAD_SUCCESS_CODE) {
      state.loaded = state.total
      state.progress = 100
    } else {
      state.loaded += loaded
      state.progress = state.total ? Number(((state.loaded / state.total) * 100).toFixed(2)) : 0
    }
    if (status != undefined) {
      state.status = status
    } else {
      state.status = state.progress >= 100 ? 1 : 0
    }
    if (state.progress >= 100) {
      state.status = 1
      state.statusMsg = '上传成功'
    }
    progressChange && progressChange({ ...state, listId: id, list: uploadObj.value })
    return state
  }

  /**
   * 单文件上传（小文件）
   * @param {*} file
   * @param {*} param1
   * @returns
   */
  async function uploadPutObject(file, { key, bucketName, fileName }, listId) {
    /**上传文件预签名（生成s3临时上传地址) */
    const res = await uploadApi.presignedPutObject({ bucketName, fileName })
    const { status, data: url } = res || {}
    if (status || !url) {
      error(key, '获取上传地址失败：' + res.msg)
      return false
    }
    try {
      await putFile(url, file)
      success(key, url, undefined, listId)
    } catch (err) {
      error(key, err, listId)
      return false
    }
    return true
  }

  /**
   * 获取文件分片信息，如果不存在则创建分片
   */
  async function getListMultipart({ key, bucketName, fileName }) {
    //如果文件大于切片的大小，分片断点续传
    const [, checkRes] = await to(uploadApi?.listMultipart?.({ bucketName, fileName }))
    const { Uploads = [] } = checkRes?.data || {}
    const uploaded = Uploads.find((m) => m.Key === fileName)
    let uploadId
    let Parts = []
    //如果存在上传的分片，直接取第一个
    if (uploaded) {
      uploadId = uploaded.UploadId
      //获取已上传的分片数据
      const res = await uploadApi?.listParts?.({ bucketName, fileName, uploadId })
      Parts = res?.data?.Parts || []
    } else {
      const res = await uploadApi?.createMultipartUpload?.({ bucketName, fileName })
      const { status = -1, data } = res || {}
      if (status || !data?.UploadId) {
        error(key, '创建分片失败')
        return [false]
      }
      uploadId = data.UploadId
    }
    return [uploadId, Parts]
  }

  function fileCallback(...args) {
    callback && callback(...args)
  }

  async function _autoRunTask(key, result, autoRunTask, taskData) {
    if (!result) return
    // console.log('result', result, key);
    // console.log('uploadObj', uploadObj.value);
    // console.log('uploadListObj', uploadListObj.value);

    //如果执行成功task是函数，就直接执行
    if (isFunction(successRunTask)) {
      const data = isArray(result) ? uploadListObj.value[key] : uploadObj.value[key]
      return successRunTask(data, result, taskData)
    }
    autoRunTask = successRunTask || autoRunTask
    //自动执行任务
    if (autoRunTask) {
      addTask(key, taskData)
      await runTask(key, result)
    }
  }

  let uploadListLast = false // 是否是最后一个

  /**
   * 批量上传文件
   * @param {*} fileList
   * @param {*} id
   * @param {*} autoRunTask 上传完成之后自动执行任务
   * @returns
   */
  async function uploadFileList(fileList, id, autoRunTask = true, taskData) {
    let isSuccess = false
    const keys = []
    const total = fileList.reduce((total, cur) => total + cur.file.size, 0)

    let uploadData
    if (id) {
      uploadData = updateListData(id, 0, 0, undefined, true)
      uploadData.total = total
    }

    for (let i = 0; i < fileList.length; i++) {
      const item = fileList[i]
      const { file, ...other } = item
      uploadListLast = i === fileList.length - 1
      const successKey = await uploadFile(file, other, id)
      fileCallback(successKey, !!successKey, item, id, uploadListLast, uploadListObj.value[id])
      if (!successKey) {
        isSuccess = false
        break
      }
      //不分片的数据添加到已上传
      item.file.size <= CHUNK_SIZE && updateListData(id, item.file.size, undefined)
      keys.push(successKey)
      if (uploadListLast) {
        isSuccess = true
      }
    }
    await _autoRunTask(id, isSuccess ? keys : isSuccess, autoRunTask, taskData)
    !isSuccess && autoRunTask && errorMsg && errorMsg(uploadListObj.value[id])
    uploadListLast = false
    return isSuccess
  }

  /**
   * 上传文件
   * @param {*} file
   * @param {*} params
   * @param {*} listId
   * @returns
   */
  async function uploadFile(file, { bucketName, fileName, key, id }, listId, autoRunTask = true, taskData = {}) {
    if (!bucketName) bucketName = defBucketName
    if (!fileName) {
      fileName = await getChunkFileName(file, listId)
    }
    key = id || key || `s3://${bucketName}/${fileName}`
    initData({ key, bucketName, fileName, total: file.size, listId })
    const fileItem = { key, bucketName, fileName, id }

    //如果文件小于分片大小，并且没有强制进行分片, 直接上传
    if (!isForceMultipart && file.size <= chunkSize) {
      const isPutObject = await uploadPutObject(file, { key, bucketName, fileName }, listId)

      // 不是list时触发回调
      // 单文件,id 空,uploadObj存在, uploadListObj 不存在, key: s3://font-end/2025/06/89be60895176466398d53bd4a693d9f6/manifest.json
      // 多文件: id空, uploadObj存在, uploadListObj 存在, key: s3://font-end/2025/06/eb488804-628d-4b23-acc4-e187b6f05866/33dbdd0177549353eeeb785d02c294af/logo192.png
      !listId && fileCallback(key, isPutObject, fileItem, id, false, uploadObj.value[key])
      if (!isPutObject) {
        autoRunTask && errorMsg && errorMsg(uploadObj.value[key])
        return false
      }
      if (!listId) {
        //单文件上传成功
        await _autoRunTask(key, key, autoRunTask, taskData)
      }
      return key
    }

    //分片上传
    const result = await multipartUpload(file, { id, key, bucketName, fileName }, listId)
    // 每次上传分片时都先判断当前上传的任务是否用户已经停止上传
    if (result === 'isStop') {
      const lastData = getData(key)
      setData(key, {
        ...lastData,
        isStop: true,
        status: 0,
        statusMsg: '上传失败',
        msg: '停止上传'
      })

      fileCallback(undefined, undefined, undefined, undefined, undefined, uploadObj.value[key])
      return false
    }
    if (!listId) {
      !isMultipartCallback && fileCallback(key, result, fileItem, id, false, uploadObj.value[key])
      await _autoRunTask(key, result, autoRunTask, taskData)
    }
    !result && !listId && errorMsg && errorMsg(uploadObj.value[key])
    return result
  }

  /**
   * 分片上传
   * @param {*} file
   * @param {*} param1
   * @param {*} listId
   * @returns
   */
  async function multipartUpload(file, itemData, listId) {
    const { id, key, bucketName, fileName } = itemData
    const [uploadId, Parts] = await getListMultipart(itemData)
    if (!uploadId) return

    //生成文件分片
    let chunkList = await getFileChunkList(file, chunkSize)
    let loaded = 0
    //存在分片的数据就过滤掉，并设置进度
    if (Parts.length) {
      chunkList = chunkList.filter((m) => {
        const part = Parts.find((p) => p.PartNumber === m.partNumber)
        if (part) {
          loaded += part.Size
          return false
        }
        return true
      })
    }
    const uploadData = getData(key)
    uploadData.loaded = loaded
    updateListData(listId, loaded, undefined)

    let isSuccess = true
    let isNeedStop
    for (let index = 0; index < chunkList.length; index++) {
      const item = chunkList[index]
      const { partNumber } = item
      //获取上传地址
      const partRes = await uploadApi?.presignedUploadPart?.({ bucketName, fileName, uploadId, partNumber })
      const { data: url, msg } = partRes || {}
      if (!url) {
        error(key, msg || `获取分片${partNumber}上传地址失败`)
        isSuccess = false
        break
      }

      //上传分片
      try {
        await putFile(url, item.file)
        // 每次上传分片时都先判断当前上传的任务是否用户已经停止上传
        isNeedStop = getData(key)?.isStop
        if (isNeedStop) break
        updateProgress(key, item.file.size, listId)
        isMultipartCallback && fileCallback(key, true, itemData, id, false, uploadObj.value[key])
      } catch (err) {
        error(key, err)
        isSuccess = false
        break
      }
    }
    if (isNeedStop) return 'isStop'
    if (!isSuccess) return isSuccess
    const completeRes = await uploadApi?.completeMultipartUpload?.({ bucketName, fileName, uploadId })
    let mulCall = [key, true, itemData, id, false] //  最后一个参数uploadObj.value[key]不从此处传进去, 而是从success/error方法中获取最新的uploadObj.value[key]数据
    if (completeRes?.status || !completeRes?.data) {
      error(key, completeRes.msg || '完成分片错误', key, mulCall)
      return false
    }
    success(key, completeRes.data.Location, completeRes.data, listId, mulCall)
    return key
  }

  return {
    uploadFileList,
    uploadFile,
    uploadPutObject,
    getData,
    setData,
    addTask,
    runTask,
    uploadObj,
    uploadListObj
  }
}
