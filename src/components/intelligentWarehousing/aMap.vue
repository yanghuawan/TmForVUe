<template>
  <div class="a-map">
    <el-card class="amap-page-container">
      <div slot="header" class="clearfix">
        <span class="card_title">智慧仓配</span>
        <span class="suggestion">Tips:<img src="../../../static/image/input.png" alt="进"> 进货需求满足度;<img src="../../../static/image/output.png" alt="出"> 出货需求满足度</span>
        <el-button style="float: right;" type="text" @click="goto()">列表模式</el-button>
        <!--<input id="tipinput"/>-->
      </div>

      <div class="amap-page-container" id="container"></div>
      <div id="panel"></div>
    </el-card>

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
import AMap from 'AMap'
import storeInfoList from '@/components/intelligentWarehousing/storeInfoList'
export default {
  name: 'aMap',
  mixins: [storeInfoList],
  data () {
    return {
      center: [],
      selectedPosition: [],
      myStoreName: ''
    }
  },
  mounted () {
    this.getStoreInfo()
    this.getStoreList()
  },
  methods: {
    goto () {
      this.$router.push('/intelligentWarehousing/amapList')
    },
    /* 获取店铺信息 */
    getStoreInfo () {
      let that = this
      this.$axios.get('/api/store/getstoreinfo').then(function (res) {
        if (res.dataList.length > 0) {
          that.center = new AMap.LngLat(res.dataList[0].lng, res.dataList[0].lat)
          that.myStoreName = res.dataList[0].name
          sessionStorage.setItem('myStoreName', res.dataList[0].name)
          that.init()
        }
      })
    },
    /* 初始化地图 */
    init () {
      let mapObj = new AMap.Map('container', {
        center: this.center,
        zoom: 12
      })
      mapObj.plugin(['AMap.ToolBar', 'AMap.MapType'], function () {
        mapObj.addControl(new AMap.ToolBar())
        mapObj.addControl(new AMap.MapType({showTraffic: false, showRoad: false}))
      })
      /* this.geolocation(mapObj) */
      /* this.searchPlace(mapObj) */
      let that = this
      setTimeout(function () {
        that.markerList(mapObj)
      }, 500)
      // this.markerList(mapObj)
    },
    /* 定位服务 */
    geolocation (mapObj) {
      mapObj.plugin(['AMap.Geolocation'], function () {
        let geolocation = new AMap.Geolocation({
          enableHighAccuracy: true, //  是否使用高精度定位，默认:true
          timeout: 10000, //  超过10秒后停止定位，默认：无穷大
          maximumAge: 0, // 定位结果缓存0毫秒，默认：0
          convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
          showButton: true, //  显示定位按钮，默认：true
          buttonPosition: 'LB', // 定位按钮停靠位置，默认：'LB'，左下角
          buttonOffset: new AMap.Pixel(10, 20), //  定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          showMarker: true, //  定位成功后在定位到的位置显示点标记，默认：true
          showCircle: true, //  定位成功后用圆圈表示定位精度范围，默认：true
          panToLocation: true, //  定位成功后将定位到的位置作为地图中心点，默认：true
          zoomToAccuracy: true //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        })
        mapObj.addControl(geolocation)
        geolocation.getCurrentPosition()
        AMap.event.addListener(geolocation, 'complete', (result) => {
          mapObj.setCenter(result.position)
        }) //  返回定位信息
        AMap.event.addListener(geolocation, 'error', (result) => {
        }) //  返回定位出错信息
      })
    },
    /* 地点搜索 */
    searchPlace (mapObj) {
      mapObj.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch'], function () {
        let auto = new AMap.Autocomplete({
          input: 'tipinput'
        })
        let placeSearch = new AMap.PlaceSearch({
          map: mapObj
        }) // 构造地点查询类
        AMap.event.addListener(auto, 'select', select)// 注册监听，当选中某条记录时会触发
        function select (e) {
          placeSearch.setCity(e.poi.adcode)
          placeSearch.search(e.poi.name) // 关键字查询查询
        }
      })
    },
    /* 覆盖物列表 */
    markerList (mapObj) {
      let that = this
      mapObj.plugin(['AMap.Marker', 'AMap.InfoWindow', 'AMap.Driving', 'AMap.ContextMenu'], function () {
        // 构造矢量圆形
        let circle = new AMap.Circle({
          center: that.center, // 圆心位置
          radius: that.Const.RADIUS, // 半径
          strokeColor: '#fff', // 线颜色
          strokeOpacity: 0, // 线透明度
          // strokeWeight: 3,  // 线粗细度
          fillColor: '#ffd967', // 填充颜色
          fillOpacity: 0.5 // 填充透明度
        })

        let driving = new AMap.Driving({
          map: mapObj,
          panel: 'panel',
          policy: AMap.DrivingPolicy.LEAST_TIME
        })
        let contextMenu = new AMap.ContextMenu() // 创建右键菜单

        // 设为终点
        contextMenu.addItem('设为终点', function () {
          driving.search(that.center, that.selectedPosition)
        }, 0)

        let marker0 = new AMap.Marker({
          icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
          position: that.center
        })
        AMap.event.addListener(marker0, 'mouseover', mouseover0)

        // mapObj.add(marker0)
        mapObj.add([marker0, circle])

        for (let i = 0; i < that.storeList.length; i++) {
          if (that.storeList[i].lng && that.storeList[i].lat) {
            let marker = new AMap.Marker({
              icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
              position: [that.storeList[i].lng, that.storeList[i].lat]
            })
            marker.content = that.storeList[i]
            AMap.event.addListener(marker, 'mouseover', mouseover)// 注册监听，当选中某条记录时会触发
            AMap.event.addListener(marker, 'mouseout', mouseout)

            marker.on('rightclick', function (e) {
              that.selectedPosition = e.lnglat
              contextMenu.open(mapObj, e.lnglat)
              // console.log('右击事件' + e.lnglat + ',' + that.selectedPosition)
            })
            // console.log(that.storeList[i])
            let label = '<div><img src="../../../static/image/input.png" alt="进" style="vertical-align: text-bottom">&nbsp;<span style="color:' + (that.storeList[i].selfRate > 0 ? '#008000' : that.storeList[i].selfRate > 0 ? '#ff0000' : '#000000') + '">' +
                        +that.storeList[i].selfRate + '%/</span><img src="../../../static/image/output.png" alt="出" style="vertical-align: text-bottom">&nbsp;' + that.storeList[i].otherRate + '%</div>'
            label += '<p style="float: left;margin-left: -75px">' + that.storeList[i].storeName + '</p>'
            marker.setLabel({// label默认蓝框白底左上角显示，样式className为：amap-marker-label
              offset: new AMap.Pixel(25, 0), // 修改label相对于maker的位置
              content: label
            })
            mapObj.add(marker)
          }
        }

        let infoWindow = new AMap.InfoWindow({
          isCustom: true, // 使用自定义窗体
          offset: new AMap.Pixel(16, -50)
        })
        let title = '餐厅食材信息'
        function mouseover (e) {
          infoWindow.setContent(that.createInfoWindow(title, e.target.content, mapObj, driving))
          infoWindow.open(mapObj, e.target.getPosition())
        }
        function mouseout () {
          mapObj.clearInfoWindow()
        }

        function mouseover0 (e) {
          showSelfInfo()
        }

        function showSelfInfo () {
          /* 本餐厅信息 */
          infoWindow.setContent(that.createInfoWindow0('餐厅食材信息_推荐调货餐厅', that.storeList, mapObj, driving))
          infoWindow.open(mapObj, that.center)
        }
        showSelfInfo()
      })
    },
    /* 构建自定义信息窗体 */
    createInfoWindow (title, store, map, driving) {
      let that = this
      let content = store.foodList
      let info = document.createElement('div')
      info.className = 'info'

      // 定义顶部标题
      let top = document.createElement('div')
      let titleD = document.createElement('div')
      let closeX = document.createElement('img')
      top.className = 'info-top'
      titleD.innerHTML = title
      closeX.src = 'https://webapi.amap.com/images/close2.gif'
      closeX.onclick = function () {
        map.clearInfoWindow()
      }

      top.appendChild(titleD)
      top.appendChild(closeX)
      info.appendChild(top)

      // 定义中部内容
      let table = document.createElement('table')
      table.className = 'data-table'
      let thead = table.createTHead()
      thead.innerHTML = '<td>食材名称</td><td>今日本店预计结余</td><td>该店预计结余</td>'/* <td>匹配度</td> */
      let tfoot = table.createTFoot()
      for (let i = 0; i < content.length; i++) {
        let row = tfoot.insertRow(i)
        let cell1 = row.insertCell()
        cell1.innerHTML = content[i].foodName
        let cell2 = row.insertCell()
        cell2.className = content[i].selfFree < 0 ? 'red-msg' : content[i].selfFree > 0 ? 'green-msg' : ''
        cell2.innerHTML = content[i].selfFree
        let cell3 = row.insertCell()
        cell3.className = content[i].free < 0 ? 'red-msg' : content[i].free > 0 ? 'green-msg' : ''
        cell3.innerHTML = content[i].free
      }
      info.appendChild(table)

      let storeInfo1 = document.createElement('div')
      storeInfo1.className = 'store-info'
      storeInfo1.innerHTML = '餐厅名称：' + store.storeName
      info.appendChild(storeInfo1)

      let storeInfo2 = document.createElement('div')
      storeInfo2.className = 'store-info'
      storeInfo2.innerHTML = '联系电话：' + (store.tel ? store.tel + '  ' : '') + store.mobile
      info.appendChild(storeInfo2)

      let storeInfo3 = document.createElement('div')
      storeInfo3.className = 'store-info store-bottom'
      storeInfo3.innerHTML = '地址：' + (store.district ? store.district : '') + (store.locationName ? store.locationName : '')
      info.appendChild(storeInfo3)

      let storeInfo4 = document.createElement('div')
      storeInfo4.className = 'blue-other'
      let button1 = document.createElement('el-button')
      let button2 = document.createElement('el-button')
      button1.type = 'text'
      button1.className = 'blue-other-in'
      button2.type = 'text'
      button1.innerHTML = '查看线路'
      button2.innerHTML = store.disStatus >= 0 ? (store.disStatus > 1 ? '申请调货' : store.disStatus === 0 ? '取消调货' : '确认送达') : '申请调货'
      storeInfo4.appendChild(button1)
      storeInfo4.appendChild(button2)
      button1.onclick = function () {
        that.selectedPosition = [store.lng, store.lat]
        driving.search(that.center, that.selectedPosition)
      }
      button2.onclick = function () {
        that.showDisList(store)
      }
      info.appendChild(storeInfo4)

      // 定义底部内容
      let bottom = document.createElement('div')
      bottom.className = 'info-bottom'
      bottom.style.position = 'relative'
      bottom.style.top = '0px'
      bottom.style.margin = '0 auto'
      let sharp = document.createElement('img')
      sharp.src = 'https://webapi.amap.com/images/sharp.png'
      bottom.appendChild(sharp)
      info.appendChild(bottom)
      return info
    },
    /* 构建本餐厅自定义信息窗体 */
    createInfoWindow0 (title, storeList, map, driving) {
      let that = this
      let info = document.createElement('div')
      info.className = 'info0'
      // 定义顶部标题
      let top = document.createElement('div')
      let titleD = document.createElement('div')
      let closeX = document.createElement('img')
      top.className = 'info-top'
      titleD.innerHTML = title
      closeX.src = 'https://webapi.amap.com/images/close2.gif'
      closeX.onclick = function () {
        map.clearInfoWindow()
      }

      top.appendChild(titleD)
      top.appendChild(closeX)
      info.appendChild(top)

      // 定义中部内容
      let table = document.createElement('table')
      table.className = 'data-table'
      let thead = table.createTHead()
      let tfoot = table.createTFoot()
      let theadString = '<td>食材名称</td><td>今日本店预计结余</td>'
      if (storeList.length > 0) {
        let content = storeList[0].foodList
        for (let i = 0; i < content.length; i++) {
          let row = tfoot.insertRow(i)
          let cell1 = row.insertCell()
          cell1.innerHTML = content[i].foodName
          let cell2 = row.insertCell()
          cell2.className = content[i].selfFree < 0 ? 'red-msg' : content[i].selfFree > 0 ? 'green-msg' : ''
          cell2.innerHTML = content[i].selfFree
          for (let j = 0; j < storeList.length; j++) {
            if (j < 3) {
              let content1 = storeList[j].foodList
              let cellN = row.insertCell()
              cellN.className = content1[i].free < 0 ? 'red-msg' : content1[i].free > 0 ? 'green-msg' : ''
              cellN.innerHTML = content1[i].free
            }
          }
        }
        let rowD = tfoot.insertRow(content.length)
        let cellN1 = rowD.insertCell()
        cellN1.className = 'weight'
        cellN1.innerHTML = '操作'
        let cellN2 = rowD.insertCell()
        cellN2.innerHTML = ''
        for (let j = 0; j < storeList.length; j++) {
          if (j < 3) {
            let store = storeList[j]
            theadString += '<td>' + store.storeName + '</td>'
            thead.innerHTML = theadString
            let cellN = rowD.insertCell()
            cellN.className = 'bule'
            let span1 = document.createElement('span')
            let span2 = document.createElement('span')
            span1.innerHTML = '查看线路'
            span1.onclick = function () {
              that.selectedPosition = [store.lng, store.lat]
              driving.search(that.center, that.selectedPosition)
            }
            span2.innerHTML = store.disStatus >= 0 ? (store.disStatus > 1 ? '申请调货' : store.disStatus === 0 ? '取消调货' : '确认送达') : '申请调货'
            span2.style.display = 'block'
            span2.onclick = function () {
              that.showDisList(store)
            }
            cellN.appendChild(span1)
            cellN.appendChild(span2)
          }
        }
        info.appendChild(table)
      }
      let space = document.createElement('div')
      space.className = 'space'
      info.appendChild(space)
      // 定义底部内容
      let bottom = document.createElement('div')
      bottom.className = 'info-bottom'
      bottom.style.position = 'relative'
      bottom.style.top = '0px'
      bottom.style.margin = '0 auto'
      let sharp = document.createElement('img')
      sharp.src = 'https://webapi.amap.com/images/sharp.png'
      bottom.appendChild(sharp)
      info.appendChild(bottom)

      return info
    }
  }
}
</script>

<style scoped lang="less">
  .a-map{
    height: calc( 100% - 20px);
    width: calc( 100% - 2px);
    .amap-page-container{
      width: 100%;
      height: 100%;
    }
    .suggestion{
      color: #999999;
      font-size: 14px;
      margin-left: 2px;
      vertical-align: text-top;
    }
  }
</style>

<style lang="less">
  .a-map{
    .el-card__body{
      height: 100%;
    }
    .info{
      width: 400px;
    }
    .info0{
      width: 600px;
    }
    .info,.info0 {
      background: #fff;
      border: solid 1px silver;
      border-radius: 5px;
      div.info-top {
        position: relative;
        background: none repeat scroll 0 0 #F9F9F9;
        border-bottom: 1px solid #CCC;
        border-radius: 5px 5px 0 0;
      }
      div.info-top div {
        display: inline-block;
        color: #333333;
        font-size: 15px;
        font-weight: bold;
        line-height: 31px;
        padding: 0 10px;
      }
      div.info-top img {
        position: absolute;
        top: 10px;
        right: 10px;
        transition-duration: 0.25s;
      }
      div.info-top img:hover {
        box-shadow: 0px 0px 5px #000;
      }
      table.data-table {
        width: 100%;
        font-size: 14px;
        line-height: 20px;
        td{
          text-align: center;
          border-right: 1px solid #CCC;
          border-bottom: 1px solid #CCC;
          height: 30px;
          line-height: 30px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        td.red-msg{
          color: red;
        }
        td.green-msg{
          color: green;
        }
        td.bule{
          color: blue;
          cursor: pointer;
        }
        td.weight{
          font-weight: bolder;
        }
      }
      div.info-bottom {
        height: 0px;
        width: 100%;
        clear: both;
        text-align: center;
      }
      div.info-bottom img {
        position: relative;
        z-index: 104;
      }
      span {
        margin-left: 5px;
        font-size: 11px;
      }
      div.store-info{
        font-size: 14px;
        padding: 5px 5px;
      }
      div.store-bottom{
        padding-bottom: 10px;
        border-radius: 0 0 5px 5px;
      }
    }
    .amap-marker-label{
      border: 1px solid #CCC;
      height: 28px;
      padding: 0 10px;
      line-height: 30px;
      font-size: 13px;
      font-weight: bolder;
      border-radius: 14px;
    }
    .amap-marker{
      .amap-icon{
        img{
          width: 23px;
        }
      }
    }
    .el-button.is-round {
      padding: 10px 23px;
    }
    .el-card__header {
      padding: 8px 20px;
      line-height: 36px;
    }
    #panel {
      position: fixed;
      background-color: white;
      max-height: 90%;
      overflow-y: auto;
      top: 125px;
      right: 10px;
      width: 280px;
      .amap-call {
        background-color: #009cf9;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
      }
      .amap-lib-driving {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        overflow: hidden;
      }
    }
    .space{
      height: 10px;
    }
    .blue-other{
      color: blue;
      cursor: pointer;
      text-align: right;
      padding: 10px;
      font-size: 13px;
      border-top: 1px solid #CCC;
      width: calc( 100% - 20px );
      .blue-other-in{
        margin-right: 20px;
      }
    }
    .el-form-item{
      margin-bottom: 0;
    }
    .el-input__inner{
      height: 30px;
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
