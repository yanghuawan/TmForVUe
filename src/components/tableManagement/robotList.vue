<template>
  <div class="robot-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">机器人列表</span>
      </div>
      <div class="filter">
        <div class="input-item">
          <el-input v-model="selectInfo.sn"
                    placeholder="机器人SN码"></el-input>
        </div>
        <div class="input-item">
          <el-select v-model="selectInfo.areaId" placeholder="选择区域">
            <el-option
              label="请选择区域"
              value=""></el-option>
            <el-option
              v-for="(item,index) in areaList"
              :key="index"
              :label="item.areaName"
              :value="item.id">
            </el-option>
          </el-select>
        </div>
        <div class="input-item">
          <el-select v-model="selectInfo.status" placeholder="使用状态">
            <el-option
              label="请选择使用状态"
              value=""></el-option>
            <el-option
              v-for="(item,index) in status"
              :key="index"
              :label="item.statusName"
              :value="item.statusCode">
            </el-option>
          </el-select>
        </div>
        <el-button type="primary" @click="getRobotList();getRobotTotalCount()">搜索</el-button>
      </div>
      <div class="note">{{kdsCount}}个KDS，{{deskCount}}个桌台未关联机器人</div>
      <el-table
        v-loading="loading"
        element-loading-text="数据加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :data="robotList"
        border
        stripe
        style="width: 100%">
        <el-table-column
          prop="sn"
          label="机器人SN码">
        </el-table-column>
        <el-table-column
          prop="functionName"
          label="机器人功能">
        </el-table-column>
        <el-table-column
          prop="areaName"
          label="所属区域">
        </el-table-column>
        <el-table-column
          prop="deskName"
          label="所属台号">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="scope">
            <span>{{scope.row.status===0?'使用中':'未使用'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="updateRobotStatus(scope.row)">{{scope.row.status===0?'解绑':'绑定'}}</el-button>
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

    <el-dialog title="绑定" :visible.sync="dialogFormVisible"
               :close-on-click-modal="false">
      <el-form label-width="120px" :model="selectRobot" ref="selectRobot" :rules="rules">
        <el-form-item label="机器人功能:" prop="functionId">
          <el-select v-model="selectRobot.functionId" placeholder="请选择机器人功能" @change="functionChange()">
            <el-option :label="item.kdsName" :value="item.kdsId" v-for="(item,index) in functionList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择区域:" v-if="showFlag" prop="areaId">
          <el-select v-model="selectRobot.areaId" placeholder="请选择机器人功能" @change="areaChange()">
            <el-option :label="item.areaName" :value="item.id" v-for="(item,index) in areaList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择桌台:" v-if="showFlag" prop="deskId">
          <el-select v-model="selectRobot.deskId" placeholder="请选择机器人功能" :disabled="deskDisabled">
            <el-option :label="item.name" :value="item.id" v-for="(item,index) in deskListByArea" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="robotInfoSubmit()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import arealist from '@/components/tableManagement/arealist'
export default {
  name: 'robotList',
  mixins: [arealist],
  data () {
    return {
      robotList: [],
      loading: '',
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      selectInfo: {
        sn: '',
        areaId: '',
        status: ''
      },
      status: [
        {
          statusCode: '1',
          statusName: '未使用'
        },
        {
          statusCode: '0',
          statusName: '使用中'
        }
      ],
      kdsCount: 0,
      deskCount: 0,
      functionList: [],
      dialogFormVisible: false,
      selectRobot: {},
      rules: {
        functionId: [
          { required: true, message: '请选择机器人功能', trigger: 'blur' }
        ],
        areaId: [
          { validator: this.validArea, trigger: 'change' }
        ],
        deskId: [
          { validator: this.validDesk, trigger: 'change' }
        ]
      },
      showFlag: false,
      deskDisabled: true,
      deskListByArea: [],
      type: 1
    }
  },
  mounted () {
    this.getRobotList()
    this.getRobotTotalCount()
  },
  methods: {
    /* 验证区域 */
    validArea (rule, val, callback) {
      if (this.showFlag) {
        if (!val) {
          callback(new Error('请选择区域'))
        } else {
          callback()
        }
      }
    },
    /* 验证桌台 */
    validDesk (rule, val, callback) {
      if (this.showFlag) {
        if (!val) {
          callback(new Error('请选择桌台'))
        } else {
          callback()
        }
      }
    },
    /* 获取桌台列表 */
    getRobotList () {
      this.loading = true
      let that = this
      let params = 'curPage=' + this.pageInfo.currentPage
      params += '&rows=' + this.pageInfo.pageSize
      params += '&sn=' + this.selectInfo.sn
      params += '&areaId=' + this.selectInfo.areaId
      params += '&status=' + this.selectInfo.status
      this.getFreeDeskCount()
      this.getFreeKdsCount()
      this.$axios.get('/api/robot/robotlist?' + params).then(function (res) {
        that.robotList = res.dataList
        that.loading = false
      })
    },
    /* 获取总条数 */
    getRobotTotalCount () {
      let that = this
      let params = 'sn=' + this.selectInfo.sn
      params += '&areaId=' + this.selectInfo.areaId
      params += '&status=' + this.selectInfo.status
      this.$axios.get('/api/robot/robotcount?' + params).then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getRobotList()
    },
    /* 修改机器人状态 */
    updateRobotStatus (row) {
      if (row.status === 1) {
        this.getFunctionList()
        this.selectRobot = row
        this.showFlag = false
        this.dialogFormVisible = true
        this.$nextTick(function () {
          this.$refs['selectRobot'].clearValidate()
        })
      } else {
        this.$confirm('确定解绑该机器人' + row.sn + '吗', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let that = this
          this.$axios.get('/api/robot/relievebind2desk?ids=' + row.id).then(function (res) {
            that.getRobotList()
            if (res.code === 0) {
              that.$message({
                type: 'success',
                message: '解绑成功!'
              })
            } else {
              that.$message({
                type: 'success',
                message: '解绑失败!'
              })
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消解绑'
          })
        })
      }
    },
    /* 获取机器人功能列表 */
    getFunctionList () {
      let that = this
      this.$axios.get('/api/store/getfunctions').then(function (res) {
        that.functionList = res.dataList
      })
    },
    /* 根据区域id获取桌台列表 */
    getDeskListByArea () {
      let that = this
      this.$axios.get('/api/desk/desklist?areaCode=' + this.selectRobot.areaId).then(function (res) {
        that.deskListByArea = res.dataList
      })
    },
    /* 选择机器人功能 */
    functionChange () {
      if (this.functionList) {
        this.deskDisabled = true
        if (this.selectRobot.functionId === this.functionList[0].kdsId) {
          this.showFlag = true
          this.type = 1
        } else {
          this.$nextTick(function () {
            this.$refs['selectRobot'].clearValidate()
          })
          this.showFlag = false
          this.selectRobot.areaId = ''
          this.selectRobot.deskId = ''
          this.type = 2
        }
      }
    },
    /* 选择所属区域 */
    areaChange () {
      this.deskDisabled = false
      this.selectRobot.deskId = ''
      this.getDeskListByArea()
    },
    /* 提交绑定信息 */
    robotInfoSubmit () {
      this.$nextTick(function () {
        this.$refs['selectRobot'].validate((valid) => {
          if (valid) {
            this.dialogFormVisible = false
            let that = this
            let params = 'robotId=' + this.selectRobot.id + '&deskId=' + this.selectRobot.deskId + '&functionId=' + this.selectRobot.functionId
            params += '&type=' + this.type
            this.$axios.get('/api/robot/addbind2desk?' + params).then(function (res) {
              that.getRobotList()
              that.getRobotTotalCount()
              if (res.code === 0) {
                that.$message({
                  type: 'success',
                  message: '绑定成功!'
                })
              } else {
                that.$message({
                  type: 'success',
                  message: '绑定失败!'
                })
              }
            })
          }
        })
      })
    },
    /* 获取空闲kds数量 */
    getFreeKdsCount () {
      let that = this
      this.$axios.get('/api/robot/getfreekds').then(function (res) {
        that.kdsCount = res.data
      })
    },
    /* 获取空闲桌台数量 */
    getFreeDeskCount () {
      let that = this
      this.$axios.get('/api/robot/getfreedesk').then(function (res) {
        that.deskCount = res.data
      })
    }
  }
}
</script>

<style scoped lang="less">
  .robot-list{
    .input-item{
      width: 200px;
      float: left;
      margin: 0 10px 10px 0;
    }
    .filter{
      width: 100%;
      height: 45px;
    }
    .note{
      width: 100%;
      height: 30px;
      line-height: 30px;
      margin-bottom: 10px;
      font-size: 15px;
    }
  }
</style>

<style lang="less">
  .robot-list{
    .cell{
      text-align: center;
    }
    .el-select{
      width: 90%;
      .el-input{
        width: 100%;
      }
    }
    .input-item{
      .el-input__inner{
        height: 35px;
      }
    }
    .el-button{
      height: 35px;
    }
    .el-dialog__body{
      min-height: 155px;
    }
  }
</style>
