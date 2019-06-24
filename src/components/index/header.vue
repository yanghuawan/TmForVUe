<template>
  <div class="header">
    <div class="brandLogo">Today Menu</div>
    <div class="userInfo">
      <img :src="userInfo.userLogo?userInfo.userLogo:require('../../assets/images/login/userLogo.png')" class="userLogo"/>
      <div class="userName">
        <el-dropdown>
          <span class="el-dropdown-link">
            {{userInfo.userName}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="logout">注销</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'homeHeader',
  data () {
    return {
      userInfo: {
        userName: sessionStorage.getItem('userName'),
        userLogo: sessionStorage.getItem('userLogo')
      },
      brandInfo: {
        brandName: '',
        createTime: '',
        id: '',
        logoUrl: ''
      }
    }
  },
  mounted: function () {
    this.getBrandInfo()
  },
  methods: {
    /* 注销 */
    logout () {
      let that = this
      sessionStorage.clear()
      this.$router.push('/login')
      this.$axios.get('/api/logout').then(function (res) {
        if (res.code === 0) {
          that.$message({
            type: 'success',
            message: '注销成功'
          })
        }
      })
      window.location.reload()
    },
    /* 获取品牌信息 */
    getBrandInfo () {
      let that = this
      this.$axios.get('/api/user/brandinfo').then(function (res) {
        that.brandInfo = res.data
      })
    }
  }
}
</script>

<style scoped lang="less">
  .header{
    width: 100%;
    height: 50px;
    position: fixed;
    top: 0;
    background: #272727;
    z-index: 999;
    .brandLogo{
      height: 100%;
      width: 200px;
      float: left;
      color: #fff;
      font-size: 20px;
      line-height: 50px;
      text-align: center;
    }
    .userInfo{
      float: right;
      height: 100%;
      .userLogo{
        float: left;
        width: 40px;
        height: 40px;
        margin-top: 5px;
        border-radius: 40px;
        background: #fff;
      }
      .userName{
        float: left;
        height: 100%;
        line-height: 50px;
        margin: 0 10px;
      }
    }
  }
</style>

<style lang="less">
  .header{
    .el-dropdown{
      color: #fff;
    }
  }
</style>
