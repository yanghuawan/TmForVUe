<!--suppress ALL -->
<script>
export default {
  name: 'storeinfolist',
  data () {
    return {
      storeList: [],
      dialogTableVisible: false,
      dialogFormVisible1: false,
      dialogFormVisible2: false,
      contentList: [],
      foodList: [],
      supplyShow: false,
      title: '',
      selectStore: {},
      applyList: [],
      selectedAdjust: {},
      publishContent: {
        title: '',
        publishList: ''
      },
      errorMsg: ''
    }
  },
  mounted () {
  },
  methods: {
    getStoreList () {
      let that = this
      this.$axios.get('/api/common/getamaplist').then(function (res) {
        if (res.dataList.length > 0) {
          that.storeList = []
          let selfTotal = 0 // 本店所缺数量
          let otherTotal = 0 // 其他店所缺数量
          let selFreeTotal = 0 // 本店多余数量
          let otherFreeTotal = 0// 其他店多余数量

          for (let i = 0; i < res.dataList.length; i++) {
            let data = res.dataList[i]
            let sameFlag = true
            if (that.storeList.length < 1) {
              sameFlag = false
            } else {
              sameFlag = data.storeId === res.dataList[i - 1].storeId
            }
            if (sameFlag) {
              let foodList = that.storeList[that.storeList.length - 1].foodList
              foodList.push(data)
              that.storeList[that.storeList.length - 1].foodList = foodList
              let foodData = res.dataList[i]
              selfTotal += foodData.selfFree < 0 ? -foodData.selfFree : 0
              otherTotal += foodData.free < 0 ? -foodData.free : 0
              selFreeTotal += foodData.free > 0 ? 0 : foodData.selfFree < 0 ? 0 : foodData.selfFree / foodData.free < -1 ? -foodData.free : foodData.selfFree
              otherFreeTotal += foodData.selfFree > 0 ? 0 : foodData.free < 0 ? 0 : foodData.free / foodData.selfFree < -1 ? -foodData.selfFree : foodData.free
            } else {
              if (that.storeList.length > 0) {
                that.setRate(otherFreeTotal, selfTotal, selFreeTotal, otherTotal)
                selfTotal = 0 // 本店所缺数量
                otherTotal = 0 // 其他店所缺数量
                selFreeTotal = 0 // 本店多余数量
                otherFreeTotal = 0// 其他店多余数量
              }

              let foodList = []
              foodList.push(data)
              data.foodList = foodList
              that.storeList.push(data)
            }
            if (i === res.dataList.length - 1) {
              that.setRate(otherFreeTotal, selfTotal, selFreeTotal, otherTotal)
            }
          }
          that.compare(that.storeList, 'selfRate')
        }
      })
    },
    setRate (otherFreeTotal, selfTotal, selFreeTotal, otherTotal) {
      let selfRate = selfTotal > 0 ? otherFreeTotal / selfTotal * 100 : 0
      let otherRate = otherTotal > 0 ? selFreeTotal / otherTotal * 100 : 0
      let selfResult = Math.floor(otherFreeTotal > 0 ? selfRate > 100 ? 100 : selfRate : 0)
      let otherResult = Math.floor(selFreeTotal > 0 ? otherRate > 100 ? 100 : otherRate : 0)
      this.storeList[this.storeList.length - 1]['selfRate'] = selfResult
      this.storeList[this.storeList.length - 1]['otherRate'] = otherResult
    },
    compare (array, pro) {
      return array.sort(function (obj1, obj2) {
        var val1 = obj1[pro]
        var val2 = obj2[pro]
        return ((val1 < val2) ? 1 : ((val1 > val2) ? -1 : 0))
      })
    },
    submitApply () {
      let submitList = []
      let that = this
      for (let i = 0; i < this.applyList.length; i++) {
        if (this.applyList[i].applyWeight) {
          submitList.push(
            {
              foodId: this.applyList[i].foodId,
              foodName: this.applyList[i].foodName,
              applyWeight: this.applyList[i].applyWeight,
              unit: this.applyList[i].unit
            }
          )
        }
      }
      this.publishContent.title = sessionStorage.getItem('myStoreName').toString() + '申请调货'
      this.publishContent.publishList = submitList
      /* 向选择的店铺的Channel发送消息 */
      this.$axios.post('/api/foodmaterial/adddispat', {
        supplyId: this.selectStore.storeId,
        content: JSON.stringify(submitList)
      }).then(function (res) {
        if (res.code === 0) {
          that.publishMessage(that.selectStore.storeId.toString(), JSON.stringify(that.publishContent))
          that.getStoreList()
          that.dialogFormVisible2 = false
          that.$message({
            type: 'success',
            message: '申请调货成功'
          })
          if (that.$route.path === '/intelligentWarehousing/amap') {
            setTimeout(function () {
              location.reload()
            }, 100)
          }
        } else {
          this.$message({
            type: 'info',
            message: '申请调货失败'
          })
        }
      })
    },
    publishMessage (otherChannel, pmessage) {
      let that = this
      this.$goEasy.publish({
        channel: otherChannel,
        message: pmessage,
        onSuccess: function () {
          that.$message({
            message: '消息发送成功',
            type: 'success'
          })
        },
        onFailed: function (error) {
          that.$message({
            message: '消息发送失败，错误编码：' + error.code + ',错误信息：' + error.content
          })
        }
      })
    },
    showFoodList (data) {
      this.selectStore = data
      if (data.disStatus < 0 || data.disStatus > 1) {
        this.title = '餐厅食材信息'
        let foodList = data.foodList
        this.foodList = []
        this.dialogFormVisible = true
        this.foodList = foodList
      } else if (data.disStatus === 0) {
        this.title = '调货申请详情_待处理'
        this.supplyShow = false
        this.contentList = JSON.parse(data.disContent)
        this.dialogFormVisible1 = true
      } else if (data.disStatus === 1) {
        this.title = '调货申请详情_待送达'
        this.supplyShow = true
        this.contentList = JSON.parse(data.disContent)
        this.dialogFormVisible1 = true
      }
    },
    showDisList (data) {
      this.selectStore = data
      if (data.disStatus < 0 || data.disStatus > 1) {
        this.title = '输入调货数量'
        let foodList = data.foodList
        this.applyList = []
        for (let i = 0; i < foodList.length; i++) {
          if (foodList[i].existFlag === 1) {
            this.applyList.push(foodList[i])
          }
        }
        this.dialogFormVisible2 = true
      } else if (data.disStatus === 0) {
        this.$confirm('确定取消调货吗', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.cancelSubmit(data.disId, 0, 4)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消该操作'
          })
        })
      } else if (data.disStatus === 1) {
        this.title = '调货申请详情_待送达'
        this.supplyShow = true
        this.contentList = JSON.parse(data.disContent)
        this.dialogFormVisible1 = true
      }
    },
    /* 取消调货、确认送达、驳回申请 */
    cancelSubmit (id, type, status, content, supplyId) {
      let that = this
      let msg = status === 1 ? '同意调货' : status === 2 ? '确认送达' : status === 3 ? '驳回调货' : '取消调货'
      let params = {
        id: id,
        status: status,
        content: content !== 'undefined' ? content : '',
        supplyId: supplyId
      }
      let acceptId = ''
      let titleMassage = ''
      if (this.$route.path === '/intelligentWarehousing/amap' || this.$route.path === '/intelligentWarehousing/amapList') {
        acceptId = this.selectStore.storeId.toString()
        titleMassage = sessionStorage.getItem('myStoreName')
      } else {
        acceptId = (status === 4) || (status === 2) ? this.selectedAdjust.supplyId.toString() : this.selectedAdjust.applyId.toString()
        titleMassage = (status === 4) || (status === 2) ? this.selectedAdjust.applyName : this.selectedAdjust.restaurant
      }
      this.$axios.post('/api/foodmaterial/updatedispatstatus', params).then(function (res) {
        if (res.code === 0) {
          if (type === 0) {
            that.getStoreList()
            if (that.$route.path === '/intelligentWarehousing/amap') {
              setTimeout(function () {
                location.reload()
              }, 100)
            }
          } else if (type === 1) {
            that.getMyAdjustList(that.Const.PAGE_SIZE, 1)
          } else if (type === 2) {
            that.getAcceptAdjustList(that.Const.PAGE_SIZE, 1)
          }
          that.$message({
            type: 'success',
            message: msg + '成功'
          })
          that.dialogTableVisible = false
          that.dialogFormVisible1 = false
          that.dialogFormVisible2 = false
          that.publishContent.title = titleMassage + msg
          that.publishContent.publishList = content !== 'undefined' ? ((status === 1 || status === 2) ? JSON.parse(content) : content) : ''
          that.publishMessage(acceptId, JSON.stringify(that.publishContent))
        }
      })
    },
    getMyAdjustList (pageSize, curPage) {
      this.loading = true
      let that = this
      let params = 'type=0'
      params += '&rows=' + pageSize
      params += '&curPage=' + curPage
      this.$axios.get('/api/foodmaterial/getdispathlist?' + params).then(function (res) {
        that.myAdjustList = []
        for (let i = 0; i < res.dataList.length; i++) {
          let data = res.dataList[i]
          data.content = data.content ? JSON.parse(data.content) : []
          that.myAdjustList.push(data)
        }
        that.loading = false
      })
    },
    /* 获取收到的调货申请列表 */
    getAcceptAdjustList (pageSize, curPage) {
      this.loading = true
      let that = this
      let params = 'type=1'
      params += '&rows=' + pageSize
      params += '&curPage=' + curPage
      this.$axios.get('/api/foodmaterial/getdispathlist?' + params).then(function (res) {
        that.acceptAdjustList = []
        for (let i = 0; i < res.dataList.length; i++) {
          let data = res.dataList[i]
          data.content = data.content ? JSON.parse(data.content) : []
          that.acceptAdjustList.push(data)
        }
        that.loading = false
      })
    },
    checkNum () {
      this.errorMsg = ''
      if (this.applyList) {
        for (let i = 0; i < this.applyList.length; i++) {
          if (this.applyList[i].applyWeight < 0) {
            this.errorMsg = '请输入不小于0的数'
            return
          }
        }
      }
      if (this.selectedAdjust.content) {
        let list = this.selectedAdjust.content
        for (let i = 0; i < list.length; i++) {
          if (list[i].supplyWeight < 0) {
            this.errorMsg = '请输入不小于0的数'
            return
          }
        }
      }
    }
  }
}
</script>
