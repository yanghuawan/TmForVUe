<template>
  <div class="order">
    <el-card class="box-card">
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="订单号:">
          <el-input v-model="selectInfo.orderId" size="medium"></el-input>
        </el-form-item>
        <el-form-item label="区域:">
          <el-select v-model="selectInfo.areaId" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.areaName" :value="item.id" v-for="(item,index) in areaList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="桌台:">
          <el-select v-model="selectInfo.deskId" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.id" v-for="(item,index) in tableList" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="支付时间:">
          <el-date-picker
            v-model="selectInfo.endTimeStart"
            type="date"
            :picker-options="pickerOptions0"
            value-format="yyyy-MM-dd"
            class="price"
            placeholder="开始日期">
          </el-date-picker>
          <div style="width: 20px;float: left;text-align: center">~</div>
          <el-date-picker
            v-model="selectInfo.endTimeEnd"
            value-format="yyyy-MM-dd"
            type="date"
            class="price"
            :picker-options="pickerOptions0"
            placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实收金额:">
          <el-input v-model="selectInfo.minTotalCharge" size="medium" class="price" type="number"></el-input>
          <div style="width: 20px;float: left;text-align: center">~</div>
          <el-input v-model="selectInfo.maxTotalCharge" size="medium" class="price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="订单状态:">
          <el-select v-model="selectInfo.status" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in statusList" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form :inline="true" class="demo-form-inline" style="border-bottom: 1px solid #F0F0F0">
        <el-form-item label="支付方式:">
          <el-select v-model="selectInfo.payKind" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in payKindList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="操作人:">
          <el-select v-model="selectInfo.operatingPerson" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option label="点餐机器人" value="点餐机器人"></el-option>
            <el-option :label="item.waiterId" :value="item.waiterId" v-for="(item,index) in operatingPersonList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button style="padding: 3px;margin-left: 110px" type="text" @click="clearFilter">清空搜索条件</el-button>
          <el-button type="primary" size="medium" @click="getOrderList();getOrderTotalCount();loading=true">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        element-loading-text="数据加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :data="orderList"
        border
        stripe
        style="width: 100%">
        <el-table-column
          prop="orderId"
          label="订单号">
        </el-table-column>
        <el-table-column
          prop="areaDesk"
          label="区域桌台号">
        </el-table-column>
        <el-table-column
          prop="oughtPay"
          label="订单原价(元)">
        </el-table-column>
        <el-table-column
          prop="actualPay"
          label="实收金额(元)">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="支付时间">
        </el-table-column>
        <el-table-column
          label="订单状态">
          <template slot-scope="scope">
            <span>{{scope.row.status===0?'已支付':'未支付'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="checkOrderDetail(scope.row)">查看详情</el-button>
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
  </div>
</template>

<script>
import arealist from '@/components/tableManagement/arealist'
export default {
  name: 'orderManagement',
  mixins: [arealist],
  data () {
    return {
      selectInfo: {
        orderId: '',
        areaId: '',
        deskId: '',
        endTimeStart: '',
        endTimeEnd: '',
        minTotalCharge: '',
        maxTotalCharge: '',
        status: '',
        payKind: '',
        operatingPerson: ''
      },
      payKindList: [],
      tableList: [],
      statusList: [
        {
          code: '1',
          name: '待支付'
        },
        {
          code: '0',
          name: '已支付'
        }
      ],
      orderList: [],
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      loading: true,
      operatingPersonList: [],
      pickerOptions0: {
        disabledDate (time) {
          return time.getTime() > Date.now() - 8.64e6
        }
      }
    }
  },
  mounted: function () {
    this.getCommonList()
    this.getOrderList()
    this.getOrderTotalCount()
  },
  methods: {
    /* 查看订单详情 */
    checkOrderDetail (row) {
      window.open('#/orderDetail?orderId=' + row.orderId)
    },
    /* 获取总条数 */
    getOrderTotalCount () {
      let that = this
      let params = 'orderNo=' + this.selectInfo.orderId
      params += '&areaId=' + this.selectInfo.areaId
      params += '&deskId=' + this.selectInfo.deskId
      params += '&status=' + this.selectInfo.status
      params += '&payKind=' + this.selectInfo.payKind
      params += '&minPay=' + this.selectInfo.minTotalCharge
      params += '&maxPay=' + this.selectInfo.maxTotalCharge
      params += '&minPayTime=' + this.selectInfo.endTimeStart
      params += '&maxPayTime=' + this.selectInfo.endTimeEnd
      params += '&operatingPerson=' + this.selectInfo.operatingPerson
      this.$axios.get('/api/order/getordercount?' + params).then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getOrderList()
    },
    /* 获取筛选条件基础数据 */
    getCommonList () {
      let that = this
      /* 获取支付方式 */
      this.payKindList = [
        {
          code: 1,
          name: '支付宝支付'
        },
        {
          code: 2,
          name: '微信支付'
        },
        {
          code: 3,
          name: '吧台支付'
        }
      ]
      /* 获取桌台列表 */
      this.$axios.get('/api/desk/desklist?curPage=' + this.pageInfo.currentPage + '&rows=' + this.pageInfo.pageSize).then(function (res) {
        that.tableList = res.dataList
      })
      /* 获取操作人列表 */
      this.$axios.get('/api/order/getwaiterids').then(function (res) {
        that.operatingPersonList = res.dataList
      })
    },
    /* 清空筛选条件 */
    clearFilter () {
      this.selectInfo = {
        orderId: '',
        areaId: '',
        deskId: '',
        endTimeStart: '',
        endTimeEnd: '',
        minTotalCharge: '',
        maxTotalCharge: '',
        status: '',
        payKind: '',
        operatingPerson: ''
      }
    },
    /* 获取订单列表 */
    getOrderList () {
      let that = this
      let params = 'orderNo=' + this.selectInfo.orderId
      params += '&areaId=' + this.selectInfo.areaId
      params += '&deskId=' + this.selectInfo.deskId
      params += '&status=' + this.selectInfo.status
      params += '&payKind=' + this.selectInfo.payKind
      params += '&minPay=' + this.selectInfo.minTotalCharge
      params += '&maxPay=' + this.selectInfo.maxTotalCharge
      params += '&minPayTime=' + this.selectInfo.endTimeStart
      params += '&maxPayTime=' + this.selectInfo.endTimeEnd
      params += '&operatingPerson=' + this.selectInfo.operatingPerson
      params += '&rows=' + this.pageInfo.pageSize
      params += '&curPage=' + this.pageInfo.currentPage
      this.$axios.get('/api/order/getorderlist?' + params).then(function (res) {
        that.orderList = res.dataList
        that.loading = false
      })
    }
  }
}
</script>

<style scoped lang="less">

</style>

<style lang="less">
  .order{
    .cell{
      text-align: center;
    }
    .demo-form-inline{
      .el-form-item{
        width: calc( 30% - 10px );
      }
      .el-form-item__label{
        width: 110px;
        text-align: right;
      }
      .el-form-item__content{
        width: calc( 100% - 110px );
      }
      .el-dialog__body{
        max-height: 300px;
        overflow-y: auto;
        padding: 10px 20px;
      }
    }
    .el-select{
      width: 90%;
      .el-input{
        width: 100%;
      }
    }
    .price{
      width: calc( 45% - 10px );
      float: left;
    }
    .el-table__body-wrapper{
      max-height: 580px;
      overflow-y: auto;
    }
  }
</style>
