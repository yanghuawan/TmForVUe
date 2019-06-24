<template>
  <div class="dish-list">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">菜品列表</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="updateDishInfo(null)">创建新菜品</el-button>
      </div>

      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="菜品名称:">
          <el-input v-model="selectInfo.name" size="medium"></el-input>
        </el-form-item>
        <el-form-item label="菜谱导航分类:">
          <el-select v-model="selectInfo.navKind" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.navName" :value="item.navId" v-for="(item,index) in navList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="selectInfo.status" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.statusName" :value="item.statusCode" v-for="(item,index) in status" :key="index"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <el-form :inline="true" class="demo-form-inline" style="border-bottom: 1px solid #F0F0F0">
        <el-form-item label="菜品单价:">
          <el-input v-model="selectInfo.minPrice" size="medium" class="price" type="number"></el-input>
          <div style="width: 20px;float: left;text-align: center">~</div>
          <el-input v-model="selectInfo.maxPrice" size="medium" class="price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="菜类型:">
          <el-select v-model="selectInfo.kind" size="medium">
            <el-option label="全部" value=""></el-option>
            <el-option :label="item.name" :value="item.code" v-for="(item,index) in kindList" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button style="padding: 3px;margin-left: 110px" type="text" @click="clearFilter">清空搜索条件</el-button>
          <el-button type="primary" size="medium" @click="getDishList();getDishTotalCount()">查询</el-button>
        </el-form-item>
      </el-form>

      <div class="operation-area">
        <el-button type="primary" size="medium" @click="changeStatus('0')">上架</el-button>
        <el-button type="primary" size="medium" @click="changeStatus('1')">下架</el-button>
        <el-button type="primary" size="medium" @click="changeNav">菜谱导航分类</el-button>
      </div>

      <el-table
        v-loading="loading"
        element-loading-text="数据加载中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
        :data="dishList"
        border
        stripe
        @selection-change="handleSelectionChange"
        style="width: 100%">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          label="菜品名称">
          <template slot-scope="scope">
            <img :src="scope.row.picturesList.length>0?scope.row.picturesList[0]:''"/>
            <span class="dish-name">{{scope.row.dishName}}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="navName"
          label="菜品导航分类">
        </el-table-column>
        <el-table-column
          prop="price"
          sortable
          label="菜品单价">
          <template slot-scope="scope">
            {{scope.row.price}}
            <span class="update-price" @click="updatePrice(scope.row)">编辑</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sales"
          sortable
          label="前7日销量">
        </el-table-column>
        <el-table-column
          prop="createTime"
          sortable
          label="创建时间">
        </el-table-column>
        <el-table-column
          label="状态">
          <template slot-scope="scope">
            <span>{{scope.row.status==='0'?'上架':'下架'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作">
          <template slot-scope="scope">
            <el-button @click="updateDishInfo(scope.row)" type="text" size="small">编辑</el-button>
            <el-button @click="deleteDishInfo(scope.row)" type="text" size="small">删除</el-button>
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

    <el-dialog title="菜谱导航分类" :visible.sync="dialogFormVisible"
               :close-on-click-modal="false">
      <el-radio-group v-model="changeNavId">
        <div v-for="(item,index) in navList" :key="index" style="margin: 10px">
          <el-radio :label="item.navId">{{item.navName}}</el-radio>
        </div>
      </el-radio-group>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="changeNavSubmit">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'修改价格_'+selectDish.dishName" :visible.sync="priceFormVisible"
               :before-close="handleClose"
               :close-on-click-modal="false">
      <el-form label-width="120px">
        <el-form-item label="菜品单价:">
          <el-input
            type="text"
            v-model.trim="selectDish.price"
            auto-complete="off"
            clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="changePriceSubmit">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'menuList',
  data () {
    return {
      dishList: [],
      pageInfo: {
        currentPage: 1,
        totalCount: 0,
        pageSize: this.Const.PAGE_SIZE
      },
      loading: '',
      selectInfo: {
        name: '',
        navKind: '',
        status: '',
        minPrice: '',
        maxPrice: '',
        kind: ''
      },
      navList: [],
      status: [
        {
          statusCode: '1',
          statusName: '下架'
        },
        {
          statusCode: '0',
          statusName: '上架'
        }
      ],
      kindList: [],
      selectedDishList: [],
      dialogFormVisible: false,
      changeNavId: '',
      priceFormVisible: false,
      selectDish: {
        id: '',
        dishName: '',
        navName: '',
        price: '',
        sevenDaySale: '',
        createTime: '',
        status: ''
      }
    }
  },
  mounted () {
    this.getDishTotalCount()
    this.getDishList()
    this.getNavList()
    this.getKindList()
  },
  methods: {
    /* 编辑菜品信息 */
    updateDishInfo (row) {
      window.open(row ? '#/addNewDish?dishId=' + row.id : '#/addNewDish?dishId=')
    },
    /* 删除菜品 */
    deleteDishInfo (row) {
      this.$confirm('确定删除' + row.dishName + '吗', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let that = this
        this.$axios.get('/api/dish/deldish?ids=' + row.id).then(function (res) {
          that.getDishList()
          if (res.code === 0) {
            that.$message({
              type: 'success',
              message: '删除成功!'
            })
            setTimeout(() => {
              if (row.needFlag === 0) {
                that.$message.closeAll()
                that.$message({
                  duration: 0,
                  showClose: true,
                  dangerouslyUseHTMLString: true,
                  message: '存在已失效的必点项<a style="margin-left: 20px;" href="#/menuManagement/needSetting">立即查看</a>'
                })
              }
            }, 1000)
          } else {
            that.$message({
              type: 'info',
              message: '删除失败!'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    /* 确认修改价格 */
    changePriceSubmit () {
      this.priceFormVisible = false
      let that = this
      this.$axios.get('/api/dish/updateprice?id=' + this.selectDish.id + '&price=' + this.selectDish.price).then(function (res) {
        that.getDishList()
        if (res.code === 0) {
          that.$message({
            type: 'success',
            message: '修改成功!'
          })
        } else {
          that.$message({
            type: 'info',
            message: '修改失败!'
          })
        }
      })
    },
    /* 编辑价格 */
    updatePrice (row) {
      this.selectDish = row
      this.priceFormVisible = true
    },
    /* 确认提交修改导航 */
    changeNavSubmit () {
      let list = []
      let that = this
      this.dialogFormVisible = false
      for (let i = 0; i < this.selectedDishList.length; i++) {
        list.push(
          {
            dishId: this.selectedDishList[i].id,
            navigationId: this.changeNavId
          }
        )
      }
      this.$axios.post('/api/dishnav/update', list).then(function (res) {
        that.getDishList()
        if (res.code === 0) {
          that.$message({
            type: 'success',
            message: '修改菜品导航成功'
          })
        } else {
          that.$message({
            type: 'info',
            message: '修改菜品导航失败'
          })
        }
      })
    },
    /* 修改菜品导航 */
    changeNav () {
      if (this.selectedDishList.length > 0) {
        this.dialogFormVisible = true
        this.changeNavId = ''
      } else {
        this.$message({
          type: 'warning',
          message: '请选择要修改导航的菜品'
        })
      }
    },
    /* 上架、下架 */
    changeStatus (code) {
      if (this.selectedDishList.length > 0) {
        let changeFlag = false
        for (let i = 0; i < this.selectedDishList.length; i++) {
          if (this.selectedDishList[i].status !== code) {
            changeFlag = true
            break
          }
        }
        if (changeFlag) {
          let ids = ''
          let that = this
          for (let i = 0; i < this.selectedDishList.length; i++) {
            ids += this.selectedDishList[i].id + ','
          }
          ids = ids.substring(0, ids.length - 1)
          this.$axios.get('/api/dish/updatestatus?ids=' + ids + '&status=' + code).then(function (res) {
            that.getDishList()
            if (res.code === 0) {
              that.$message({
                type: 'success',
                message: code === '0' ? '上架成功' : '下架成功'
              })
            } else {
              that.$message({
                type: 'info',
                message: code === '0' ? '上架失败' : '下架失败'
              })
            }
          })
        } else {
          this.$message({
            type: 'warning',
            message: code === '0' ? '请选择要上架的菜品' : '请选择要下架的菜品'
          })
        }
      } else {
        this.$message({
          type: 'warning',
          message: code === '0' ? '请选择要上架的菜品' : '请选择要下架的菜品'
        })
      }
    },
    /* 选中或取消 */
    handleSelectionChange (val) {
      this.selectedDishList = val
    },
    /* 清空搜索条件 */
    clearFilter () {
      this.selectInfo = {
        name: '',
        navKind: '',
        status: '',
        minPrice: '',
        maxPrice: '',
        kind: ''
      }
    },
    /* 获取菜类型列表 */
    getKindList () {
      let that = this
      this.$axios.get('/api/common/dictionarylist?type=kind').then(function (res) {
        that.kindList = res.dataList
      })
    },
    /* 获取菜谱导航列表 */
    getNavList () {
      let that = this
      this.$axios.get('/api/nav/list').then(function (res) {
        that.navList = res.dataList
      })
    },
    /* 获取总条数 */
    getDishTotalCount () {
      let params = 'name=' + this.selectInfo.name
      params += this.selectInfo.maxPrice ? '&maxPrice=' + this.selectInfo.maxPrice : ''
      params += this.selectInfo.minPrice ? '&minPrice=' + this.selectInfo.minPrice : ''
      params += '&navKind=' + this.selectInfo.navKind
      params += '&status=' + this.selectInfo.status
      params += '&kind=' + this.selectInfo.kind
      let that = this
      this.$axios.get('/api/dish/dishcount?' + params).then(function (res) {
        that.pageInfo.totalCount = res.data
      })
    },
    /* 分页 */
    handleCurrentChange (val) {
      this.pageInfo.currentPage = val
      this.getDishList()
    },
    /* 获取菜品列表 */
    getDishList () {
      this.loading = true
      let params = 'rows=' + this.pageInfo.pageSize + '&curPage=' + this.pageInfo.currentPage
      params += this.selectInfo.minPrice ? '&minPrice=' + this.selectInfo.minPrice : ''
      params += this.selectInfo.maxPrice ? '&maxPrice=' + this.selectInfo.maxPrice : ''
      params += '&name=' + this.selectInfo.name
      params += '&navKind=' + this.selectInfo.navKind
      params += '&status=' + this.selectInfo.status
      params += '&kind=' + this.selectInfo.kind
      let that = this
      this.$axios.get('/api/dish/dishlist?' + params).then(function (res) {
        that.dishList = res.dataList
        for (let i = 0; i < that.dishList.length; i++) {
          that.dishList[i].picturesList = that.dishList[i].pictures ? JSON.parse(that.dishList[i].pictures) : []
        }
        that.loading = false
      })
    },
    handleClose (done) {
      this.getDishList()
      done()
    }
  }
}
</script>

<style scoped lang="less">
  .dish-list{
    .input-item{
      width: 200px;
      float: left;
      margin: 0 10px 10px 0;
    }
    .filter{
      width: 100%;
      height: 45px;
    }
    .note{
      width: 100%;
      height: 30px;
      line-height: 30px;
      margin-bottom: 10px;
      font-size: 15px;
    }
    .operation-area{
      margin: 10px 0;
    }
    .update-price{
      margin-left: 10px;
      color: #409EFF;
      cursor: pointer;
    }
    img{
      width: 80px;
      height: 80px;
      float: left;
      margin: 10px;
    }
    .dish-name{
      display: block;
      float: left;
      line-height: 80px;
      margin: 10px 0;
    }
  }
</style>

<style lang="less">
  .dish-list{
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
    .el-radio{
      padding: 10px 0;
    }
  }
</style>
