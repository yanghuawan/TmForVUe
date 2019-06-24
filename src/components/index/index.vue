<template>
  <div class="index" id="app">
    <index-header></index-header>
    <div class="main">
      <index-left></index-left>
      <div class="right">
        <div class="right-main">
          <router-view></router-view>
        </div>
        <!--<index-footer></index-footer>-->
      </div>
    </div>

    <el-dialog title="修改密码" :visible.sync="dialogFormVisible" class="changePassword" :show-close="false"
               :close-on-click-modal="false">
      <el-form :model="pswInfo" ref="pswInfo" :rules="rules" label-width="120px">
        <el-form-item label="新密码:" prop="newPassword">
          <el-input
            type="password"
            v-model.trim="pswInfo.newPassword"
            auto-complete="off"
            placeholder="密码长度6-20位字符"
            clearable></el-input>
        </el-form-item>
        <el-form-item label="重复密码:" prop="checkPassword">
          <el-input type="password"
                    v-model.trim="pswInfo.checkPassword"
                    auto-complete="off"
                    clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="changePassword">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改密码" :visible.sync="dialogFormVisible2" class="changePassword" :show-close="false"
               :close-on-click-modal="false">
      <store v-on:submitResult="submitResult"></store>
    </el-dialog>
  </div>
</template>

<script>
import indexHeader from './header'
import indexLeft from './left'
import indexFooter from './footer'
import store from '@/components/restaurantSetting/storeSetting'
import {Notification} from 'element-ui'

export default {
  name: 'index',
  components: {
    indexHeader,
    indexLeft,
    indexFooter,
    store,
    Notification
  },
  data () {
    return {
      dialogFormVisible: false,
      dialogFormVisible2: false,
      pswInfo: {
        checkPassword: '',
        newPassword: ''
      },
      rules: {
        newPassword: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          {min: 6, max: 20, message: '长度在 3 到 5 个字符', trigger: 'blur'},
          {validator: this.validatePassword, trigger: 'blur'}
        ],
        checkPassword: [
          {required: true, message: '请再次输入密码', trigger: 'blur'},
          {validator: this.checkSame, trigger: 'blur'}
        ]
      },
      acceptAdjustList: []
    }
  },
  mounted: function () {
    this.isInitPassword()
    if (sessionStorage.getItem('roleName') !== '品牌管理员') {
      this.getNewAcceptAdjust()
    }
    if (sessionStorage.getItem('storeId')) {
      this.subscribeMessage(sessionStorage.getItem('storeId').toString())
    }
  },
  methods: {
    submitResult (data) {
      sessionStorage.setItem('initStore', !data + '')
      this.dialogFormVisible2 = !data
    },
    /* 校验两次密码是否输入一致 */
    checkSame (rule, val1, callback) {
      if (val1 === this.pswInfo.newPassword) {
        callback()
      } else {
        callback(new Error('两次密码不一致'))
      }
    },
    /* 确认修改密码 */
    changePassword () {
      this.$nextTick(function () {
        this.$refs['pswInfo'].validate((valid) => {
          if (valid) {
            let that = this
            this.$axios.get('/api/user/changepasswd?newPasswd=' + this.$md5(this.pswInfo.newPassword)).then(function (res) {
              if (res.code === 0) {
                that.dialogFormVisible = false
                that.dialogFormVisible2 = true
                that.$message({
                  message: '修改密码成功',
                  type: 'success'
                })
                sessionStorage.setItem('initPassword', 'false')
              } else {
                that.dialogFormVisible = true
                that.$message({
                  message: '修改密码失败',
                  type: 'success'
                })
                sessionStorage.setItem('initPassword', 'true')
              }
            })
          }
        })
      })
    },
    isInitPassword () {
      if (sessionStorage.getItem('initPassword') === 'true') {
        this.dialogFormVisible = true
      } else if (sessionStorage.getItem('initStore') === 'true') {
        this.dialogFormVisible2 = true
      }
    },
    /* 刷新收到的调货申请 */
    getNewAcceptAdjust () {
      let that = this
      this.$axios.get('/api/foodmaterial/getNewAcceptAdjust').then(function (res) {
        if (res.code === 0) {
          let dataContent = res.data.content ? JSON.parse(res.data.content) : []
          let str = ''
          for (let j = 0; j < dataContent.length; j++) {
            str += dataContent[j].foodName + ' ' + dataContent[j].applyWeight + dataContent[j].unit + '、'
          }
          that.open1(res.data, str)
        }
      })
    },
    /* Notification通知消息提醒 */
    open1 (applyName1, applyContent) {
      let titleContent = applyName1.status === 0 ? applyName1.applyName + '调货申请' : applyName1.supplyName + '同意调货'
      this.instance = this.$notify({
        title: titleContent,
        message: '<div style="font-size: 12px">' + applyContent + '</div><a href="#/intelligentWarehousing/adjustManagement">查看详情</a>',
        dangerouslyUseHTMLString: true,
        duration: 0,
        position: 'bottom-right',
        onClick: function () {
          Notification.closeAll()
        }
      })
    },
    /* 订阅(接收消息) */
    subscribeMessage (myChannel) {
      let that = this
      this.$goEasy.subscribe({
        channel: myChannel,
        onMessage: function (pmessage) {
          let message = JSON.parse(pmessage.content).publishList
          let str = ''
          if (message) {
            for (let i = 0; i < message.length; i++) {
              if (message[i].foodName) {
                if (message[i].applyWeight) {
                  str += message[i].foodName + ' ' + message[i].applyWeight + message[i].unit + '、'
                }
              } else {
                str += message[i].toString()
              }
            }
          }
          if (str.length >= 0) {
            that.$notify({
              title: JSON.parse(pmessage.content).title,
              dangerouslyUseHTMLString: true,
              message: '<div style="height:50px;overflow: hidden">' + str + '</div><a href="#/intelligentWarehousing/adjustManagement">查看详情</a>',
              position: 'bottom-right',
              duration: 0,
              onClick: function () {
                Notification.closeAll()
              }
            })
          }
        },
        onFailed: function (error) {
          that.$message({
            message: 'Channel订阅失败，错误编码：' + error.code + ',错误信息：' + error.content
          })
        }
      })
    },
    /**
       * 验证新密码规则
       * 数字、字母或下划线，至少包含两种
       */
    validatePassword (rule, val, callback) {
      /* 特殊符号 */
      let paten = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？%+_]")
      /* 纯数字、纯字母或纯特殊符号 */
      let isDigit = /^(?:\d+|[a-zA-Z]+|[!@#$%^&*]+)$/
      if (!isDigit.exec(val)) {
        if (!paten.exec(val)) {
          callback()
        } else {
          callback(new Error('请输入6-20位数字和字母'))
        }
      } else {
        callback(new Error('不可为纯数字或纯字母'))
      }
    }
  }
}
</script>

<style scoped lang="less">
  .index {
    width: 100%;
    height: 100%;
    .main {
      width: 100%;
      margin-top: 50px;
      height: calc(100% - 50px);
      .right {
        width: calc(100% - 200px);
        height: 100%;
        float: right;
        .right-main {
          width: 100%;
          height: 100%;
          min-width: 1455px;
          overflow: auto;
        }
      }
    }
  }
</style>

<style lang="less">
  .index {
    li {
      text-align: left;
    }
    .el-dialog {
      width: 35%;
    }
    .el-input {
      width: 90%;
    }
    .el-form-item {
      margin-bottom: 20px;
    }
  }
</style>
