 ```html
 <!-- 图片 -->
<common-upload 
    :showProgress="false" 
    :isShowZoom="true" 
    :accept="'.jpg,.png,.jpeg'"
    :fileKey="dataForm.cover?.key" 
    :checkFile="checkFile" 
    :deleteCheck="true" 
    :uploadKey="`custom-image${dataForm.id || ''}`" 
    imgUrl="coverImgUrl" 
    @success="coverS3Success" 
    @error="uploadError"  
    isPreview  
    isForceReUpload>
</common-upload>

 <!-- 图片 -->
<common-upload 
    :showProgress="false" 
    :imgUrl="detailImgUrl" 
    @success="detailImgS3Success" 
    @error="uploadError" 
    :accept="'.jpg,.png,.jpeg'" 
    :fileKey="dataForm.detailImg?.key" 
    :checkFile="checkFile" 
    :deleteCheck="true" 
    :uploadKey="`custom-script${dataForm.id || ''}`" 
    isPreview
    isForceReUpload></common-upload>

<!-- 业务编排-上传算子 -->
<common-upload
     pageName="workbench" 
     :editFile="editFile" 
     @success="scriptPathSuccess" 
     @error="uploadError"
    @deleteUploadFile="onDeleteUpload" 
    :checkFile="checkFile" 
    :deleteCheck="true"
    ></common-upload>

<common-upload 
:editFile="draftPathName" 
:dataInfo="draftPathDataInfo" @returnKey="changeDraftS3" @deleteUploadFile="deleteUploadFile(true)" @success="draftS3Success" @error="draftUploadError" :fileKey="dataForm.draftS3?.key" :checkFile="checkFile" :deleteCheck="true" :uploadKey="`custom-draft${dataForm.id || ''}`" :ifChangeShowImg="false" ref="uploadDraftRef"></common-upload>


```