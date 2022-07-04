import { customerHandler } from "@/common/lib/polkadot-provider/events/handlers/customer"

const handlers = {
  customer: customerHandler
}

export async function processEvent(state, address, event, role) {
  let statusAdd = false
  let message = ""
  let data = null
  let params = null

  const dataEvent = JSON.parse(event.data.toString())
  if (dataEvent.length > 0) {
    let handler = handlers[role][event.section]
    if (!handler) {
      console.log("no role mapping")
      return { statusAdd, message, data, params }
    }

    // Get event configuration data
    const value = state.configEvent["role"][role][event.section][event.method].value
    const valueMessage = state.configEvent["role"][role][event.section][event.method].value_message
    const identity = state.configEvent["role"][role][event.section][event.method].identity

    const res = await handler(dataEvent, value, valueMessage, { section: event.section, method: event.method })
    
    if (res.data[identity] === address || res.data[1][identity] === address) {
      statusAdd = true
      message = state.configEvent["role"][role][event.section][event.method].message + " " + res.wording
    }

    data = res.data
    params = res.params
  }

  return { statusAdd, message, data, params }
}
