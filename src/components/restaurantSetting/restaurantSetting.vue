<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">餐厅设置</span>
      </div>
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="KDS设置" name="first">
          <kds></kds>
        </el-tab-pane>
        <el-tab-pane label="餐厅基础信息设置" name="second">
          <store></store>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import kds from '@/components/restaurantSetting/kdsSetting'
import store from '@/components/restaurantSetting/storeSetting'
export default {
  name: 'restaurantSetting',
  components: {kds, store},
  data () {
    return {
      activeName: 'first'
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style scoped lang="less">

</style>
