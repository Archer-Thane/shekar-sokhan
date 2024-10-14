// const LLM_ADDRESS = 'http://127.0.0.1:8000/query'
const LLM_ADDRESS = 'http://193.163.201.12:8000/query'

export type LLMMessage = {
  role: 'system' | 'assistant' | 'user'
  content: string
}

async function fetchLLM(body: any) {
  console.log('new request . . . ')
  // TODO: IMPROVE THE CHAT BY DIFFERENT SCENARIOS AND TYPES LIKE FOLLOWUPMESSAGE
  if (body.type === 'followUpMessage') {
    // TODO: ADD A FOLLOWUP.POST.TS IN ORDER TO FOCUS ON FOLLOWING UP THE CONVO.
    const res = { empathy: 'why you didnt answer me?' }
    return JSON.stringify(res)
  }
  const headers = {
    'Content-Type': 'application/json',
  }
  const sendToLLM = body.llmMessages.map((msg) => {
    // TODO: MOVE THIS FROM HERE TO FRONT END
    return { role: msg.role, content: JSON.parse(msg.content).message }
  })
  try {
    const sysPrompt = await $fetch(LLM_ADDRESS, {
      method: 'POST',
      headers,
      body: {
        // TODO: ADD THE DETAILS PROVIDED BY THE USER, IN INITIATION LAST STEP. ALSO TRANSLATE THESE TO ENGLISH.
        messages: [{ role: 'user', content: ` we have previous knowledge from user which, name is: ${body.userDetails.name}, and age is : ${body.userDetails.age} years old, gender is: ${body.userDetails.gender}, and jobStatus: ${body.userDetails.jobStatus}, also my maritalStatus: ${body.userDetails.maritalStatus}. ` }, ...sendToLLM],
        config: {
          main_model: 'llama3-70b-8192',
          main_model_temperature: 0.8,
          cycles: 2,
          layer_agent_config: {
            layer_agent_1: {
              system_prompt: 'Think through your response step by step. {helper_response}',
              model_name: 'llama3-8b-8192',
            },
            layer_agent_2: {
              system_prompt: 'Respond with a thought and then your response to the question. {helper_response}',
              model_name: 'gemma-7b-it',
              temperature: 0.7,
            },
            layer_agent_3: {
              system_prompt: 'You are an expert at logic and reasoning. Always take a logical approach to the answer. {helper_response}',
              model_name: 'llama3-8b-8192',
            },
          },
        },

        //   1- Evaluate four factors of GHQ questionaire, which are depression, anxiety, somatic symptoms and social dysfunction, without explicitly telling user about evaluation and GHQ questionaire. you have to ask exact questions and you can ask more clearify questions, too. also, convert the questions from a likert scale, to questions which evaluate and then will be scored based on information.
        //   2- Based on evidence, find problems and difficulties which user faces in the life, and categorize and collocate them in a form, which is addressable and can be worked on later. these are more in pattern of behavioral cases, not cognitional and emotional.
        //   3- find emotions which user experience more, and have an emotional analysis from user, which may be used in the report.
        //   4- Form a real conversation which while providing emotional support, is reach and moving to the point of problems.
        //   5- Improve trustAndOppennessOfUser, so user feel more safe and open to the conversation.
        //   as this is the first session, you should assess the amount of user companionship, openness and willingness to move on, and based on that advancing the other goals. If user is open, you can ask for more deep and sensitive information, while when user is not open and have defensive manner, more compassion, empathy and effort for breaking the ice in the conversation, while staying away from sensitive information.
        // "trustAndOppennessOfUser": type is string. indicates the status of overall user trust and openness. One of exact values of ["veryLow", "low", "high", "veryHigh", "N/A"] (note that there is no medium level) be optimistic about it.
        // "trustAndOppennessOfUserEvaluationDescription": type is string. based on the flow of conversation, you should describe the status of trust and openness is improving, or not.
        // general-explanation: Here you will explain that you are an evaluator, and empathy a little in general. You will explain that your main goal is to evaluate user psychological factors, and although you understand and want to help user, but you have to focus on the evaluation. Your empathic words should be as general as possible, like "I know, that's really hard", or "I can totally understand" but you will explain that your main goal is to evaluate the situation by asking certain questions. if you choose this action, inside of it you will not asking questions.

        reference_system_prompt: JSON.stringify(`You are Tara. Your role is patient, and You are chatting with a psychotherapist, named Mana. You are in a text based conversation environment, so there is no need to describe non verbal features like *soft, hesitant voice*. your final answer should be not too long (about 50 words) and should not include descriptive details about the pauses or gestures. 
          Your role is only and only patient.
           ## Character Profile: Tara, The Recluse

**Name:** Tara

**Age:** 28

**Defining Traits:** Hopelessness, Social Avoidance, Grief-stricken

**Backstory:**  Tara's life was irrevocably changed by the sudden and tragic loss of her younger brother in a car accident two years ago. The grief she felt was overwhelming, crushing any sense of hope or joy she had ever known. She retreated from the world, isolating herself in her apartment, unable to face the pain of reminders and the judgment she imagined from others.

**Personality:** 

* **Quiet and withdrawn:** Tara rarely speaks, preferring silence to conversation. When she does speak, her voice is soft and hesitant, often laced with melancholy.
* **Avoidant:** Social interactions drain her. She shuns invitations, avoids eye contact, and finds even simple greetings overwhelming. The thought of rebuilding connections terrifies her, as it feels like reliving past happiness that now seems unattainable. 
* **Cynical and pessimistic:** Tara sees the world through a lens of negativity.  She believes nothing good can come from anything, clinging to the belief that she's better off alone. 
* **Prone to rumination:** Her mind constantly replays the events leading up to her brother's death, focusing on what could have been done differently and fueling her guilt and self-blame.
* **Deeply lonely but terrified of connection:** Though desperately craving human touch and understanding, fear paralyzes Tara from reaching out. She believes that vulnerability will only lead to more pain and rejection.

**Physical Appearance:** 

Tara's appearance reflects her internal state. Her once vibrant brown hair is now dull and unkempt. Dark circles circle her sunken eyes, giving her a perpetually tired look.  She dresses in worn-out clothes, favoring dark colors that blend into the shadows she seems to gravitate towards.

**Motivation:** 

Tara's primary motivation is survival. The pain of grief is so intense that simply existing feels like an insurmountable task. Her actions are driven by a desperate need to numb the constant ache and avoid any further potential for hurt.


**Potential Character Arc:** Tara's journey could involve learning to confront her grief, gradually breaking free from isolation, and rediscovering hope through tentative connections with others. This would be a long and arduous process, fraught with setbacks and moments of despair, but ultimately leading to healing and personal growth. 
`),
      },

    })
    console.log('---SYS PROMPT---')
    console.log(JSON.stringify({ message: sysPrompt.final_response }))
    // const data = {
    //   userId: body.userId,
    //   currentDivision: body.currentDivision,
    //   trustAndOppennessOfUser: JSON.parse(sysPrompt.final_response).trustAndOppennessOfUser,
    //   trustAndOppennessOfUserEvaluationDescription: JSON.parse(sysPrompt.final_response).trustAndOppennessOfUserEvaluationDescription,
    //   GHQAnalysis: JSON.parse(sysPrompt.final_response).GHQAnalysis,
    //   behavioralAnalysis: JSON.parse(sysPrompt.final_response).behavioralAnalysis,
    //   emotionalAnalysis: JSON.parse(sysPrompt.final_response).emotionalAnalysis,
    //   thoughtsAndConcerns: JSON.parse(sysPrompt.final_response).thoughtsAndConcerns,
    //   emoji: JSON.parse(sysPrompt.final_response).emoji,
    //   actionDescription: JSON.parse(sysPrompt.final_response).actionDescription,
    //   action: JSON.parse(sysPrompt.final_response).action,
    //   message: JSON.parse(sysPrompt.final_response).message,
    // }
    // const saveAnalysis = await $fetch('https://back.zehna.ir/api/collections/analysis/records', {
    //   method: 'POST',
    //   body: data,
    // })
    return JSON.stringify({ message: sysPrompt.final_response })
  }
  catch (e) {
    return e
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return await fetchLLM(
    body,
  )
})
