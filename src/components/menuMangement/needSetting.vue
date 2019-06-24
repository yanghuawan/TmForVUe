<template>
  <div class="need-setting">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">必点项设置
        <span class="suggestion">Tips：必点项失效，通常是因为菜品已被下架或删除，或者删除了必点规格等</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="updateNeedContent(null,1)">新增必点项</el-button>
        </span>
      </div>
      <div>
        <el-table
          :data="needFoodList"
          stripe
          border
          style="width: 100%">
          <el-table-column
          prop="needName"
          label="必点菜品">
          </el-table-column>
          <el-table-column
          prop="needNum"
          label="必点数量">
          </el-table-column>
          <el-table-column
          label="状态"
          >
            <template slot-scope="scope">
              <span :class="scope.row.needStatus === 0?'':'redFont'">{{scope.row.needStatus === 0 ? '正常' : '已失效'}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作">
            <template slot-scope="scope">
              <el-button @click="updateNeedContent(scope.row,0)" type="text" size="small" v-if="scope.row.needStatus === 0">编辑</el-button>
              <el-button @click="deleteNeedInfo(scope.row)" type="text" size="small">删除</el-button>
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
      </div>
    </el-card>

    <el-dialog
    :title="title"
    :visible.sync="dialogFormVisible"
    :before-close="handleClose"
    >
      <el-form :model="updateNeed" ref="updateNeed" :rules="rules">
        <el-form-item label="必点菜品:" prop="dishName">
          <div>
          <span v-if="firstClick"><el-button @click="getSelectDishList()">选择菜品</el-button></span>
          <span v-else>
            <el-input v-model="updateNeed.dishName" style="width: 200px" readonly></el-input>
            <el-button type="text" @click="getSelectDishList()">修改</el-button>
          </span>
          </div>
        </el-form-item>
        <el-form-item label="选择规格" v-if="updateNeed.chooseList.length > 0" prop="needChoose">
          <el-select v-model="updateNeed.needChoose" placeholder="选择规格">
            <el-option v-for="choose in updateNeed.chooseList"
                       :key="choose"
                       :label="choose"
                       :value="choose"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="必点数量:" prop="needNum">
          <el-select v-model="updateNeed.needNum" placeholder="请选择数量">
            <el-option label="与用餐人数一致" value="与用餐人数一致"></el-option>
            <el-option v-for="n in 20"
                       :key="n"
                       :label="n"
                       :value="n"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmButton()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="选择菜品"
               :visible.sync="innerVisible"
               :before-close="handleClose2"
               append-to-body>
      <div style="margin-bottom: 10px"><el-input v-model="inputFoodName" prefix-icon="el-icon-search" placeholder="请输入内容"></el-input></div>
      <el-table
        :data="tables"
        height="400"
        stripe
        border>
        <el-table-column
          prop="dishName"
          label="菜品名称">
        </el-table-column>
        <el-table-column
          prop="navName"
          label="所属分类"
        ></el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.needFlag === 0 && scope.row.needStatus === 0">已添加</span>
            <el-button v-else type="text" @click="addNeedDish(scope.row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'needSetting',
  data () {
    return {
      needFoodList: [{
        needChoose: ''
      }],
      updateNeed: {
        dishName: '',
        needNum: '',
        chooseList: []
      },
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      selectDishList: [],
      title: '',
      dialogFormVisible: false,
      dialogFormVisible2: false,
      innerVisible: false,
      value: '',
      inputFoodName: '',
      firstClick: true,
      rules: {
        dishName: [
          { required: true, message: '请选择必点菜品', trigger: 'blur' }
        ],
        needNum: [
          { required: true, message: '请选择必点数量', trigger: 'change' }
        ],
        needChoose: [
          { required: true, message: '请选择必点规格', trigger: 'change' }
        ]
      }
    }
  },
  mounted () {
    this.getNeedFoodList()
    this.getNeedFoodCount()
    this.$message.closeAll()
  },
  computed: {
    tables () {
      const inputFoodName = this.inputFoodName
      if (inputFoodName) {
        return this.selectDishList.filter(data => {
          return Object.keys(data).some(key => {
            return String(data[key]).toLowerCase().indexOf(inputFoodName) > -1
          })
        })
      }
      return this.selectDishList
    }
  },
  methods: {
    /* 必点菜品列表 */
    getNeedFoodList () {
      let that = this
      this.$axios.get('/api/dish/getneedlist?curPage=1&rows=20').then(function (res) {
        that.needFoodList = res.dataList
        for (let i = 0; i < res.dataList.length; i++) {
          that.needFoodList[i].needName = res.dataList[i].needChoose ? res.dataList[i].dishName + '  (' + res.dataList[i].needChoose + ')' : res.dataList[i].dishName
          that.needFoodList[i].needNum = res.dataList[i].needNum ? res.dataList[i].needNum : ''
          that.needFoodList[i].chooseList = res.dataList[i].chooseList ? JSON.parse(res.dataList[i].chooseList) : []
        }
      })
    },
    /* 必点菜品数量 */
    getNeedFoodCount () {
      let that = this
      this.$axios.get('/api/dish/getneedcount').then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    },
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getNeedFoodList()
    },
    /* 可选必点项目列表 */
    getSelectDishList () {
      let that = this
      this.$axios.get('/api/dish/getselectdish').then(function (res) {
        if (res.code === 0) {
          that.selectDishList = res.dataList
          for (let i = 0; i < res.dataList.length; i++) {
            that.selectDishList[i].chooseList = res.dataList[i].chooseList ? JSON.parse(res.dataList[i].chooseList) : []
          }
        }
      })
      this.innerVisible = true
    },
    /* 编辑必点内容 */
    updateNeedContent (rows, index) {
      // console.log(rows)
      this.dialogFormVisible = true
      this.$nextTick(function () {
        this.$refs['updateNeed'].clearValidate()
      })
      if (index === 0) {
        this.updateNeed = rows
        this.title = '编辑'
        this.firstClick = false
      } else {
        this.title = '新增'
        this.updateNeed = {
          dishName: '',
          needNum: '',
          needChoose: '',
          chooseList: []
        }
        this.firstClick = true
      }
    },
    confirmButton () {
      let that = this
      this.$refs['updateNeed'].validate((valid) => {
        if (valid) {
          if (that.title === '新增') {
            that.confirmAddNeedDish()
          } else {
            that.confirmUpdateNeed()
          }
        } else {
          return false
        }
      })
    },
    /* 编辑必点菜品 */
    confirmUpdateNeed () {
      this.dialogFormVisible = false
      let that = this
      this.$axios.post('/api/dish/updateneed',
        {
          id: that.updateNeed.id,
          needFlag: 0,
          needStatus: 0,
          needNum: that.updateNeed.needNum,
          needChoose: that.updateNeed.needChoose
        }
      ).then(function (res) {
        that.getNeedFoodList()
        if (res.code === 0) {
          that.$message({
            message: '修改成功',
            type: 'success'
          })
        } else {
          that.$message({
            message: '修改失败',
            type: 'success'
          })
        }
      })
    },
    /* 新增必点菜品 */
    confirmAddNeedDish () {
      let that = this
      this.dialogFormVisible = false
      this.$axios.post('/api/dish/addneed',
        {
          id: this.updateNeed.id,
          needNum: this.updateNeed.needNum,
          needChoose: this.updateNeed.needChoose ? this.updateNeed.needChoose : ''
        }
      ).then(function (res) {
        that.getNeedFoodList()
        that.getNeedFoodCount()
        if (res.code === 0) {
          that.$message({
            message: '新增必点项成功',
            type: 'success'
          })
        } else {
          that.$message({
            message: '新增必点项失败'
          })
        }
      })
    },
    /* 删除必点菜品 */
    deleteNeedInfo (rows) {
      let that = this
      this.$confirm('移除必点菜品: ' + rows.dishName + '  你确定删除这个必点项吗？', '移除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        that.$axios.get('/api/dish/delneed?id=' + rows.id).then(function (res) {
          that.getNeedFoodList()
          that.getNeedFoodCount()
          if (res.code === 0) {
            that.$message({
              type: 'success',
              message: '删除成功'
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
    addNeedDish (rows) {
      this.updateNeed = rows
      this.innerVisible = false
      this.firstClick = false
    },
    handleClose (done) {
      this.getNeedFoodList()
      done()
    },
    handleClose2 (done) {
      this.inputFoodName = ''
      done()
    }
  }
}
</script>

<style scoped lang="less">
  .need-setting{
    .suggestion{
      color: #999999;
      font-size: 14px;
      margin-left: 2px;
      font-weight: normal;
    }
    .redFont{
      color: red;
    }
    .indexInfo{
      font-size: 13px;
      letter-spacing: 2px;
    }
  }
</style>

<style lang="less">
  .need-setting{
    .cell{
      text-align: center;
    }
    .el-form-item__error {
      left: 80px;
    }
  }
</style>
