import Vue from 'vue'
import Router from 'vue-router'
const Home = resolve => require(['./routers/home/Home'], resolve);
const My = resolve => require(['./routers/my/My.vue'], resolve);
const DeviceSet = resolve => require(['./routers/deviceSet/DeviceSet.vue'], resolve);
const Dynamic = resolve => require(['./routers/dynamic/Dynamic.vue'], resolve);
const DynamicRecord = resolve => require(['./routers/dynamicRecord/DynamicRecord.vue'], resolve);
const DynamicInfo = resolve => require(['./routers/dynamicInfo/DynamicInfo.vue'], resolve);
const StepSettings = resolve => require(['./routers/deviceSet/StepSettings.vue'], resolve);
const RelationDevice = resolve => require(['./routers/deviceSet/relationDevice/RelationDevice.vue'], resolve);
const DeviceInfo = resolve => require(['./routers/deviceSet/DeviceInfo.vue'], resolve);
const HealthHistory = resolve => require(['./routers/healthHistory/HealthHistory.vue'],resolve);
const HeartRate = resolve => require(['./routers/deviceSet/HeartRate.vue'],resolve);
const TempDiff = resolve => require(['./routers/deviceSet/TempDiff.vue'],resolve);
const Male = resolve => require(['./routers/deviceSet/male/Male.vue'],resolve);
const Female = resolve => require(['./routers/deviceSet/female/Female.vue'],resolve);
const FemaleDetile = resolve => require(['./routers/deviceSet/female/FemaleDetile.vue'],resolve);
const FemaleSet = resolve => require(['./routers/deviceSet/female/FemaleSet.vue'],resolve);
const Clock = resolve => require(['./routers/clock/Clock.vue'],resolve);
const AddClock = resolve => require(['./routers/clock/AddClock.vue'],resolve);
const Sedentary = resolve => require(['./routers/sedentary/Sedentary.vue'],resolve);
const Test = resolve => require(['./routers/test/Test.vue'],resolve);

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/Test',
      name: 'Test',
      component: Test,
    },
    {
      path: '/HealthHistory',
      name: 'HealthHistory',
      component: HealthHistory,
    },
    {
      path: '/Dynamic',
      name: 'Dynamic',
      component: Dynamic,
    },
    {
      path: '/DynamicRecord',
      name: 'DynamicRecord',
      component: DynamicRecord,
    },
    {
      path: '/DynamicInfo/:id',
      name: 'DynamicInfo',
      component: DynamicInfo,
    },
    {
      path: '/My',
      name: 'My',
      component: My,
    },
    {
      path: '/DeviceSet',
      name: 'DeviceSet',
      component: DeviceSet,
    },
    {
      path: '/DeviceSet/DeviceInfo',
      name: 'DeviceInfo',
      component: DeviceInfo,
    },
    {
      path: '/DeviceSet/StepSettings',
      name: 'StepSettings',
      component: StepSettings
    },
    {
      path: '/DeviceSet/RelationDevice',
      name: 'RelationDevice',
      component: RelationDevice
    },
    {
      path: '/DeviceSet/HeartRate',
      name: 'HeartRate',
      component: HeartRate
    },
    {
      path: '/DeviceSet/TempDiff',
      name: 'TempDiff',
      component: TempDiff
    },
    {
      path: '/Male',
      name: 'Male',
      component: Male
    },
    {
      path: '/Female',
      name: 'Female',
      component: Female
    },
    {
      path: '/FemaleDetile',
      name: 'FemaleDetile',
      component: FemaleDetile
    },
    {
      path: '/FemaleSet',
      name: 'FemaleSet',
      component: FemaleSet
    },
    {
      path: '/Clock',
      name: 'Clock',
      component: Clock
    },
    {
      path: '/AddClock/:itemIndex',
      name: 'AddClock',
      component: AddClock
    },
    {
      path: '/Sedentary',
      name: 'Sedentary',
      component: Sedentary
    },
  ]
})
