<template lang="pug">
.customer-emr
  ui-debio-modal(
    :show="showModalPassword"
    :show-title="false"
    disable-dismiss
    @onClose="showModalPassword = false; error = null"
  )
    ui-debio-icon(:icon="alertIcon" stroke size="80")
    h1 Delete
    p.modal-password__subtitle(v-if="selectedFile") Are you sure you want to delete {{ selectedFile.title }} EMR files?

    ui-debio-input(
      :rules="$options.rules.password"
      :errorMessages="passwordErrorMessages"
      :error="error"
      v-model="password"
      @keyup.enter="onDelete"
      @blur="error = null"
      type="password"
      variant="small"
      label="Delete your EMR files by input your password"
      placeholder="Input your password"
      block
      outlined
    )

    .modal-password__cta.d-flex(slot="cta")
      Button(
        outlined
        color="secondary"
        @click="showModalPassword = false; error = null"
      ) Cancel

      Button(
        color="secondary"
        :disabled="!password"
        @click="onDelete"
      ) Delete
  ui-debio-banner(
    title="My EMR"
    subtitle="Here, you can upload a collection of your Electronic Medical Records (medical history, diagnoses, medications, treatment plans, immunization dates, allergies, radiology images, and laboratory)."
    gradient-color="primary"
    with-decoration
  )
    template(slot="illustration")
      ui-debio-icon.banner-illustration(:icon="analiticIllustration" :size="cardBlock ? 250 : 180" view-box="0 0 252 252" fill)

  DataTable(
    :headers="headers"
    :loading="isLoading"
    :items="emrDocuments"
  )
    template(v-slot:[`item.documentTitle`]="{ item }")
      .d-flex.flex-column
        span(v-for="file in item.files") {{ file.title }}

    template(v-slot:[`item.documentDescription`]="{ item }")
      .d-flex.flex-column
        span(v-for="file in item.files") {{ file.description }}

    template(v-slot:[`item.createdAt`]="{ item }")
      span {{ new Date(item.createdAt).toLocaleDateString() }}

    template(v-slot:[`item.actions`]="{ item }")
      .customer-emr__actions
        ui-debio-icon(:icon="eyeIcon" size="16" role="button" stroke @click="onDetails(item.id)")
        ui-debio-icon(:icon="trashIcon" size="16" role="button" stroke @click="handleOpenModalDelete(item)")
</template>

<script>
import { mapState } from "vuex"
import { validateForms } from "@/common/lib/validate"
import {
  layersIcon,
  analiticIllustration,
  eyeIcon,
  alertIcon,
  trashIcon,
  downloadIcon
} from "@/common/icons"

import errorMessage from "@/common/constants/error-messages"

import {
  queryGetEMRList,
  queryElectronicMedicalRecordById
} from "@/common/lib/polkadot-provider/query/electronic-medical-record"

import DataTable from "@/common/components/DataTable"
import Button from "@/common/components/Button"
import metamaskServiceHandler from "@/common/lib/metamask/mixins/metamaskServiceHandler"

export default {
  name: "CustomerEmr",
  mixins: [metamaskServiceHandler, validateForms],

  components: { DataTable, Button },

  data: () => ({
    layersIcon,
    analiticIllustration,
    eyeIcon,
    trashIcon,
    downloadIcon,
    alertIcon,

    cardBlock: false,
    showModalPassword: false,
    selectedFile: null,
    error: null,
    password: "",
    headers: [
      {
        text: "EMR Title",
        value: "title",
        sortable: true
      },
      {
        text: "Category",
        value: "category",
        sortable: true
      },
      {
        text: "Document Title",
        value: "documentTitle",
        sortable: true
      },
      {
        text: "Description",
        value: "documentDescription",
        sortable: true
      },
      {
        text: "Upload Date",
        value: "createdAt",
        align: "center",
        sortable: true
      },
      {
        text: "Action",
        value: "actions",
        align: "center"
      }
    ],
    emrDocuments: [
      {
        id: 1,
        title: "Covid 19",
        category: "Vaccinations",
        files: [
          {
            title: "Xray",
            link: "QmPMyww3BkaDYHspBvaFxA2JJQTULQfeyJLRhoSh4c98fG",
            description: "My xray sample"
          },
          {
            title: "Data vaccination",
            link: "QmUv4n9iwJw75WbYy3P8D9LUzzAdzYzcgYEMH8Du35gumE",
            description: "my vaccinations detail"
          }
        ],
        createdAt: "Fri Nov 05 2021 16:29:50 GMT+0700 (Western Indonesia Time)"
      },
      {
        id: 2,
        title: "Whole genome squencing",
        category: "Vaccinations",
        files: [
          {
            title: "Xray",
            link: "QmPMyww3BkaDYHspBvaFxA2JJQTULQfeyJLRhoSh4c98fG",
            description: "My xray sample"
          },
          {
            title: "Data vaccination",
            link: "QmPMyww3BkaDYHspBvaFxA2JJQTULQfeyJLRhoSh4c98fG",
            description: "my vaccinations detail"
          }
        ],
        createdAt: "2/7/2011"
      }
    ]
  }),

  computed: {
    ...mapState({
      api: (state) => state.substrate.api,
      wallet: (state) => state.substrate.wallet,
      mnemonicData: (state) => state.substrate.mnemonicData,
      lastEventData: (state) => state.substrate.lastEventData,
      loadingData: (state) => state.auth.loadingData
    }),

    passwordErrorMessages() {
      return this.errorMessages || this.error?.message
    }
  },

  watch: {
    lastEventData() {
      if (this.lastEventData != null) {
        const dataEvent = JSON.parse(this.lastEventData.data.toString())
        if (this.lastEventData.method == "ElectronicMedicalRecordInfoRemoved") {
          if (dataEvent[0].owner_id == this.wallet.address) {
            this.getDocumentsHistory()
          }
        }
      }
    }
  },

  mounted() {
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 959) this.cardBlock = true
      else this.cardBlock = false
    })
  },

  rules: {
    password: [ val => !!val || errorMessage.PASSWORD(8) ]
  },

  created() {
    this.getDocumentsHistory()
  },

  methods: {
    async getDocumentsHistory() {
      await this.metamaskDispatchAction(this.getEMRHistory)
    },

    async getEMRHistory() {
      const dataEMR = await this.metamaskDispatchAction(queryGetEMRList, this.api, this.wallet.address)

      if (dataEMR !== null) {
        const listEMR = dataEMR.reduce((filtered, current) => {
          if (filtered.every(v => v !== current)) filtered.push(current)

          return filtered
        }, [])

        if (listEMR.length > 0) {
          listEMR.reverse() // TODO: BAD way, Need reverse from backend
          for (let i = 0; i < listEMR.length; i++) {
            const emrDetail = await this.metamaskDispatchAction(queryElectronicMedicalRecordById,
              this.api,
              listEMR[i]
            )

            if (emrDetail != null) {
              this.prepareEMRData(emrDetail)
            }
          }

          this.emrDocuments.sort(
            (a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)
          )
        }
      }
    },



    prepareEMRData() {
      // TODO: Data still not fetched properly. Need update later
      // const title = dataEMR.title
      // const description = dataEMR.description
      // var d = new Date(parseInt(dataEMR.uploadedAt.replace(/,/g, "")))
      // const timestamp = d.getTime().toString()
      // const data = dataEMR
      // const date = d.toLocaleString("en-US", {
      //   day: "numeric", // numeric, 2-digit
      //   year: "numeric", // numeric, 2-digit
      //   month: "long" // numeric, 2-digit, long, short, narrow
      // })

      // const order = {
      //   title,
      //   description,
      //   data,
      //   date,
      //   timestamp,
      //   type: "emr"
      // }

      // this.emrDocuments.push(order)
    },

    onDetails(id) {
      this.$router.push({ name: "customer-emr-details", params: { id }})
    },

    handleOpenModalDelete(item) {
      this.selectedFile = item
      this.showModalPassword = true
    },

    async onDelete() {
      const { id } = this.selectedFile
      try {
        await this.wallet.decodePkcs8(this.password)

        this.emrDocuments = this.emrDocuments.filter(document => document.id !== id)
        this.showModalPassword = false
      } catch (e) {
        this.error = e
      }
      // TODO: Update this when Backend is ready
    }
  }
}
</script>

<style lang="sass" scoped>
  .customer-emr
    display: flex
    flex-direction: column
    gap: 30px

    &__actions
      display: flex
      align-items: center
      justify-content: center
      gap: 20px

    &::v-deep
      .banner__subtitle
        max-width: 36.188rem !important
      .banner-illustration
        position: absolute
        bottom: -100px

      .ui-debio-modal__card
        gap: 20px

    .modal-password
      &__subtitle
        max-width: 251px
        text-align: center

      &__cta
        gap: 20px
</style>
