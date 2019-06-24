<template>
  <div id="wangeditor">
    <div ref="editorElem" style="text-align:left">
      <div v-html="content"></div>
    </div>
  </div>
</template>

<script>
import E from 'wangeditor'
export default {
  name: 'editorElem',
  data () {
    return {
      // editorContent: ''
      editor: ''
    }
  },
  props: ['content'], // 接收父组件的方法
  watch: {
    content (val, oldVal) { // 普通的watch监听
      this.editor.txt.html(val)
    }
  },
  mounted () {
    this.editor = new E(this.$refs.editorElem) // 创建富文本实例
    let that = this
    this.editor.customConfig.onchange = (html) => {
      // this.editorContent = html
      this.$emit('editorContent', html)
      // this.catchData(html) // 把这个html通过catchData的方法传入父组件
    }
    this.editor.customConfig.uploadImgServer = '你的上传图片的接口'
    this.editor.customConfig.uploadFileName = '你自定义的文件名'
    this.editor.customConfig.uploadImgMaxSize = 200 * 1024 * 1024
    this.editor.customConfig.customUploadImg = function (files, insert) {
      var date = new FormData()
      date.append('file', files[0])
      that.$axios.post('/api/image/uploadimage', date).then(function (res) {
        insert(that.Const.IMAGE_PATH + res.data)
      })
    }
    this.editor.customConfig.menus = [ // 菜单配置
      'head',
      'list', // 列表
      'justify', // 对齐方式
      'bold',
      'fontSize', // 字号
      'italic',
      'underline',
      'image', // 插入图片
      'foreColor', // 文字颜色
      'undo', // 撤销
      'redo' // 重复
    ]
    // 下面是最重要的的方法
    this.editor.customConfig.uploadImgHooks = {
      before: function (xhr, editor, files) {
        // 图片上传之前触发
      },
      success: function (xhr, editor, result) {
        // 图片上传并返回结果，图片插入成功之后触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
        this.imgUrl = Object.values(result.data).toString()
      },
      fail: function (xhr, editor, result) {
        // 图片上传并返回结果，但图片插入错误时触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象，result 是服务器端返回的结果
      },
      error: function (xhr, editor) {
        // 图片上传出错时触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
      },
      timeout: function (xhr, editor) {
        // 图片上传超时时触发
        // xhr 是 XMLHttpRequst 对象，editor 是编辑器对象
      },

      // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
      // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
      customInsert: function (insertImg, result, editor) {
        // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
        // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果

        // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
        let url = Object.values(result.data) // result.data就是服务器返回的图片名字和链接
        JSON.stringify(url) // 在这里转成JSON格式
        insertImg('http://baidu.com' + url)
        // result 必须是一个 JSON 格式字符串！！！否则报错
      }
    }
    this.editor.create()
  }
}
</script>
