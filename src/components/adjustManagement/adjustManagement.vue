<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span class="card_title">调货管理</span>
      </div>
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="我申请的调货" name="first">
          <myAdjust></myAdjust>
        </el-tab-pane>
        <el-tab-pane label="我收到的调货申请" name="second">
          <accept></accept>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import myAdjust from '@/components/adjustManagement/myAdjust'
import accept from '@/components/adjustManagement/acceptAdjust'
export default {
  name: 'adjustManagement',
  components: {myAdjust, accept},
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
