<template>
  <div class="forecast-curve" style="overflow: scroll">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">数据概览</span>
      </div>
      <div class="content-first">
        <el-tabs type="border-card" @tab-click="handleClick" style="position: relative">
          <el-tab-pane v-for="(tab,index) in labelList1" :key="index">
          <span slot="label">
            <span class="tab-inner-info">{{tab.name}}<span class="icon-center">|</span>{{tab.info}}
              <el-tooltip class="item" effect="light" :content="tooltips[index]" placement="bottom-start">
                <i class="el-icon-question icon"></i>
              </el-tooltip>
            </span>
          </span>
          </el-tab-pane>
        </el-tabs>
        <div class="pick-date">
          <div class="top">
            <el-date-picker
              type="dates"
              v-model="pickDate"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions0"
              @change="handleChange"
              placeholder="时间段选择">
            </el-date-picker>
            <div v-for="(date,index) in clickDateList" :key="index" @click="dateClick(date, index, 'clickDateList', 1, 'timeSpan')" :class="date.active?'date-click date-click-active':'date-click'">{{date.name}}</div>
          </div>
          <div class="middle">
            <div v-for="(type,index) in dataTypeList" :key="index" @click="dateClick(type, index, 'dataTypeList', 1, 'type')" :class="type.active?'type-click type-click-active':'type-click'">{{type.name}}</div>
          </div>
        </div>
        <div id="echarts-top"></div>
      </div>
    </el-card>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title" style="position: relative">食材消耗统计_{{forecastFoodName}}
          <i class="el-icon-question icon"></i>
          <el-tooltip class="item" effect="light" :content="tooltips[3]" placement="bottom-start">
            <i class="el-icon-question icon"></i>
          </el-tooltip>
        </span>
        <div id="echartsInfo" class="food-echarts-info">
          <div class="pick-date">
            <div class="top">
              <el-date-picker
                type="dates"
                v-model="pickDate2"
                value-format="yyyy-MM-dd"
                :picker-options="pickerOptions0"
                @change="handleChange2"
                placeholder="时间段选择">
              </el-date-picker>
              <div v-for="(date,index) in clickDateList2" :key="index" @click="dateClick(date, index, 'clickDateList2', 2, 'timeSpan2')" :class="date.active?'date-click date-click-active':'date-click'">{{date.name}}</div>
            </div>
            <div class="middle">
              <div v-for="(type,index) in dataTypeList2" :key="index" @click="dateClick(type, index, 'dataTypeList2', 2, 'type2')" :class="type.active?'type-click type-click-active':'type-click'">{{type.name}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="content-first">
        <div id="middleContent">
          <div id="echarts-food" style="padding-bottom: 25px"></div>
        </div>
        <div>
        <el-tabs type="border-card" @tab-click="handleClick2">
          <el-tab-pane v-for="(tab,index) in labelList2" :key="index">
          <span slot="label">
            <span class="tab-inner-info">{{tab.name}}</span>
          </span>
          </el-tab-pane>
        </el-tabs>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'forecastCurve',
  data () {
    return {
      labelList1: [],
      labelList2: [],
      forecastFoodName: '',
      pickDate: '',
      pickDate2: '',
      clickDateList: [
        {
          name: '近30天',
          code: 4,
          active: false
        }, {
          name: '近七天',
          code: 3,
          active: false
        }, {
          name: '昨日',
          code: 2,
          active: false
        }, {
          name: '今日',
          code: 1,
          active: true
        }
      ],
      dataTypeList: [
        {
          name: '日',
          code: 1,
          active: false
        }, {
          name: '时',
          code: 2,
          active: true
        }
      ],
      clickDateList2: [
        {
          name: '近30天',
          code: 4,
          active: false
        }, {
          name: '近七天',
          code: 3,
          active: false
        }, {
          name: '昨日',
          code: 2,
          active: false
        }, {
          name: '今日',
          code: 1,
          active: true
        }
      ],
      dataTypeList2: [
        {
          name: '日',
          code: 1,
          active: false
        },
        {
          name: '时',
          code: 2,
          active: true
        }
      ],
      selectedTabIndex: 0,
      startTime: '',
      endTime: '',
      type: 2,
      timeSpan: 1,
      selectedTabIndex2: 0,
      startTime2: '',
      endTime2: '',
      type2: 2,
      timeSpan2: 1,
      urlTop: '',
      url1: '/api/foodmaterial/getmealsmumbers?',
      url2: '/api/foodmaterial/getfoodcurvedata?',
      pickerOptions0: {
        disabledDate (time) {
          return time.getTime() > Date.now() - 8.64e6
        }
      },
      selectedFoodId: '',
      selectedCode: 1,
      tooltips: ['只包含成功下单且未退单的用户', '不包含退单的数据', '只包含已结账的数据', '只包含已出菜的食材']
    }
  },
  mounted () {
    this.getLabelList1()
    this.getLabelList2()
    this.getData(this.url1, 'labelList1', this.selectedTabIndex, 'echarts-top', 1)
  },
  methods: {
    handleChange () {
      if (this.pickDate !== null && this.pickDate.length > 0) {
        for (let i = 0; i < this.clickDateList.length; i++) {
          this.clickDateList[i].active = false
        }
        this.timeSpan = 0
        this.startTime = this.pickDate[0]
        this.endTime = this.pickDate[this.pickDate.length - 1]
        this.getData(this.url1, 'labelList1', this.selectedTabIndex, 'echarts-top', 1)
      }
    },
    handleChange2 () {
      if (this.pickDate2 !== null && this.pickDate2.length > 0) {
        for (let i = 0; i < this.clickDateList2.length; i++) {
          this.clickDateList2[i].active = false
        }
        this.timeSpan2 = 0
        this.startTime2 = this.pickDate2[0]
        this.endTime2 = this.pickDate2[this.pickDate2.length - 1]
        this.getData(this.url2, 'labelList2', this.selectedTabIndex2, 'echarts-food', 2)
      }
    },
    getLabelList1 () {
      this.labelList1 = [{
        code: 1,
        name: '用餐人数',
        info: '',
        xAxis: [],
        series: [],
        seriesT: []
      }, {
        code: 2,
        name: '订单数量',
        info: '',
        xAxis: [],
        series: [],
        seriesT: []
      }, {
        code: 3,
        name: '营业额',
        info: '',
        xAxis: [],
        series: [],
        seriesT: []
      }]
      this.getDefaultData()
      this.getData(this.url1, 'labelList1', this.selectedTabIndex, 'echarts-top', 1)
    },
    getDefaultData () {
      let param = 'code=' + this.selectedCode + '&timeSpan=' + this.timeSpan + '&type=' + this.type + '&startTime=' + this.startTime + '&endTime=' + this.endTime
      let that = this
      this.$axios.get('/api/foodmaterial/getdefaultcurvedate?' + param).then(function (res) {
        if (res.code === 0) {
          // that.labelList1[0].info = res.dataList[0].population ? res.dataList[0].population : 0
          // that.labelList1[1].info = res.dataList[0].orderNumbers ? res.dataList[0].orderNumbers : 0
          // that.labelList1[2].info = '¥' + (res.dataList[0].turnover ? res.dataList[0].turnover : 0)
          for (let i = 0; i < res.dataList.length; i++) {
            let icon = (i === 2 ? '¥' : '')
            that.labelList1[i].info = icon + (res.dataList[i].data ? res.dataList[i].data : 0)
          }
        }
      })
    },
    getLabelList2 () {
      let that = this
      this.$axios.get('/api/foodmaterial/getprocurement').then(function (res) {
        that.labelList2 = []
        if (res.dataList.length > 0) {
          for (let i = 0; i < res.dataList.length; i++) {
            let data = res.dataList[i]
            that.labelList2.push(
              {
                foodId: data.id,
                name: data.foodName,
                xAxis: [],
                series: [],
                seriesT: []
              }
            )
          }
          that.selectedFoodId = that.labelList2[0].foodId
          that.forecastFoodName = that.labelList2[0].name
          that.getData(that.url2, 'labelList2', that.selectedTabIndex2, 'echarts-food', 2)
        }
      })
    },
    dateClick (date, index, list, code, type) {
      let url = '/api/foodmaterial/'
      for (let i = 0; i < this[list].length; i++) {
        this[list][i].active = false
      }
      this[list][index].active = true
      if (code === 1) {
        if (type !== 'type') {
          this.startTime = ''
          this.endTime = ''
          this.pickDate = []
        }
        this[type] = date.code
        url += 'getmealsmumbers?'
        this.getData(url, 'labelList1', this.selectedTabIndex, 'echarts-top', 1)
        this.getDefaultData()
      } else if (code === 2) {
        if (type !== 'type2') {
          this.startTime2 = ''
          this.endTime2 = ''
          this.pickDate2 = []
        }
        this[type] = date.code
        url += 'getfoodcurvedata?'
        this.getData(url, 'labelList2', this.selectedTabIndex2, 'echarts-food', 2)
      }
    },
    getData (url, tabList, tabIndex, echartsId, type) {
      let param = 'code=' + this.selectedCode + '&timeSpan=' + this.timeSpan + '&type=' + this.type + '&startTime=' + this.startTime + '&endTime=' + this.endTime
      let param2 = 'foodId=' + this.selectedFoodId + '&timeSpan=' + this.timeSpan2 + '&type=' + this.type2 + '&startTime=' + this.startTime2 + '&endTime=' + this.endTime2
      let that = this
      this.$axios.get(type === 1 ? url + param : url + param2).then(function (res) {
        if (res.code === 0) {
          that[tabList][tabIndex].xAxis = res.data.xAxis
          that[tabList][tabIndex].series = res.data.series
          that[tabList][tabIndex].seriesT = res.data.seriesT
          that.initEcharts(that[tabList][tabIndex], echartsId)
        }
      })
    },
    handleClick (tab, event) {
      this.selectedCode = this.labelList1[tab.index].code
      this.selectedTabIndex = tab.index
      this.getData(this.url1, 'labelList1', this.selectedTabIndex, 'echarts-top', 1)
    },
    handleClick2 (tab, event) {
      this.selectedFoodId = this.labelList2[tab.index].foodId
      this.selectedTabIndex2 = tab.index
      this.forecastFoodName = this.labelList2[tab.index].name
      this.getData(this.url2, 'labelList2', this.selectedTabIndex2, 'echarts-food', 2)
    },
    initEcharts (tab, id) {
      let dom = document.getElementById(id)
      for (let i = 0; i < dom.childNodes.length; i++) {
        if (dom.childNodes[i].className === 'no-data-class') {
          dom.removeChild(dom.childNodes[i])
        }
      }
      let echarts = this.$echarts.init(dom)
      if (tab.series.length < 1 && tab.seriesT.length < 1) {
        let noDataInfo = document.createElement('div')
        noDataInfo.className = 'no-data-class'
        noDataInfo.innerHTML = '暂无数据'
        dom.appendChild(noDataInfo)
      }
      let option = {
        xAxis: {
          type: 'category',
          data: tab.xAxis,
          boundaryGap: false
        },
        grid: {
          top: 30, // 距离容器上边界40像素
          right: 50,
          bottom: 30, // 距离容器下边界30像素
          left: 50
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            let res = '<div><p>时间 ' + params[0].name + '</p></div>'
            res += '<p>' + (id === 'echarts-top' ? (params[0].seriesName + (tab.code === 3 ? '(元)' : '')) : '消耗数量(斤)') + ' ' + ((params[0].seriesName === '用餐人数' || params[0].seriesName === '订单数量') ? (params[0].data ? Math.round(params[0].data) : Math.round(params[1].data) + ' (预测)') : (params[0].data ? params[0].data : params[1].data + ' (预测)')) + '</p>'
            return res
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: tab.name,
            data: tab.series,
            type: 'line',
            lineStyle: {
              normal: {
                color: 'green',
                width: 2
              }
            }
          },
          {
            name: tab.name,
            data: tab.seriesT,
            type: 'line',
            lineStyle: {
              normal: {
                color: 'red',
                width: 2,
                type: 'dotted'
              }
            }
          }
        ]
      }
      echarts.setOption(option)
    }
  }
}
</script>

<style scoped lang="less">
  .forecast-curve{
    #echarts-top{
      width: calc( 100% - 2px );
      height: 400px;
      border-left: 1px solid #dcdfe6;
      border-bottom: 1px solid #dcdfe6;
      border-right: 1px solid #dcdfe6;
      position: relative;
    }
    #echartsInfo{
      height: 40px;
      .pick-date{
        margin-top: 0;
      }
    }
    #echarts-food{
      width: calc( 100% - 2px );
      height: 480px;
      border-left: 1px solid #dcdfe6;
      border-right: 1px solid #dcdfe6;
    }
    .pick-date{
      position: relative;
      z-index: 99;
      height: 70px;
      float: right;
      margin-top: -80px;
      .top{
        height: 30px;
      }
      .middle{
        margin: 10px 10px 0 0;
        height: 30px;
      }
    }
    .date-click{
      margin: 0 10px;
      color: #000;
      float: right;
      height: 30px;
      line-height: 30px;
      font-size: 15px;
      cursor: pointer;
    }
    .date-click-active{
      color: #409EFF;
    }
    .type-click{
      cursor: pointer;
      float: right;
      padding: 5px 20px;
      border: 1px solid #909399;
    }
    .type-click-active{
      color: #fff;
      border: 1px solid #409EFF;
      background: #409EFF;
    }
  }
</style>

<style lang="less">
  .forecast-curve{
    .el-tabs__item{
      height: 90px;
      padding: 0 30px;
    }
    .tab-inner-info{
      position: relative;
      font-size: 18px;
      line-height: 90px;
      text-align: center;
      .icon-center{
        margin: 0 10px;
      }
    }
    .icon{
      position: absolute;
      top: -5px;
      right: -18px;
    }
    .el-tabs__content{
      padding: 0;
    }
    .el-tabs__header {
      background-color: #fff;
    }
    .pick-date{
      .top{
        .el-input {
          width: 200px;
        }
        .el-input__inner {
          padding-right: 10px;
          height: 30px;
        }
        .el-input__prefix, .el-input__suffix{
          top: -5px;
        }
      }
    }
    .el-tabs--border-card {
      background: #fff;
      border: 0;
      border-top: 1px solid #dcdfe6;
      border-left: 1px solid #dcdfe6;
      border-right: 1px solid #dcdfe6;
      -webkit-box-shadow: 0 2px 4px 0 rgba(0,0,0,0), 0 0 6px 0 rgba(0,0,0,0);
      box-shadow: 0 2px 4px 0 rgba(0,0,0,0), 0 0 6px 0 rgba(0,0,0,0);
    }
    .el-tabs--border-card>.el-tabs__header .el-tabs__item {
      border: 1px solid transparent;
      margin: -1px -1px 0;
      color: #000;
      font-weight: bolder;
    }
    .el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active {
      border-right-color: #fff;
      border-left-color: #fff;
      border-bottom: 1px solid #dcdfe6;
      color: #409EFF !important;
    }
    .box {
      width: 400px;

      .top {
        text-align: center;
      }

      .left {
        float: left;
        width: 60px;
      }

      .right {
        float: right;
        width: 60px;
      }

      .bottom {
        clear: both;
        text-align: center;
      }

      .item {
        margin: 4px;
      }

      .left .el-tooltip__popper,
      .right .el-tooltip__popper {
        padding: 8px 10px;
      }
    }
    .no-data-class{
      width: 100px;
      text-align: center;
      position: absolute;
      font-weight: bolder;
      top: 170px;
      left: calc( 50% - 50px );
    }
    .food-echarts-info{
      margin-top: -20px;
    }
  }
</style>
