<template lang="pug">
  .status-card
    .status-card__imageBanner
      ui-debio-icon(
        :icon="registeredBanner"
        size="185"
        view-box="-10 -16 180 180"
      )

    .status-card__status {{ status }}
    .status-card__message {{ message }}

    .status-card__stepper
      .step-indicator
        .status-card__step
          div(:class="setClass(1)")
            v-icon.icon(v-if="orderStatus === 'Rejected'") mdi-close 
            v-icon.icon(v-else) mdi-check
          small Order Confirmation
        .status-card__indicator-line
        .status-card__step
          div(:class="setClass(2)")
            v-icon.icon mdi-check
          small Analyzed
        .status-card__indicator-line
        .status-card__step
          div(:class="setClass(3)")
            v-icon.icon mdi-check
          small Result Ready
    .status-card__button
      ui-debio-button(
        v-if="orderStatus === 'Registered'"
        width="100%" 
        color="red"
        outlined 
        @click="cancelOrder"
        :loading="isLoading"
      ) Cancel Request

      ui-debio-button(
        v-if="orderStatus === 'Rejected'"
        width="100%" 
        color="primary"
        @click="viewResult"
      ) View Reason

      ui-debio-button(
        v-if="orderStatus === 'InProgress' || orderStatus === 'ResultReady'"
        :disabled="orderStatus === 'InProgress'"
        width="100%" 
        color="primary"
        @click="viewResult"
      ) View Result

</template>


<script>

import { mapState } from "vuex"
import { registeredBanner } from "@debionetwork/ui-icons"
import { queryGeneticAnalysisOrderById, queryGeneticAnalysisByGeneticAnalysisTrackingId, queryGeneticAnalystByAccountId } from "@debionetwork/polkadot-provider"
import Kilt from "@kiltprotocol/sdk-js"
import { u8aToHex } from "@polkadot/util"
import CryptoJS from "crypto-js"
import { downloadFile, decryptFile, downloadDocumentFile } from "@/common/lib/pinata-proxy"


export default {
  name: "StepperStatusCard",

  data: () => ({
    registeredBanner,
    orderId: null,
    status: null,
    message: null,
    isLoading: false,
    activeStep: 1,
    orderDetail: {
      Registered: {
        status: "Awaiting Confirmation",
        message: "Your request has been sent.",
        active: 1
      },
      Rejected: {
        status: "Order Rejected",
        message: "Your request has been rejected by Genetic Analyst.",
        active: 1
      },
      InProgress: {
        status: "Confirmation Order",
        message: "Your request has been registered. You may send your sample to selected lab.",
        active: 2
      },
      ResultReady: {
        status: "Confirmation Order",
        message: "Your request being analyzed",
        active: 3
      }
    },
    orderStatus: null,
    stepper: ["Order Confirmation", "Analyzed", "Result Ready"],
    trackingId: "",
    publicKey: null,
    secretKey: null,
    analystInfo: null,
    analysisDetail: null
  }),

  computed: {
    ...mapState({
      api: (state) => state.substrate.api,
      wallet: (state) => state.substrate.wallet,
      mnemonicData: (state) => state.substrate.mnemonicData
    })
  },

  async mounted() {
    this.orderId = this.$route.params.id
    await this.getStatus()
  },

  watch: {
    mnemonicData(val) {
      if (val) this.initialData()
    }
  },

  methods: {
    async getStatus() {
      const detail = await queryGeneticAnalysisOrderById(this.api, this.orderId)
      this.trackingId = detail.geneticAnalysisTrackingId
      const analysisDetail = await queryGeneticAnalysisByGeneticAnalysisTrackingId(this.api, this.trackingId)
      this.analystInfo = await queryGeneticAnalystByAccountId(this.api, detail.sellerId)

      this.orderStatus = analysisDetail.status
      this.status = this.orderDetail[this.orderStatus].status
      this.message = this.orderDetail[this.orderStatus].message
      this.activeStep = this.orderDetail[this.orderStatus].active
      this.reportLink = analysisDetail.reportLink
    },

    setClass(step) {
      if (this.activeStep >= step) {
        if (this.orderStatus === "Rejected") {
          return ["step-icon", "border-error", "error"]
        }

        return ["step-icon", "active"]
      }

      return "step-icon"
    },

    async cancelOrder() {
      this.$emit("cancel")
    },

    async viewResult() {
      if (this.orderStatus === "Rejected") {
        this.$emit("reject", this.trackingId)
        return
      }

      this.$router.push({
        name: "customer-genetic-analysis-result",
        params: { id: this.$route.params.id }
      })

      const pair = { publicKey: this.analystInfo.info.boxPublicKey, secretKey: this.secretKey }
      const type = "application/pdf"
      const { data } = await downloadFile(this.reportLink)
      const decryptedFile = decryptFile(data, pair, type)
      await downloadDocumentFile(decryptedFile, this.reportLink.split("/").pop(), type)
    },

    async initialData(){
      const cred = Kilt.Identity.buildFromMnemonic(this.mnemonicData.toString(CryptoJS.enc.Utf8))
      this.publicKey = u8aToHex(cred.boxKeyPair.publicKey)
      this.secretKey = u8aToHex(cred.boxKeyPair.secretKey)
    }
  }
}
</script>

<style lang="sass" scoped>
  @import "@/common/styles/mixins.sass"
  @import "@/common/styles/functions.sass"

  .status-card
    border: solid 0.5px #E4E4E4
    background-color: #FFFFFF
    padding: toRem(16px)
    width: toRem(511px)

    &__imageBanner
      width: toRem(481px)
      height:toRem(184px)
      margin-bottom: toRem(15px)
      align-items: center
      display: flex
      flex-direction: column
      background: linear-gradient(81.43deg, #6344D0 2.53%, #9D82FF 100%)

    &__status
      margin-bottom: toRem(20px)
      @include button-2

    &__message
      @include body-text-3

    &__button
      margin-bottom: toRem(16px)

    &__stepper
      width: 60%
      min-width: toRem(100px)
      margin: 16% 20% 10%



    &__step
      display: flex
      align-items: center
      flex-direction: column
      z-index: 1
      position: relative
      small
        position: absolute
        text-align: center
        font-size: 10px
        top: -30px
        color: #595959
        font-weight: 600
        width: 75px

    &__indicator-line
      height: 1px
      background: #A868FF
      flex: 1

    &__indicator-line-error
      height: 1px
      background: red
      flex: 1
      

  .step-indicator
    display: flex
    align-items: center
    .step-icon
      box-sizing: border-box
      display: flex
      align-items: center
      justify-content: center
      width: 20px
      height: 20px
      border: 1px solid #A868FF
      border-radius: 50%
      background: #FFF
      .icon
        font-size: 10px
        color: #ffffff
        font-weight: 500

    .active
      background: linear-gradient(225deg, #D665FF 0%, #4C6FFF 100%)
      border: none

    .error
      background: red
    .border-error
      border: 1px solid red

</style>
