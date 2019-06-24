<script>
export default {
  name: 'menus',
  data () {
    return {
      menus: []
    }
  },
  mounted () {
    this.getMenus()
  },
  methods: {
    getMenus () {
      let that = this
      this.$axios.get('/api/user/getUserMenus').then(function (res) {
        that.menus = res.dataList
      })
    }
  }
}
</script>
