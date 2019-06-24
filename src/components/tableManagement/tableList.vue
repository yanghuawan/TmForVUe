<template>
  <div class="table-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">桌台列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="updateDeskInfo(null,1)">新增桌台</el-button>
      </div>
      <el-table
        v-loading="loading"
        element-loading-text="数据加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :data="tableList"
        border
        stripe
        style="width: 100%">
        <el-table-column
          prop="areaName"
          label="所属区域">
        </el-table-column>
        <el-table-column
          prop="name"
          label="桌台名称">
        </el-table-column>
        <el-table-column
          prop="capacity"
          label="可坐人数">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button @click="updateDeskInfo(scope.row,0)" type="text" size="small">编辑</el-button>
            <el-button @click="deleteDeskInfo(scope.row)" type="text" size="small">删除</el-button>
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
      <el-form label-width="120px" :model="selectDesk" ref="selectDesk" :rules="rules">
        <el-form-item label="所属区域:" prop="areaId">
          <el-select v-model="selectDesk.areaId" placeholder="选择区域">
            <el-option :label="item.areaName" :value="item.id" v-for="(item,index) in areaList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="桌台名称:" prop="name">
          <el-input
            type="text"
            v-model.trim="selectDesk.name"
            auto-complete="off"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="可坐人数:" prop="capacity">
          <el-input
            type="number"
            min="1"
            max="20"
            v-model.trim="selectDesk.capacity"
            placeholder="范围：1-20"
            auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deskInfoSubmit">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import arealist from '@/components/tableManagement/arealist'
export default {
  name: 'tableList',
  mixins: [arealist],
  data () {
    return {
      tableList: [],
      loading: '',
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      dialogFormVisible: false,
      updateFlag: '',
      selectDesk: {},
      rules: {
        areaId: [
          { required: true, message: '请选择区域', trigger: 'change' }
        ],
        name: [
          { required: true, message: '请输入桌台名称', trigger: 'blur' },
          { validator: this.validName, trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '请输入可坐人数', trigger: 'blur' },
          { validator: this.validCapacity, trigger: 'blur' }
        ]
      },
      formLabelWidth: '120px',
      preName: '',
      title: ''
    }
  },
  mounted () {
    this.getTableList()
    this.getDeskTotalCount()
  },
  methods: {
    validName (rule, val, callback) {
      if (val === this.preName) {
        callback()
      }
      if (this.selectDesk.areaId) {
        this.$axios.get('/api/desk/validdeskname?name=' + val + '&areaId=' + this.selectDesk.areaId).then(function (res) {
          if (res.code === -1) {
            callback()
          } else {
            callback(new Error('桌台名称已存在'))
          }
        })
      }
    },
    /* 校验可坐人数 */
    validCapacity (rule, val, callback) {
      if (val > 20 || val < 1) {
        callback(new Error('超出可选范围1-20'))
      } else {
        callback()
      }
    },
    /* 获取桌台列表 */
    getTableList () {
      this.loading = true
      let that = this
      this.$axios.get('/api/desk/desklist?curPage=' + this.pageInfo.currentPage + '&rows=' + this.pageInfo.pageSize).then(function (res) {
        that.tableList = res.dataList
        that.loading = false
      })
    },
    /* 编辑或添加桌台信息 */
    updateDeskInfo (row, code) {
      this.dialogFormVisible = true
      this.$nextTick(function () {
        this.$refs['selectDesk'].clearValidate()
      })
      if (code === 0) {
        this.preName = row.name
        this.updateFlag = true
        this.title = '编辑桌台'
        this.selectDesk = row
      } else {
        this.updateFlag = false
        this.title = '新增桌台'
        this.selectDesk = {
          areaId: '',
          name: '',
          capacity: ''
        }
      }
    },
    /* 删除桌台信息 */
    deleteDeskInfo (row) {
      this.$confirm('确定删除' + row.areaName + row.name + '吗', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this
        this.$axios.get('/api/desk/deskdel?ids=' + row.id).then(function (res) {
          that.getTableList()
          that.getDeskTotalCount()
          if (res.code === 0) {
            that.$message({
              type: 'success',
              message: '删除成功!'
            })
          } else {
            that.$message({
              type: 'info',
              message: '删除失败'
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
    /* 获取总条数 */
    getDeskTotalCount () {
      let that = this
      this.$axios.get('/api/desk/deskcount').then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getTableList()
    },
    /* 提交桌台信息 */
    deskInfoSubmit () {
      this.$nextTick(function () {
        this.$refs['selectDesk'].validate((valid) => {
          if (valid) {
            this.dialogFormVisible = false
            let that = this
            let msg = ''
            let url = '/api/desk/'
            if (this.updateFlag) {
              msg = '修改'
              url += 'deskupdate'
            } else {
              msg = '增加'
              url += 'deskadd'
            }
            this.$axios.post(url, this.selectDesk).then(function (res) {
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
              that.getTableList()
              that.getDeskTotalCount()
            })
          }
        })
      })
    },
    handleClose (done) {
      this.getTableList()
      done()
    }
  }
}
</script>

<style scoped lang="less">

</style>

<style lang="less">
  .table-list{
    .cell{
      text-align: center;
    }
    .el-select{
      width: 100%;
    }
  }
</style>
