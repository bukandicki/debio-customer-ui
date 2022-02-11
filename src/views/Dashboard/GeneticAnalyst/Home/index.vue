<template lang="pug">
  .ga-dashboard
    .ga-dashboard__wrapper
      ui-debio-banner.ga-dashboard__banner(
        title="Genetic Analyst"
        subtitle="Povide service for customer who have been tested in previous years can get interpretation that leads to improved maintenance."
        gradient-color="tertiary"
        with-decoration
      )
        template(slot="illustration")
          ui-debio-icon(
            :icon="geneticAnalystIllustration"
            :size="cardBlock ? 250 : 120"
            view-box="0 0 120 120"
            fill
          )

      DataTable(:headers="headers" :items="orders")
        template(slot="prepend")
          .ga-dashboard__text
            h2.ga-dashboard__table-title Order Lists
            p.ga-dashboard__table-subtitle.mb-0 List of all services ordered by Customers

        template(v-slot:[`item.id`]="{ item }")
          span {{ `${item.id.substr(0, 4)}...${item.id.substr(item.id.length - 3)}` }}

        template(v-slot:[`item.action`]="{ item }")
          .ga-dashboard__table-action.d-flex.justify-center
            router-link(:to="{ name: 'ga-order-details', params: { id: item.id, item } }")
              ui-debio-icon(
                :icon="eyeIcon"
                role="button"
                size="16"
                stroke
              )

</template>

<script>
import DataTable from "@/common/components/DataTable"
import { geneticAnalystIllustration, eyeIcon } from "@/common/icons"


export default {
  name: "GADashboard",
  components: { DataTable },

  data: () => ({
    geneticAnalystIllustration,
    eyeIcon,

    cardBlock: false,
    orders: [
      {
        id: "0xa654e848bbb9ec1bb817cca5f005f5a24148eab00d3af3254200dd99a78fd40e",
        name: "Neurology Analysis A",
        createdAt: "28 Jan 2022",
        price: "3600  DBIO",
        status: "In Progress"
      },
      {
        id: "0xa654e848bbb9ec1bb817cca5f005f5a24148eab00d3af3254200dd99a78fd40a",
        name: "Neurology Analysis B",
        createdAt: "21 Jan 2022",
        price: "2300 DBIO",
        status: "Done"
      },
      {
        id: "0xa654e848bbb9ec1bb817cca5f005f5a24148eab00d3af3254200dd99a78fd40c",
        name: "Neurology Analysis C",
        createdAt: "25 Jan 2022",
        price: "1400 DBIO",
        status: "In Progress"
      },
      {
        id: "0xa654e848bbb9ec1bb817cca5f005f5a24148eab00d3af3254200dd99a78fd40b",
        name: "Neurology Analysis D",
        createdAt: "15 Jan 2022",
        price: "4600 DBIO",
        status: "Reject"
      },
      {
        id: "0xa654e848bbb9ec1bb817cca5f005f5a24148eab00d3af3254200dd99a78fd40z",
        name: "Neurology Analysis E",
        createdAt: "16 Jan 2022",
        price: "1600 DBIO",
        status: "Open"
      }
    ],
    headers: [
      {
        text: "Order ID",
        value: "id",
        sortable: true
      },
      {
        text: "Service Name",
        value: "name",
        sortable: true
      },
      {
        text: "Order Date",
        value: "createdAt",
        sortable: true
      },
      {
        text: "Price",
        value: "price",
        sortable: true
      },
      {
        text: "Status",
        value: "status",
        sortable: true
      },
      {
        text: "Action",
        value: "action",
        align: "center",
        sortable: false
      }
    ]
  }),

  mounted() {
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 959) this.cardBlock = true
      else this.cardBlock = false
    })
  }
}
</script>

<style lang="sass" scoped>
  @import "@/common/styles/mixins.sass"

  .ga-dashboard
    &__wrapper
      display: flex
      flex-direction: column
      gap: 35px

    &__table-title
      @include body-text-medium-1

    &__table-subtitle
      @include body-text-3


    &::v-deep
      .v-data-table > .v-data-table__wrapper > table > tbody > tr > td
        @include body-text-3

      .banner__content-description
        margin-left: 10.25rem

      .banner__subtitle
        max-width: 32.2rem !important
</style>
