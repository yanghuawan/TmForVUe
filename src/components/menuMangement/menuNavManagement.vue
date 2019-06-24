<template>
  <div class="menu-nav">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">菜谱导航</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="updateNavInfo(null,1)">添加导航</el-button>
      </div>
      <el-table
        :data="navList"
        border
        stripe
        :default-sort="{prop:'priority'}"
        style="width: 100%">
        <el-table-column
          prop="navName"
          label="导航名称">
        </el-table-column>
        <el-table-column
          prop="count"
          label="拥有菜品数">
        </el-table-column>
        <el-table-column
          label="排序">
          <template slot-scope="scope">
            <span @click="goUp(scope)" class="cursor" v-if="scope.$index>0">↑</span>
            <span @click="goDown(scope)" class="cursor" v-if="scope.$index<navList.length-1">↓</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button @click="updateNavInfo(scope.row,0)" type="text" size="small">编辑</el-button>
            <el-button @click="deleteNavInfo(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="title" :visible.sync="dialogFormVisible"
               :before-close="handleClose"
               :close-on-click-modal="false">
      <el-form label-width="120px" :model="selectNav" ref="selectNav" :rules="rules" >
        <el-form-item label="导航名称:" prop="navName">
          <el-input
            type="text"
            v-model.trim="selectNav.navName"
            auto-complete="off"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="NavInfoSubmit">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'menuNavManagement',
  data () {
    return {
      navList: [],
      updateFlag: '',
      dialogFormVisible: false,
      selectNav: {
        navName: ''
      },
      rules: {
        navName: [
          { required: true, message: '请输入导航名称', trigger: 'blur' },
          { validator: this.validName, trigger: 'blur' }
        ]
      },
      title: ''
    }
  },
  mounted () {
    this.getNavList()
  },
  methods: {
    validName (rule, val, callback) {
      this.$axios.get('/api/nav/validname?name=' + val).then(function (res) {
        if (res.code === 0) {
          callback(new Error('该导航名称已存在'))
        } else {
          callback()
        }
      })
    },
    /* 获取菜谱导航列表 */
    getNavList () {
      let that = this
      this.$axios.get('/api/nav/list').then(function (res) {
        that.navList = res.dataList
      })
    },
    /* 编辑导航信息 */
    updateNavInfo (row, code) {
      this.dialogFormVisible = true
      this.$nextTick(function () {
        this.$refs['selectNav'].clearValidate()
      })
      if (code === 0) {
        this.updateFlag = true
        this.title = '编辑导航'
        this.selectNav = row
      } else {
        this.updateFlag = false
        this.title = '新增导航'
        this.selectNav = {
          navName: '',
          navId: ''
        }
      }
    },
    /* 删除桌台信息 */
    deleteNavInfo (row) {
      if (row.count > 0) {
        this.$alert(row.navName + '关联了菜品，无法删除。<br>请将该导航下的菜品分配到其他导航后再删除该导航。', '提示消息', {
          dangerouslyUseHTMLString: true
        })
        return
      }
      this.$confirm('确定删除' + row.navName + '吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this
        this.$axios.get('/api/nav/delete?id=' + row.navId).then(function (res) {
          that.getNavList()
          if (res.code === 0) {
            that.$message({
              type: 'success',
              message: '删除成功!'
            })
          } else {
            that.$message({
              type: 'success',
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
    /* 提交更新信息 */
    NavInfoSubmit () {
      this.$nextTick(function () {
        this.$refs['selectNav'].validate((valid) => {
          if (valid) {
            this.dialogFormVisible = false
            let url = '/api/nav/'
            let msg = ''
            let that = this
            if (this.updateFlag) {
              url += 'update'
              msg = '修改'
            } else {
              url += 'add'
              msg = '添加'
            }
            this.$axios.post(url, this.selectNav).then(function (res) {
              that.getNavList()
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
    /* 上移 */
    goUp (scope) {
      let index = scope.$index
      let pre = this.navList[index - 1].priority
      this.navList[index - 1].priority = scope.row.priority
      this.navList[index].priority = pre
      this.navList.splice(index, 1)
      this.navList.splice(index - 1, 0, scope.row)
      console.log(this.navList)
      this.prioritySubmit()
    },
    /* 下移 */
    goDown (scope) {
      let index = scope.$index
      let pre = this.navList[index + 1].priority
      this.navList[index + 1].priority = scope.row.priority
      this.navList[index].priority = pre
      this.navList.splice(index, 1)
      this.navList.splice(index + 1, 0, scope.row)
      console.log(this.navList)
      this.prioritySubmit()
    },
    prioritySubmit () {
      this.$axios.post('/api/nav/priority', this.navList).then(function (res) {
        console.log(res)
      })
    },
    handleClose (done) {
      this.getNavList()
      done()
    }
  }
}
</script>

<style scoped lang="less">
  .cursor{
    cursor: pointer;
    color: #000;
    margin: 0 5px;
  }
  .cursor:hover{
    color: #409EFF;
  }
</style>

<style lang="less">
  .menu-nav{
    .cell{
      text-align: center;
    }
  }
</style>
