<template>
  <div class="region-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">区域列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="updateAreaInfo(null,1)">新增区域</el-button>
      </div>
      <el-table
        :data="areaList"
        border
        stripe
        style="width: 100%">
        <el-table-column
          prop="areaName"
          label="区域名称">
        </el-table-column>
        <el-table-column
          prop="deskCount"
          label="桌台数">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button @click="updateAreaInfo(scope.row,0)" type="text" size="small">编辑</el-button>
            <el-button @click="deleteAreaInfo(scope.row)" type="text" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="title" :visible.sync="dialogFormVisible" @close='closeDialog'
               :close-on-click-modal="false">
      <el-form label-width="120px" :model="selectArea" ref="selectArea" :rules="rules">
        <el-form-item label="区域名称:" prop="areaName">
          <el-input
            type="text"
            v-model.trim="selectArea.areaName"
            auto-complete="off"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="areaInfoSubmit">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import arealist from '@/components/tableManagement/arealist'
export default {
  name: 'regionList',
  mixins: [arealist],
  data () {
    return {
      dialogFormVisible: false,
      selectArea: {},
      rules: {
        areaName: [
          { required: true, message: '请输入区域名称', trigger: 'blur' },
          { validator: this.validName, trigger: 'blur' }
        ]
      },
      updateFlag: '',
      title: ''
    }
  },
  mounted () {
  },
  methods: {
    closeDialog () {
      this.getAreaList()
    },
    validName (rule, val, callback) {
      this.$axios.get('/api/area/validareaname?areaName=' + val).then(function (res) {
        if (res.data === 0) {
          callback()
        } else {
          callback(new Error('区域名称已存在'))
        }
      })
    },
    /* 编辑或新增桌台信息 */
    updateAreaInfo (row, code) {
      this.dialogFormVisible = true
      this.$nextTick(function () {
        this.$refs['selectArea'].clearValidate()
      })
      if (code === 0) {
        this.updateFlag = true
        this.title = '编辑区域'
        this.selectArea = row
      } else {
        this.updateFlag = false
        this.title = '新增区域'
        this.selectArea = {
          areaName: ''
        }
      }
    },
    /* 删除桌台信息 */
    deleteAreaInfo (row) {
      this.$confirm('确定删除' + row.areaName + '吗', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this
        this.$axios.get('/api/area/delarea?ids=' + row.id).then(function (res) {
          that.getAreaList()
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
    /* 提交桌台信息 */
    areaInfoSubmit () {
      this.$nextTick(function () {
        this.$refs['selectArea'].validate((valid) => {
          this.dialogFormVisible = false
          let that = this
          let msg = ''
          let url = '/api/area/'
          if (valid) {
            if (this.updateFlag) {
              msg = '修改'
              url += 'updatearea'
            } else {
              msg = '增加'
              url += 'addarea'
            }
            this.$axios.post(url, this.selectArea).then(function (res) {
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
              that.getAreaList()
            })
          }
        })
      })
    }
  }
}
</script>

<style scoped lang="less">

</style>

<style lang="less">
  .region-list{
    .cell{
      text-align: center;
    }
  }
</style>
