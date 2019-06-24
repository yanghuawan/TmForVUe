<template>
  <div class="store-setting">
    <el-form :model="storeInfo" label-width="120px" ref="storeInfo" :rules="rules" label-position="right">
      <el-form-item label="餐厅logo:" prop="logoPng">
        <el-upload
          class="upload-demo store-img"
          action="/api/image/uploadimage"
          ref="uploadImage"
          :on-success="handleSuccess"
          :file-list="fileList"
          :limit="1"
          accept=".jpg,.png,.bmp,.gif"
          :auto-upload='true'
          list-type="picture-card">
          <el-button size="small" type="primary" class="btn-down">点击上传</el-button>
        </el-upload>
        <span class="suggestion">建议尺寸：800*800，图片格式支持JPG、PNG、BMP、GIF格式，图片大小不得大于200KB</span>
      </el-form-item>
      <el-form-item label="餐厅名称:" prop="name">
        <el-input v-model="storeInfo.name"></el-input>
      </el-form-item>
      <el-form-item label="餐厅公告:">
        <el-input v-model="storeInfo.notic"></el-input>
      </el-form-item>
      <el-form-item id="suggestion">
        <div class="suggestion">手机号固话至少填一个</div>
      </el-form-item>
      <el-form-item label="固话:" prop="tel">
        <el-input v-model="storeInfo.tel" placeholder="区号-座机号码"></el-input>
      </el-form-item>
      <el-form-item label="手机号:" prop="mobile">
        <el-input v-model="storeInfo.mobile" placeholder="11位手机号"></el-input>
        <div class="msg">{{mobileMsg}}</div>
      </el-form-item>
      <el-form-item label="餐厅地址:" prop="locationName">
        <el-input id="tipinput" v-model="storeInfo.locationName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitStoreInfo()">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import AMap from 'AMap'
export default {
  name: 'store',
  data () {
    return {
      storeInfo: {
        id: '',
        name: '',
        logoPng: '',
        notic: '',
        tel: '',
        mobile: '',
        district: '',
        address: '',
        locationName: '',
        lat: '',
        lng: ''
      },
      rules: {
        name: [
          {required: true, message: '请输入餐厅名称', trigger: 'blur'}
        ],
        logoPng: [
          {required: true, message: '请上传店铺logo', trigger: 'blur'}
        ],
        tel: [
          {pattern: /^\d{3,4}-?\d{7,9}$/, message: '格式：区号-座机号码', trigger: 'blur'}
        ],
        mobile: [
          {pattern: /^[1][3,4,5,7,8][0-9]{9}$/, message: '请输入正确的手机号', trigger: 'blur'}
        ],
        locationName: [
          {required: true, message: '请在可选列表中选择餐厅地址', trigger: 'blur'},
          { validator: this.validLocation, trigger: 'blur' }
        ]
      },
      logo: '',
      provinceList: [],
      cityList: [],
      areaList: [],
      images: {},
      fileList: [],
      selectLocation: false,
      preLocation: '',
      mobileMsg: ''
    }
  },
  mounted () {
    this.getStoreInfo()
    this.initSearch()
  },
  methods: {
    validLocation (rule, val, callback) {
      if (this.preLocation === this.storeInfo.locationName) {
        callback()
      }
      setTimeout(() => {
        if (!this.selectLocation) {
          callback(new Error('请在可选列表中选择餐厅地址'))
        } else {
          callback()
        }
      }, 500)
    },
    initSearch () {
      let auto
      let that = this
      AMap.service('AMap.Autocomplete', function () {
        auto = new AMap.Autocomplete({
          input: 'tipinput'
        })
      })
      let placeSearch
      AMap.service('AMap.PlaceSearch', function () {
        that.selectLocation = false
        placeSearch = new AMap.PlaceSearch({
          pageSize: 10,
          pageIndex: 1
        })
      })
      AMap.event.addListener(auto, 'select', select)// 注册监听，当选中某条记录时会触发
      function select (e) {
        that.storeInfo.district = e.poi.district
        that.storeInfo.address = e.poi.address
        that.storeInfo.locationName = e.poi.name
        that.storeInfo.lat = e.poi.location.lat
        that.storeInfo.lng = e.poi.location.lng
        that.selectLocation = true
        placeSearch.setCity(e.poi.adcode)
        placeSearch.search(e.poi.name) // 关键字查询查询
      }
    },
    handleSuccess (res, file, filelist) {
      this.storeInfo.logoPng = res.data
    },
    /* 获取店铺信息 */
    getStoreInfo () {
      this.mobileMsg = ''
      let that = this
      this.$axios.get('/api/store/getstoreinfo').then(function (res) {
        if (res.dataList.length > 0) {
          that.storeInfo = res.dataList[0]
          that.preLocation = res.dataList[0].locationName ? res.dataList[0].locationName : ''
          if (that.storeInfo.logoPng) {
            that.fileList = []
            that.fileList.push({
              name: 'logo',
              url: that.Const.IMAGE_PATH + that.storeInfo.logoPng
            })
          }
        }
      })
    },
    /* 提交店铺信息 */
    submitStoreInfo () {
      if (!this.storeInfo.tel && !this.storeInfo.mobile) {
        this.mobileMsg = '手机号固话至少填一个'
        return
      }
      this.$nextTick(function () {
        this.$refs['storeInfo'].validate((valid) => {
          let that = this
          if (valid) {
            this.$refs.uploadImage.submit()
            that.$axios.post('/api/store/updatestore', that.storeInfo).then(function (res) {
              that.getStoreInfo()
              if (res.code === 0) {
                that.$emit('submitResult', true)
                that.$message({
                  type: 'success',
                  message: '提交成功!'
                })
              } else {
                that.$emit('submitResult', false)
                that.$message({
                  type: 'info',
                  message: '提交失败!'
                })
              }
            })
          }
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
  .store-setting{
    .suggestion{
      color: #909399;
    }
    .store-img{
      width: 150px;
      height: 150px;
      position: relative;
      border: 1px solid #d3d4d6;
      float: left;
      margin-right: 10px;
      overflow: hidden;
      .btn-down{
        display: block;
        width: 100%;
        height: 30px;
        border: 0;
        border-top: 1px solid #d3d4d6;
        text-align: center;
        background: #fff;
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 10;
        color: #000;
        border-radius: 0;
      }
    }
  }
</style>

<style lang="less">
  .store-setting{
    .el-form-item{
      margin-bottom: 25px !important;
    }
    .image-upload{
      height: 30px;
      width: 100%;
      z-index: 10;
      position: absolute;
      bottom: 0;
      left: 0;
      input {
        height: 30px;
        width: 100%;
      }
    }
    .el-icon-zoom-in{
      display: none;
    }
    .el-upload-list__item{
      width: 150px;
      height: 150px;
      border: 0;
      border-radius: 0;
    }
    .el-upload--picture-card{
      border: 0;
      border-radius: 0;
    }
    .el-upload-list__item-status-label{
      display: none !important;
    }
    #suggestion{
      height: 30px;
      padding: 0;
      margin-bottom: 0 !important;
      margin-top: -10px;
      .el-form-item__content {
        line-height: 30px;
      }
    }
  }
</style>
