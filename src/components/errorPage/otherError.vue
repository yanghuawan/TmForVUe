<template>
  <div style="text-align: center;margin-top: 200px" class="otherError">
    <img src="../../../static/image/other.png"/>
    <div style="display: inline-block">
      <div class="msgInfo">糟糕！网页无法访问。<span class="errorKind">(错误类型：{{this.$route.query.errorStatus?this.$route.query.errorStatus:''}})</span></div>
      <div style="margin-top: 20px;text-align: left;margin-left: 30px"><span class="timeStyle">{{count}}</span>s后自動返回首頁</div>
      <div style="margin-top: 20px;text-align: left;margin-left: 30px" ><el-button type="text" @click="goLoginPage(1)" class="linkStyle">立即返回首页</el-button></div>
    </div>
  </div>
</template>

<script>
import {Notification} from 'element-ui'
export default {
  name: 'otherError',
  data () {
    return {
      count: ''
    }
  },
  mounted () {
    Notification.closeAll()
    this.goLoginPage(0)
  },
  methods: {
    goLoginPage (index) {
      if (index === 0) {
        const TIME_COUNT = 5
        if (!this.timer) {
          this.count = TIME_COUNT
          this.show = false
          this.timer = setInterval(() => {
            if (this.count > 0 && this.count <= TIME_COUNT) {
              this.count--
            } else {
              this.show = true
              clearInterval(this.timer)
              this.timer = null
              this.$router.push('/menuManagement/menuList')
            }
          }, 1000)
        }
      } else {
        this.$router.push('/menuManagement/menuList')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='less'>
  .otherError{
    font-size: 14px;
    color: #333333;
    .msgInfo{
      font-size: 28px;
      font-weight: bolder;
      color: #333333;
      margin-left: 30px;
      .errorKind{
        font-size: 14px;
        color: #999999;
      }
    }
    .timeStyle{
      font-size: 28px;
      color: #008000;
    }
    .linkStyle{
      font-size: 28px;
      color: #0000ff
    }
  }
</style>
