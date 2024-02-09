import 'nuxt'
import PocketBase from 'pocketbase'

declare module '#app' {
  interface NuxtApp {
    $pb: PocketBase
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $pb: PocketBase
  }
}
