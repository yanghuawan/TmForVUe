<template>
  <div class="kdsSetting">
    <span v-show="unusedKind.length > 0" class="msg">
      <span v-for="(item,i) in unusedKind" :key="i"><span v-if="i>0">,</span>{{item.name}}</span>
      未指定KDS,未指定KDS表示下单后即已出菜
    </span>
    <el-button class="add_kds" type="text" @click="updateKdsInfo('',1)">添加KDS</el-button>
    <el-table
      v-loading="loading"
      element-loading-text="数据加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      :data="KdsList"
      border
      stripe
      style="width: 100%">
      <el-table-column
        prop="kdsName"
        label="KDS名称">
      </el-table-column>
      <el-table-column
        prop="modelName"
        label="合并模式">
      </el-table-column>
      <el-table-column
        label="显示菜类型">
        <template slot-scope="scope">
          <span v-for="(type,index) in scope.row.showContexList" :key="index">
            {{type.name}}
            <span v-if="index < scope.row.showContexList.length-1">,</span>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button @click="updateKdsInfo(scope.row,0)" type="text" size="small">编辑</el-button>
          <el-button @click="deleteKds(scope.row)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @current-change="handleCurrentChange"
      :current-page.sync="pageInfo.currentPage"
      :page-size="pageInfo.pageSize"
      layout="total, prev, pager, next"
      v-show="pageInfo.totalCount"
      :total="pageInfo.totalCount">
    </el-pagination>

    <el-dialog :title="title" :visible.sync="dialogFormVisible"
               :close-on-click-modal="false">
      <el-form label-width="120px" :model="selectKds" ref="selectKds" :rules="rules">
        <el-form-item label="KDS名称:" prop="kdsName">
          <el-input
            type="text"
            v-model.trim="selectKds.kdsName"
            auto-complete="off"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="合并模式:" prop="model.code">
          <el-select v-model="selectKds.model.code" placeholder="选择KDS合并模式">
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in modelList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设置菜类型:">
          <el-checkbox-group v-model="selectedShowContex">
            <el-checkbox :label="cont.kindCode"
                         name="cont" v-for="(cont,index) in kindList"
                         :key="index">{{cont.kindName+(cont.kdsName?'（'+cont.kdsName+'）':'')}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="kdsInfoSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'kds',
  data () {
    return {
      KdsList: [],
      loading: true,
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      title: '',
      dialogFormVisible: false,
      selectKds: {
        kdsId: '',
        kdsName: '',
        model: {
          code: '',
          name: ''
        },
        showContex: {
          code: '',
          name: ''
        }
      },
      rules: {
        kdsName: [
          { required: true, message: '请输入KDS名称', trigger: 'blur' },
          { validator: this.validKdsName, trigger: 'blur' }
        ],
        model: {
          code: [
            { required: true, message: '请选择合并模式', trigger: 'change' }
          ]
        }
      },
      updateFlag: '',
      modelList: [],
      kindList: [],
      selectedShowContex: [],
      kdsNameOld: '',
      unusedKind: []
    }
  },
  mounted () {
    this.getKdsTotalCount()
    this.getKdsList()
  },
  methods: {
    /* 获取KDS列表 */
    getKdsList () {
      this.loading = true
      let that = this
      this.$axios.get('/api/store/getkdslist?curPage=' + this.pageInfo.currentPage + '&pageSize=' + this.Const.PAGE_SIZE).then(function (res) {
        that.KdsList = res.dataList
        that.loading = false
        that.getUnusedKind()
      })
    },
    getKdsTotalCount () {
      let that = this
      this.$axios.get('/api/store/getkdscount').then(function (res) {
        if (res.code === 0) {
          that.pageInfo.totalCount = res.data
        } else {
          that.pageInfo.totalCount = 0
        }
      })
    },
    getUnusedKind () {
      this.unusedKind = []
      let that = this
      this.$axios.get('/api/store/getunusedkind').then(function (res) {
        that.unusedKind = res.dataList
      })
    },
    /* 编辑或添加KDS信息 */
    updateKdsInfo (row, code) {
      this.getModelList()
      this.selectedShowContex = []
      this.kdsNameOld = ''
      this.dialogFormVisible = true
      this.$nextTick(function () {
        this.$refs['selectKds'].clearValidate()
      })
      if (code === 0) {
        this.kdsNameOld = row.kdsName
        this.getKindList(row.showContexList)
        this.updateFlag = true
        this.title = '编辑KDS'
        this.selectKds.kdsId = row.kdsId
        this.selectKds.kdsName = row.kdsName
        this.selectKds.model.code = parseInt(row.modelCode)
      } else {
        this.getKindList(false)
        this.updateFlag = false
        this.title = '添加KDS'
        this.selectKds = {
          kdsId: '',
          kdsName: '',
          model: {
            code: '',
            name: ''
          },
          showContex: {
            code: '',
            name: ''
          }
        }
      }
    },
    /* 删除KDS信息 */
    deleteKds (row) {
      this.$confirm('确定删除' + row.kdsName + '吗', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this
        this.$axios.get('/api/store/deletekds?id=' + row.kdsId).then(function (res) {
          that.getKdsList()
          that.getKdsTotalCount()
          if (res.code === 0) {
            that.$message({
              type: 'success',
              message: '删除成功!'
            })
          } else {
            that.$message({
              type: 'info',
              message: '删除失败!'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /* 获取合并模式列表 */
    getModelList () {
      let that = this
      this.$axios.get('/api/common/dictionarylist?type=model').then(function (res) {
        that.modelList = res.dataList
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getKdsList()
    },
    /* 获取菜类型列表 */
    getKindList (list) {
      let that = this
      if (list) {
        for (let j = 0; j < list.length; j++) {
          that.selectedShowContex.push(list[j].code)
        }
      }
      this.$axios.get('/api/store/getkindlist').then(function (res) {
        that.kindList = res.dataList
      })
    },
    /* 点击保存 */
    kdsInfoSubmit () {
      this.$nextTick(function () {
        this.$refs['selectKds'].validate((valid) => {
          if (valid) {
            this.selectKds.dataType = 0
            this.selectKds.storeId = sessionStorage.getItem('storeId')
            this.selectKds.showContex.code = -1
            let submitList = []
            submitList.push(this.selectKds)
            for (let i = 0; i < this.selectedShowContex.length; i++) {
              let item = {
                kdsId: this.selectKds.kdsId,
                kdsName: this.selectKds.kdsName,
                model: {
                  code: this.selectKds.model.code
                },
                showContex: {
                  code: this.selectedShowContex[i]
                },
                dataType: 1,
                storeId: sessionStorage.getItem('storeId')
              }
              submitList.push(item)
            }
            this.dialogFormVisible = false
            let that = this
            let url = '/api/store/'
            let msg = ''
            if (this.updateFlag) {
              url += 'updatekds'
              msg = '修改'
            } else {
              url += 'addkds'
              msg = '添加'
            }
            this.$axios.post(url, submitList).then(function (res) {
              that.getKdsList()
              that.getKdsTotalCount()
              if (res.code === 0) {
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
            })
          }
        })
      })
    },
    /* kds名称校验 */
    validKdsName (rule, name, callback) {
      if (this.kdsNameOld === name) {
        callback()
      } else {
        this.$axios.get('/api/store/getKdsName?name=' + name).then(function (res) {
          if (res.code === 0) {
            if (res.data === 0) {
              callback()
            } else {
              callback(new Error('重复的KDS名称'))
            }
          }
        })
      }
    }
  }
}
</script>

<style scoped lang="less">
  .kdsSetting{
    .add_kds{
      padding: 0 10px 10px;
      float: right;
    }
  }
</style>

<style lang="less">
  .kdsSetting{
    .cell{
      text-align: center;
    }
    .el-select{
      width: 90%;
      .el-input{
        width: 100%;
      }
    }
    .el-checkbox{
      margin-left: 0 !important;
      margin-right: 30px;
      width: 138px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
