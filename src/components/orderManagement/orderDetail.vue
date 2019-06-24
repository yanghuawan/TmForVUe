<template>
  <div class="order-detail">
    <index-header></index-header>
    <div class="new-dish-cont">
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span class="card_title">订单详情</span>
        </div>

        <div class="order-item">
          <h1>订单信息</h1>
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="订单编号:">
              <span>{{orderDetail.orderId}}</span>
            </el-form-item>
            <el-form-item label="用餐人数:">
              <span>{{orderDetail.population}}</span>
            </el-form-item>
          </el-form>
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="订单状态:">
              <span>{{orderDetail.status===0?'已支付':'未支付'}}</span>
            </el-form-item>
            <el-form-item label="桌台:" style="letter-spacing: 10px">
              <span>{{orderDetail.areaDeskName}}</span>
            </el-form-item>
          </el-form>
        </div>
        <div class="order-item">
          <h1>支付信息</h1>
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="订单原价:">
              <span>{{orderPayDetail.orderPrice}}</span>
            </el-form-item>
          </el-form>
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="应收金额:">
              <span>{{orderPayDetail.ought}}</span>
            </el-form-item>
            <el-form-item label="交易流水号:">
              <span>{{orderPayDetail.tranNumber}}</span>
            </el-form-item>
          </el-form>
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="实收金额:">
              <span>{{orderPayDetail.actual}}</span>
            </el-form-item>
            <el-form-item label="支付时间:" style="letter-spacing: 2px">
              <span>{{orderPayDetail.payTime}}</span>
            </el-form-item>
          </el-form>
          <el-form :inline="true" class="demo-form-inline">
            <el-form-item label="支付方式:">
              <span>{{payMassage}}</span>
            </el-form-item>
            <el-form-item label="操作员:" style="letter-spacing: 6px">
              <span>{{orderPayDetail.operator}}</span>
            </el-form-item>
          </el-form>
        </div>
        <div class="order-item">
          <h1>下单内容</h1>
          <el-table
            :data="orderDetailList"
            border
            stripe
            style="width: 100%">
            <el-table-column
              prop="dishName"
              label="菜品名称">
            </el-table-column>
            <el-table-column
              prop="price"
              label="单价(元)">
            </el-table-column>
            <el-table-column
              prop="num"
              label="下单数量">
            </el-table-column>
            <el-table-column
              prop="retire"
              label="退菜数量">
            </el-table-column>
            <el-table-column
              prop="total"
              label="小计(元)">
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import indexHeader from '../index/header'

export default {
  name: 'orderDetail',
  components: {
    'index-header': indexHeader
  },
  data () {
    return {
      orderDetail: {
        orderId: '',
        areaDeskName: '',
        population: '',
        status: ''
      },
      orderPayDetail: {
        orderPrice: ''
      },
      payType: [{
        code: 0,
        kind: '支付宝'
      }, {
        code: 1,
        kind: '微信'
      }, {
        code: 2,
        kind: '吧台'
      }],
      payMassage: '',
      orderDetailList: []
    }
  },
  mounted: function () {
    this.getOrderDetail()
    this.getOrderPayInfo()
    this.getOrderDetailList()
  },
  methods: {
    /* 获取订单列表 */
    getOrderDetail () {
      let that = this
      this.$axios.get('/api/order/getOrderDetailInfo?orderId=' + this.$route.query.orderId).then(function (res) {
        that.orderDetail = res.data
      })
    },
    /* 获取订单支付信息 */
    getOrderPayInfo () {
      let that = this
      this.$axios.get('/api/order/getOrderPayInfo?orderId=' + this.$route.query.orderId).then(function (res) {
        if (res.code === 0) {
          that.orderPayDetail = res.data
          that.orderPayDetail.operator = res.data.waiter ? res.data.waiter : '点餐机器人' + res.data.robot
          that.payMassage = that.payType[that.orderPayDetail.payKind].kind
        }
      })
    },
    /* 获取订单详情列表 */
    getOrderDetailList () {
      let that = this
      this.$axios.get('/api/order/getOrderContent?orderId=' + this.$route.query.orderId).then(function (res) {
        if (res.code === 0) {
          that.orderDetailList = res.dataList
        } else {
          that.orderDetailList = []
        }
      })
    }
  }
}
</script>

<style scoped lang="less">
  .order-detail {
    height: 100%;
    overflow-y: auto;
    .order-item {
      margin: 20px 0;
      h1 {
        margin: 10px 0;
      }
    }
    .new-dish-cont {
      margin-top: 60px;
      width: 1200px;
      padding-left: calc(calc(100% - 1200px) / 2);
    }
  }

  span {
    letter-spacing: 0px;
  }
</style>

<style lang="less">
  .order-detail {
    .cell {
      text-align: center;
    }
    .demo-form-inline {
      .el-form-item {
        width: calc(30% - 10px);
      }
      .el-form-item__label {
        width: 110px;
        text-align: right;
      }
      .el-form-item__content {
        width: calc(100% - 110px);
      }
    }
  }
</style>
