/**
 * Created by Administrator on 2017/9/12.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import main from './main/main'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    isLoading: false
  },
  actions: {},
  mutations: {
  },
  modules: {
      main
  }
})
