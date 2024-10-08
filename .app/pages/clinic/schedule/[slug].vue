<script setup lang="ts">
definePageMeta({
  title: 'روزهای هفته',
  preview: [
    {
      title: 'Member details',
      description: 'For viewing Maya\'s details',
      categories: ['layouts', 'lists', 'details'],
      src: '/img/screens/layouts-members-maya-rosselini.png',
      srcDark: '/img/screens/layouts-members-maya-rosselini-dark.png',
      order: 37,
      params: {
        slug: 'maya-rosselini',
      },
      new: true,
    },
    {
      title: 'Member details',
      description: 'For viewing John\'s details',
      categories: ['layouts', 'lists', 'details'],
      src: '/img/screens/layouts-members-john-baxter.png',
      srcDark: '/img/screens/layouts-members-john-baxter-dark.png',
      order: 37,
      params: {
        slug: 'john-baxter',
      },
      new: true,
    },
  ],
  layout: 'sidebar',
})

const { open } = usePanels()
const route = useRoute()
const slug = computed(() => route.params.slug)

const query = computed(() => {
  return {
    slug: slug.value,
  }
})

const { data, pending, error, refresh } = await useFetch('/api/members', {
  query,
})

if (!data.value?.member) {
  await navigateTo('/layouts/members/kendra-wilson')
}
const showTimeModal = ref(false)
const isLoading = ref(false)
const startHour = ref(8)
const addNewTime = async () => {

}
</script>

<template>
  <div>
    <BaseCard rounded="md">
      <div
        class="border-muted-200 dark:border-muted-800 flex gap-4 border-b p-6 sm:p-10"
      >
        <BaseAvatar
          :src="data?.member?.picture"
          :alt="data?.member?.name"
          size="lg"
          rounded="none"
          mask="blob"
        />
        <div class="grow">
          <BaseHeading
            weight="medium"
            size="xl"
            lead="none"
            class="line-clamp-1"
          >
            {{ data?.member?.name }}
          </BaseHeading>
          <BaseParagraph size="sm" class="text-muted-400 mb-2 line-clamp-1">
            {{ data?.member?.email }}
          </BaseParagraph>
          <BaseTag
            rounded="lg"
            variant="pastel"
            color="primary"
          >
            {{ data?.member?.role?.label }}
          </BaseTag>
        </div>
        <div>
          <BaseButton
            rounded="full"
            color="default"
            size="sm"
            @click="showTimeModal = true"
          >
            <Icon name="lucide:plus" class="ml-2 size-4" />
            <span>افزودن زمان به برنامه این روز</span>
          </BaseButton>
        </div>
      </div>

      <div class="p-6 sm:p-10">
        <div class="space-y-6">
          <div
            v-for="role in data?.member?.role?.details"
            :key="role.label"
            class="border-muted-200 dark:border-muted-800 grid grid-cols-12 border-b pb-6"
          >
            <div class="xs:mb-6 col-span-12 sm:col-span-4">
              <BaseParagraph size="sm" class="text-muted-500">
                {{ role.label }}
              </BaseParagraph>
              <BaseHeading
                size="md"
                weight="medium"
                class="text-muted-800 dark:text-muted-100"
              >
                {{ role.access }}
              </BaseHeading>
            </div>
            <div class="col-span-12 sm:col-span-8">
              <ul class="list-disc space-y-1">
                <li
                  v-for="permission in role.permissions"
                  :key="permission.label"
                  class="flex gap-2"
                >
                  <Icon
                    v-if="permission.status"
                    name="lucide:check"
                    class="text-success-500 relative top-1 size-4 shrink-0"
                  />
                  <Icon
                    v-else
                    name="lucide:x"
                    class="text-danger-500 relative top-1 size-4 shrink-0"
                  />
                  <BaseParagraph size="sm" class="text-muted-400">
                    {{
                      permission.label
                    }}
                  </BaseParagraph>
                </li>
              </ul>
            </div>
          </div>
          <div class="grid grid-cols-12 pb-6">
            <div class="col-span-12 sm:col-span-4">
              <BaseParagraph size="sm" class="text-muted-500">
                Cards
              </BaseParagraph>
              <BaseHeading
                size="md"
                weight="medium"
                class="text-muted-800 dark:text-muted-100"
              >
                {{ data?.member?.cards?.length ?? 0 }} card{{
                  data?.member?.cards?.length && data.member.cards.length > 1
                    ? 's'
                    : ''
                }}
              </BaseHeading>
            </div>
            <div class="col-span-12 sm:col-span-8">
              <table class="w-full whitespace-nowrap">
                <tbody>
                  <tr
                    v-for="card in data?.member?.cards"
                    :key="card.id"
                    tabindex="0"
                  >
                    <td class="p-4">
                      <div
                        class="text-muted-500 dark:text-muted-300 me-5 flex items-center gap-2 md:me-0"
                      >
                        <Icon name="lucide:credit-card" class="size-5" />
                        <BaseText
                          size="sm"
                          weight="medium"
                          lead="none"
                        >
                          {{ card.cardInfo.number }}
                        </BaseText>
                        <span
                          class="bg-muted-100 dark:bg-muted-600/10 text-muted-500 m-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-sans text-xs"
                        >
                          <span
                            class="size-2 rounded-full"
                            :class="[
                              card.cardInfo.status === 'active' &&
                                'bg-success-500',
                              card.cardInfo.status === 'disabled' &&
                                'bg-muted-300 dark:bg-muted-700',
                              card.cardInfo.status === 'expired' &&
                                'bg-warning-500',
                              card.cardInfo.status === 'locked' &&
                                'bg-danger-500',
                            ]"
                          />
                          <span>{{ card.cardInfo.status }}</span>
                        </span>
                      </div>
                    </td>
                    <td class="xs:hidden p-4">
                      <BaseButton
                        to="/layouts/cards"
                        rounded="md"
                        size="sm"
                      >
                        View
                      </BaseButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
  <TairoModal
    :open="showTimeModal"
    size="md"
    @close="showTimeModal = false"
  >
    <template #header>
      <!-- Header -->
      <div class="flex w-full items-center justify-between p-4 md:p-6">
        <h3
          class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white"
        >
          افزودن برنامه به روز {{ data?.member?.name }}
        </h3>

        <BaseButtonClose @click="showTimeModal = false" />
      </div>
    </template>

    <!-- Body -->
    <div class="p-4 md:p-6">
      <div class="mx-auto w-full text-center">
        <Icon
          name="ph:calendar-plus"
          class="mb-5 block size-[75px] text-yellow-500"
        />

        <h3
          class="font-heading text-muted-800 text-lg font-medium leading-6 dark:text-white"
        >
          لطفا توجه کنید
        </h3>

        <p
          class="font-alt text-muted-500 dark:text-muted-400 mt-2 text-justify text-sm leading-5"
        >
          برنامه زمانی برای این روز یعنی {{ data?.member?.name }} تنظیم خواهد شد و نوبت ها مبتنی بر این برنامه چیده می شوند. شما باید ساعت شروع، تعداد جلسات و فاصله گپ استراحت زمانی بین هر جلسه را تعیین نمایید. می توانید یک برنامه برای کل روز، یا چندین برنامه برای بخش های مختلف روز تعیین نمایید.
        </p>
        <div class="col-span-12">
          <BaseInput
            v-model="startHour"
            label="ساعت شروع"
            placeholder="به فرمت ۲۴ ساعت"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <!-- Footer -->
      <div class="p-4 md:p-6">
        <div class="flex gap-x-2">
          <BaseButton @click="showTimeModal = false">
            بازگشت
          </BaseButton>

          <BaseButton
            color="warning"
            variant="solid"
            :loading="isLoading"
            @click="addNewTime"
          >
            تایید و حذف
          </BaseButton>
        </div>
      </div>
    </template>
  </TairoModal>
</template>
