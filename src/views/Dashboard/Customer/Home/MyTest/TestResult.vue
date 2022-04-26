<template lang="pug">
  div
    v-container
      ui-debio-card(width="100%")
        v-row.resultBody
          v-col(cols="12" md="9")
            ui-debio-card(width="100%" class="mt-2")
              template
                v-progress-linear(
                  v-if="resultLoading"
                  indeterminate
                  color="primary"
                )
                v-card-text
                  embed(
                    :src="`${result}#view=fitH`"
                    scrolling="auto"
                    height="500px"
                    width="100%"
                    type="application/pdf"
                  )
                  div
                    span {{dummyResult.title}}
                    br
                  div
                    span {{dummyResult.subTitle}}
                  div
                    span {{dummyResult.content}}
          v-col(cols="12" md="3")
            div.buttonSection(v-for="(file, index) in files" :key="file.name")
              ui-debio-card(
                :title="file.fileTitle"
                :sub-title="file.fileSubTitle"
                tiny-card
                with-icon
                role="button"
                @click="actionDownload(index)"
              )
                ui-debio-icon(
                  slot="icon"
                  size="33"
                  :icon="downloadIcon"
                  stroke
                  color="#c400a5"
                )

            ui-debio-card(
              v-if="!ratingTestResult"
              class="mt-2"
              tiny-card
              with-icon
              title="Rating"
              sub-title="Help us improve your test experience by rating this service"
              @click="actionRating"
              )
                ui-debio-icon(
                  size="33"
                  slot="icon"
                  :icon="starIcon"
                  stroke
                  color="#c400a5"
                )
            ui-debio-card(
              v-else
              class="mt-2"
              tiny-card
              with-icon
              :title="ratingTitle"
              :sub-title="ratingSubTitle"
              )
                ui-debio-rating(
                  :size="33"
                  :total-rating="ratingTestResult"
                  :with-reviewers="false"
                )

      ui-debio-modal(
        :show="showModalRating"
        :cta-action="submitRating"
        title="Please tell us about your experience!"
        cta-title="Submit"
        @onClose="showModalRating = false"
      )
        template
          ui-debio-rating(
            :size="33"
            :total-rating="5"
            :with-reviewers="false"
            interactive
            @input="getRating"
          )
          ui-debio-textarea(
            :rules="$options.rules.review"
            variant="small"
            label="Write a review"
            placeholder="Write a review"
            v-model="review"
            validate-on-blur
            outlined
            block
          )

      ui-debio-modal(
        :show="showModal"
        :icon="checkCircleIcon"
        :cta-action="closeModal"
        :title="modalTitle"
        cta-title="OK"
        @onClose="showModal = false"
      )

</template>

<script>
import { mapState } from "vuex"
import Kilt from "@kiltprotocol/sdk-js"
import CryptoJS from "crypto-js"
import { queryDnaTestResults } from "@debionetwork/polkadot-provider"
import { queryLabById } from "@debionetwork/polkadot-provider"
import { downloadFile, decryptFile, downloadDocumentFile, getIpfsMetaData } from "@/common/lib/pinata-proxy"
import { queryOrderDetailByOrderID, queryServiceById } from "@debionetwork/polkadot-provider"
import { u8aToHex } from "@polkadot/util"
import { submitRatingOrder, getRatingByOrderId } from "@/common/lib/api"
import { downloadIcon, debioIcon, creditCardIcon, starIcon, checkCircleIcon } from "@debionetwork/ui-icons"
import errorMessage from "@/common/constants/error-messages"

export default {
  name: "TestResult",

  data: () => ({
    downloadIcon,
    debioIcon,
    creditCardIcon,
    starIcon,
    checkCircleIcon,
    errorMessage,

    privateKey: "",
    publicKey: "",
    idOrder: "",
    ownerAddress: "",
    testResult: {},
    services: [],
    rating: 0,
    review: "",
    ratingTitle: "",
    ratingSubTitle: "",
    ratingTestResult: null,
    lab: null,
    order: null,
    isDataPdf: false,
    serviceName: "",
    serviceCategory: "",
    resultLoading: false,
    showModal: false,
    showModalRating: false,
    files: [],
    baseUrl: "https://ipfs.io/ipfs/",
    dummyResult: {
      title: "Whole Genome Sequencing Test Report",
      subTitle: "GSI Lab, 5 July 2021",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  }),

  async mounted() {
    this.resultLoading = true
    this.idOrder = this.$route.params.idOrder
    const cred = Kilt.Identity.buildFromMnemonic(this.mnemonicData.toString(CryptoJS.enc.Utf8))
    this.privateKey = u8aToHex(cred.boxKeyPair.secretKey)
    this.ownerAddress = this.wallet.address
    await this.getRatingTestResult()
    await this.getTestResult()
    await this.getLabServices()
    await this.getFileUploaded()
    await this.parseResult()
  },

  methods: {
    async getRatingTestResult() {
      try {
        const data = await getRatingByOrderId(this.idOrder)
        this.ratingTestResult = data?.rating
        this.ratingTitle = `Rating ${this.ratingTestResult},0`
        this.ratingSubTitle = data?.review
      } catch (error) {
        console.error(error)
      }
    },

    async getTestResult() {
      try {
        this.order = await queryOrderDetailByOrderID(this.api, this.idOrder)
        this.ownerAddress = this.order.customerEthAddress

        this.testResult = await queryDnaTestResults(
          this.api,
          this.order.dnaSampleTrackingId
        )
      } catch (error) {
        this.resultLoading = false
        console.error(error)
      }
    },

    async getLabServices() {
      try {
        this.lab = await queryLabById(this.api, this.testResult.labId)
        this.services = await queryServiceById(this.api, this.order.serviceId)

        this.publicKey = this.lab.info.boxPublicKey
        this.serviceCategory = this.services.info.category
        this.serviceName = this.services.info.name
      } catch (error) {
        this.resultLoading = false
        this.services = []
        console.error(error)
      }
    },

    async getFileUploaded() {
      try {
        if (this.testResult.reportLink !== "") {
          this.files.push({
            fileType: "report",
            fileName: this.serviceName + " Report",
            fileLink: this.testResult.reportLink,
            fileTitle: "Download Report",
            fileSubTitle: "Download Your Test Report"
          })
        }

        if (this.testResult.resultLink !== "") {
          this.files.push({
            fileType: "result",
            fileName: this.serviceName + " Result",
            fileLink: this.testResult.resultLink,
            fileTitle: "Download Raw Data",
            fileSubTitle: "Download Your Genomic Data"
          })
        }
      } catch (error) {
        this.resultLoading = false
        console.error(error)
      }
    },

    async parseResult() {
      try {
        const path = this.files[0].fileLink
        const pair = { secretKey: this.privateKey, publicKey: this.publicKey }

        const { type, data } = await downloadFile(path, true)

        const decryptedFile = decryptFile(data, pair, type)
        const fileBlob = window.URL.createObjectURL(new Blob([decryptedFile], { type }))

        this.result = fileBlob
        this.resultLoading = false
      } catch (error) {
        this.resultLoading = false
        console.error(error)
      }
    },

    async actionDownload(index) {
      try {
        const { rows } = await getIpfsMetaData(this.files[index].fileLink.split("/").pop())
        const { type, data } = await downloadFile(this.files[index].fileLink, true)
        const pair = { secretKey: this.privateKey, publicKey: this.publicKey }
        const decryptedFile = decryptFile(data, pair, type)

        await downloadDocumentFile(decryptedFile, rows[0].metadata.name, type)
      } catch (error) {
        console.error(error)
      }
    },

    actionRating() {
      this.showModalRating = true
    },

    closeModal(){
      this.$emit("showModal", false)
      this.showModal = false
    },

    getRating(stars) {
      this.rating = stars
    },

    async submitRating() {
      try {
        const data = await submitRatingOrder(
          this.testResult.labId,
          this.order.serviceId,
          this.testResult.orderId,
          this.order.customerId,
          this.rating,
          this.review
        )

        this.ratingTestResult = data.rating
        this.ratingTitle = `Rating ${this.ratingTestResult},0`
        this.ratingSubTitle = data.review

        this.showModalRating = false
        this.showModal = true
      } catch (error) {
        this.showModalRating = false
        this.showModal = true
        console.error(error)
      }
    }
  },

  computed: {
    ...mapState({
      api: (state) => state.substrate.api,
      wallet: (state) => state.substrate.wallet,
      mnemonicData: (state) => state.substrate.mnemonicData
    }),

    reportResult() {
      if (this.dialog) {
        return ""
      }

      if (this.resultLoading) {
        return "Decrypting report.."
      }

      console.log(this.result);

      return this.result ? this.result : "No report available for this result"
    },

    modalTitle() {
      return `Thank you! ${"\n"} Your feedback has been sent`
    }
  },

  rules: {
    document: {
      review: [ val => !!val || errorMessage.REQUIRED ]
    }
  }
}
</script>

<style lang="sass">
  .resultBody
    margin: 25px 0 0 0
  .buttonSection
    margin: 8px 0 45px 0
  .v-card__text
    height: 500px

</style>
