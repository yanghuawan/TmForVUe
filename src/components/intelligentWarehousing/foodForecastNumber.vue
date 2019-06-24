<template>
  <div class="foodForecast-number">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">食材结余缺货表
          <span class="suggestion">注：列表中只显示监控的食材</span>
          <el-button type="text" style="margin-left: 5px" @click="goto('/intelligentWarehousing/foodHouse')">设置监控食材</el-button>
        </span>
        <el-button type="text" style="float: right" @click="goto('/intelligentWarehousing/amap')">查看可调货的餐厅</el-button>
      </div>
      <el-table
        :data="foodForecastInfo"
        stripe
        border
        style="width: 100%">
        <el-table-column
          prop="foodName"
          label="食材名称"
          width="350">
        </el-table-column>
        <el-table-column
          label="今日已消耗"
          width="320">
          <template slot-scope="scope">
            <span>{{scope.row.consumed}}{{scope.row.unit}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="今日预计还需数量"
          width="320">
          <template slot-scope="scope">
            <span>{{scope.row.required}}{{scope.row.unit}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="库存还有的数量"
          width="320">
          <template slot-scope="scope">
            <span>{{scope.row.balance}}{{scope.row.unit}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="今日全天预计结余数量"
          width="325">
          <template slot-scope="scope">
            <span>{{scope.row.storeResult}}{{scope.row.unit}}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'foodForecastNumber',
  data () {
    return {
      foodForecastInfo: []
    }
  },
  mounted () {
    this.getFoodForecastInfo()
  },
  methods: {
    goto (url) {
      this.$router.push(url)
    },
    getFoodForecastInfo () {
      let that = this
      this.$axios.get('/api/common/getfoodrequireddate').then(function (res) {
        that.foodForecastInfo = res.dataList
      })
    }
  }
}
</script>

<style scoped lang="less">
  .foodForecast-number{
    .suggestion{
      color: #999999;
      font-size: 14px;
      margin-left: 2px;
    }
  }
</style>

<style lang="less">
  .foodForecast-number{
    .cell{
      text-align: center;
    }
    .el-card__header {
      padding: 10px 20px;
    }
  }
</style>
