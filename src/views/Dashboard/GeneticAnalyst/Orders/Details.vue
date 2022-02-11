<template lang="pug">
  .ga-order-details
    //- TODO: Update dummy data with data value from backend
    ui-debio-icon.ga-order-details__back-button(
      :icon="chevronLeftIcon"
      size="20"
      color="#5640A5"
      role="button"
      @click="handlePrevious"
      stroke
    )
    .ga-order-details__wrapper
      ui-debio-stepper.ga-order-details__stepper(:items="computeStepper")

      h6.order-section__title {{ computeDetailsTitle }}

      section.order-section
        transition(name="transition-slide-x" mode="out-in")
          Card.order-section__hilight-description.mb-6(
            :title="$route.params.item.status === 'Reject' ? 'Reason of Rejection' : 'DNA Result'"
            v-if="$route.params.item.status === 'Reject' || (step === 3 && $route.params.item.status !== 'Reject')"
          )
            p(v-if="step === 3 && $route.params.item.status !== 'Reject'") DNA Report Analysis.pdf
            p
              | {{ readMore ? hilightDescription : hilightDescription.substr(0, 130) }}
              a(@click="readMore = !readMore" role="button") {{ readMore ? " Read less" : " Read more..." }}

        .order-section__services
          Card.service-details(:title="$route.params.item.name")
            p.service-details__description(
              title="The metabolism analysis uses a blood or saliva sample and body-related data (e.g. weight, physical activity, eating habits) to investigate how your metabolism works."
              aria-label="The metabolism analysis uses a blood or saliva sample and body-related data (e.g. weight, physical activity, eating habits) to investigate how your metabolism works."
            ) The metabolism analysis uses a blood or saliva sample and body-related data (e.g. weight, physical activity, eating habits) to investigate how your metabolism works.

            .service-details__time.d-flex.align-center
              ui-debio-icon.mr-2(:icon="timerIcon" size="20" stroke color="#000000")
              span(aria-label="5 Days") 5 Days

            .service-details__detail.d-flex.mt-5
              ui-debio-avatar.service-details__avatar.mr-4(
                src="https://i.pravatar.cc/80"
                alt="Hildegard Agustin"
                size="80"
              )
              .service-details__analyst
                p.service-details__analyst-name.mb-0(
                  title="Hildegard Agustin"
                  aria-label="Hildegard Agustin"
                ) Hildegard Agustina

                p.service-details__analyst-specialization.mb-0(
                  title="Metabolic"
                  aria-label="Metabolic"
                ) Metabolic

                span.service-details__analyst-price {{ $route.params.item.price }}

          Card.order-details(title="Order ID")
            .order-details__wrapper
              span.order-details__hash(:title="$route.params.item.id" :aria-label="$route.params.item.id") {{ $route.params.item.id }}
              .order-details__date.mb-4.mt-4
                b.order-details__date-label Date: 
                span.order-details__date-detail {{ $route.params.item.createdAt }}

              b.order-details__name(title="Pediatric Record" aria-label="Pediatric Record") Pediatric Record
              span.order-details__file(title="PerdiatricRecord.vcf" aria-label="PerdiatricRecord.vcf" role="button" @click="handleDownloadFile") PerdiatricRecord.vcf

              .order-details__actions.d-flex.justify-space-between(v-if="$route.params.item.status !== 'Reject' && step === 1")
                Button(
                  :disabled="$route.params.item.status !== 'Open'"
                  width="130px"
                  color="secondary"
                  outlined
                ) REJECT
                Button(
                  width="130px"
                  :disabled="$route.params.item.status !== 'Open'"
                  color="secondary"
                  @click="step = 2"
                ) ACCEPT

      transition(name="transition-slide-x" mode="out-in")
        section.upload-section.mt-6(v-if="step === 2")
          form.upload-section__forms(@submit.prevent="handleSubmitForms")
            ui-debio-file(
              v-model="document.file"
              :error="isDirty.document && isDirty.document.file"
              :rules="$options.rules.document.file"
              variant="medium"
              label="Upload Genetic Result"
              label-rules="(.pdf, .doc - Maximum fle size is 2MB)"
            )
            ui-debio-textarea(
              v-model="document.description"
              :error="isDirty.document && isDirty.document.description"
              :rules="$options.rules.document.description"
              variant="medium"
              rows="3"
              placeholder="Spider bit me help omg The metabolism analysis uses a blood or saliva sample and body-related data (e.g. weight, physical activity, eating habits) to investigate how"
              label="Comment / Feedback (Optional)"
              outlined
              block
            )

          .upload-section__tx-details.d-flex.justify-space-between(@mouseleave="handleShowTooltip")
            .upload-section__tx-title
              span Estimated transaction weight
              ui-debio-icon.ml-1(
                :icon="alertIcon"
                size="14"
                stroke
                @mouseenter="handleShowTooltip"
              )
              span.upload-section__tx-tooltip(
                :class="{ 'upload-section__tx-tooltip--show': showTooltip }"
              ) Total fee paid in DBIO to execute this transaction.

            span.upload-section__tx-price 0.0014 DBIO
          Button(block @click="handleSubmitForms" color="secondary") SUBMIT
</template>

<script>
import { chevronLeftIcon, timerIcon, alertIcon } from "@/common/icons"
import { validateForms } from "@/common/lib/validate"
import errorMessage from "@/common/constants/error-messages"
import Card from "./Card.vue"
import Button from "@/common/components/Button"

const englishAlphabet = val => (val && /^[A-Za-z0-9!@#$%^&*\\(\\)\-_=+:;"',.\\/? ]+$/.test(val)) || errorMessage.INPUT_CHARACTER("English alphabet")

export default {
  name: "GAOrderDetails",
  mixins: [validateForms],
  
  components: { Card, Button },

  data: () => ({
    chevronLeftIcon,
    timerIcon,
    alertIcon,

    step: 1,
    readMore: false,
    showTooltip: false,
    hilightDescription: "The Big Oxmox advised her not to do so, because there were thousands of bad Commas, wild Question Marks and devious Semikoli, but the Little Blind Text didn’t listen. She packed her seven versalia, put her initial into the belt and made herself on the way. When she reached the first hills of the Italic Mountains, she had a last view back on the skyline of her hometown Bookmarksgrove, the headline of Alphabet Village and the subline of her own road, the Line Lane. Pityful a rethoric question ran over her cheek, then she continued her way. On her way she met a copy. The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times and everything that was left from its origin would be the word 'and' and the Little Blind Text should turn around and return to its own, safe country. But nothing the copy said could convince her and so it didn’t take long until a few insidious Copy Writers ambushed her, made her drunk with Longe and Parole and dragged her into their agency, where they abused her for their",
    document: {
      file: null,
      description: null
    },
    steppers: [
      { number: 1, title: "Confirm Order", active: false },
      { number: 2, title: "Upload Result", active: false },
      { number: 3, title: "Success", active: false }
    ]
  }),

  computed: {
    computeStepper() {
      return this.steppers.map(stepper => {
        if (stepper.number === 1) return {
          ...stepper,
          active: stepper.number === this.step
        } 
        return { ...stepper, active: stepper.number === this.step }
      })
    },

    computeDetailsTitle() {
      const sectionTitles = ["Upload Result", "Completed"]
      
      if (this.step === 1) return this.$route.params.item.status === "Open"
        ? "Awaiting Order"
        : `${this.$route.params.item.status} Order`

      else return sectionTitles[this.step - 2]
    }
  },

  rules: {
    document: {
      file: [
        val => !!val || errorMessage.REQUIRED,
        val => (val && val.size < 2000000) || errorMessage.FILE_SIZE(2),
        val => (val && (val.type === "application/pdf" || val.type === "application/msword" || val.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) || errorMessage.FILE_FORMAT("PDF/DOC/DOCX")
      ],
      description: [
        val => !!val || errorMessage.REQUIRED,
        val => val && val.length < 255 || errorMessage.MAX_CHARACTER(255),
        englishAlphabet
      ]
    }
  },

  created() {
    if (this.$route.params.item.status === "In Progress") this.step = 2
    else if (this.$route.params.item.status === "Done") this.step = 3
  },

  methods: {
    handlePrevious() {
      if (this.step === 1) {
        this.$router.go(-1)
        return
      }

      else { this.step-- }
    },

    handleDownloadFile() {
      // TODO: Do something
    },

    handleSubmitForms() {
      this._touchForms("document")
      const { description: docDescription, file: docFile } = this.isDirty?.document
      if (docDescription || docFile) return

      this.step = 3
    },

    handleShowTooltip(e) {
      if (e.type === "mouseenter") {
        this.showTooltip = true
      } else {
        this.showTooltip = false
      }
    }
  }
}
</script>

<style lang="sass">
  @import "@/common/styles/mixins.sass"

  .ga-order-details
    padding: 15px 15px 80px
    background: #ffffff
    border-radius: 4px

    &__wrapper
      display: flex
      flex-direction: column
      align-items: center
      justify-content: center

    &__back-button
      width: max-content
      border-radius: 4px
      padding: 5px
      margin-bottom: 1rem
      background: #F5F7F9

    &__stepper
      margin-bottom: 40px


  .order-section
    width: 100%
    max-width: 704px
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    
    &__title
      color: #595959
      margin-bottom: 40px
      @include h6-opensans

    &__services
      display: flex
      gap: 24px

  .upload-section,
  .upload-section__forms
    display: flex
    flex-direction: column
    gap: 16px
    width: 100%
    max-width: 704px

  .upload-section
    &__tx-title,
    &__tx-price
      @include body-text-3

    &__tx-title
      position: relative
      display: flex
      align-items: center

    &__tx-tooltip
      max-width: 143px
      padding: 10px
      position: absolute
      top: 35px
      z-index: 10
      background: #fff
      border: 1px solid #D3C9D1
      right: -120px
      transition: all .3s ease-in-out
      visibility: hidden
      opacity: 0
      @include tiny-reg

      &::after
        position: absolute
        content: ""
        display: block
        top: -20px
        height: 20px
        border-color: transparent transparent #FFF transparent
        border-style: solid
        border-width: 8px

      &::before
        position: absolute
        content: ""
        display: block
        top: -21px
        height: 20px
        border-color: transparent transparent #D3C9D1 transparent
        border-style: solid
        border-width: 8px

      &--show
        opacity: 1
        visibility: visible

    &__tx-price
      color: #444444
    
  .service-details
    &__description
      width: 280px
      font-size: 14px
      text-align: justify
      display: -webkit-box
      -webkit-line-clamp: 4
      -webkit-box-orient: vertical  
      overflow: hidden

    &__analyst-name,
    &__analyst-specialization
      overflow: hidden
      text-overflow: ellipsis
      white-space: pre
      max-width: 170px

    &__analyst
      width: 100%
      position: relative

    &__analyst-name
      @include button-2

    &__analyst-specialization
      @include body-text-2

    &__analyst-price
      position: absolute
      bottom: 0
      right: 0
      color: #F006CB
      @include body-text-3-opensans-medium

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

  .order-details
    &__wrapper
      display: flex
      flex-direction: column

    &__actions
      margin-top: 53px

    &__hash,
    &__name,
    &__file
      overflow: hidden
      text-overflow: ellipsis
      max-width: 279px

    &__name
      white-space: pre
      @include button-2

    &__file
      width: max-content
      margin-top: 10px
      font-size: 14px
      color: #5640A5

    &__date-label
      @include button-2

    &__date-detail
      @include body-text-2
</style>
