<template>
  <div class="left">
    <el-menu
      :default-active="this.$route.path"
      class="el-menu-vertical-demo"
      @select="handleSelect"
      router
      unique-opened>
      <span v-for="(item,i) in menus" :key="i">
        <el-submenu :index="item.path" v-if="item.child && item.child.length>0">
          <template slot="title">
            <!--<i class="el-icon-location"></i>-->
            <img :src="item.path === $route.matched[0].path?Const.IMAGE_PATH + item.iconActive:Const.IMAGE_PATH + item.icon" class="menu-icon"/>
            <span>{{item.name}}</span>
          </template>
          <el-menu-item-group v-if="item.child">
            <el-menu-item v-for="(child,id) in item.child" :key="id" :index="child.path" ref="menus">{{child.name}}</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
        <el-menu-item :index="item.path" v-else ref="menus">
          <!--<i class="el-icon-menu"></i>-->
          <img :src="item.path === $route.fullPath?Const.IMAGE_PATH + item.iconActive:Const.IMAGE_PATH + item.icon" class="menu-icon"/>
          <span slot="title">{{item.name}}</span>
        </el-menu-item>
      </span>
    </el-menu>
  </div>
</template>

<script>
import menus from './menus'
export default {
  name: 'homeLeft',
  mixins: [menus],
  mounted: function () {
  },
  data () {
    return {

    }
  },
  methods: {
    handleSelect (index, indexPath) {
      let menuList = this.$refs.menus
      let iconName = ''
      this.clearActive(menuList)
      for (let i = 0; i < this.menus.length; i++) {
        if (this.menus[i].path === index) {
          iconName = this.menus[i].iconActive
          break
        }
        if (this.menus[i].child.length > 0) {
          let child = this.menus[i].child
          for (let j = 0; j < child.length; j++) {
            if (child[j].path === index) {
              iconName = this.menus[i].iconActive
              break
            }
          }
        }
      }
      for (let i = 0; i < menuList.length; i++) {
        if (menuList[i].index === index) {
          if (menuList[i].$el.children[0]) {
            menuList[i].$el.children[0].src = this.Const.IMAGE_PATH + iconName
          } else {
            menuList[i].$parent.$parent.$el.children[0].children[0].src = this.Const.IMAGE_PATH + iconName
          }
        }
      }
    },
    clearActive (menuList) {
      for (let j = 0; j < this.menus.length; j++) {
        for (let i = 0; i < menuList.length; i++) {
          if (menuList[i].index === this.menus[j].path) {
            menuList[i].$el.children[0].src = this.Const.IMAGE_PATH + this.menus[j].icon
            break
          }
          if (this.menus[j].child.length > 0) {
            let child = this.menus[j].child
            for (let a = 0; a < child.length; a++) {
              if (child[a].path === menuList[i].index) {
                menuList[i].$parent.$parent.$el.children[0].children[0].src = this.Const.IMAGE_PATH + this.menus[j].icon
                break
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
  .left{
    width: 200px;
    height: calc( 100% - 50px );
    overflow-y: auto;
    position: fixed;
    top: 50px;
    left: 0;
    background: #404040;
  }
</style>

<style lang="less">
  .left{
    ul{
      height: 100%;
    }
    .el-menu {
      border-right: none;
      background: rgba(0,0,0,0);
    }
    .el-menu-item,.el-submenu__title{
      color: #fff;
    }
    .el-menu-item.is-active {
      color: #fff;
      background: #333;
    }
    .el-menu-item:hover,.el-submenu__title:hover{
      background: #607B8B;
    }
    img{
      margin-right: 10px;
    }
    .menu-icon{
      width: 18px;
    }
}
</style>
