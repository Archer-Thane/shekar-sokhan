<script setup lang="ts">
definePageMeta({
  preview: {
    title: 'تنظیم زمان ها',
    description: 'انتخاب برنامه برای اعمال زمانبندی',
    categories: ['layouts', 'wizards', 'forms'],
    src: '/img/screens/layouts-invite-review.png',
    srcDark: '/img/screens/layouts-invite-review-dark.png',
    order: 37,
    new: true,

  },
  layout: 'sidebar',
})

const route = useRoute()
const router = useRouter()
const page = computed(() => parseInt((route.query.page as string) ?? '1'))

const filter = ref('')
const perPage = ref(45)
const { open } = usePanels()

watch([filter, perPage], () => {
  router.push({
    query: {
      page: undefined,
    },
  })
})
useHead({ htmlAttrs: { dir: 'rtl' } })

const query = computed(() => {
  return {
    filter: filter.value,
    perPage: perPage.value,
    page: page.value,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/members', {
  query,
})

const currentMember = ref()
</script>

<template>
  <!--Wrapper-->
  <div class="w-full pb-24">
    <!--Header-->
    <div class="flex items-center justify-end py-6">
      <!--Buttons-->
      <div class="hidden items-center gap-2 md:flex">
        <!-- <BaseButton
          rounded="full"
          color="default"
          size="sm"
        >
          <Icon name="lucide:edit-3" class="ml-2 size-4" />
          <span>ویرایش روز</span>
        </BaseButton> -->
      </div>
    </div>
    <div class="grid grid-cols-12 gap-6">
      <!--Navigation-->
      <div class="ltablet:col-span-5 col-span-12 lg:col-span-5">
        <ul
          class="ltablet:flex-col ptablet:overflow-x-auto ltablet:overflow-x-hidden flex gap-1 overflow-x-auto lg:flex-col lg:overflow-x-hidden"
        >
          <li
            v-for="member in data?.data"
            :key="member.id"
            role="button"
            tabindex="0"
            @click="currentMember = member"
          >
            <NuxtLink
              :to="`/clinic/schedule/${member.slug}`"
              class="hover:bg-muted-200 dark:hover:bg-muted-800/60 flex items-center gap-2 rounded-xl p-4"
              active-class="bg-muted-200 dark:bg-muted-800/60"
            >
              <BaseAvatar
                :src="member.picture"
                :alt="member.name"
                size="sm"
              />
              <div>
                <BaseHeading
                  weight="medium"
                  size="md"
                  lead="tight"
                  class="line-clamp-1"
                >
                  {{ member.name }}
                </BaseHeading>
                <BaseParagraph size="xs" class="text-muted-400 line-clamp-1">
                  {{ member.email }}
                </BaseParagraph>
              </div>
              <div class="ms-auto hidden sm:block">
                <BaseTag rounded="lg">
                  {{ member.role.label }}
                </BaseTag>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
      <!--Slug content-->
      <div class="ltablet:col-span-7 col-span-12 lg:col-span-7">
        <NuxtPage v-if="currentMember !== undefined" />
        <BaseCard
          v-else
          rounded="md"
        >
          <div class="p-6">
            <div class="py-10 text-center">
              <BaseHeading
                weight="medium"
                size="xl"
                lead="none"
                class="mb-1"
              >
                این جا برنامه زمانی روز نمایش داده می شود
              </BaseHeading>
              <BaseParagraph
                size="sm"
                class="text-muted-400 mx-auto mt-2 max-w-xs"
                style="line-height: 2em;"
              >
                لازم است تا یکی از روز های هفته را از سمت راست در رایانه های شخصی و بالا در گوشی های همراه انتخاب نمایید. با انتخاب روز، برنامه ی زمانی شما نمایش  داده می شود. برای افزودن زمان های جدید به برنامه از دکمه ی «افزودن» در بالا استفاده نمایید.
              </BaseParagraph>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </div>
</template>
