<template>
  <div class="add-new-dish">
    <index-header></index-header>
    <div class="new-dish-cont">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span class="card_title">添加新菜品</span>
        </div>

        <el-form>
          <el-form-item label="是否上架:">
            <el-checkbox v-model="statusChecked" >上架</el-checkbox>
          </el-form-item>
        </el-form>

        <el-form label-width="140px" label-position="right" :model="selectDish" ref="selectDish" :rules="rules">

          <h1>菜品基础信息</h1>

          <el-form-item label="菜品名称:" prop="name">
            <el-input v-model="selectDish.name"></el-input>
          </el-form-item>
          <el-form-item label="菜谱导航分类:" prop="nav">
            <el-select v-model="selectDish.nav" class="input-custom">
              <el-option :label="item.navName" :value="item.navId" v-for="(item,index) in navList" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="菜类型:" prop="kind">
            <el-select v-model="selectDish.kind" class="input-custom">
              <el-option :label="item.name" :value="item.code" v-for="(item,index) in kindList" :key="index"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="辣度:">
            <el-radio-group v-model="selectDish.pepperDegree">
              <el-radio :label="0">不设定</el-radio>
              <el-radio :label="item.code" v-for="(item,index) in pepperDegreeList" :key="index">{{item.name}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="推荐指数:">
            <el-radio-group v-model="selectDish.recommendIndex">
              <el-radio :label="0">不设定</el-radio>
              <el-radio :label="item.code" v-for="(item,index) in recommendIndexList" :key="index">{{item.name}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="特色标签:">
            <el-radio-group v-model="selectDish.specialtyLabel">
              <el-radio :label="0">不设定</el-radio>
              <el-radio :label="item.code" v-for="(item,index) in specialtyLabelList" :key="index">
                {{item.name}}
                <i class="el-icon-close" v-show="item.deleteFlag===1" title="删除特色标签" @click="deleteSpecialtyLabel(item,index)"></i>
              </el-radio>
              <el-input
                class="input-new-tag"
                v-model.trim="inputValue0"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(0)"
              >
              </el-input>
              <el-button class="button-new-tag" size="small" @click="handleInputConfirm(0)" type="text">添加</el-button>
              <el-button type="text" class="msg">{{nameMsg}}</el-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="菜品分量:">
            <el-radio-group v-model="selectDish.weight">
              <el-radio :label="item.code" v-for="(item,index) in weightList" :key="index">{{item.name}}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="主材:" style="width: 60%" prop="mainMaterials">
            <el-table
              :data="selectDish.mainMaterialsList"
              border
              stripe
              style="width: 100%">
              <el-table-column
                label="*菜名">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.id" filterable placeholder="请选择">
                    <el-option
                      v-for="(item,index) in foodList"
                      :key="index"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                label="*重量(克)">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.weight"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="removeTableList(scope.$index,0)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" size="small" @click="addTableList(0)">添加主材</el-button>
          </el-form-item>
          <el-form-item label="配菜:" style="width: 60%">
            <el-table
              :data="selectDish.contornoList"
              border
              stripe
              style="width: 100%">
              <el-table-column
                label="*菜名">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.id" filterable placeholder="请选择">
                    <el-option
                      v-for="(item,index) in foodList"
                      :key="index"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                label="*重量(克)">
                <template slot-scope="scope">
                  <el-input v-model="scope.row.weight"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="removeTableList(scope.$index,1)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" size="small" @click="addTableList(1)">添加配菜</el-button>
          </el-form-item>
          <el-form-item label="佐料:" style="width: 40%">
            <el-table
              :data="selectDish.seasoningList"
              border
              stripe
              style="width: 100%">
              <el-table-column
                label="*菜名">
                <template slot-scope="scope">
                  <el-select v-model="scope.row.id" filterable placeholder="请选择">
                    <el-option
                      v-for="(item,index) in foodList"
                      :key="index"
                      :label="item.name"
                      :value="item.id">
                    </el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="removeTableList(scope.$index,2)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" size="small" @click="addTableList(2)">添加佐料</el-button>
          </el-form-item>
          <el-form-item label="可选规格:">
            <el-tag
              v-for="(tag,index) in availableChooseList"
              :key="index"
              :disable-transitions="false"
              closable
              @close="handleClose(index)"
              type="info">
              {{tag}}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-model.trim="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(1)"
            >
            </el-input>
            <el-button class="button-new-tag" size="small" @click="handleInputConfirm(1)" type="text">添加</el-button>
          </el-form-item>
          <el-form-item label="菜品单价(元):" prop="price">
            <el-input v-model="selectDish.price" type="number" min="0"></el-input>
          </el-form-item>
          <el-form-item label="加工耗时约(分钟):" prop="processTime">
            <el-input v-model="selectDish.processTime" type="number" min="0"></el-input>
          </el-form-item>
          <el-form-item label="最大订购分数:" prop="maxOrders">
            <el-input v-model="selectDish.maxOrders" type="number" min="0"></el-input>
          </el-form-item>

          <h1>菜品详情</h1>

          <el-form-item label="菜品主图:" prop="dishPictures">
            <div class="suggestion">建议尺寸：800*800，最多可上传5张，图片格式支持JPG、PNG、BMP、GIF格式，图片大小不得大于200KB</div>
            <el-upload
              class="upload-demo"
              action="/api/image/uploadimage"
              ref="uploadImage"
              :multiple="true"
              :on-exceed="handleExceed"
              :on-change="handleChange"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :file-list="fileList"
              :limit="5"
              accept=".jpg,.png,.bmp,.gif"
              :auto-upload='false'
              list-type="picture-card">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
            <el-button
              size="small"
              type="info"
              class="btn-down"
              v-for="(item,index) in fileList"
              :key="index"
              v-if="index==0">主图</el-button><el-button
            size="small"
            type="primary"
            class="btn-down"
            @click.native="setMainImg(item,index)"
            v-for="(item,index) in fileList"
            :key="index"
            v-if="index>0">设为主图</el-button>
          </el-form-item>
          <el-form-item label="菜品描述:">
            <v-vueQuillEditor v-on:editorContent="catchData" v-bind:content="selectDish.describeContext"></v-vueQuillEditor>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitDishInfo">提交</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import vueQuillEditor from '../common/vueQuillEditor.vue'
import indexHeader from '../index/header'
export default {
  name: 'addNewDish',
  components: {
    'v-vueQuillEditor': vueQuillEditor,
    'index-header': indexHeader
  },
  data () {
    return {
      selectDish: {
        dishId: '',
        dishName: '',
        nav: '',
        price: '',
        sevenDaySale: '',
        createTime: '',
        status: '',
        kind: '',
        pepperDegree: '',
        recommendIndex: '',
        specialtyLabel: '',
        weight: '',
        mainMaterials: '',
        mainMaterialsList: [],
        contorno: '',
        seasoning: '',
        availableChoose: '',
        contornoList: [],
        seasoningList: [],
        availableChooseList: [],
        processTime: '',
        maxOrders: '',
        dishPicturesList: [],
        describeContext: ''
      },
      initSelectDish: {
        dishId: '',
        dishName: '',
        nav: '',
        price: '',
        sevenDaySale: '',
        createTime: '',
        status: '',
        kind: '',
        pepperDegree: '',
        recommendIndex: '',
        specialtyLabel: '',
        weight: '',
        mainMaterials: '',
        mainMaterialsList: [],
        contorno: '',
        seasoning: '',
        availableChoose: '',
        contornoList: [],
        seasoningList: [],
        availableChooseList: [],
        processTime: '',
        maxOrders: '',
        dishPicturesList: [],
        describeContext: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入菜品名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度不得超过20个字符', trigger: 'blur' },
          { validator: this.validDishName, trigger: 'blur' }
        ],
        nav: [
          { required: true, message: '请选择菜谱导航分类', trigger: 'change' }
        ],
        kind: [
          { required: true, message: '请选择菜类型', trigger: 'change' }
        ],
        price: [
          { required: true, message: '请输入单价', trigger: 'blur' },
          {validator: this.checkNum, trigger: 'blur'}
        ],
        processTime: [
          {validator: this.checkNum, trigger: 'blur'}
        ],
        maxOrders: [
          {validator: this.checkNum, trigger: 'blur'}
        ],
        dishPictures: [
          { required: true, message: '请选择菜品主图', trigger: 'change' }
        ],
        mainMaterials: [
          { validator: this.validMainMaterials, trigger: 'blur' }
        ]
      },
      navList: [],
      kindList: [],
      pepperDegreeList: [],
      recommendIndexList: [],
      specialtyLabelList: [],
      weightList: [],
      inputValue0: '',
      inputValue: '',
      statusChecked: true,
      fileList: [],
      describe: '',
      preName: '',
      contentEditFlag: false,
      nameMsg: '',
      foodList: [],
      availableChooseList: []
    }
  },
  mounted: function () {
    this.getDishInfo()
    this.getNavList()
    this.getCommonList('kind', 'kindList', '0')
    this.getCommonList('pepper_degree', 'pepperDegreeList', '0')
    this.getCommonList('recommend_index', 'recommendIndexList', '0')
    this.getCommonList('specialty_label', 'specialtyLabelList', '1')
    this.getCommonList('weight', 'weightList', '0')
    this.getFoodList()
    setTimeout(() => {
      if (sessionStorage.getItem('needStatus') === '1') {
        this.$message({
          duration: 0,
          showClose: true,
          dangerouslyUseHTMLString: true,
          message: '存在已失效的必点项<a style="margin-left: 20px;" href="#/menuManagement/needSetting">立即查看</a>'
        })
        window.onbeforeunload = null
      } else {
        window.onbeforeunload = function (e) {
          e = e || window.event
          // 兼容IE8和Firefox 4之前的版本
          if (e) {
            e.returnValue = '关闭提示'
          }
          // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
          return '关闭提示'
        }
      }
    }, 500)
  },
  watch: {
  },
  methods: {
    checkNum (rule, val1, callback) {
      if (val1 < 0) {
        callback(new Error('不可输入小于零的数'))
      } else {
        callback()
      }
    },
    deleteSpecialtyLabel (item, i) {
      this.specialtyLabelList.splice(i, 1)
      let that = this
      this.$axios.get('/api/common/deletedictionary?code=' + item.code).then(function (res) {
        that.$message({
          type: res.code === 0 ? 'success' : 'info',
          message: '删除特色标签' + (res.code === 0 ? '成功!' : '失败!')
        })
      })
    },
    getFoodList () {
      let that = this
      this.$axios.get('/api/foodmaterial/getfoodlist?curPage=1&rows=10000').then(function (res) {
        that.foodList = res.dataList
      })
    },
    handleExceed (files, fileList) {
      this.$message({
        type: 'info',
        message: '超出可选范围，最多可上传5张图片'
      })
    },
    handleSuccess (res, file, fileList) {
      for (let i = 0; i < fileList.length; i++) {
        if (fileList[i].uid === file.uid) {
          this.fileList[i].name = res.data
        }
      }
    },
    uploadFileList () {
      this.$refs['uploadImage'].submit()
    },
    /* 校验菜品名称是否重复 */
    validDishName (rule, val, callback) {
      if (this.preName === val) {
        callback()
      } else {
        this.$axios.get('/api/dish/validdishname?name=' + val).then(function (res) {
          if (res.code === -1) {
            callback()
          } else {
            callback(new Error('该菜品名已存在'))
          }
        })
      }
    },
    /* 校验主材 */
    validMainMaterials (rule, val, callback) {
      if (this.selectDish.mainMaterialsList.length < 1) {
        callback(new Error('请输入主材'))
      } else {
        callback()
      }
    },
    /* 移除列表中的项，主材、配菜、佐料 */
    removeTableList (index, code) {
      if (code === 0) {
        this.selectDish.mainMaterialsList.splice(index, 1)
      } else if (code === 1) {
        this.selectDish.contornoList.splice(index, 1)
      } else {
        this.selectDish.seasoningList.splice(index, 1)
      }
    },
    /* 添加列表中的项。主材、配菜、佐料 */
    addTableList (code) {
      if (code === 0) {
        this.selectDish.mainMaterialsList.push(
          {
            id: '',
            weight: ''
          }
        )
      } else if (code === 1) {
        this.selectDish.contornoList.push(
          {
            id: '',
            weight: ''
          }
        )
      } else {
        this.selectDish.seasoningList.push(
          {
            id: ''
          }
        )
      }
    },
    /* 设置主图 */
    setMainImg (item, index) {
      this.fileList.splice(index, 1)
      this.fileList.splice(0, 0, item)
    },
    /* 移除主图事件 */
    handleRemove (file, filelist) {
      this.$refs.uploadImage.$children[1].$el.style.display = 'inline-block'
      this.fileList = filelist
    },
    /* 添加或上传主图事件 */
    handleChange (file, filelist) {
      this.fileList = filelist
      if (filelist.length === 5) {
        this.$refs.uploadImage.$children[1].$el.style.display = 'none'
      }
    },
    /* 提交菜品信息 */
    submitDishInfo () {
      this.uploadFileList()
      this.selectDish.dishPicturesList = []
      this.selectDish.status = this.statusChecked ? 0 : 1
      this.selectDish.mainMaterials = JSON.stringify(this.selectDish.mainMaterialsList)
      this.selectDish.contorno = JSON.stringify(this.selectDish.contornoList)
      this.selectDish.seasoning = JSON.stringify(this.selectDish.seasoningList)
      this.selectDish.availableChoose = JSON.stringify(this.availableChooseList)
      this.selectDish.describeContext = this.contentEditFlag ? this.describe : this.selectDish.describeContext
      this.selectDish.needStatus = 0
      sessionStorage.setItem('needStatus', '0')
      if (this.selectDish.needFlag === 0 &&
        ((!this.selectDish.needChoose && this.selectDish.availableChooseList.length > 0) ||
          (this.selectDish.needChoose && this.availableChooseList.length <= 0) ||
          this.availableChooseList.indexOf(this.selectDish.needChoose) < 0)) {
        this.selectDish.needStatus = 1
        sessionStorage.setItem('needStatus', '1')
      }
      setTimeout(() => {
        for (let i = 0; i < this.fileList.length; i++) {
          this.selectDish.dishPicturesList.push(this.fileList[i].name)
        }
        this.selectDish.dishPictures = JSON.stringify(this.selectDish.dishPicturesList)
        this.$nextTick(function () {
          this.$refs['selectDish'].validate((valid) => {
            if (valid) {
              let id = this.$route.query.dishId
              let url = '/api/dish/'
              let msg = ''
              let that = this
              if (id) {
                url += 'updatedish'
                msg = '修改'
              } else {
                url += 'adddish'
                msg = '添加'
              }
              this.$axios.post(url, that.selectDish).then(function (res) {
                if (res.code === 0) {
                  if (!id) {
                    // that.contentEditFlag = false
                    // that.describe = ''
                    that.selectDish = that.initSelectDish
                    // that.fileList = []
                  }
                  that.$nextTick(function () {
                    that.$refs['selectDish'].clearValidate()
                  })
                  that.$message({
                    type: 'success',
                    message: msg + '成功!'
                  })
                } else {
                  that.$message({
                    type: 'info',
                    message: msg + '失败!'
                  })
                }
                window.onbeforeunload = null
                setTimeout(() => {
                  window.location.reload()
                }, 500)
              })
            }
          })
        })
      }, 100)
    },
    /* 获取菜品信息 */
    getDishInfo () {
      if (this.$route.query.dishId) {
        let that = this
        this.$axios.get('/api/dish/dishinfo?id=' + this.$route.query.dishId).then(function (res) {
          if (res.code === 0) {
            that.selectDish = res.dataList[0]
            that.preName = res.dataList[0].name
            that.statusChecked = that.selectDish.status === 0
            that.selectDish.mainMaterialsList = that.selectDish.mainMaterials ? JSON.parse(that.selectDish.mainMaterials) : []
            that.selectDish.contornoList = that.selectDish.contorno ? JSON.parse(that.selectDish.contorno) : []
            that.selectDish.seasoningList = that.selectDish.seasoning ? JSON.parse(that.selectDish.seasoning) : []
            // that.selectDish.availableChooseList = that.selectDish.availableChoose ? JSON.parse(that.selectDish.availableChoose) : []
            that.availableChooseList = that.selectDish.availableChoose ? JSON.parse(that.selectDish.availableChoose) : []
            that.selectDish.dishPicturesList = that.selectDish.dishPictures ? JSON.parse(that.selectDish.dishPictures) : []
            that.selectDish.processTime = that.selectDish.processTime === '0' ? '' : that.selectDish.processTime
            that.selectDish.maxOrders = that.selectDish.maxOrders === '0' ? '' : that.selectDish.maxOrders
            that.selectDish.price = that.selectDish.price === '0' ? '' : that.selectDish.price
            that.fileList = []
            for (let i = 0; i < that.selectDish.dishPicturesList.length; i++) {
              that.fileList.push({
                name: that.selectDish.dishPicturesList[i],
                url: that.selectDish.dishPicturesList[i]
                // url: that.Const.IMAGE_PATH + that.selectDish.dishPicturesList[i]
              })
            }
            if (that.fileList.length === 5) {
              that.$refs.uploadImage.$children[1].$el.style.display = 'none'
            }

            that.$nextTick(function () {
              that.$refs['selectDish'].clearValidate()
            })
          }
        })
      }
    },
    catchData (value) {
      this.contentEditFlag = true
      this.describe = value
    },
    /* tag操作 */
    handleClose (index) {
      this.availableChooseList.splice(index, 1)
      // this.selectDish.availableChooseList.splice(index, 1)
    },
    /* 添加特色标签0或可选规格1 */
    handleInputConfirm (code) {
      if (code === 0) {
        this.validSpecialtyName()
        setTimeout(() => {
          if (this.inputValue0 && this.nameMsg === '') {
            let that = this
            let data = {
              name: this.inputValue0,
              type: 'specialty_label',
              storeId: sessionStorage.getItem('storeId')
            }
            this.$axios.post('/api/common/adddicdata', data).then(function (res) {
              if (res.code === 0) {
                that.inputValue0 = ''
                that.getCommonList('specialty_label', 'specialtyLabelList', '1')
              }
            })
          }
        }, 100)
      } else {
        if (this.inputValue) {
          this.availableChooseList.push(this.inputValue)
        }
        this.inputValue = ''
      }
    },
    validSpecialtyName () {
      if (this.inputValue0.length > 10) {
        this.nameMsg = '长度超出,最多可输入10个字符'
        return
      }
      let that = this
      let data = {
        name: this.inputValue0,
        type: 'specialty_label',
        storeId: sessionStorage.getItem('storeId')
      }
      this.$axios.post('/api/common/validname', data).then(function (res) {
        if (res.code === -1) {
          that.nameMsg = ''
        } else {
          that.nameMsg = '该标签已存在'
        }
      })
    },
    /* 获取菜类型列表 */
    getCommonList (type, typeName, storeFlag) {
      let that = this
      this.$axios.get('/api/common/dictionarylist?storeFlag=' + storeFlag + '&type=' + type).then(function (res) {
        that[typeName] = res.dataList
      })
    },
    /* 获取菜谱导航列表 */
    getNavList () {
      let that = this
      this.$axios.get('/api/nav/list').then(function (res) {
        that.navList = res.dataList
      })
    }
  }
}
</script>

<style scoped lang="less">
  .add-new-dish{
    height: 100%;
    overflow-y: auto;
    .suggestion{
      color: #909399;
    }
    .dish-pics{
      float: left;
      margin: 10px;
      img{
        height: 120px;
        width: 120px;
      }
    }
    h1{
      margin: 30px 10px 20px;
      font-size: x-large;
    }
    .new-dish-cont{
      margin-top: 60px;
      width: 1200px;
      padding-left:calc( calc( 100% - 1200px)/2 ) ;
    }
  }
</style>

<style lang="less">
  .add-new-dish{
    .cell{
      text-align: center;
    }
    .el-tag + .el-tag {
      margin-left: 10px;
    }
    .button-new-tag {
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
      margin: 10px;
    }
    .input-new-tag {
      width: 90px !important;
      margin-left: 10px;
      vertical-align: center;
    }
    .el-input{
      width: 50%;
    }
    .el-select{
      width: 50%;
      .el-input{
        width: 100%;
      }
    }
    .el-upload-list__item{
      transition: null;
    }
    .btn-down{
      height: 30px;
      width: 100px;
      margin: 0 32px 8px 24px;
    }
    .upload-demo{
      height: 150px;
    }
    .w-e-text{
      overflow-y: auto;
    }
    table{
      .el-input{
        width: 80%;
        .el-input__inner{
          text-align: center;
          height: 30px;
          width: 100%;
        }
      }
      .el-select{
        width: 80%;
        .el-input{
          width: 100%;
        }
      }
    }
    .el-table__empty-block{
      min-height: 30px;
    }
    .el-radio{
      padding: 10px 0;
      margin-right: 20px;
    }
    .el-radio+.el-radio {
      margin-left: 0;
    }
    .el-tag{
      margin-right: 10px;
    }
    .el-tag + .el-tag {
      margin-left: 0;
    }
  }
</style>
