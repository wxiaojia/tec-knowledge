// 1 
dynamicRules: ({ values }) => {
    if (!values.selectDatabase) return []
    return [
      {
        required: true,
        validator: async (_, value) => {
          if (!value || !regex.ChineseEnglishNumberUnderlineReg.test(value)) return Promise.reject('请输入1-30长度的中英文、数字、中划线、下划线')
          const res = await datasetApi.check({ page: 0, size: 1, groupName: value }).catch(() => {
            return Promise.resolve()
          })
          if (res?.result?.length) return Promise.reject('数据集名称已存在')
          return Promise.resolve()
        }
      }
    ]
  }
优化：
dynamicRules: ({ values }) => {
    if (!values.selectDatabase) return []
    return handleCommonRules({
        require: true,
        regx: regx.ChineseEnglishNumberUnderlineReg30,
        repearRule: {
            api: datasetApi.check,
            params: 'groupName',
        }
    })
}

// 2 
dynamicRules: () => {
    return [
      {
        required: true,
        validator: async (_,   value) => {
          if (!value || !regex.EnglishNumberReg.test(value)) return Promise.reject('请输入10字符以内的数字、字母')
          const res = await machineConfigurationApi.checkRepeat({ page: 0, size: 1, seatNo: [value] })
          if (res?.result?.length && (editMsg.value?.id ? res?.result[0]?.id !== editMsg.value?.id : true)) return Promise.reject('机位编号已存在')
          return Promise.resolve()
        },
        trigger: 'blur'
      }
    ]
  }
优化：
commonRule: {
    require: true,
    regxName: regx.one_ten_EnglishNumberReg,
    repearRule: {
        api: machineConfigurationApi.checkRepeat,
        params: 'seatNo',
        uniq: { key: 'id', value: editMsg.value?.id }  // 有传则比较
    }
}

// 3
dynamicRules: () => {
    return [
      {
        required: true,
        validator: async (_, value) => {
          if (!value || !regex.ChineseEnglishNumberUnderlineReg.test(value)) return Promise.reject('请输入1-30长度的中英文、数字、中划线、下划线')
          //TODO:产品要求，必须要校验平台所有算法名称是否重复
          const algorithmList = await overviewApi.list({ page: 0, size: 1, name: [value] })
          if (algorithmList?.result?.length) return Promise.reject('算法名称已存在')

          //TODO:产品要求，必须要校验第三方基础算法名称是否重复（已上架）
          const thirdPartyList = await warehouseApi.manufacturerList({ page: 0, size: 1, name: [value], source: 'SUPPLIER', supplierAlgoType: 'BASE_ALGO', publishStatus: ['PUBLISH'] })
          if (thirdPartyList?.result?.length) return Promise.reject('算法名称已存在')

          const res = await arrangeApi.list({ page: 0, size: 1, arrangeType: 'ALGO', modelName: value }).catch(() => {
            return Promise.resolve()
          })
          if (res?.result?.length && (fromData.value?.id ? fromData.value?.id !== res.result[0].id : true)) return Promise.reject('算法名称已存在')
          return Promise.resolve()
        }
      }
    ]
  }
commonRule: {
    require: true,
    regxName: regx.one_thirty_ChineseEnglishNumberUnderlineReg,
    repearRule:[{
        api: overviewApi.list,
        params: 'name',
    }, {
        api: warehouseApi.manufacturerList,
        params: (values) => {name: [values.value], source: 'SUPPLIER', supplierAlgoType: 'BASE_ALGO', publishStatus: ['PUBLISH'] },
    }, {
        api: arrangeApi.list,
        params: (values) => {arrangeType: 'ALGO', modelName: values.modelName },
        uniq: { key: 'id', value: fromData.value?.id} 
    }]

}

// 4
dynamicRules: () => {
    return [
      {
        required: true,
        validator: async (_, value) => {
          if (!value || !regex.ChineseEnglishNumberUnderlineReg.test(value)) return Promise.reject('请输入1-30长度的中英文、数字、中划线、下划线')
          if (isUpdate) {
            if (serveNameList.value.some((item) => item.text == value && item.value != editData.serviceName)) return Promise.reject('名称已存在，请重新输入')
          } else {
            if (serveNameList.value.some((item) => item.text == value)) return Promise.reject('名称已存在，请重新输入')
          }
        },
        trigger: 'blur'
      }
    ]
  }
优化：
commonRule: {
    require: true,
    regxName: regx.one_thirty_ChineseEnglishNumberUnderlineReg,
    repearRule: {
       data: serveNameList.value,
       uniq: { value: editData.id },
       filter: { name: 'text', value: editData.serviceName }
    }
}

// 5
dynamicRules: () => {
    return [
      {
        required: true,
        validator: async (_, value) => {
          if (!value) return Promise.reject('此项为必填项')
          if (!regex.ChineseEnglishNumberUnderlineReg.test(value)) return Promise.reject('请输入1-30长度的中英文、数字、中划线、下划线')
          if (frameworkList.value.some((item) => item.text === value)) return Promise.reject('名称已存在，请重新输入')
          return Promise.resolve()
        }
      }
    ]
  }
  commonRule: {
    require: true,
    regxName: regx.one_thirty_ChineseEnglishNumberUnderlineReg,
    repearRule: {
      data: frameworkList.value,
      filter: { name: 'text' }
    }
  }

  // 6
  dynamicRules: () => {
    return [
      {
        required: true,
        validator: async (_, value) => {
          if (!value || !regex.ChineseEnglishNumberUnderlineReg.test(value)) return Promise.reject('请输入1-30长度的中英文、数字、中划线、下划线')
          if (frameworkList.value.some((item) => item.text === value && (!!editData.value.id ? editData.value?.value !== item.value : true))) return Promise.reject('名称已存在，请重新输入')
          return Promise.resolve()
        }
      }
    ]
  }
  优化：
  commonRule: {
    require: true,
    regx: regx.one_thirty_ChineseEnglishNumberUnderlineReg,
    repearRule: {
      data: frameworkList.value,
      uniq: { value: editData.value?.id },
      filter: { name: 'text', value: editData.value?.value }
    }
  }
  
  // 7
  rules: [
    {
      required: true,
      validator: async (_, value) => {
        if (!value) {
          return Promise.reject('此项为必填项')
        }
        if (!regex.ChineseEnglishNumberUnderlineReg.test(value)) {
          return Promise.reject(appStore.valName10)
        }
        var filter = {}
        let filterParentId = addOrganization.value.parentId === '0-0' ? null : addOrganization.value.parentId.split('-')[1]
        if (!props.addOrEditFlag) {
          filter = { name: value, parentId: filterParentId }
        } else {
          filter = { id: addOrganization.value.id, name: value, parentId: filterParentId }
        }
        const [err, res] = await utils.to(organizationApi.checkOrganizationName(filter))
        if (res.status === 0) {
          if (res.data) {
            return Promise.reject('名称已存在，请重新输入')
          } else {
            return Promise.resolve()
          }
        } else {
          return Promise.reject('名称已存在，请重新输入')
        }
      },
      trigger: 'change'
    }
  ]

commonRule: {
    require: true,
    regx: regx.ChineseEnglishNumberUnderlineReg,
    repearRule: {
        api: organizationApi.checkOrganizationName,
        params: ({value}) => {
          let filterParentId = addOrganization.value.parentId === '0-0' ? null : addOrganization.value.parentId.split('-')[1]
          filter = !props.addOrEditFlag ? { name: value, parentId: filterParentId } : { id: addOrganization.value.id, name: value, parentId: filterParentId }
        }
    },
    trigger: 'change'
}

// 
require: true
rules: [
    {
      required: true,
      validator: async (_, value) => {
        if (!value || !regex.ChineseEnglishNumberUnderlineReg.test(value)) return Promise.reject('请输入1-30长度的中英文、数字、中划线、下划线')
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
commonRules: regx.one_thirty_ChineseEnglishNumberUnderlineReg

// 
rules: [
    {
      required: true,
      validator: async (_, value) => {
        if (!value) return Promise.reject('此项为必填项')
        if (!regex.ChineseEnglishNumberUnderlineReg.test(value)) return Promise.reject('请输入1-30长度的中英文、数字、中划线、下划线')
        const res = await manufacturerApi.list({ page: 0, size: 1, name: value }).catch(() => {
          return Promise.resolve()
        })
        
        if (isUpdate.value && editData.value?.id && res?.result?.length && editData.value.id != res.result[0].id) return Promise.reject('名称已存在，请重新输入')
        if (!isUpdate.value && res?.result?.length) return Promise.reject('名称已存在，请重新输入')
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
commonRule: {
    require: true,
    regxName: regx.one_thirty_ChineseEnglishNumberUnderlineReg,
    repearRule: {
      api: manufacturerApi.list,
      params: 'name',
      uniq: { key: 'id', value: editData.value?.id }
    },
    trigger: 'blur'
}


