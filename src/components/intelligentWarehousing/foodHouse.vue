<template>
  <div class="listening-food">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">食材库</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="updateFoodInfo(null,0)">新增食材</el-button>
      </div>

      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="食材名称：">
          <el-input v-model="selectInfo.name" size="medium"></el-input>
        </el-form-item>
        <el-form-item label="食材类型：">
          <el-select v-model="selectInfo.kind" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in foodKindList"
                       :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建者：">
          <el-select v-model="selectInfo.create" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in createList"
                       :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="食材是否为监控状态：">
          <el-select v-model="selectInfo.status" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in status" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-button style="padding: 3px;margin-left: 110px" type="text" @click="clearFilter">清空搜索条件</el-button>
        <el-button type="primary" size="medium" @click="getFoodList();getFoodCount()">查询</el-button>
      </el-form>

      <el-table
        v-loading="loading"
        element-loading-text="数据加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :data="foodList"
        max-height="700"
        border
        stripe
        style="width: 100%">
        <el-table-column
          prop="name"
          label="食材名称">
        </el-table-column>
        <el-table-column
          prop="kindName"
          label="食材类型">
        </el-table-column>
        <el-table-column
          prop="creatorName"
          label="创建者">
        </el-table-column>
        <el-table-column
          label="食材是否为监控状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :active-value="0"
              :inactive-value="1"
              @change="getUpdateListeningStatusCount(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="300"
          align="center">
          <template slot-scope="scope">
            <el-button @click="updateFoodInfo(scope.row,1)" type="text" size="small"
                       v-if="scope.row.creatorName !=='平台'">编辑
            </el-button>
            <el-button @click="deleteFoodInfo(scope.row)" type="text" size="small"
                       v-if="scope.row.creatorName !== '平台'">删除
            </el-button>
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
    </el-card>
    <el-dialog :title="title" :visible.sync="dialogFormVisible"
               :before-close="handleClose"
               :close-on-click-modal="false">
      <el-form ref="foodData" :model="foodData" label-width="120px" :rules="rules">
        <el-form-item label="食材名称:" prop="name">
          <el-input
            type="text"
            v-model.trim="foodData.name"
            placeholder="请输入食材名称"
            auto-complete="off"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="食材类型:" prop="kind">
          <div>
            <el-radio-group v-model="foodData.kind">
              <el-radio v-for="(item,index) in foodKindList" :key="index" :label="item.code">{{item.name}}</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="foodInfoSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'foodHouse',
  data () {
    return {
      foodList: [{
        creatorName: ''
      }],
      loading: true,
      selectInfo: {
        name: '',
        kind: '',
        create: '',
        status: ''
      },
      foodKindList: [],
      createList: [],
      status: [
        {
          name: '是',
          code: 0
        },
        {
          name: '否',
          code: 1
        }
      ],
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      dialogFormVisible: false,
      updateFlag: '',
      foodData: {},
      rules: {
        name: [
          /* 非空校验 */
          {required: true, message: '请输入食材名称', trigger: 'blur'},
          {validator: this.validFoodName, trigger: 'blur'}
        ],
        kind: [
          {required: true, message: '请输入食材名称', trigger: 'blur'}
        ]
      },
      radio: '1',
      title: ''
    }
  },
  mounted () {
    this.getFoodList()
    this.getFoodCount()
    this.getCommonData('food_kind', 'foodKindList')
    this.getCommonData('food_creator', 'createList')
  },
  methods: {
    validFoodName (rule, val, callback) {
      if (this.foodData.name) {
        this.$axios.get('/api/foodmaterial/validfoodname?name=' + val).then(function (res) {
          if (res.data === 0) {
            callback()
          } else {
            callback(new Error('食材名称已存在'))
          }
        })
      }
    },
    getFoodCount () {
      let that = this
      let url = 'name=' + this.selectInfo.name
      url += '&kind=' + this.selectInfo.kind
      url += '&creator=' + this.selectInfo.create
      url += '&status=' + this.selectInfo.status
      this.$axios.get('/api/foodmaterial/getfoodtotalcount?' + url).then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    },
    getFoodList () {
      this.loading = true
      let that = this
      let url = 'curPage=' + this.pageInfo.currentPage
      url += '&rows=' + this.pageInfo.pageSize
      url += '&name=' + this.selectInfo.name
      url += '&kind=' + this.selectInfo.kind
      url += '&creator=' + this.selectInfo.create
      url += '&status=' + this.selectInfo.status
      this.$axios.get('/api/foodmaterial/getfoodlist?' + url).then(function (res) {
        that.foodList = res.dataList
        that.loading = false
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getFoodList()
    },
    /* 清空搜索条件 */
    clearFilter () {
      this.selectInfo = {
        name: '',
        kind: '',
        create: '',
        status: ''
      }
    },
    /* 添加食材信息 */
    updateFoodInfo (food, code) {
      this.dialogFormVisible = true
      this.$nextTick(function () {
        this.$refs['foodData'].clearValidate()
      })
      if (code === 0) {
        this.updateFlag = false
        this.title = '新增食材'
        this.foodData = {
          name: '',
          kind: '',
          creator: ''
        }
      }
      if (code === 1) {
        this.updateFlag = true
        this.title = '编辑食材'
        this.foodData = food
      }
    },
    /* 删除食材信息 */
    deleteFoodInfo (rows) {
      let that = this
      this.$axios.get('/api/foodmaterial/getfoodusedcount?id=' + rows.id).then(function (res) {
        if (res.data === 0) {
          that.deleteFood(rows)
        } else {
          that.$alert('该食材已被菜品使用，无法删除', '删除', {
            confirmButtonText: '确定'
          })
        }
      })
    },
    /* 删除食材 */
    deleteFood (rows) {
      this.$confirm('确定移除' + rows.name + '吗', '提示', {
        confirmButtonText: '移除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this
        this.$axios.get('/api/foodmaterial/deletefood?ids=' + rows.id).then(function (res) {
          that.getFoodList()
          that.getFoodCount()
          if (res.code === 0) {
            that.$message({
              type: 'success',
              message: '删除成功！'
            })
          } else {
            that.$message({
              type: 'info',
              message: '删除失败'
            })
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      })
    },
    /* 提交食材信息 */
    foodInfoSubmit () {
      this.$nextTick(function () {
        this.$refs['foodData'].validate((valid) => {
          if (valid) {
            this.dialogFormVisible = false
            let that = this
            let msg = ''
            let url = '/api/foodmaterial/'
            if (this.updateFlag) {
              msg = '修改'
              url += 'updatefood'
            } else {
              msg = '增加'
              url += 'addfood'
            }
            this.$axios.post(url, this.foodData).then(function (res) {
              if (res.code === 0) {
                that.$message({
                  type: 'success',
                  message: msg + '成功!'
                })
              } else {
                that.$message({
                  type: 'success',
                  message: msg + '失败!'
                })
              }
              that.getFoodList()
              that.getFoodCount()
            })
          }
        })
      })
    },
    /* 修改食材监控状态 */
    getChangeStatus (rows) {
      let that = this
      this.$axios.get('/api/foodmaterial/updatestatus?id=' + rows.id + '&status=' + rows.status).then(function (res) {
        if (res.code === 0) {
          that.$message({
            type: 'success',
            message: '监控状态修改成功'
          })
        } else {
          that.$message({
            type: 'info',
            message: '监控状态修改失败'
          })
        }
      })
    },
    /* 获得修改监控状态的数据 */
    getUpdateListeningStatusCount (rows) {
      let that = this
      if (rows.status === 0) {
        this.$axios.get('/api/foodmaterial/getlisteningcount').then(function (res) {
          if (res.data >= 10) {
            that.$alert('您已监控10条食材，达上限', '提示', {
              confirmButtonText: '确定'
            })
            that.getFoodList()
            that.getFoodCount()
          } else {
            that.getChangeStatus(rows)
          }
        })
      } else {
        this.getChangeStatus(rows)
      }
    },
    getCommonData (type, list) {
      let that = this
      this.$axios.get('/api/common/dictionarylist?type=' + type).then(function (res) {
        that[list] = res.dataList
      })
    },
    handleClose (done) {
      this.getFoodList()
      done()
    }
  }
}
</script>
<style scoped lang="less">
  .listening-food {
  }
</style>

<style lang="less">
  .listening-food {
    .cell {
      text-align: center;
    }
    .el-radio + .el-radio {
      margin-left: 0;
    }
    .el-radio {
      margin: 10px !important;
    }
  }
</style>
