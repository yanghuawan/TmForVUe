<template>
  <div class="accept_adjust">
    <el-table
      :data="acceptAdjustList"
      v-loading="loading"
      element-loading-text="数据加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      stripe
      border
      style="width: 100%">
      <el-table-column
        label="申请内容"
        width="800">
        <template slot-scope="scope">
          <span v-for="(c,i) in scope.row.content" :key="i"><span v-if="i>0">、</span>{{c.foodName}}&nbsp;{{c.applyWeight}}{{c.unit}}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="applyName"
        label="申请调货餐厅"
      ></el-table-column>
      <el-table-column
        prop="createTime"
        label="申请时间"
      ></el-table-column>
      <el-table-column
        label="状态">
        <template slot-scope="scope">
          {{scope.row.status===0?'待通过':scope.row.status===1?'送货中':scope.row.status===2?'已送达':scope.row.status===3?'已驳回':scope.row.status===4?'已取消':''}}
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        align="center">
        <template slot-scope="scope">
          <el-button  type="text" size="small" @click="getDetailInfo(scope.row)">查看详情</el-button>
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
    <el-dialog :title="title" :visible.sync="dialogTableVisible">
      <span class="red error_msg">{{errorMsg}}</span>
      <el-table
        :data="selectedAdjust.content"
        stripe
        border>
        <el-table-column
          prop="foodName"
          label="食材名称">
        </el-table-column>
        <el-table-column
          label="申请调货数量">
          <template slot-scope="scope">
            <span>{{scope.row.applyWeight}}<span>{{scope.row.unit}}</span></span>
          </template>
        </el-table-column>
        <el-table-column
          prop="acquire"
          :label="supplyLabel"
          v-if="supplyShow">
          <template slot-scope="scope">
            <span v-if="selectedAdjust.status===1 || selectedAdjust.status===2">{{scope.row.supplyWeight}}<span>{{scope.row.unit}}</span></span>
            <el-input v-model="scope.row.supplyWeight" v-if="selectedAdjust.status===0" type="number" min="0" @blur="checkNum()"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <el-form>
        <el-form-item label="调货餐厅:">
          <span>{{selectedAdjust.restaurant}}</span>
        </el-form-item>
        <el-form-item label="联系电话:">
          <span>{{selectedAdjust.tel}}<span v-if="selectedAdjust.tel">&nbsp;&nbsp;</span>{{selectedAdjust.mobile}}</span>
        </el-form-item>
        <el-form-item label="餐厅地址:">
          <span>{{selectedAdjust.district}}{{selectedAdjust.address}}{{selectedAdjust.locationName}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===3">
          <span>驳回时间：{{selectedAdjust.updateTime}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===1 || selectedAdjust.status===2">
          <span>同意调货时间：{{selectedAdjust.passTime}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===2">
          <span>送达时间：{{selectedAdjust.supplyTime}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===4">
          <span>取消时间：{{selectedAdjust.updateTime}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===0">
          <el-button type="primary" style="float: right" size="medium" @click="cancelSubmit(selectedAdjust.id, 2, 1, JSON.stringify(selectedAdjust.content))" :disabled="errorMsg!==''">同意调货</el-button>
          <el-button type="primary" style="float: right;margin-right: 20px" size="medium" @click="cancelSubmit(selectedAdjust.id, 2, 3)">拒绝调货</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import storeInfoList from '@/components/intelligentWarehousing/storeInfoList'
export default {
  name: 'accept',
  mixins: [storeInfoList],
  data () {
    return {
      acceptAdjustList: [], // 收到的调货申请
      adjustFoodList: [], // 调货食材列表
      loading: false,
      supplyLabel: '送货数量',
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      otherStoreId: ''
    }
  },
  mounted () {
    this.getAcceptAdjustList(this.pageInfo.pageSize, this.pageInfo.currentPage)
    this.getAcceptAdjustListCount()
  },
  methods: {
    getDetailInfo (rows) {
      this.title = '调货申请详情_' + rows.status
      this.supplyLabel = rows.status === 0 ? '输入确认可调货数量' : '送货数量'
      this.selectedAdjust = rows
      this.supplyShow = !(rows.status === 3 || rows.status === 4)
      this.dialogTableVisible = true
      this.title = '调货申请详情_' + (rows.status === 0 ? '待处理' : rows.status === 1 ? '待送达' : rows.status === 2 ? '已送达' : rows.status === 3 ? '被驳回' : '已取消')
      this.otherStoreId = rows.applyId
    },
    /* 检验输入的调货数量是否有效 */
    checkedBuyNumber (index, rows) {
      let value = rows.adjustable
      let message = document.getElementById(index)
      if (value < 0) {
        message.innerText = '调货量不小于0'
      } else {
        message.innerText = ''
      }
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getAcceptAdjustList(this.pageInfo.pageSize, this.pageInfo.currentPage)
    },
    getAcceptAdjustListCount () {
      let that = this
      this.$axios.get('/api/foodmaterial/getdispathCount?type=1').then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    }
  }
}
</script>

<style scoped lang="less">
  .adjustDetail{
    margin-top: 8px;
    font-size: 16px;
  }
</style>
<style lang="less">
  .accept_adjust{
    .cell{
      text-align: center;
    }
    .el-select{
      width: 90%;
      .el-input{
        width: 100%;
      }
    }

    .el-form-item{
      margin-bottom: 0;
    }
    .el-input__inner{
      height: 30px;
    }
    .suggestion{
      color: #909399;
      font-size: 13px;
    }
    .red{
      color: #ff0000;
    }
    .error_msg{
      display: inline-block;
      line-height: 20px;
      height: 20px;
    }
    .el-dialog__body{
      padding: 10px 20px 30px;
    }
  }
</style>
