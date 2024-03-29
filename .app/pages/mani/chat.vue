<script setup lang="ts">
import { BackendMessage } from '~/composables/message'

definePageMeta({
  title: 'پیام ها',
  layout: 'empty',
  preview: {
    title: 'ذهنا',
    description: 'سامانه همدلی هوشمند',
    categories: ['dashboards'],
    src: '/img/screens/dashboards-messaging.png',
    srcDark: '/img/screens/dashboards-messaging-dark.png',
    order: 26,
  },
})

useHead({ htmlAttrs: { dir: 'rtl' } })

const PATIENT_AGENT = 'ZohrehPatient'

const { user } = useUser()
const { open } = usePanels()
const seamless = useSeamless()

const { translated, translate } = seamless
const { getMessages, saveMessage } = useMessage()

const search = ref('')
const message = ref('')
const messageLoading = ref(false)
const chatEl = ref<HTMLElement>()
const expanded = ref(false)
const loading = ref(true)
const conversation = ref({
  user: {
    name: 'مانی، مشاور بحران',
    photo: '/img/avatars/1.svg',
    role: 'ایجنت هوش مصنوعی',
    bio: 'مانی، مشاور بحران توانایی همدلی، و انجام مداخلات بحران و بالاخص خودکشی را دارست.',
    age: '12500ms-17000ms',
    location: 'ایران',
  },
  messages: [
    {
      role: 'separator',
      translatedFa: 'شروع گفت و گو',
      content: 'Conversation Started',
    },
    {
      role: 'assistant',
      translatedFa:
        'سلام. من مانی هستم 👋، و این جا هستم که به شما کمک کنم. توجه داشته باشید که تمام پیام هایی که رد و بدل می کنیم محرمانه، و بر طبق قوانین و مقررات در سایت هستن که در ابتدای ورودتون داخل نرم افزار، اون ها رو پذیرفته اید.',
      content: "Hi. I'm Mani. How can I help you?",
      time: new Date().toLocaleTimeString('fa'),
    },
  ] as BackendMessage[],
})

const sleep = (time: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, time))
}
const nuxtApp = useNuxtApp()
const toaster = useToaster()
const signout = () => {
  nuxtApp.$pb.authStore.clear()
  toaster.show({
    title: 'خروج از سیستم', // Authentication
    message: `خروج موفقیت آمیز بود`, // Please log in again
    color: 'success',
    icon: 'ph:check',
    closable: true,
  })
  navigateTo('/auth/login')
}

onMounted(async () => {
  const msg = await getMessages()
  msg.map((m) => (m.time = new Date(m.created ?? '').toLocaleTimeString('fa')))
  conversation.value.messages.push(...msg)
  loading.value = false
  // await autoConversation()
  await sleep(2000)
  setTimeout(() => {
    if (chatEl.value) {
      chatEl.value.scrollTo({
        top: chatEl.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, 300)
})

// async function autoConversation() {
//   const lastContent = conversation.value.messages.at(-1)?.content as string
//   const m = await ask(PATIENT_AGENT, lastContent as string)
//   const t = await translate(m, 'English', 'Western Persian')
//   const newMessage: BackendMessage = {
//     role: 'user',
//     translatedFa: t,
//     content: m,
//     time: new Date().toLocaleTimeString('fa'),
//   }
//   conversation.value.messages.push(newMessage)
//   // const userEval = await ask('SummaryJsonizer', translated.value)
//   await saveMessage({
//     content: m as string,
//     translatedFa: t,
//     anonymousUser: user.value.record.id,
//     role: 'user',
//     // evaluations: JSON.parse(userEval),
//     evaluations: {},
//   })
//   const answer = await ask('Mani', m)
//   // const AIEval = await ask('SummaryJsonizer', translated.value)
//   const t2 = await translate(answer, 'English', 'Western Persian')
//   await saveMessage({
//     content: answer,
//     translatedFa: t2 as string,
//     anonymousUser: user.value.record.id,
//     role: 'assistant',
//     time: new Date().toLocaleTimeString('fa'),
//     evaluations: {},
//   })
//   conversation.value.messages.push({
//     role: 'assistant',
//     translatedFa: t2,
//     content: answer,
//     created: new Date().toLocaleTimeString('fa'),
//   })
//   await autoConversation()
// }
async function translateAndAssemble(answer: string) {
  const chunks = answer.split('\n').filter((chunk) => chunk.trim().length > 0)
  const translatePromises = chunks.map((chunk, index) => {
    return translate(chunk, 'English', 'Western Persian').then(
      (translatedChunk) => ({
        index,
        translatedChunk,
      }),
    )
  })

  const translatedChunksWithIndex = await Promise.all(translatePromises)
  translatedChunksWithIndex.sort((a, b) => a.index - b.index)
  const translatedAnswer = translatedChunksWithIndex
    .map((item) => item.translatedChunk)
    .join('\n')

  return translatedAnswer
}
async function submitMessage() {
  if (!message.value) return
  if (messageLoading.value) return
  messageLoading.value = true
  const m = message.value
  message.value = ''
  const newMessage: BackendMessage = {
    role: 'user',
    translatedFa: m,
    content: '',
    time: new Date().toLocaleTimeString('fa'),
  }
  conversation.value.messages.push(newMessage)
  setTimeout(() => {
    if (chatEl.value) {
      chatEl.value.scrollTo({
        top: chatEl.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, 30)
  const t = await translate(m, 'Western Persian', 'English')
  conversation.value.messages[conversation.value.messages.length - 1].content =
    t as string
  const userEval = await $fetch('/api/llm', {
    method: 'POST',
    body: {
      llmMessages: [
        {
          content:
            'You are A senior psychotherapist. you accept a message from a psychotherapy conversation, then analyze the information, compact it in a json format. you include useful information, not including the summary itself. It is possible that the whole input to you has no value, if so, use this json {result : ""} to respond. YOU ONLY RETURN JSON. Emphasize on psychological information, which are useful for therapy.',
          role: 'system',
        },
        { content: translated.value, role: 'user' },
      ],
    },
  })

  await saveMessage({
    content: t as string,
    translatedFa: m,
    anonymousUser: user.value.record.id,
    role: 'user',
    evaluations: JSON.parse(userEval),
  })
  const answer = await $fetch('/api/llm', {
    method: 'POST',
    body: {
      llmMessages: [
        {
          content:
            'You are using proper counselling techniques such as Active listening and responsiveness, Questioning, Trustworthiness and Empathy to help patients. You are a human Named Mani Rastegar. You are a licensed therapist, and your approach is counselling, and ACT techniques. You have a humanistic approach. You use Counselling techniques such as reframing, reflection, empathy and using proper open ended questions. use informal tone and use simple terms and sentences. avoid using metaphors and amphibology.  be kind, friendly and compassionate.',
          role: 'system',
        },
        { content: translated.value, role: 'user' },
      ],
    },
  })
  const t2 = await translateAndAssemble(answer)
  await saveMessage({
    content: answer,
    translatedFa: t2,
    anonymousUser: user.value.record.id,
    role: 'assistant',
    time: new Date().toLocaleTimeString('fa'),
    evaluations: {},
  })
  messageLoading.value = false
  conversation.value.messages.push({
    role: 'assistant',
    translatedFa: t2,
    content: answer,
    time: new Date().toLocaleTimeString('fa'),
  })

  await nextTick()

  if (chatEl.value) {
    chatEl.value.scrollTo({
      top: chatEl.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}
</script>

<template>
  <div class="relative">
    <div class="bg-muted-100 dark:bg-muted-900 flex min-h-screen">
      <!-- Sidebar -->
      <div
        class="border-muted-200 dark:border-muted-700 dark:bg-muted-800 relative z-10 hidden h-screen w-20 border-r bg-white sm:block"
      >
        <div class="flex h-full flex-col justify-between">
          <div class="flex flex-col">
            <div
              class="ltablet:w-full flex h-16 w-16 shrink-0 items-center justify-center lg:w-full"
            >
              <NuxtLink to="#" class="flex items-center justify-center">
                <TairoLogo class="text-primary-600 h-10" />
              </NuxtLink>
            </div>
            <div
              class="ltablet:w-full flex h-16 w-16 shrink-0 items-center justify-center lg:w-full"
            >
              <a
                href="#"
                class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
                title="Back"
                @click.prevent="navigateTo('/choose')"
              >
                <Icon name="lucide:arrow-right" class="h-5 w-5" />
              </a>
            </div>
          </div>
          <div class="flex flex-col">
            <div class="flex h-16 w-full items-center justify-center">
              <button
                role="button"
                class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
                title="جست و جو"
                @click="open('search')"
              >
                <Icon name="ph:magnifying-glass-duotone" class="h-5 w-5" />
              </button>
            </div>
            <div class="flex h-16 w-full items-center justify-center">
              <NuxtLink
                to="#"
                class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
                title="Settings"
              >
                <Icon name="ph:gear-six-duotone" class="h-5 w-5" />
              </NuxtLink>
            </div>
            <div class="flex h-16 w-full items-center justify-center">
              <NuxtLink
                to=""
                class="text-muted-400 hover:text-primary-500 hover:bg-primary-500/20 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300"
                title="Settings"
                @click="signout"
              >
                <Icon name="ph:sign-out" class="h-5 w-5" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div
        class="relative w-full transition-all duration-300"
        :class="
          expanded
            ? 'ltablet:max-w-[calc(100%_-_160px)] lg:max-w-[calc(100%_-_160px)]'
            : 'ltablet:max-w-[calc(100%_-_470px)] lg:max-w-[calc(100%_-_550px)]'
        "
      >
        <div class="flex w-full flex-col">
          <!-- Header -->
          <div
            class="flex h-16 w-full items-center justify-between px-4 sm:px-8"
          >
            <div class="flex items-center gap-2">
              <BaseInput
                v-model="search"
                shape="curved"
                icon="lucide:search"
                placeholder="جست و جو"
              />
            </div>

            <TairoSidebarTools
              class="relative -end-4 z-20 flex h-16 w-full scale-90 items-center justify-end gap-2 sm:end-0 sm:scale-100"
            />
          </div>
          <!-- Body -->
          <div
            ref="chatEl"
            class="relative h-[calc(100vh_-_128px)] w-full p-4 sm:p-8"
            :class="loading ? 'overflow-hidden' : 'overflow-y-auto slimscroll'"
          >
            <!-- Loader-->
            <div
              class="bg-muted-100 dark:bg-muted-900 pointer-events-none absolute inset-0 z-10 h-full w-full p-8 transition-opacity duration-300"
              :class="loading ? 'opacity-100' : 'opacity-0 pointer-events-none'"
            >
              <div class="mt-12 space-y-12">
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[14rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[8rem] rounded" />
                  </div>
                </div>
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[16rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[12rem] rounded" />
                  </div>
                </div>
                <div
                  class="ms-auto flex w-full max-w-md flex-row-reverse justify-end gap-4"
                >
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[16rem] rounded"
                    />
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[12rem] rounded"
                    />
                  </div>
                </div>
                <div
                  class="ms-auto flex w-full max-w-md flex-row-reverse justify-end gap-4"
                >
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[14rem] rounded"
                    />
                    <BasePlaceload
                      class="ms-auto h-3 w-full max-w-[8rem] rounded"
                    />
                  </div>
                </div>
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[14rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[8rem] rounded" />
                  </div>
                </div>
                <div class="flex w-full max-w-md gap-4">
                  <BasePlaceload
                    class="h-8 w-8 shrink-0 rounded-full"
                    :width="32"
                    :height="32"
                  />
                  <div class="grow space-y-2">
                    <BasePlaceload class="h-3 w-full max-w-[16rem] rounded" />
                    <BasePlaceload class="h-3 w-full max-w-[12rem] rounded" />
                  </div>
                </div>
              </div>
            </div>
            <!-- Messages loop -->
            <div v-if="!loading" class="space-y-12">
              <div
                v-for="(item, index) in conversation?.messages"
                :key="index"
                class="relative flex w-full gap-4"
                :class="[
                  item.role === 'assistant' ? 'flex-row' : 'flex-row-reverse',
                  item.role === 'separator' ? 'justify-center' : '',
                ]"
              >
                <template v-if="item.role !== 'separator'">
                  <div class="shrink-0">
                    <BaseAvatar
                      v-if="item.role === 'assistant'"
                      :src="conversation?.user.photo"
                      size="xs"
                    />
                    <BaseAvatar
                      v-else-if="item.role === 'user'"
                      src="/img/avatars/3.svg"
                      size="xs"
                    />
                  </div>
                  <div class="flex max-w-md flex-col">
                    <div
                      class="bg-muted-200 dark:bg-muted-800 rounded-xl p-4"
                      :class="[
                        item.role === 'assistant' ? 'rounded-ss-none' : '',
                        item.role === 'user' ? 'rounded-se-none' : '',
                      ]"
                    >
                      <p class="font-sans text-sm">{{ item.translatedFa }}</p>
                    </div>
                    <div
                      class="text-muted-400 mt-1 font-sans text-xs"
                      :class="item.role === 'assistant' ? 'text-right' : ''"
                    >
                      {{ item.time }}
                    </div>
                    <!-- <div
                      v-if="item.attachments.length > 0"
                      class="mt-2 space-y-2"
                    >
                      <template
                        v-for="(attachment, idx) in item.attachments"
                        :key="idx"
                      >
                        <div
                          v-if="attachment.role === 'image'"
                          class="dark:bg-muted-800 max-w-xs rounded-2xl bg-white p-2"
                          :class="item.role === 'user' ? 'ms-auto' : ''"
                        >
                          <img
                            :src="attachment.image"
                            :alt="attachment.text"
                            class="rounded-xl"
                          />
                        </div>
                        <NuxtLink
                          :to="attachment.url"
                          v-else-if="attachment.role === 'link'"
                          class="dark:bg-muted-800 block max-w-xs rounded-2xl bg-white p-2"
                          :class="item.role === 'user' ? 'ms-auto' : ''"
                        >
                          <img
                            :src="attachment.image"
                            :alt="attachment.text"
                            class="rounded-xl"
                          />
                          <div class="px-1 py-2">
                            <p
                              class="text-muted-800 dark:text-muted-100 font-sans"
                            >
                              {{ attachment.url?.replace(/(^\w+:|^)\/\//, '') }}
                            </p>
                            <p class="text-muted-400 font-sans text-xs">
                              {{ attachment.text }}
                            </p>
                          </div>
                        </NuxtLink>
                      </template>
                    </div> -->
                  </div>
                </template>
                <div v-else>
                  <div
                    class="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    <div
                      class="border-muted-300/50 dark:border-muted-800 w-full border-t"
                    ></div>
                  </div>
                  <div class="relative flex justify-center">
                    <span
                      class="bg-muted-100 dark:bg-muted-900 text-muted-400 px-3 font-sans text-xs uppercase"
                    >
                      {{ item.translatedFa }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Compose -->
          <form
            @submit.prevent="submitMessage"
            class="bg-muted-100 dark:bg-muted-900 flex h-16 w-full items-center px-4 sm:px-8"
          >
            <div class="relative w-full">
              <BaseInput
                v-model.trim="message"
                :loading="messageLoading"
                :disabled="messageLoading"
                shape="full"
                :classes="{
                  input: 'h-12 ps-6 pe-24',
                }"
                placeholder="متن را بنویسید ..."
              />
              <div class="absolute end-2 top-0 flex h-12 items-center gap-1">
                <button
                  role="button"
                  class="text-muted-400 hover:text-primary-500 flex h-12 w-10 items-center justify-center transition-colors duration-300"
                >
                  <Icon name="lucide:smile" class="h-5 w-5" />
                </button>
                <button
                  role="button"
                  class="text-muted-400 hover:text-primary-500 flex h-12 w-10 items-center justify-center transition-colors duration-300"
                >
                  <Icon name="lucide:paperclip" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <!-- Current user -->
      <div
        class="ltablet:w-[310px] dark:bg-muted-800 fixed end-0 top-0 z-20 h-full w-[390px] bg-white transition-transform duration-300"
        :class="expanded ? 'translate-x-full' : 'translate-x-0'"
      >
        <div class="flex h-16 w-full items-center justify-between px-8"></div>
        <div class="relative flex w-full flex-col px-8">
          <!-- Loader -->
          <div v-if="loading" class="mt-8">
            <div class="mb-3 flex items-center justify-center">
              <BasePlaceload
                class="h-24 w-24 shrink-0 rounded-full"
                :width="96"
                :height="96"
              />
            </div>
            <div class="flex flex-col items-center">
              <BasePlaceload class="mb-2 h-3 w-full max-w-[10rem] rounded" />
              <BasePlaceload class="mb-2 h-3 w-full max-w-[6rem] rounded" />
              <div class="my-4 flex w-full flex-col items-center">
                <BasePlaceload class="mb-2 h-2 w-full max-w-[15rem] rounded" />
                <BasePlaceload class="mb-2 h-2 w-full max-w-[13rem] rounded" />
              </div>
              <div class="mb-6 flex w-full items-center justify-center">
                <div class="px-4">
                  <BasePlaceload class="h-3 w-[3.5rem] rounded" />
                </div>
                <div class="px-4">
                  <BasePlaceload class="h-3 w-[3.5rem] rounded" />
                </div>
              </div>
              <div class="w-full">
                <BasePlaceload class="h-10 w-full rounded-xl" />
                <BasePlaceload class="mx-auto mt-3 h-3 w-[7.5rem] rounded" />
              </div>
            </div>
          </div>
          <!-- User details -->
          <div v-else class="mt-8">
            <div class="flex items-center justify-center">
              <BaseAvatar :src="conversation?.user.photo" size="2xl" />
            </div>
            <div class="text-center">
              <BaseHeading tag="h3" size="lg" class="mt-4">
                <span>{{ conversation?.user.name }}</span>
              </BaseHeading>
              <BaseParagraph size="sm" class="text-muted-400">
                <span>{{ conversation?.user.role }}</span>
              </BaseParagraph>
              <div class="my-4">
                <BaseParagraph
                  size="sm"
                  class="text-muted-500 dark:text-muted-400"
                >
                  <span>{{ conversation?.user.bio }}</span>
                </BaseParagraph>
              </div>
              <div
                class="divide-muted-200 dark:divide-muted-700 flex items-center justify-center divide-x"
                dir="ltr"
              >
                <div class="flex items-center justify-center gap-2 px-4">
                  <Icon
                    name="ph:timer-duotone"
                    class="text-muted-400 h-4 w-4"
                  />
                  <span class="text-muted-400 font-sans text-xs">
                    {{ conversation?.user.age }}
                  </span>
                </div>
                <div class="flex items-center justify-center gap-2 px-4">
                  <Icon
                    name="ph:map-pin-duotone"
                    class="text-muted-400 h-4 w-4"
                  />
                  <span class="text-muted-400 font-sans text-xs">
                    {{ conversation?.user.location }}
                  </span>
                </div>
              </div>
              <div class="mt-6">
                <BaseButton shape="curved" class="w-full">
                  <span> درباره مانی، هوش مصنوعی </span>
                </BaseButton>
                <button
                  role="button"
                  class="text-primary-500 mt-3 font-sans text-sm underline-offset-4 hover:underline"
                >
                  همرسانی گفت و گو
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <TairoPanels />
  </div>
</template>
