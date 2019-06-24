<template>
  <div class="foodStore-import">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <div class="card_title">食材</div>
      </div>
      <div class="content_style">如何导入食材</div>
      <div class="span-row">
        <span>1、选择需要监控的食材（<span @click="goto(0)" class="click-span">选择需监控的食材</span>）</span>
      </div>
      <div class="span-row">
        <span>2、下载食材模板（<span @click="goto(1)" class="click-span">下载模板</span>）</span>
      </div>
      <div class="span-row">
        <span>3、食材库存编辑完成后，导入文件</span><span slot="tip" class="el-upload__tip">（只能上传.xlsx/.xls文件）</span>
        <el-upload
          class="upload-food-list"
          ref="upload"
          action="/api/foodmaterial/import"
          :on-remove="handleRemove"
          :on-change="handleChange"
          :file-list="fileList"
          :on-success="handleSuccess"
          accept=".xls,.xlsx"
          :auto-upload="false">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload" v-if="showSubmitBtn">
            上传到服务器
          </el-button>
        </el-upload>
        <el-button slot="trigger" size="small" type="primary" style="float: right;margin-top: -45px" v-show="failList.length > 0" @click="export2Excel">下载导入失败的食材</el-button>
      </div>
      <div>
        <el-table
          :data="sussList"
          max-height="500"
          border
          stripe
          style="width: 100%;overflow: auto"
          v-if="tableFlag">
          <el-table-column
            prop="name"
            label="食材名称"
            align="center">
          </el-table-column>
          <el-table-column
            prop="weight"
            label="采购数量"
            align="center">
          </el-table-column>
          <el-table-column
            label="采购单位"
            align="center">
            <template slot-scope="scope">
              <span>斤</span>
            </template>
          </el-table-column>
          <el-table-column
            label="导入状态"
            align="center">
            <template slot-scope="scope">
              <span v-if="scope.$index < failList.length" style="color: red;">失败</span>
              <span v-else>正常</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script type="module">
/* eslint-disable camelcase */

export default {
  name: 'foodStoreImport',
  data () {
    return {
      importData: [],
      showSubmitBtn: false,
      tableFlag: false,
      fileList: [],
      failList: [],
      sussList: []
    }
  },
  mounted () {
  },
  methods: {
    goto (code) {
      if (code === 0) {
        this.$router.push('/intelligentWarehousing/foodHouse')
      } else if (code === 1) {
        let that = this
        this.$axios.get('/api/foodmaterial/getlisteningcount').then(function (res) {
          if (res.data === 0) {
            that.$alert('未设置需监控的食材，无法下载模板', '提示', {
              confirmButtonText: '确定'
            })
          } else {
            that.downloadedPattern()
          }
        })
      }
    },
    /* 下载模板 */
    downloadedPattern () {
      window.location.href = '/api/foodmaterial/export'
    },
    submitUpload () {
      this.$refs.upload.submit()
      this.tableFlag = true
    },
    handleRemove (file, fileList) {
      this.fileList = []
      this.showSubmitBtn = false
    },
    handleChange (file) {
      this.fileList = []
      this.fileList.push(file)
      this.showSubmitBtn = true
    },
    handleSuccess (res, file, fileList) {
      this.failList = res.data.failList ? res.data.failList : []
      this.sussList = this.failList.concat(res.data.sussList ? res.data.sussList : [])
      let msg = '共' + res.data.total + '条数据,成功导入' + (res.data.success ? res.data.success : 0) + '条,失败' + (res.data.failCount ? res.data.failCount : 0) + '条'
      if (res.data.failCount > 0) {
        this.$alert(msg, '导入提示', {
          confirmButtonText: '下载导入失败食材',
          callback: () => {
            this.export2Excel()
          }
        })
      } else {
        this.$alert(msg, '导入提示', {
          confirmButtonText: '我知道了',
          callback: () => {

          }
        })
      }
      this.tableFlag = true
    },
    /* list生成excel */
    export2Excel () {
      require.ensure([], () => {
        const {export_json_to_excel} = require('../../vendor/Export2Excel')
        const tHeader = this.Const.T_HEADER // 对应表格输出的title
        const filterVal = this.Const.FILTER_VAL // 对应表格输出的数据
        const list = this.failList
        const data = this.formatJson(filterVal, list)
        export_json_to_excel(tHeader, data, '失败食材列表' + new Date().toLocaleString()) // 对应下载文件的名字
      })
    },
    formatJson (filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    }

  }
}
</script>

<style scoped lang="less">
  .foodStore-import {
    .click-span {
      color: #0000ff;
      cursor: pointer;
    }
    .span-row {
      margin: 15px;
      font-size: 13px;
    }
  }
</style>

<style lang="less">
  .foodStore-import {
    .upload-food-list {
      margin: 15px;
      width: 350px;
    }
    .el-message-box__headerbtn {
      display: none !important;
    }
  }
</style>
