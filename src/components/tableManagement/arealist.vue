<script>
export default {
  name: 'arealist',
  data () {
    return {
      areaList: []
    }
  },
  mounted () {
    this.getAreaList()
  },
  methods: {
    /* 获取区域列表 */
    getAreaList () {
      let that = this
      this.$axios.get('/api/area/arealist').then(function (res) {
        that.areaList = res.dataList
      })
    }
  }
}
</script>
