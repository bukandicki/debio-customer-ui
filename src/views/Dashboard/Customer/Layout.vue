<template lang="pug">
  div.layout-dashboard
    ui-debio-modal(
      :show="showModalPassword"
      title="Unlock Wallet by Input your password"
      :icon="checkCircleIcon"
      :showCta="!success"
      :showTitle="!success"
      disable-dismiss
    )
      ui-debio-input(
        v-if="!success"
        :errorMessages="passwordErrorMessages"
        :rules="$options.rules.password"
        :type="showPassword ? 'text' : 'password'"
        variant="small"
        placeholder="Input Password"
        v-model="password"
        outlined
        block
        :error="!!error"
        validate-on-blur
        @keyup.enter="handleSubmitPassword"
        @blur="error = null"
        @isError="handleError"
      )
        ui-debio-icon(
          slot="icon-append"
          role="button"
          size="18"
          @click="handleShowPassword"
          :icon="showPassword ? eyeIcon : eyeOffIcon"
          stroke
        )

      .modal-password__cta.d-flex(slot="cta")
        Button(
          block
          color="secondary"
          @click="handleSubmitPassword"
        ) Submit

    NavigationDrawer.layout-dashboard__sidebar(:items="computeNavs")
      Button(
        outlined
        height="35px"
        @click="goToRequestTestPage"
        class="font-weight-bold sidebar-text mt-4 dg-raleway-font"
        color="primary"
      ) Request a Test

      Button(
        outlined
        height="35px"
        @click="goToUploadEMR"
        class="font-weight-bold sidebar-text mt-4 dg-raleway-font"
        color="primary"
      ) Upload EMR

    Navbar.layout-dashboard__navbar(:notifications="localListNotification")
    .layout-dashboard__main
      transition(name="transition-slide-x" mode="out-in")
        router-view
</template>

<script>
import { mapState } from "vuex"
import store from "@/store"
import { validateForms } from "@/common/lib/validate"
import {
  gridIcon,
  boxIcon,
  eyeIcon,
  eyeOffIcon,
  databaseIcon,
  checkCircleIcon,
  fileTextIcon,
  creditCardIcon
} from "@/common/icons"

import NavigationDrawer from "@/common/components/NavigationDrawer"
import Navbar from "@/common/components/Navbar.vue"
import Button from "@/common/components/Button"
import errorMessage from "@/common/constants/error-messages"

export default {
  name: "MainPage",

  mixins: [validateForms],

  components: { NavigationDrawer, Navbar, Button },

  data: () => ({
    checkCircleIcon,
    eyeIcon,
    eyeOffIcon,

    showModalPassword: false,
    showPassword: false,
    success: false,
    error: null,
    password: null,

    navs: [
      { text: "Dashboard", disabled: false, active: false, route: "customer-dashboard", icon: gridIcon },
      { text: "My Test", disabled: false, active: false, route: "my-test", icon: boxIcon },
      { text: "My EMR", disabled: false, active: false, route: "customer-emr", icon: fileTextIcon },
      { text: "Data Bounty", disabled: false, active: false, route: "customer-data-bounty", icon: databaseIcon },
      { text: "Payment History", disabled: false, active: false, route: "customer-payment-history", icon: creditCardIcon }
    ]
  }),

  computed: {
    ...mapState({
      lastEventData: (state) => state.substrate.lastEventData,
      wallet: (state) => state.substrate.wallet,
      localListNotification: (state) => state.substrate.localListNotification,
      mnemonicData: (state) => state.substrate.mnemonicData
    }),

    computeNavs() {
      const setActive = name => {
        return (
          this.$route.name === name ||
          this.$route.meta.parent === name
        )
      }

      return this.navs.map(nav => ({ ...nav, active: setActive(nav.route) }))
    },

    computeButtonActive() {
      return !/(\/customer\/request-test)/.test(this.$route.path)
    },

    passwordErrorMessages() {
      return this.errorMessages || this.error?.message
    }
  },

  watch: {
    lastEventData(event) {
      if (event !== null) {
        this.$store.dispatch("substrate/addListNotification", {
          address: this.wallet.address,
          event: event,
          role: "customer"
        });
      }
    }
  },

  async mounted() {
    if (!this.mnemonicData) this.showModalPassword = true
    await this.getListNotification()
  },

  rules: {
    password: [ val => !!val || errorMessage.PASSWORD(8) ]
  },

  methods: {
    async getListNotification() {
      await this.$store.dispatch("substrate/getListNotification", {
        address: this.wallet.address,
        role: "customer"
      })
    },

    goToRequestTestPage() {
      this.$router.push({ name: "customer-request-test" })
    },

    goToUploadEMR() {
      this.$router.push({ name: "customer-emr-create" })
    },

    handleShowPassword() {
      this.showPassword = !this.showPassword
    },

    async handleSubmitPassword() {
      try {
        await this.wallet.unlock(this.password)
        await store.dispatch("substrate/getEncryptedAccountData", {
          password: this.password
        })

        this.success = true

        setTimeout(() => {
          this.showModalPassword = false
        }, 1300)
      } catch (e) {
        this.error = e
      }
    }
  }
}
</script>

<style lang="sass" scoped>
  .layout-dashboard
    width: 100vw
    min-height: 100vh
    background: #F5F7F9
    display: grid
    grid-template-rows: 5.688rem calc(100% - 6.563rem) calc(100% - 21.375rem)
    grid-template-columns: 16.563rem calc(100% - 16.563rem)
    grid-template-areas: "sidebar navbar" "sidebar main"

    &__navbar
      padding: 2.5rem 1.25rem !important
      padding-right: 2.5rem !important
      grid-area: navbar

    &__main
      padding: 1.25rem !important
      padding-right: 2.5rem !important
      grid-area: main

    &__sidebar
      grid-area: sidebar

      Button
       font-weight: 500 !important
       font-size: 13px

  .modal-password
    &__cta
      gap: 20px
  
  .transition-slide-x
    &-enter-active,
    &-leave-active
      transition: all cubic-bezier(.7, -0.04, .61, 1.14) .3s

    &-enter
      opacity: 0
      transform: translateX(1.563rem)

    &-leave-to
      opacity: 0
      transform: translateX(-12.813rem)
</style>
