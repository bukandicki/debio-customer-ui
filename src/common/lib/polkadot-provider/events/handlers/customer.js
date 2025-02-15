import { toFormatDebioCoin } from "@/common/lib/polkadot-provider/index"
import store from "@/store"

const defaultHandler = {
  get: function (target, name) {
    return Object.prototype.hasOwnProperty.call(target, name) ? target[name] : (dataEvent, value, valueMessage) => {
      const data = dataEvent[0]
      const id = data[value]
      const params = { number: id }
      const wording = "for (" + data[valueMessage].substr(0, 4) + "..." + data[valueMessage].substr(data[valueMessage].length - 4) + ")"
      return { data, id, params, wording }
    }
  }
}

const handler = {
  orders: async (dataEvent, value, valueMessage) => {
    const data = dataEvent[0]
    const id = data[value]
    const params = { id: id }

    const computeId = `${id.substr(0, 4)}...${id.substr(id.length - 4)}`
    const computeWording = `${valueMessage} DBIO as a reward for completing the request test for ${computeId} from the service requested`

    const finalWording = data.status === "Fulfilled" && data.orderFlow === "StakingRequestService"
      ? computeWording
      : `${valueMessage} for (${computeId}) is ${data.status}`

    const wording = finalWording
    return { data, id, params, wording }
  },
  geneticTesting: async (dataEvent, value, valueMessage) => {
    const data = dataEvent[0]
    const id = data[value]
    const params = { orderId: id }

    const formatedHash = `${data?.trackingId.substr(0, 4)}...${data?.trackingId?.substr(data?.trackingId?.length - 4)}`
    const computeWording = `${valueMessage} (${formatedHash}) are out. Click here to see your order details.`

    const wording = computeWording

    return { data, id, params, wording }
  },
  balances: async (dataEvent, value, valueMessage) => {
    const data = dataEvent
    const id = data[value]
    const params = { number: id }
    const finalText = await toFormatDebioCoin(data[valueMessage])
    const wording = finalText + " DBIO!"
    return { data, id, params, wording }
  },
  rewards: async (dataEvent, value, valueMessage) => {
    const web3 = store.getters["metamask/getWeb3"]
    const data = dataEvent;
    const id = data[value];
    const params = null;
    const finalText = await toFormatDebioCoin(data[valueMessage])
    const coin = web3.utils.fromWei(finalText, "kwei")
    const wording = `${coin} DBIO for registering in Debio Appchain`;
    return { data, id, params, wording }
  },
  serviceRequest: async (dataEvent, value, valueMessage, event) => {
    const data = dataEvent
    const id = isNaN(value) ? data[0][value] : data[value]
    const params = { page: 1 }
    let wording = valueMessage

    if (event.method === "ServiceRequestCreated") {
      const formatedHash = `${data[1]?.hash?.substr(0, 4)}...${data[1]?.hash?.substr(data[1]?.hash?.length - 4)}`
      wording = `${valueMessage} (${formatedHash}).`
    }

    return { data, id, params, wording}
  },
  geneticAnalysisOrders: async (dataEvent, value, valueMessage, event) => {
    const data = dataEvent[0]
    const id = data[value]
    const status = data["status"]
    const params = { orderId: id }
    const formatedHash = `${id?.substr(0, 4)}...${id?.substr(id?.length - 4)}`
    let wording = `${valueMessage} <${formatedHash}>`

    if (event.method === "GeneticAnalysisOrderRefunded") {
      wording = `${wording} has been ${status.toLowerCase()}, kindly check your account balance.`
    }

    return { data, id, params, wording }
  },
  geneticAnalysis: async (dataEvent, value, valueMessage, event) => {
    const data = dataEvent[0]
    const id = data[value]
    const status = data["status"]
    const params = { orderId: id }
    const formatedHash = `${id?.substr(0, 4)}...${id?.substr(id?.length - 4)}`
    const computeStatus = event.method === "GeneticAnalysisResultReady" ? "are out" : `has been ${status.toLowerCase()}`
    const wording = `${valueMessage} <${formatedHash}> ${computeStatus}. Click here to see your order details.`

    return { data, id, params, wording }
  }
}

// If property not found, return defaultHandler
export const customerHandler = new Proxy(handler, defaultHandler)
