<template>
  <div class="my_adjust">
    <el-table
      :data="myAdjustList"
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
        prop="restaurant"
        label="调货餐厅"
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
          <el-button  type="text" size="small" @click="getDetailInfo(scope.row)">查看详情
          </el-button>
          <el-button  type="text" size="small"
                      v-if="scope.row.status===0 || scope.row.status===1"
                      @click="operator(scope.row)">{{scope.row.status===0?'取消调货':'确认送达'}}
          </el-button>
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
      <el-table
        :data="selectedAdjust.content"
        border
        stripe>
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
          v-if="supplyShow"
          label="送货数量">
          <template slot-scope="scope">
            <span>{{scope.row.supplyWeight}}<span>{{scope.row.unit}}</span></span>
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
        <el-form-item class="suggestion" v-if="selectedAdjust.status===1 || selectedAdjust.status===2">
          <span>同意调货时间：{{selectedAdjust.passTime}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===2">
          <span>送达时间：{{selectedAdjust.supplyTime}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===3">
          <span>驳回时间：{{selectedAdjust.updateTime}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="selectedAdjust.status===4">
          <span>取消时间：{{selectedAdjust.updateTime}}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import storeInfoList from '@/components/intelligentWarehousing/storeInfoList'
export default {
  name: 'myAdjust',
  mixins: [storeInfoList],
  data () {
    return {
      myAdjustList: [],
      loading: true,
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      }
    }
  },
  mounted () {
    this.getMyAdjustList(this.pageInfo.pageSize, this.pageInfo.currentPage)
    this.getMyAdjustListCount()
  },
  methods: {
    getDetailInfo (rows) {
      this.selectedAdjust = rows
      this.supplyShow = !(rows.status === 0 || rows.status === 3 || rows.status === 4)
      this.dialogTableVisible = true
      this.title = '调货申请详情_' + (rows.status === 0 ? '待处理' : rows.status === 1 ? '待送达' : rows.status === 2 ? '已送达' : rows.status === 3 ? '被驳回' : '已取消')
    },
    operator (rows) {
      this.selectedAdjust = rows
      let flag = rows.status === 0 ? '取消调货' : '确认送达'
      let message1 = '确认取消调货？'
      let message2 = '确认食材已送达？'
      this.$confirm(rows.status === 0 ? message1 : message2, flag, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        rows.status === 0 ? this.cancelSubmit(rows.id, 1, 4) : this.cancelSubmit(rows.id, 1, 2, JSON.stringify(rows.content), rows.supplyId)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消该操作'
        })
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getMyAdjustList(this.pageInfo.pageSize, this.pageInfo.currentPage)
    },
    getMyAdjustListCount () {
      let that = this
      this.$axios.get('/api/foodmaterial/getdispathCount?type=0').then(function (res) {
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
  .my_adjust{
    .cell{
      text-align: center;
    }
    .el-select{
      width: 90%;
      .el-input{
        width: 100%;
      }
    }
    .el-checkbox{
      margin-left: 0 !important;
      margin-right: 30px;
      width: 138px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  }
</style>
