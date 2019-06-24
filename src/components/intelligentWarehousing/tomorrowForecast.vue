<template>
  <div class="tomorrow-forecast">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">监控食材明日采购数量</span>
        <el-button type="text" style="float: right" @click="getFoodShopList()">保存并打印采购单</el-button>
      </div>
      <el-table
        id="out-table1"
        :data="foodForecastInfo"
        stripe
        border
        :style="tableSize">
        <el-table-column
          prop="foodName"
          label="食材名称">
        </el-table-column>
        <el-table-column
          label="采购数量">
          <template slot-scope="scope">
            <el-input
              type="number"
              min="0"
              size="small"
              v-model="scope.row.weight"
              auto-complete="off"
              @change="checkedBuyNumber(scope.$index,scope.row)"></el-input>
            <p :id='scope.$index' style="color: red;font-size: 8px;text-align: left;padding-left: 18px"></p>
          </template>
        </el-table-column>
        <el-table-column
          prop="unit"
          label="采购单位">
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-radio-group v-model="scope.row.isBuy">
              <el-radio label="0">采购</el-radio>
              <el-radio label="1">不采购</el-radio>
            </el-radio-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="采购食材" :visible.sync="dialogTableVisible"
               :close-on-click-modal="false"
               style="width: 1800px" align="center">
      <div id="showPrintContent">
      <el-table :data="foodShopList" align="center" style="overflow: auto" border stripe>
        <el-table-column prop="foodName" label="食材名称"></el-table-column>
        <el-table-column prop="weight" label="采购数量"></el-table-column>
        <el-table-column prop="unit" label="采购单位"></el-table-column>
      </el-table>
      </div>
      <el-button @click="dialogTableVisible = false">取 消</el-button>
      <el-button type="primary" @click="printTable();submitForecastList()">确 定</el-button>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'tomorrowForecast',
  data () {
    return {
      foodForecastInfo: [],
      tableSize: 'width: 100%',
      dialogTableVisible: false,
      foodShopList: []
    }
  },
  mounted () {
    this.getListeningFood()
  },
  methods: {
    printTable () {
      let oldContent = document.body.innerHTML
      let showPrintContent = document.getElementById('showPrintContent')
      let newContent = showPrintContent.innerHTML
      document.body.innerHTML = newContent
      window.print()
      document.body.innerHTML = oldContent
      window.location.reload()
      return false
    },
    getListeningFood () {
      let that = this
      this.$axios.get('/api/foodmaterial/getprocurement').then(function (res) {
        that.foodForecastInfo = res.dataList
      })
    },
    getFoodShopList () {
      this.foodShopList = []
      for (let i = 0; i < this.foodForecastInfo.length; i++) {
        if (this.foodForecastInfo[i].isBuy === '0' && this.foodForecastInfo[i].weight > 0) {
          this.foodShopList.push(this.foodForecastInfo[i])
        }
      }
      this.dialogTableVisible = true
    },
    checkedBuyNumber (index, rows) {
      let value = rows.amount
      let message = document.getElementById(index)
      if (value < 0) {
        message.innerText = '采购量不小于0'
      } else {
        message.innerText = ''
      }
    },
    submitForecastList () {
      this.$axios.post('/api/foodmaterial/saveprocurement', this.foodShopList).then(function (res) {
      })
    }
  }
}
</script>

<style scoped lang="less">
  .tomorrow-forecast{
    .suggestion{
      color: #999999;
      font-size: 14px;
      margin-left: 2px;
    }
  }
</style>

<style lang="less">
  .tomorrow-forecast{
    .el-input__inner{
      text-align: center;
    }
    .cell{
      text-align: center;
    }
    #showPrintContent{
      margin-bottom: 20px;
    }
    .card_title{
      line-height: 40px;
    }
    .el-card__header {
      padding: 10px 20px;
    }
  }
</style>
