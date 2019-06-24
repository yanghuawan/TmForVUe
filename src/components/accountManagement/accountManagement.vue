<template>
  <div class="account">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">账号管理</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="updateUserInfo('','1')">添加账号</el-button>
      </div>

      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="省:">
          <el-select v-model="province" size="medium" @change="getRegion(province,2)" filterable >
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.id + '-' + item.name" v-for="(item,index) in provinceList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="市:">
          <el-select v-model="city" size="medium" @change="getRegion(city,3)" filterable >
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.id + '-' + item.name" v-for="(item,index) in cityList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区:">
          <el-select v-model="area" size="medium" filterable >
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.id + '-' + item.name" v-for="(item,index) in areaList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="status" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in statusList" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        element-loading-text="数据加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :data="userList"
        border
        stripe
        style="width: 100%">
        <el-table-column
          prop="storeName"
          label="店铺名称">
        </el-table-column>
        <el-table-column
          prop="userRealName"
          label="姓名">
        </el-table-column>
        <el-table-column
          prop="tel"
          label="手机号">
        </el-table-column>
        <el-table-column
          label="店铺地址">
          <template slot-scope="scope">
            {{scope.row.district}}
          </template>
        </el-table-column>
        <el-table-column
          prop="roleName"
          label="角色">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="scope">
            {{scope.row.status===0?'正常':'禁用'}}
          </template>
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope" v-if="scope.$index>0">
            <el-button type="text" size="small" @click="detailDialog = true;selectUser=scope.row">查看详情</el-button>
            <el-button @click="updateUserInfo(scope.row,'0')" type="text" size="small">编辑</el-button>
            <el-button @click="deleteUser(scope.row)" type="text" size="small">删除</el-button>
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
      <el-form label-position="right" :model="selectUser" ref="selectUser" :rules="rules" label-width="120px">
        <el-form-item label="姓名:" prop="userRealName">
          <el-input
            type="text"
            v-model.trim="selectUser.userRealName"
            auto-complete="off"
            :disabled="updateFlag"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="手机号:" prop="tel">
          <el-input type="text"
                    v-model.trim="selectUser.tel"
                    auto-complete="off"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="密码:" v-if="!updateFlag">
          <el-input type="text"
                    v-model.trim="selectUser.passwd"
                    auto-complete="off"
                    :disabled="true"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="密码:" v-if="updateFlag">
          <el-button type="primary" plain v-if="showResetBtn" @click="resetPassword()">重置密码</el-button>
          <el-input type="text"
                    v-model.trim="selectUser.passwd"
                    auto-complete="off"
                    :disabled="true"
                    v-if="!showResetBtn"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="角色:">
          <el-input type="text"
                    v-model.trim="selectUser.roleName"
                    auto-complete="off"
                    :disabled="true"
                    clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitUser">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="餐厅详情" :visible.sync="detailDialog"
               :close-on-click-modal="false">
      <el-form label-position="right" label-width="120px">
        <el-form-item label="餐厅logo:">
          <img :src="selectUser.storeLogo?Const.IMAGE_PATH+selectUser.storeLogo:''" onerror=""/>
        </el-form-item>
        <el-form-item label="餐厅名称:">
          <span>{{selectUser.storeName}}</span>
        </el-form-item>
        <el-form-item label="固话:">
          <span>{{selectUser.storeTel}}</span>
        </el-form-item>
        <el-form-item label="手机号:">
          <span>{{selectUser.storeMobile}}</span>
        </el-form-item>
        <el-form-item label="店铺地址:">
          <span>{{selectUser.district}}{{selectUser.address}}{{selectUser.locationName}}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script type="text/javascript">
export default {
  name: 'accountManagement',
  data () {
    return {
      userList: [],
      loading: '',
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      title: '',
      dialogFormVisible: false,
      detailDialog: false,
      selectUser: {
        userRealName: '',
        tel: '',
        roleName: '',
        passwd: '',
        storeLogo: '',
        storeName: '',
        storeTel: '',
        storeMobile: '',
        district: '',
        address: '',
        locationName: ''
      },
      rules: {
        userRealName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        tel: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: this.validTel, trigger: 'blur' }
        ]
      },
      updateFlag: '',
      showResetBtn: '',
      childRole: {
        roleId: '',
        roleName: ''
      },
      statusList: [
        {
          code: 1,
          name: '禁用'
        },
        {
          code: 0,
          name: '正常'
        }
      ],
      provinceList: [],
      cityList: [],
      areaList: [],
      province: '',
      city: '',
      area: '',
      status: '',
      oldTel: ''
    }
  },
  mounted () {
    this.getChildRole()
    this.getUserList()
    this.getUserTotalCount()
    this.getRegion(0, 1)
  },
  watch: {
    province (cur, old) {
      if (cur !== old) {
        this.getUserList()
        this.getUserTotalCount()
      }
    },
    city (cur, old) {
      if (cur !== old) {
        this.getUserList()
        this.getUserTotalCount()
      }
    },
    area (cur, old) {
      if (cur !== old) {
        this.getUserList()
        this.getUserTotalCount()
      }
    },
    status (cur, old) {
      if (cur !== old) {
        this.getUserList()
        this.getUserTotalCount()
      }
    }
  },
  methods: {
    /* 验证手机号 */
    validTel (rule, val, callback) {
      let pattern = /^[1][3,4,5,7,8][0-9]{9}$/
      if (!pattern.test(val)) {
        callback(new Error('请输入正确的手机号'))
      }
      if (this.oldTel === val) {
        callback()
      }
      this.$axios.get('/api/user/validtel?tel=' + val).then(function (res) {
        if (res.code === 0) {
          callback(new Error('手机号已被' + res.data.userRealName + '占用'))
        } else {
          callback()
        }
      })
    },
    /* 获取省市区数据 */
    getRegion (id, level) {
      if (id) {
        id = id.substring(0, id.indexOf('-'))
      }
      let that = this
      this.$axios.get('/api/common/getregions?id=' + id + '&level=' + level).then(function (res) {
        if (level === 1) {
          that.provinceList = res.dataList
          that.cityList = []
          that.areaList = []
          that.province = ''
          that.city = ''
          that.area = ''
        } else if (level === 2) {
          that.cityList = res.dataList
          that.areaList = []
          that.city = ''
          that.area = ''
        } else {
          that.areaList = res.dataList
          that.area = ''
        }
      })
    },
    submitUser () {
      this.$nextTick(function () {
        this.$refs['selectUser'].validate((valid) => {
          if (valid) {
            this.dialogFormVisible = false
            let url = '/api/user/'
            let msg = ''
            if (this.updateFlag) {
              url += 'modifyuser'
              msg = '修改'
            } else {
              url += 'adduser'
              msg = '添加'
            }
            let that = this
            this.selectUser.passwd = this.selectUser.passwd ? this.$md5(this.selectUser.passwd) : ''
            this.$axios.post(url, this.selectUser).then(function (res) {
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
              that.getUserList()
              that.getUserTotalCount()
            })
          }
        })
      })
    },
    /* 获取用户列表 */
    getUserList () {
      this.loading = true
      let that = this
      let district = this.province ? this.province.substring(this.province.indexOf('-') + 1) : ''
      district += this.city ? this.city.substring(this.city.indexOf('-') + 1) : ''
      district += this.area ? this.area.substring(this.area.indexOf('-') + 1) : ''
      let str = 'curPage=' + this.pageInfo.currentPage + '&rows=' + this.pageInfo.pageSize
      str += '&district=' + district
      str += '&status=' + this.status
      this.$axios.get('/api/user/userlist?' + str).then(function (res) {
        that.userList = res.dataList
        that.loading = false
      })
    },
    getUserTotalCount () {
      let str = '&district=' + this.province + this.city + this.area
      str += '&status=' + this.status
      this.pageInfo.totalCount = 0
      let that = this
      this.$axios.get('/api/user/usercount?' + str).then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    },
    /* 编辑或添加用户信息 */
    updateUserInfo (row, flag) {
      this.dialogFormVisible = true
      this.$nextTick(function () {
        this.$refs['selectUser'].clearValidate()
      })
      if (flag === '0') {
        this.updateFlag = true
        this.showResetBtn = true
        this.title = '编辑账号'
        this.selectUser = row
        this.oldTel = row.tel
      } else {
        this.updateFlag = false
        this.title = '添加账号'
        this.selectUser = {
          userRealName: '',
          passwd: this.Const.INIT_PASSWORD,
          tel: '',
          roleName: this.childRole.roleName
        }
      }
    },
    /* 重置密码 */
    resetPassword () {
      this.showResetBtn = false
      this.selectUser.passwd = this.Const.INIT_PASSWORD
    },
    /* 删除用户信息 */
    deleteUser (row) {
      this.$confirm('确定删除' + row.userRealName + '的账号吗', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this
        this.$axios.get('/api/user/deluser?ids=' + row.id).then(function (res) {
          that.$message({
            type: 'success',
            message: '删除成功!'
          })
          that.getUserList()
          that.getUserTotalCount()
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /* 获取下级角色信息 */
    getChildRole () {
      let that = this
      this.$axios.get('/api/user/getsubrole').then(function (res) {
        that.childRole = res.data.data
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getUserList()
    },
    handleClose (done) {
      this.getUserList()
      done()
    }
  }
}
</script>

<style scoped lang="less">
  .account{
    .filter{
      width: 100%;
      height: 45px;
    }
  }
</style>

<style lang="less">
  .account{
    .cell{
      text-align: center;
    }
    .el-select{
      width: 90%;
      .el-input{
        width: 100%;
      }
    }
  }
</style>
