<template>
  <div class="a-map">
    <el-card class="amap-page-container">
      <div slot="header" class="clearfix">
        <span class="card_title">智慧仓配</span>
        <span class="suggestion">Tips：列表显示方圆20公里的餐厅</span>
        <el-button style="float: right;" type="text" @click="goto()">地图模式</el-button>
      </div>
      <el-table
        :data="storeList"
        border
        stripe>
        <el-table-column
          prop="storeName"
          label="餐厅名称">
        </el-table-column>
        <el-table-column
          label="联系方式">
          <template slot-scope="scope">
            <span>{{scope.row.tel}}<span v-if="scope.row.tel">&nbsp;&nbsp;</span>{{scope.row.mobile}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="地址">
          <template slot-scope="scope">
            <span>{{scope.row.district}}{{scope.row.address}}{{scope.row.locationName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="匹配度">
          <template slot-scope="scope">
            <span :class="scope.row.selfRate>0?'green':''"><img src="../../../static/image/input.png" alt="进" style="vertical-align: text-bottom">&nbsp;{{scope.row.selfRate}}%</span><span>/<img src="../../../static/image/output.png" alt="出" style="vertical-align: text-bottom">&nbsp;{{scope.row.otherRate}}%</span>
          </template>
        </el-table-column>
        <el-table-column
          width="180"
          label="操作">
          <template slot-scope="scope">
            <el-button @click="showFoodList(scope.row)" type="text" size="small">详情</el-button>
            <el-button @click="showDisList(scope.row)" type="text" size="small">{{scope.row.disStatus>=0?(scope.row.disStatus>1?'申请调货':scope.row.disStatus===0?'取消调货':'确认送达'):'申请调货'}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="title" :visible.sync="dialogFormVisible"
               :close-on-click-modal="true">
      <el-table
        :data="foodList"
        border
        stripe>
        <el-table-column
          prop="foodName"
          label="食材名称">
        </el-table-column>
        <el-table-column
          label="今日本店预计结余">
          <template slot-scope="scope">
            <span :class="scope.row.selfFree<0?'red':scope.row.selfFree>0?'green':''">{{scope.row.selfFree}}<span>{{scope.row.unit}}</span></span>
          </template>
        </el-table-column>
        <el-table-column
          label="该店预计结余">
          <template slot-scope="scope">
            <span :class="scope.row.free<0?'red':scope.row.free>0?'green':''">{{scope.row.free}}<span>{{scope.row.unit}}</span></span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="dialogFormVisible1"
               :close-on-click-modal="true">
      <span class="red error_msg">{{errorMsg}}</span>
      <el-table
        :data="contentList"
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
          <span>{{selectStore.storeName}}</span>
        </el-form-item>
        <el-form-item label="联系电话:">
          <span>{{selectStore.tel}}<span v-if="selectStore.tel">&nbsp;&nbsp;</span>{{selectStore.mobile}}</span>
        </el-form-item>
        <el-form-item label="餐厅地址:">
          <span>{{selectStore.district}}{{selectStore.address}}{{selectStore.locationName}}</span>
        </el-form-item>
        <el-form-item class="suggestion" v-if="supplyShow">
          <span>同意调货时间：{{selectStore.disUpdateTime}}</span>
        </el-form-item>
        <el-form-item v-if="!supplyShow">
          <el-button type="primary" style="float: right" size="medium" @click="cancelSubmit(selectStore.disId,0,4)">取消调货</el-button>
        </el-form-item>
        <el-form-item v-if="supplyShow">
          <el-button type="primary" style="float: right" size="medium" @click="cancelSubmit(selectStore.disId,0,2,selectStore.disContent,selectStore.storeId)">确认送达</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="dialogFormVisible2"
               :close-on-click-modal="true">
      <span class="red error_msg">{{errorMsg}}</span>
      <el-table
        :data="applyList"
        border
        stripe>
        <el-table-column
          prop="foodName"
          label="食材名称">
        </el-table-column>
        <el-table-column
          label="今日本店预计结余">
          <template slot-scope="scope">
            <span :class="scope.row.selfFree<0?'red':scope.row.selfFree>0?'green':''">{{scope.row.selfFree}}<span>{{scope.row.unit}}</span></span>
          </template>
        </el-table-column>
        <el-table-column
          label="该店预计结余">
          <template slot-scope="scope">
            <span :class="scope.row.free<0?'red':scope.row.free>0?'green':''">{{scope.row.free}}<span>{{scope.row.unit}}</span></span>
          </template>
        </el-table-column>
        <el-table-column
          label="请输入调货数量">
          <template slot-scope="scope">
            <el-input v-model="scope.row.applyWeight" type="number" min="0" @blur="checkNum()"></el-input>
          </template>
        </el-table-column>
      </el-table>
      <el-form>
        <el-form-item label="调货餐厅:">
          <span>{{selectStore.storeName}}</span>
        </el-form-item>
        <el-form-item label="联系电话:">
          <span>{{selectStore.tel}}<span v-if="selectStore.tel">&nbsp;&nbsp;</span>{{selectStore.mobile}}</span>
        </el-form-item>
        <el-form-item label="餐厅地址:">
          <span>{{selectStore.district}}{{selectStore.address}}{{selectStore.locationName}}</span>
        </el-form-item>
        <el-form-item v-if="applyList.length > 0">
          <el-button type="primary" style="float: right" size="medium" @click="submitApply();dialogFormVisible2=false" :disabled="errorMsg!==''">确认调货</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import storeInfoList from '@/components/intelligentWarehousing/storeInfoList'
export default {
  name: 'aMapList',
  mixins: [storeInfoList],
  data () {
    return {
      dialogFormVisible: false
    }
  },
  mounted () {
    this.getStoreList()
  },
  methods: {
    goto () {
      this.$router.push('/intelligentWarehousing/amap')
    }
  }
}
</script>

<style scoped lang="less">
  .a-map{
    height: calc( 100% - 20px);
    .suggestion{
      color: #909399;
      font-size: 13px;
    }
  }
</style>

<style lang="less">
  .a-map{
    .el-card__body{
      height: 100%;
    }
    .cell{
      text-align: center;
    }
    .red{
      color: #ff0000;
    }
    .green{
      color: #008000;
    }
    .el-form-item{
      margin-bottom: 0;
    }
    .el-input__inner{
      height: 30px;
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
