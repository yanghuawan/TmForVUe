<template>
  <div class="login">
    <div class="input-box">
      <div class="background"></div>
      <div class="login-tit">
      <h1>{{brand}}</h1>
      </div>

      <div class="msg input-item">{{msg}}</div>

      <el-form :model="userInfo" ref="userInfo" :rules="rules" label-position="right">
        <el-form-item class="input-item" prop="username">
          <el-input
            placeholder="账号/手机号"
            v-model.lazy.trim="userInfo.username"
            @keyup.enter.native="login"
            clearable>
          </el-input>
        </el-form-item>
        <el-form-item class="input-item" prop="password">
          <el-input
            placeholder="密码"
            v-model.lazy.trim="userInfo.password"
            type="password"
            @keyup.enter.native="login"
            clearable>
          </el-input>
        </el-form-item>
        <el-form-item class="input-item" prop="checkCode">
          <div class="checkCode">
            <el-input
              placeholder="请输入验证码"
              v-model.lazy.trim="userInfo.checkCode"
              @keyup.enter.native="login"
              clearable>
            </el-input>
          </div>
          <img :src="checkImg?('data:image/png;base64,' + checkImg):'../../static/image/login/refresh.png'" class="checkImg" @click="refreshCode" title="点击刷新验证码" onerror="this.src='../../static/image/login/refresh.png';this.onerror=null"/>
          <a class="refreshCode" @click="refreshCode">看不清</a>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      userInfo: {
        username: '',
        password: '',
        checkCode: ''
      },
      rules: {
        username: [
          {required: true, message: '请输入账号/手机号', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'}
        ],
        checkCode: [
          {required: true, message: '请输入验证码', trigger: 'blur'}
        ]
      },
      msg: '',
      brand: 'Today Menu',
      checkImg: '',
      codeKey: '',
      codeValue: ''
    }
  },
  mounted: function () {
    this.getCheckImg()
  },
  computed: {
  },
  methods: {
    /* 点击登录 */
    login () {
      this.$nextTick(function () {
        this.msg = ''
        let that = this
        this.$refs['userInfo'].validate((valid) => {
          if (valid) {
            new Promise((resolve, reject) => {
              this.$axios.get('/api/validCode?key=' + this.codeKey + '&code=' + this.userInfo.checkCode.toLowerCase())
                .then(response => {
                  if (response.result === 0) {
                    resolve()
                  } else {
                    that.msg = '请输入正确的验证码'
                    that.getCheckImg()
                  }
                })
            }).then(() => {
              let code = this.$md5(this.userInfo.checkCode.toLowerCase())
              this.$axios.post('/api/furyLogin?username=' + that.userInfo.username + '*' + code + '&password=' + this.$md5(this.userInfo.password) + code).then(function (response) {
                if (response.code === 0) {
                  let data = response.data
                  sessionStorage.setItem('token', data.token)
                  sessionStorage.setItem('userName', data.userName)
                  if (that.userInfo.password === that.Const.INIT_PASSWORD) {
                    sessionStorage.setItem('initPassword', 'true')
                    sessionStorage.setItem('initStore', 'true')
                  }
                  sessionStorage.setItem('userId', data.userId)
                  sessionStorage.setItem('storeId', data.storeId)
                  sessionStorage.setItem('userLogo', data.imgPng ? data.imgPng : '')
                  sessionStorage.setItem('roleName', data.roleName)
                  that.$router.push(data.roleName === '店长' ? '/menuManagement/menuList' : '/accountManagement/accountList')
                } else {
                  that.msg = '用户名或密码错误'
                  that.getCheckImg()
                }
              })
            })
          }
        })
      })
    },
    /* 刷新验证码 */
    refreshCode () {
      this.getCheckImg()
    },
    /* 获取验证码 */
    getCheckImg () {
      let that = this
      this.$axios.get('/api/getVerificationCode')
        .then(response => {
          that.checkImg = response.image_base64
          that.codeKey = response.code_key
          that.codeValue = response.code
        })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='less'>
  .login{
    width: 100%;
    padding-top: 200px;
    height: calc( 100% - 200px);
    .background{
      width: 100%;
      height: 100%;
      position: fixed;
      left: 0;
      top: 0;
      z-index: -999;
      background: url("../../../static/image/login/login_bg.jpg");
      /*-webkit-filter: grayscale(100%); !* Chrome, Safari, Opera *!
      filter: grayscale(100%);
      -webkit-filter: blur(2px); !* Chrome, Safari, Opera *!
      filter: blur(2px);*/
      opacity: 0.8;
    }
    .login-tit{
      h1{
        text-align: center;
        font-size: 30px;
      }
    }
    .input-box {
      background: #fff;
      width: 350px;
      padding: 20px 80px;
      margin: 0 auto;
      border: 1px solid #ebeef5;
      .input-item{
        margin: 16px 0;
        .checkCode{
          width: 45%;
          float: left;
        }
        .checkImg{
          width: 30%;
          height: 40px;
          margin: 0 10px;
          float: left;
          cursor: pointer;
        }
        .refreshCode{
          display: inline-block;
          height: 40px;
          line-height: 40px;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          color: blue;
          text-align: center;
          width: calc( 25% - 20px);
        }
      }
      .el-button--primary{
        width: 100%;
        margin-top: 5px;
      }
    }
  }
</style>
